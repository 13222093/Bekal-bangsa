"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import RoleSelector from "@/components/role-selector"
import VendorDashboard from "@/components/vendor/vendor-dashboard"
import KitchenDashboard from "@/components/kitchen/kitchen-dashboard"
import ErrorBoundary from "@/components/shared/error-boundary"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  // State untuk menyimpan role user (vendor/kitchen)
  const [userRole, setUserRole] = useState<"vendor" | "kitchen" | null>(null)
  // State loading agar tidak "flash" tampilan landing page saat sedang mengecek token
  const [isLoading, setIsLoading] = useState(true)

  // --- LOGIC PENGECEKAN LOGIN ---
  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Cek apakah ada token & data user di LocalStorage
        const token = localStorage.getItem("token")
        const userStr = localStorage.getItem("user")
        
        if (token && userStr) {
          const user = JSON.parse(userStr)
          
          // 2. Jika ada, set Role sesuai data user (otomatis masuk dashboard)
          if (user.role === "vendor" || user.role === "kitchen") {
            setUserRole(user.role)
          } else {
            // Role tidak valid/tidak dikenal
            setUserRole(null)
          }
        } else {
          // 3. Jika tidak ada token, biarkan user di Landing Page
          setUserRole(null)
        }
      } catch (e) {
        console.error("Gagal membaca data login:", e)
        // Jika data korup, bersihkan sekalian biar user login ulang
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUserRole(null)
      } finally {
        setIsLoading(false) // Proses pengecekan selesai
      }
    }

    checkAuth()
  }, [])

  // --- LOGIC LOGOUT ---
  const handleLogout = () => {
    // Hapus data dari browser
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    
    // Reset state agar tampilan kembali ke RoleSelector
    setUserRole(null)
    router.refresh()
  }

  // Tampilkan Loading Spinner saat aplikasi baru dibuka (sedang cek token)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
          <p className="text-emerald-700 font-medium">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        {/* LOGIKA SWITCHING TAMPILAN BERDASARKAN ROLE */}
        
        {userRole === "vendor" ? (
          // Jika Vendor Login -> Tampilkan Dashboard Vendor
          <VendorDashboard onLogout={handleLogout} />
        ) : userRole === "kitchen" ? (
          // Jika Kitchen Login -> Tampilkan Dashboard Kitchen
          <KitchenDashboard onLogout={handleLogout} />
        ) : (
          // Jika Belum Login -> Tampilkan Landing Page (Pilih Role)
          <RoleSelector /> 
        )}
      </main>
    </ErrorBoundary>
  )
}