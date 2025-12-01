from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services import analyze_market_inventory # Import fungsi yang tadi kita buat

app = FastAPI()

# Setup CORS (Biar Frontend Streamlit/Next bisa akses)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Bekal Bangsa Backend is Running! 🚀"}

@app.post("/api/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    Endpoint utama: Terima gambar -> Proses AI -> Balikin JSON
    """
    # Baca file gambar jadi bytes
    image_bytes = await file.read()
    
    # Panggil Logic di services.py
    result = analyze_market_inventory(image_bytes)
    
    return result