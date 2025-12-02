import base64
import json
from .clients import kolosal_client
from prompts import (
    get_inventory_analysis_prompt,
    get_cooked_meal_analysis_prompt
)

from PIL import Image
import io

def resize_image(image_bytes, max_size=(1024, 1024)):
    """Resize image to avoid huge payloads"""
    try:
        # Check if image_bytes is valid
        if not image_bytes or len(image_bytes) == 0:
            print(f"❌ Image bytes is empty or None")
            return None
            
        print(f"📦 Image size before resize: {len(image_bytes)} bytes")
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if RGBA (PNG)
        if image.mode == 'RGBA':
            image = image.convert('RGB')
            
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        buffer = io.BytesIO()
        image.save(buffer, format="JPEG", quality=85)
        resized = buffer.getvalue()
        print(f"✅ Image resized: {len(resized)} bytes")
        return resized
    except Exception as e:
        print(f"⚠️ Resize failed ({type(e).__name__}: {e}), using original image")
        print(f"📦 Original image size: {len(image_bytes) if image_bytes else 0} bytes")
        return image_bytes

def encode_image_to_base64(image_bytes):
    """Helper buat ubah bytes gambar jadi string base64"""
    # Resize dulu sebelum encode!
    resized_bytes = resize_image(image_bytes)
    return base64.b64encode(resized_bytes).decode('utf-8')

def analyze_market_inventory(image_bytes):
    """
    Claude untuk Deteksi Jenis, Hitung Jumlah, Cek Kualitas.
    """
    
    print("✨ Mengirim gambar ke Claude Sonnet 4.5 (All-in-One Analysis)...")
    
    # 1. Siapkan Gambar (Base64 dengan Resize)
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
                "expiry_days": item.get("expiry_days"),
                "note": item.get("visual_reasoning") # Bonus: alesan AI-nya
            })
            
        return {"status": "success", "items": final_data}

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
    import re
    
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
        content = response.choices[0].message.content
        print(f"🤖 Claude Raw Response (Cooked Meal): {content[:200]}...")
        
        # Clean markdown
        cleaned_content = content.replace("```json", "").replace("```", "").strip()
        
        # Try to extract just the main JSON object (ignore extra fields)
        # Find the first { and try to find the matching }
        try:
            parsed_data = json.loads(cleaned_content)
        except json.JSONDecodeError:
            # If full parse fails, try to extract just what we need
            print("⚠️ Full JSON parse failed, attempting partial extraction...")
            parsed_data = {}
            
            # Extract menu_name
            menu_match = re.search(r'"menu_name"\s*:\s*"([^"]+)"', cleaned_content)
            if menu_match:
                parsed_data["menu_name"] = menu_match.group(1)
            
            # Extract is_safe
            safe_match = re.search(r'"is_safe"\s*:\s*(true|false)', cleaned_content)
            if safe_match:
                parsed_data["is_safe"] = safe_match.group(1) == "true"
            
            # Extract visual_quality
            quality_match = re.search(r'"visual_quality"\s*:\s*"([^"]+)"', cleaned_content)
            if quality_match:
                parsed_data["visual_quality"] = quality_match.group(1)
            
            # Extract nutrition values
            parsed_data["nutrition_estimate"] = {}
            for nutrient in ["calories", "protein", "carbs", "fats", "fat"]:
                pattern = f'"{nutrient}"\\s*:\\s*"([^"]+)"'
                match = re.search(pattern, cleaned_content)
                if match:
                    value_str = match.group(1)
                    # Extract first number from strings like "650-750 kkal" or "25-30 gram"
                    number_match = re.search(r'(\d+)', value_str)
                    if number_match:
                        parsed_data["nutrition_estimate"][nutrient] = number_match.group(1)
        
        # Normalize nutrition values (handle both "fat" and "fats")
        if "nutrition_estimate" in parsed_data:
            nutr = parsed_data["nutrition_estimate"]
            if "fat" in nutr and "fats" not in nutr:
                nutr["fats"] = nutr["fat"]
        
        print(f"✅ Parsed Data: {parsed_data}")
        return parsed_data
    except json.JSONDecodeError as e:
        print(f"❌ JSON Decode Error: {e}")
        print(f"❌ Content was: {content}")
        return {"error": f"Invalid JSON: {str(e)}"}
    except Exception as e:
        print(f"❌ API Error: {e}")
        return {"error": str(e)}
