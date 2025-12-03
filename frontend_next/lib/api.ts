// frontend_next/lib/api.ts

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Wrapper standar untuk fetch API dengan otomatisasi Token Auth.
 */
export async function apiCall<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`

    // 1. Siapkan Header Standar (JSON)
    // Kita deklarasikan sebagai Record<string, string> agar TypeScript tidak rewel saat nambah field baru
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    // 2. Cek apakah ada Token Login di browser?
    // (Hanya jalan di sisi client, bukan server-side rendering awal)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        // Tempelkan tiket masuk ke header
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    // 3. Gabungkan dengan header tambahan jika ada dari parameter options
    if (options?.headers) {
      Object.assign(headers, options.headers)
    }

    // 4. Kirim Request ke Backend
    const response = await fetch(url, {
      ...options,
      headers: headers, // Header yang sudah lengkap (JSON + Token)
    })

    // 5. Cek jika Response Kosong (Misal 204 No Content)
    if (response.status === 204) {
      return { success: true }
    }

    const data = await response.json()

    // 6. Handle Error dari Backend
    if (!response.ok) {
      console.error(`[API] Error (${response.status}):`, data)

      // KHUSUS: Jika Error 401 (Unauthorized/Token Expired)
      if (response.status === 401 && typeof window !== "undefined") {
        console.warn("Sesi habis, logout otomatis...")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        // Redirect paksa ke halaman login (Opsional)
        // window.location.href = "/login" 
      }

      return {
        success: false,
        error: data.detail || data.message || data.error || "Terjadi kesalahan pada server",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[API] Network Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal terhubung ke server",
    }
  }
}

// --- KUMPULAN FUNGSI API SPESIFIK ---

export const API = {
  // 1. Upload & Vision AI (Butuh penanganan khusus karena Multipart Form Data)
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    
    // Ambil token manual karena kita tidak pakai apiCall (agar Content-Type dihandle otomatis oleh browser)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`

    return fetch(`${API_BASE}/upload`, { 
        method: "POST", 
        body: formData,
        headers 
    })
  },

  analyzeImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`

    return fetch(`${API_BASE}/analyze`, { 
        method: "POST", 
        body: formData,
        headers
    })
  },

  // 2. Supply (Stok Gudang)
  saveSupplies: (items: any[]) => apiCall("/supplies", { 
      method: "POST", 
      body: JSON.stringify(items) 
  }),

  getSupplies: () => apiCall("/supplies"),

  // Pencarian Supplier (Public/Protected)
  searchSuppliers: (query: string, lat?: number, long?: number) =>
    apiCall(`/suppliers/search?q=${query}${lat ? `&lat=${lat}` : ""}${long ? `&long=${long}` : ""}`),

  // 3. Menu & AI Chef
  getMenuRecommendations: (ingredients: string[]) =>
    apiCall("/recommend-menu", { 
        method: "POST", 
        body: JSON.stringify({ ingredients }) 
    }),

  // 4. Orders (Transaksi)
  getVendorOrders: () => apiCall("/orders/umkm"), // Khusus Vendor

  getKitchenOrders: () => apiCall("/orders/kitchen"), // Khusus Kitchen

  updateOrder: (orderId: number, status: string) =>
    apiCall(`/orders/${orderId}`, { 
        method: "PUT", 
        body: JSON.stringify({ status }) 
    }),

  // 5. Kitchen Actions (Masak)
  startCooking: (menuName: string, qtyProduced: number, ingredientIds: number[]) =>
    apiCall("/kitchen/cook", {
      method: "POST",
      body: JSON.stringify({ 
          menu_name: menuName, 
          qty_produced: qtyProduced, 
          ingredients_ids: ingredientIds 
      }),
    }),

  // 6. IoT & Monitoring
  getIoTLogs: () => apiCall("/iot/logs"),

  // 7. Notifikasi
  triggerNotifications: () => apiCall("/notifications/trigger", { method: "POST" }),
}