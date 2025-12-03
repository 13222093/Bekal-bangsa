"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, UtensilsCrossed, Leaf } from "lucide-react"
import { useRouter } from "next/navigation"

export default function RoleSelector() {
  const router = useRouter()

  const handleSelectRole = (role: "vendor" | "kitchen") => {
    // Redirect ke halaman Login dengan query param role
    // Halaman login nanti akan membaca param ini untuk menyesuaikan judul & form
    router.push(`/login?role=${role}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-emerald-600 to-primary p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-8 h-8 text-white" />
            <h1 className="text-5xl md:text-6xl font-bold text-white">Bekal Bangsa</h1>
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <p className="text-xl md:text-2xl text-emerald-50 font-medium">Dari Lahan Lokal, Jadi Bekal Masa Depan</p>
          <p className="text-emerald-100 text-sm md:text-base">Platform Cerdas untuk Ekosistem Pangan Lokal</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-6">
          
          {/* Vendor Card */}
          <Card
            className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => handleSelectRole("vendor")}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-amber-400"></div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-secondary/20 to-amber-100 p-6 rounded-2xl group-hover:scale-110 transition-transform">
                  <ShoppingCart className="w-16 h-16 text-secondary" />
                </div>
              </div>
              <CardTitle className="text-3xl text-foreground">UMKM Vendor</CardTitle>
              <CardDescription className="text-base mt-2">Jual & Donasikan Persediaan Makanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-secondary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Ambil foto dengan AI atau upload file</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-secondary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Deteksi lokasi otomatis dengan GPS</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-secondary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Cari SPPG terdekat berdasarkan jarak</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-secondary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Pantau status pesanan real-time</span>
                </li>
              </ul>
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-semibold py-6 text-base rounded-lg">
                Masuk Sebagai Vendor
              </Button>
            </CardContent>
          </Card>

          {/* Kitchen Card */}
          <Card
            className="border-0 shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden relative"
            onClick={() => handleSelectRole("kitchen")}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400"></div>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-br from-primary/20 to-emerald-100 p-6 rounded-2xl group-hover:scale-110 transition-transform">
                  <UtensilsCrossed className="w-16 h-16 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl text-foreground">Kitchen Admin</CardTitle>
              <CardDescription className="text-base mt-2">Kelola Persediaan & Produksi Makanan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-primary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Dashboard persediaan dari semua vendor</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-primary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Rekomendasi menu berbasis AI</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-primary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Pantau produksi dengan nutrisi otomatis</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-primary font-bold text-lg mt-0.5">✓</span>
                  <span className="text-sm text-foreground/80">Monitor IoT suhu & kelembaban real-time</span>
                </li>
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base rounded-lg">
                Masuk Sebagai Kitchen Admin
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="text-center text-emerald-50 text-sm">
          <p>Platform untuk Program Makan Bergizi Gratis yang lebih baik</p>
        </div>
      </div>
    </div>
  )
}