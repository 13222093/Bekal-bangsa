from datetime import datetime, timedelta
from .clients import supabase
from .logistics import haversine_distance
from .kitchen import generate_menu_recommendation

def calculate_expiry_date(days: int) -> str:
    """
    Menghitung tanggal kadaluarsa berdasarkan jumlah hari dari sekarang.
    Output: YYYY-MM-DD
    """
    expiry_date = datetime.now() + timedelta(days=days)
    return expiry_date.strftime("%Y-%m-%d")

def check_expiry_and_notify():
    """
    Cek barang yang mau busuk (expiry_days <= 2).
    Generate notifikasi simulasi untuk WhatsApp.
    """
    print("🔔 Checking expiry for notifications...")
    
    # 1. Ambil data yang mau busuk
    response = supabase.table("supplies").select("*").lte("expiry_days", 2).execute()
    expiring_items = response.data
    
    print(f"DEBUG: expiring_items type: {type(expiring_items)}")
    if expiring_items:
        print(f"DEBUG: First item type: {type(expiring_items[0])}")
        print(f"DEBUG: First item content: {expiring_items[0]}")
    
    if not expiring_items:
        return {"status": "no_risk", "messages": []}
        
    notifications = []
    
    # --- LOGIC 1: NOTIFIKASI KE UMKM (VENDOR) ---
    # Group by Owner
    vendor_items = {}
    for item in expiring_items:
        owner = item.get("owner_name", "Pedagang")
        if owner not in vendor_items:
            vendor_items[owner] = []
        vendor_items[owner].append(item)
        
    # Lokasi SPPG (Monas - Jakarta Pusat)
    sppg_lat = -6.175392
    sppg_long = 106.827153
    
    for owner, items in vendor_items.items():
        item_names = ", ".join([i['item_name'] for i in items])
        
        # Ambil lokasi salah satu item (asumsi pedagang di satu lokasi)
        # Kalau gak ada GPS, pake default
        v_lat = items[0].get('latitude')
        v_long = items[0].get('longitude')
        
        dist_info = ""
        if v_lat and v_long:
            dist = haversine_distance(v_lat, v_long, sppg_lat, sppg_long)
            dist_info = f"SPPG Jakarta Pusat hanya berjarak {dist:.1f} km dari Anda."
        else:
            dist_info = "Segera tawarkan ke SPPG terdekat."
            
        msg = {
            "to": owner,
            "role": "Vendor (UMKM)",
            "type": "WARNING",
            "message": f"⚠️ Halo {owner}! {item_names} Anda akan busuk dalam < 2 hari. {dist_info} Jual murah sekarang sebelum rugi!"
        }
        notifications.append(msg)
        
    # --- LOGIC 2: NOTIFIKASI KE SPPG (KITCHEN) ---
    # SPPG butuh solusi (Resep)
    all_expiring_names = [i['item_name'] for i in expiring_items]
    
    # Minta AI buatkan resep penyelamatan
    # Kita reuse fungsi generate_menu_recommendation tapi dengan konteks "Rescue"
    rescue_menu = generate_menu_recommendation(all_expiring_names)
    
    menu_name = rescue_menu.get("menu_name", "Tumis Campur")
    
    # Format pesan WhatsApp yang rapi
    ingredients_str = "\n".join([f"- {i}" for i in rescue_menu.get("ingredients_needed", [])])
    steps_str = "\n".join([f"{idx+1}. {step}" for idx, step in enumerate(rescue_menu.get("cooking_steps", []))])
    
    nut = rescue_menu.get("nutrition", {})
    nutrition_str = f"Kalori: {nut.get('calories', '-')}, Protein: {nut.get('protein', '-')}"
    
    message_body = f"""🚨 PERHATIAN: {', '.join(all_expiring_names)} di gudang pedagang hampir busuk!
    
    REKOMENDASI AI: Masak '{menu_name}' hari ini!

    🛒 Bahan:
    {ingredients_str}

    👨‍🍳 Cara Masak:
    {steps_str}

    📊 Nutrisi: {nutrition_str}
    ({rescue_menu.get('reason')})"""

    msg_sppg = {
        "to": "Admin SPPG",
        "role": "SPPG (Kitchen)",
        "type": "URGENT + RECIPE",
        "message": message_body
    }
    notifications.append(msg_sppg)
    
    return {"status": "success", "data": notifications}
