from datetime import datetime, timedelta
from database import supabase
from .logistics import haversine_distance
from .kitchen import generate_menu_recommendation

# Global Cache untuk Resep Penyelamatan (Reset saat restart server)
_RESCUE_MENU_CACHE = {"hash": "", "menu": None}

def calculate_expiry_date(days: int) -> str:
    """
    Menghitung tanggal kadaluarsa berdasarkan jumlah hari dari sekarang.
    Output: YYYY-MM-DD
    """
    expiry_date = datetime.now() + timedelta(days=days)
    return expiry_date.strftime("%Y-%m-%d")

def check_expiry_and_notify():
    """
    Cek barang yang mau busuk (expiry_days <= 7).
    Mengambil data kontak Vendor dari tabel 'users' untuk notifikasi.
    """
    print("🔔 Checking expiry for notifications...")
    
    # 1. Ambil data stok yang mau busuk (Warning H-7)
    response = supabase.table("supplies").select("*").lte("expiry_days", 7).execute()
    expiring_items = response.data
    
    if not expiring_items:
        return {"status": "no_risk", "messages": []}
        
    notifications = []
    
    # --- LOGIC 1: NOTIFIKASI KE UMKM (VENDOR) ---
    # Kelompokkan item berdasarkan user_id (Vendor Pemilik)
    vendor_groups = {}
    for item in expiring_items:
        uid = item.get("user_id")
        
        # Jika data lama (tidak ada user_id), skip
        if not uid:
            continue
            
        if uid not in vendor_groups:
            vendor_groups[uid] = []
        vendor_groups[uid].append(item)
        
    # Lokasi SPPG (Monas - Jakarta Pusat)
    sppg_lat = -6.175392
    sppg_long = 106.827153
    
    # Loop setiap Vendor untuk kirim notifikasi personal
    for uid, items in vendor_groups.items():
        # 1. Ambil Data User (Vendor) dari Database
        try:
            user_res = supabase.table("users").select("full_name, phone_number, latitude, longitude").eq("id", uid).single().execute()
            vendor_user = user_res.data
        except Exception as e:
            print(f"⚠️ Gagal ambil data user {uid}: {e}")
            continue

        if not vendor_user:
            continue

        # 2. Siapkan Data Pesan
        vendor_name = vendor_user.get('full_name', 'Mitra Vendor')
        phone = vendor_user.get('phone_number', '-')
        item_names = ", ".join([f"{i['item_name']} ({i['quantity']} {i['unit']})" for i in items])
        
        # Hitung jarak vendor ke SPPG (Jika vendor punya GPS)
        v_lat = vendor_user.get('latitude')
        v_long = vendor_user.get('longitude')
        
        dist_info = ""
        if v_lat and v_long:
            dist = haversine_distance(v_lat, v_long, sppg_lat, sppg_long)
            dist_info = f"Lokasi SPPG terdekat berjarak {dist:.1f} km dari titik Anda."
        else:
            dist_info = "Segera tawarkan ke SPPG terdekat."
            
        # 3. Format Pesan WhatsApp
        msg = {
            "to": f"{vendor_name} ({phone})",
            "role": "Vendor (UMKM)",
            "type": "WARNING",
            "message": (
                f"⚠️ Halo {vendor_name}!\n"
                f"Stok berikut akan segera kadaluarsa: {item_names}.\n"
                f"{dist_info}\n"
                f"Saran: Diskonkan sekarang atau donasikan ke Dapur Umum sebelum rugi total!"
            )
        }
        notifications.append(msg)
        
    # --- LOGIC 2: NOTIFIKASI KE SPPG (KITCHEN) ---
    # SPPG butuh solusi (Resep Penyelamatan) dari SEMUA bahan yang mau busuk
    all_expiring_names = sorted([i['item_name'] for i in expiring_items])
    
    if not all_expiring_names:
         # Jika tidak ada item valid, return yang sudah ada
         return {
            "status": "success", 
            "data": notifications,
            "expiring_items": expiring_items,
            "rescue_menu": None
        }

    items_hash = ",".join(all_expiring_names)
    
    global _RESCUE_MENU_CACHE
    
    # Cek Cache: Jika daftar bahannya sama persis, jangan tanya AI lagi (Hemat Biaya)
    if _RESCUE_MENU_CACHE["hash"] == items_hash and _RESCUE_MENU_CACHE["menu"]:
        print("⚡ Using Cached Rescue Menu (Saving AI Tokens)")
        rescue_menu = _RESCUE_MENU_CACHE["menu"]
    else:
        print("🤖 Generating New Rescue Menu via AI...")
        # Minta AI buatkan resep penyelamatan
        rescue_menu_data = generate_menu_recommendation(all_expiring_names)
        
        # Normalisasi struktur data dari AI (kadang return list, kadang dict)
        if isinstance(rescue_menu_data, dict) and "recommendations" in rescue_menu_data:
             rescue_menu = rescue_menu_data["recommendations"][0]
        elif isinstance(rescue_menu_data, list) and len(rescue_menu_data) > 0:
            rescue_menu = rescue_menu_data[0]
        elif isinstance(rescue_menu_data, dict) and "menu_name" in rescue_menu_data:
             rescue_menu = rescue_menu_data
        else:
            print(f"⚠️ Invalid Rescue Menu Data: {rescue_menu_data}")
            rescue_menu = None
            
        # Simpan ke cache
        if rescue_menu:
            _RESCUE_MENU_CACHE = {"hash": items_hash, "menu": rescue_menu}
    
    if rescue_menu:
        menu_name = rescue_menu.get("menu_name", "Tumis Campur Darurat")
        
        # Format pesan WhatsApp untuk Kitchen Admin
        ingredients_str = "\n".join([f"- {i}" for i in rescue_menu.get("ingredients_needed", [])])
        steps_str = "\n".join([f"{idx+1}. {step}" for idx, step in enumerate(rescue_menu.get("cooking_steps", []))])
        
        nut = rescue_menu.get("nutrition", {})
        nutrition_str = f"Kalori: {nut.get('calories', '-')}, Protein: {nut.get('protein', '-')}"
        
        message_body = f"""🚨 ALERTA DAPUR: Bahan-bahan berikut hampir expired: {', '.join(all_expiring_names)}!
        
REKOMENDASI AI: Masak '{menu_name}' hari ini untuk menyelamatkan stok!

🛒 Bahan Diperlukan:
{ingredients_str}

👨‍🍳 Cara Masak:
{steps_str}

📊 Estimasi Nutrisi: {nutrition_str}
Reasoning AI: {rescue_menu.get('reason')}"""

        msg_sppg = {
            "to": "Admin Kitchen SPPG (Broadcast)",
            "role": "SPPG (Kitchen)",
            "type": "URGENT + RECIPE",
            "message": message_body
        }
        notifications.append(msg_sppg)
    
    # Return data terstruktur untuk ditampilkan di Frontend (ExpiryAlerts component)
    return {
        "status": "success", 
        "data": notifications,
        "expiring_items": expiring_items,
        "rescue_menu": rescue_menu
    }