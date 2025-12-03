from .clients import supabase
from collections import defaultdict
from datetime import datetime, timedelta

def get_kitchen_analytics():
    """
    Aggregates data for SPPG Dashboard (Streamlit Style).
    1. Composition (Pie): Item Name vs Quantity
    2. Quality (Bar): Item Name vs Quantity (colored by status?) - Simplified to just Quantity per Item for now, or stacked if possible.
    3. Metrics: Total Items, Total Qty, Warning Count
    """
    try:
        # Fetch all supplies (Kitchen sees global stock in market)
        response = supabase.table("supplies").select("*").execute()
        items = response.data
        
        if not items:
            return {
                "metrics": {"total_items": 0, "total_qty": 0, "warning_count": 0},
                "composition": [],
                "quality": []
            }

        # 1. Metrics
        total_items = len(items)
        total_qty = sum(item['quantity'] for item in items)
        # Warning count: expiry_days <= 3
        warning_count = sum(1 for item in items if item.get('expiry_days', 0) <= 3)

        # 2. Composition (Pie Chart Data)
        # Group by item_name
        composition_map = defaultdict(int)
        for item in items:
            composition_map[item['item_name']] += item['quantity']
        
        composition_data = [
            {"name": name, "value": qty} 
            for name, qty in composition_map.items()
        ]
        # Sort by value desc
        composition_data.sort(key=lambda x: x['value'], reverse=True)

        # 3. Quality/Quantity (Bar Chart Data)
        # For simplicity in Recharts, we'll just show the same grouped data but maybe add status info if needed.
        # Streamlit used: x='item_name', y='quantity', color='quality_status'
        # To do this in Recharts, we need data like: { name: "Bayam", fresh: 10, warning: 5, critical: 0 }
        
        quality_map = defaultdict(lambda: {"fresh": 0, "warning": 0, "critical": 0})
        
        for item in items:
            name = item['item_name']
            days = item.get('expiry_days', 0)
            qty = item['quantity']
            
            if days <= 2:
                quality_map[name]["critical"] += qty
            elif days <= 5:
                quality_map[name]["warning"] += qty
            else:
                quality_map[name]["fresh"] += qty
                
        quality_data = []
        for name, counts in quality_map.items():
            quality_data.append({
                "name": name,
                "fresh": counts["fresh"],
                "warning": counts["warning"],
                "critical": counts["critical"],
                "total": counts["fresh"] + counts["warning"] + counts["critical"]
            })
            
        quality_data.sort(key=lambda x: x['total'], reverse=True)

        return {
            "metrics": {
                "total_items": total_items,
                "total_qty": total_qty,
                "warning_count": warning_count
            },
            "composition": composition_data, # For Pie Chart
            "quality": quality_data          # For Stacked Bar Chart
        }

    except Exception as e:
        print(f"Error getting kitchen analytics: {e}")
        return {"error": str(e)}

def get_vendor_analytics(user_id: int):
    """
    Aggregates data for Vendor Dashboard.
    FILTERED BY USER ID (Private Data).
    1. Inventory Health: Count Fresh/Warning/Expired
    2. Expiry Risk: Pie Chart
    3. Top Sales: Bar Chart (from Orders)
    """
    try:
        # --- Inventory Health & Expiry Risk (FILTERED) ---
        # Hanya ambil barang milik user yang sedang login
        response = supabase.table("supplies").select("*").eq("user_id", user_id).execute()
        items = response.data
        
        fresh = 0
        warning = 0
        expired = 0
        
        for item in items:
            days = item.get('expiry_days', 0)
            if days <= 0: # Assuming 0 or less is expired/critical for this chart
                expired += 1
            elif days <= 5:
                warning += 1
            else:
                fresh += 1
                
        inventory_health = {
            "fresh": fresh,
            "warning": warning,
            "expired": expired
        }
        
        expiry_risk_data = [
            {"name": "Aman", "value": fresh, "fill": "#10B981"},
            {"name": "Peringatan", "value": warning, "fill": "#F59E0B"},
            {"name": "Kadaluwarsa", "value": expired, "fill": "#EF4444"}
        ]

        # --- Top Sales (FILTERED) ---
        # Fetch orders where seller_id matches user_id
        orders_resp = supabase.table("orders").select("*, supplies(item_name)").eq("seller_id", user_id).execute()
        orders = orders_resp.data
        
        sales_map = defaultdict(int)
        if orders:
            for order in orders:
                # Try to get name from joined supply, fallback to supply_name if stored, or ID
                name = "Unknown"
                if order.get('supplies'):
                     name = order['supplies'].get('item_name', 'Unknown')
                elif order.get('supply_name'):
                     name = order['supply_name']
                
                sales_map[name] += order['qty_ordered']
        
        sales_data = [
            {"name": name, "value": qty}
            for name, qty in sales_map.items()
        ]
        sales_data.sort(key=lambda x: x['value'], reverse=True)
        sales_data = sales_data[:5] # Top 5

        return {
            "inventory_health": inventory_health,
            "expiry_risk": expiry_risk_data,
            "top_sales": sales_data
        }

    except Exception as e:
        print(f"Error getting vendor analytics: {e}")
        return {"error": str(e)}