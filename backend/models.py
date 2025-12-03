from pydantic import BaseModel
from typing import Optional, List

# ==========================================
# 🔐 1. AUTH MODELS (OTENTIKASI)
# ==========================================

class UserRegister(BaseModel):
    full_name: str
    email: str
    username: str
    password: str
    role: str # 'vendor' atau 'kitchen'
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class GoogleLoginRequest(BaseModel):
    token: str
    role: str = "vendor" # Default role jika user baru

# ==========================================
# 📦 2. SUPPLY CHAIN MODELS (STOK)
# ==========================================

class SupplyItem(BaseModel):
    # Field Wajib (dari AI/Input User)
    name: str           # Contoh: "Bawang Merah"
    qty: int            # Contoh: 5
    unit: str           # Contoh: "Pcs"
    freshness: str      # Contoh: "Sangat Segar"
    expiry_days: int    # Contoh: 14
    
    # Field Optional (Default Value)
    note: Optional[str] = None      # Alasan AI
    
    # Field ini akan diisi otomatis oleh Backend berdasarkan Token Login
    owner_name: Optional[str] = None  
    location: Optional[str] = None 
    
    # Field Lokasi (GPS)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Field Tambahan (Update Produksi)
    photo_url: Optional[str] = None     # Link Foto Bukti
    expiry_date: Optional[str] = None   # Tanggal Pasti (YYYY-MM-DD)

# ==========================================
# 🍽️ 3. KITCHEN & ORDER MODELS (TRANSAKSI)
# ==========================================

class MenuRequest(BaseModel):
    ingredients: List[str] # Contoh: ["Bayam", "Tahu"]

class OrderRequest(BaseModel):
    supply_id: int
    qty_ordered: int
    # Buyer name diambil otomatis dari Token Login
    buyer_name: Optional[str] = None 

class OrderStatusUpdate(BaseModel):
    status: str # 'confirmed', 'completed', 'pending'

class CookRequest(BaseModel):
    menu_name: str
    qty_produced: int
    ingredients_ids: List[int] # ID barang di gudang yang dipakai
    
class MealAnalysisRequest(BaseModel):
    # Model dummy untuk dokumentasi, implementasi pakai UploadFile di main.py
    pass 

# ==========================================
# 📡 4. IOT & SMART STORAGE MODELS
# ==========================================

class IoTLogRequest(BaseModel):
    temperature: float
    humidity: float
    device_id: str = "SENSOR-01"

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = "general" # 'cooking', 'shopping', etc