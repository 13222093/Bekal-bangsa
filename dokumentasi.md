# 🍱 Bekal Bangsa: Platform Cerdas Ekosistem Pangan Lokal

**"Dari Lahan Lokal, Jadi Bekal Masa Depan"**

Bekal Bangsa adalah platform terintegrasi yang menghubungkan **UMKM/Pedagang Pasar (Vendor)** dengan **Dapur Satuan Pelayanan Gizi (Kitchen Hub)** untuk mendukung program Makan Bergizi Gratis (MBG). Platform ini memanfaatkan **Artificial Intelligence (AI)** dan **Internet of Things (IoT)** untuk efisiensi rantai pasok, kontrol kualitas, dan manajemen gizi.

---

## 🏗️ Tech Stack

### Frontend

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn UI, Lucide React
* **Visualization:** Recharts (Grafik & Analitik)
* **Auth:** JWT Handling & Google OAuth (@react-oauth/google)

### Backend

* **Framework:** FastAPI (Python)
* **Server:** Uvicorn
* **AI Engine:** Claude Sonnet 4.5 (via Kolosal API)

  * *Computer Vision:* Analisis stok mentah & QC makanan jadi
  * *NLP/Chat:* Chatbot asisten dapur & rekomendasi resep
* **Security:** Passlib (Bcrypt hashing), Python-Jose (JWT), Slowapi (Rate Limiting)

### Database & Cloud

* **Database:** Supabase (PostgreSQL)
* **Storage:** Supabase Storage (foto stok & QC)

---

## 🌟 Fitur Utama

### 1. Sistem Otentikasi & Role (RBAC)

* **Multi-Role:** Vendor & Kitchen Admin
* **Login:** Email/Password + Google OAuth
* **Keamanan:** JWT Token & Password Hashing (Bcrypt)

### 2. Modul Vendor (UMKM / Pedagang Pasar)

* Upload inventori berbasis foto dengan AI
* Dashboard status kualitas stok (Segar / Warning / Expired)
* Manajemen pesanan masuk
* Smart GPS untuk hitung jarak ke Kitchen

### 3. Modul Kitchen Admin (SPPG)

* Cari supplier terdekat via GPS real-time
* Pencatatan produksi masakan dan pengurangan stok otomatis
* **AI Nutritionist:** kalkulasi nutrisi & kalori makanan
* **AI Chatbot Assistant** untuk rekomendasi resep
* Quality Control berbasis AI (foto masakan)
* Monitoring IoT (Suhu & Humidity gudang)

---

## 🗄️ Struktur Database Supabase (Ringkas)

TABLE `users`
(id, full_name, username, email, password, role, phone_number, address, latitude, longitude)

TABLE `supplies`
(id, user_id, item_name, quantity, unit, quality_status, expiry_days, expiry_date, photo_url, ai_notes, owner_name, location)

TABLE `orders`
(id, supply_id, buyer_id, seller_id, qty_ordered, status, buyer_name)

TABLE `meal_productions`
(id, menu_name, qty_produced, expiry_datetime, status, storage_tips)

TABLE `storage_logs`
(id, temperature, humidity, device_id, created_at)

---

## 🚀 Instalasi & Menjalankan

### Backend (FastAPI)

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install fastapi uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] supabase openai python-dotenv slowapi google-auth requests
uvicorn main:app --reload
```

Backend berjalan di: **[http://localhost:8000](http://localhost:8000)**

### Frontend (Next.js)

```
cd frontend_next
npm install
npm run dev
```

Frontend berjalan di: **[http://localhost:3000](http://localhost:3000)**

### Environment Variables

* SUPABASE_URL
* SUPABASE_KEY
* KOLOSAL_API_KEY
* GOOGLE_CLIENT_ID
* SECRET_KEY

---

## 📅 Progress Update

### Backend

* Perbaikan proteksi JWT untuk semua endpoint sensitif
* Data antar Vendor kini terisolasi (filter by user id)
* Orders otomatis terhubung berdasarkan pemilik barang
* AI Chatbot membaca stok real-time dari database

### Frontend

* Login & Role navigation real (bukan dummy)
* Interceptor API otomatis pasang Bearer token
* UI Chatbot dengan Voice Input & TTS
* Navbar dinamis (avatar, nama user, lokasi)

### Database

* Penambahan kolom user: username, password, latitude, longitude
* Seed user default (pak_asep, bu_susi, admin_pusat)
* Relasi orders → supplies & users diperbaiki

---

## 🔮 Roadmap Selanjutnya

* Integrasi **QRIS Payment Gateway**
* **PWA Mobile App**
* IoT ESP32 fisik
* Realtime websocket untuk status order

---

## 👥 Tim Pengembang

**Bekal Bangsa — Imphnen Kolosal Hackathon Team**

---
