export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function apiCall<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      console.error(`[v0] API Error (${response.status}):`, data)
      return {
        success: false,
        error: data.error || data.message || "API call failed",
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[v0] API Error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Specific API calls
export const API = {
  // Upload & Analyze
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${API_BASE}/upload`, { method: "POST", body: formData })
  },

  analyzeImage: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return fetch(`${API_BASE}/analyze`, { method: "POST", body: formData })
  },

  // Supplies
  saveSupplies: (items: any[]) => apiCall("/supplies", { method: "POST", body: JSON.stringify(items) }),

  getSupplies: () => apiCall("/supplies"),

  searchSuppliers: (query: string, lat?: number, long?: number) =>
    apiCall(`/suppliers/search?q=${query}${lat ? `&lat=${lat}` : ""}${long ? `&long=${long}` : ""}`),

  // Menu
  getMenuRecommendations: (ingredients: string[]) =>
    apiCall("/recommend-menu", { method: "POST", body: JSON.stringify({ ingredients }) }),

  // Orders
  getVendorOrders: () => apiCall("/orders/umkm"),

  updateOrder: (orderId: number, status: string) =>
    apiCall(`/orders/${orderId}`, { method: "PUT", body: JSON.stringify({ status }) }),

  // Kitchen
  startCooking: (menuName: string, qtyProduced: number, ingredientIds: number[]) =>
    apiCall("/kitchen/cook", {
      method: "POST",
      body: JSON.stringify({ menu_name: menuName, qty_produced: qtyProduced, ingredients_ids: ingredientIds }),
    }),

  // IoT
  getIoTLogs: () => apiCall("/iot/logs"),

  // Notifications
  triggerNotifications: () => apiCall("/notifications/trigger", { method: "POST" }),
}
