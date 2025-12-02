import base64
import json
from .clients import kolosal_client
from prompts import (
    get_inventory_analysis_prompt,
    get_cooked_meal_analysis_prompt
)

def encode_image_to_base64(image_bytes):
    """Helper buat ubah bytes gambar jadi string base64"""
    return base64.b64encode(image_bytes).decode('utf-8')

def analyze_market_inventory(image_bytes):
    """
    Claude untuk Deteksi Jenis, Hitung Jumlah, Cek Kualitas.
    """
    
    print("✨ Mengirim gambar ke Claude Sonnet 4.5 (All-in-One Analysis)...")
    
    # 1. Siapkan Gambar
    base64_image = encode_image_to_base64(image_bytes)

    # 2. Prompt Claude
    prompt_text = get_inventory_analysis_prompt()

    try:
        # 3. Panggil API Colossal
        response = kolosal_client.chat.completions.create(
            model="Claude Sonnet 4.5", # Pastikan nama model sesuai instruksi Colossal
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000,
            temperature=0.1 # Penting! Rendah biar dia teliti ngitung (gak kreatif/halu)
        )
        
        # 4. Parsing Hasil
        content = response.choices[0].message.content
        print(f"🤖 Claude Raw Response: {content[:100]}...") # Debug dikit

        # Bersihin markdown kalau ada
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        parsed_data = json.loads(cleaned_content)
        
        # 5. Format Return
        final_data = []
        for item in parsed_data.get("items", []):
            final_data.append({
                "name": item.get("name"),
                "qty": item.get("qty"),
                "unit": item.get("unit"),
                "freshness": item.get("freshness"),
                "expiry": item.get("expiry_days"),
                "note": item.get("visual_reasoning") # Bonus: alesan AI-nya
            })
            
        return {"status": "success", "data": final_data}

    except json.JSONDecodeError:
        print("❌ Error: Claude tidak mengembalikan JSON valid.")
        return {"error": "AI Error (Invalid JSON)"}
    except Exception as e:
        print(f"❌ Error API: {e}")
        return {"error": f"Gagal analisis: {str(e)}"}

def analyze_cooked_meal(image_bytes):
    """
    VISI KOMPUTER UNTUK MAKANAN JADI (QC FINAL)
    Cek basi/tidak, estimasi gizi visual.
    """
    print("🍱 Menganalisis Makanan Jadi...")
    base64_image = encode_image_to_base64(image_bytes)
    
    prompt_text = get_cooked_meal_analysis_prompt()
    
    try:
        response = kolosal_client.chat.completions.create(
            model="Claude Sonnet 4.5",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                    ]
                }
            ],
            max_tokens=600
        )
        content = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        return json.loads(content)
    except Exception as e:
        return {"error": str(e)}
