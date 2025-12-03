# backend/reset_admin.py
from database import supabase
from security import get_password_hash

# 1. Buat Hash yang VALID di komputer ini
password_baru = "123456"
hash_baru = get_password_hash(password_baru)

print(f"Generating hash for '{password_baru}'...")
print(f"New Hash: {hash_baru}")

# 2. Update User 'bu_susi' dengan hash ini
try:
    response = supabase.table("users").update({"password": hash_baru}).eq("username", "bu_susi").execute()
    print("✅ Berhasil reset password Bu Susi!")
    print(response.data)
except Exception as e:
    print(f"❌ Gagal update: {e}")

try:
    response = supabase.table("users").update({"password": hash_baru}).eq("username", "pak_asep").execute()
    print("✅ Berhasil reset password Bu Susi!")
    print(response.data)
except Exception as e:
    print(f"❌ Gagal update: {e}")

# 3. Update User 'admin_pusat' (Kitchen) sekalian
try:
    supabase.table("users").update({"password": hash_baru}).eq("username", "sppg_pusat").execute()
    print("✅ Berhasil reset password Admin Pusat!")
except Exception as e:
    print(f"❌ Gagal update kitchen: {e}")

try:
    supabase.table("users").update({"password": hash_baru}).eq("username", "sppg_selatan").execute()
    print("✅ Berhasil reset password Admin Pusat!")
except Exception as e:
    print(f"❌ Gagal update kitchen: {e}")