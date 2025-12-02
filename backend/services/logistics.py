import math
import random
from .clients import supabase

# --- DATA SPPG (HARDCODED NETWORK) ---
SPPG_LOCATIONS = [
    {"id": 1, "name": "SPPG Jakarta Pusat (Monas)", "address": "Jl. Medan Merdeka Barat, Gambir", "lat": -6.175392, "long": 106.827153, "phone": "0812-3456-7890"},
    {"id": 2, "name": "SPPG Jakarta Selatan (Blok M)", "address": "Jl. Melawai Raya, Kebayoran Baru", "lat": -6.244223, "long": 106.801782, "phone": "0812-9876-5432"},
    {"id": 3, "name": "SPPG Jakarta Barat (Grogol)", "address": "Jl. Kyai Tapa, Grogol Petamburan", "lat": -6.167570, "long": 106.790960, "phone": "0812-1122-3344"},
    {"id": 4, "name": "SPPG Jakarta Timur (Jatinegara)", "address": "Jl. Matraman Raya, Jatinegara", "lat": -6.215116, "long": 106.870434, "phone": "0812-5566-7788"},
    {"id": 5, "name": "SPPG Jakarta Utara (Kelapa Gading)", "address": "Jl. Boulevard Raya, Kelapa Gading", "lat": -6.162331, "long": 106.900220, "phone": "0812-9988-7766"}
]

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Hitung jarak antara dua titik koordinat (km)
    """
    R = 6371  # Radius bumi dalam km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) * math.sin(dlat / 2) + math.cos(math.radians(lat1)) \
        * math.cos(math.radians(lat2)) * math.sin(dlon / 2) * math.sin(dlon / 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def search_suppliers(keyword: str, user_lat: float = -6.175392, user_long: float = 106.827153):
    """
    Cari supplier dan urutkan berdasarkan JARAK TERDEKAT.
    Default User Location: Monas (Jakarta Pusat).
    """
    print(f"🔍 Mencari supplier '{keyword}' dekat {user_lat}, {user_long}")
    
    try:
        # 1. Ambil data dari DB (Filter nama dulu)
        response = supabase.table("supplies")\
            .select("*")\
            .ilike("item_name", f"%{keyword}%")\
            .execute()
            
        items = response.data
        
        # 2. Inject Dummy Location & Hitung Jarak
        # (Karena data DB belum ada lat/long beneran, kita simulasi di sini biar demo lancar)
        
        results_with_distance = []
        for item in items:
            # 1. Coba ambil Real GPS dari Database
            item_lat = item.get('latitude')
            item_long = item.get('longitude')
            
            # 2. Fallback ke Simulasi jika data GPS kosong (None)
            if item_lat is None or item_long is None:
                # Simulasi koordinat random sekitar Jakarta (± 0.05 derajat)
                item_lat = -6.175392 + random.uniform(-0.05, 0.05)
                item_long = 106.827153 + random.uniform(-0.05, 0.05)
            
            dist = haversine_distance(user_lat, user_long, item_lat, item_long)
            
            # Tambahkan info jarak ke item
            item['distance_km'] = round(dist, 1)
            item['location_lat'] = item_lat
            item['location_long'] = item_long
            
            results_with_distance.append(item)
            
        # 3. Urutkan berdasarkan jarak terdekat (Ascending)
        results_with_distance.sort(key=lambda x: x['distance_km'])
        
        return results_with_distance
        
    except Exception as e:
        print(f"❌ Error DB Search: {e}")
        return {"error": "Gagal mencari data"}

def search_nearest_sppg(user_lat: float, user_long: float):
    """
    Cari SPPG terdekat dari lokasi user (Vendor).
    """
    results = []
    for sppg in SPPG_LOCATIONS:
        dist = haversine_distance(user_lat, user_long, sppg['lat'], sppg['long'])
        sppg_copy = sppg.copy()
        sppg_copy['distance_km'] = round(dist, 2)
        results.append(sppg_copy)
    
    # Urutkan dari yang terdekat
    results.sort(key=lambda x: x['distance_km'])
    return results
