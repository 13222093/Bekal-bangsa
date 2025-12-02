import time
from fastapi import UploadFile
from .clients import supabase

async def upload_image_to_supabase(file: UploadFile) -> str:
    """
    Upload file gambar ke Supabase Storage dan kembalikan URL publiknya.
    """
    try:
        # 1. Baca file bytes
        file_bytes = await file.read()
        
        # 2. Generate nama file unik (timestamp_filename)
        timestamp = int(time.time())
        filename = f"{timestamp}_{file.filename}"
        
        # 3. Upload ke Supabase Storage (Bucket: 'supply-photos')
        # Pastikan bucket 'supply-photos' sudah dibuat di Supabase Dashboard!
        bucket_name = "supply-photos"
        
        response = supabase.storage.from_(bucket_name).upload(
            path=filename,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        
        # 4. Ambil Public URL
        public_url = supabase.storage.from_(bucket_name).get_public_url(filename)
        
        return public_url
        
    except Exception as e:
        print(f"❌ Error Upload Supabase: {e}")
        # Jangan raise error biar flow gak putus, tapi return None atau string kosong
        # Nanti di main.py bisa dicek
        return None
