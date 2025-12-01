import os
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# Load env dari folder backend
load_dotenv(Path(__file__).parent / ".env")

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise ValueError("❌ SUPABASE_URL atau SUPABASE_KEY belum diisi di .env!")

# Bikin client global biar bisa dipanggil di mana aja
supabase: Client = create_client(url, key)