from pydantic import BaseModel
from typing import Optional, List

# --- MODEL DATA BARANG (SUPPLY) ---
class SupplyItem(BaseModel):
    # Field ini WAJIB ada (dikirim dari Frontend hasil AI)
    name: str           # Contoh: "Bawang Merah"
    qty: int            # Contoh: 5
    unit: str           # Contoh: "Pcs"
    freshness: str      # Contoh: "Sangat Segar"
    expiry_days: int    # Contoh: 14 (Sesuai output JSON Claude)
    
    # Field ini OPTIONAL (Boleh kosong / default)
    note: Optional[str] = None      # Alasan AI (Reasoning)
    owner_name: str = "Pedagang Pasar"  # Nanti bisa diganti nama user login
    location: str = "Pasar Tradisional" # Nanti bisa ambil dari GPS

# --- MODEL REQUEST MENU (DEMAND) ---
class MenuRequest(BaseModel):
    ingredients: List[str] # Contoh: ["Bayam", "Tahu", "Bawang"]