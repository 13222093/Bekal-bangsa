"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Warehouse } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Supply {
  id: number
  name: string
  qty: number
  unit: string
  freshness: string
  expiry_days: number
  owner_name: string
  location: string
}

export default function SupplyOverview() {
  const [supplies, setSupplies] = useState<Supply[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await fetch("/api/supplies")
        const data = await response.json()
        setSupplies(data.supplies || [])
      } catch (error) {
        console.error("Error fetching supplies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupplies()
  }, [])

  const filteredSupplies = supplies.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const chartData = supplies.map((s) => ({
    name: s.name.substring(0, 8),
    qty: s.qty,
    expiryDays: s.expiry_days,
  }))

  const expiryDistribution = [
    {
      name: "Urgent (0-2d)",
      value: supplies.filter((s) => s.expiry_days <= 2).length,
    },
    {
      name: "Warning (3-5d)",
      value: supplies.filter((s) => s.expiry_days > 2 && s.expiry_days <= 5).length,
    },
    {
      name: "Normal (6+d)",
      value: supplies.filter((s) => s.expiry_days > 5).length,
    },
  ]

  const COLORS = ["#EF4444", "#EAB308", "#2D7A3E"]

  const getUrgencyColor = (expiryDays: number) => {
    if (expiryDays <= 2) return "bg-red-100 text-red-700 border border-red-300"
    if (expiryDays <= 5) return "bg-yellow-100 text-yellow-700 border border-yellow-300"
    return "bg-emerald-100 text-emerald-700 border border-emerald-300"
  }

  const getUrgencyBg = (expiryDays: number) => {
    if (expiryDays <= 2) return "bg-red-50 border-l-4 border-l-red-500"
    if (expiryDays <= 5) return "bg-yellow-50 border-l-4 border-l-yellow-500"
    return "bg-emerald-50 border-l-4 border-l-primary"
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Memuat persediaan...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20 pb-3">
            <CardTitle className="text-sm">Total Bahan</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-foreground">{supplies.length}</div>
            <p className="text-xs text-muted-foreground">jenis bahan</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200 pb-3">
            <CardTitle className="text-sm">Urgent</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-red-600">{supplies.filter((s) => s.expiry_days <= 2).length}</div>
            <p className="text-xs text-muted-foreground">akan segera kadaluarsa</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 pb-3">
            <CardTitle className="text-sm">Warning</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-yellow-600">
              {supplies.filter((s) => s.expiry_days > 2 && s.expiry_days <= 5).length}
            </div>
            <p className="text-xs text-muted-foreground">kadaluarsa dalam 3-5 hari</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200 pb-3">
            <CardTitle className="text-sm">Stabil</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-emerald-600">
              {supplies.filter((s) => s.expiry_days > 5).length}
            </div>
            <p className="text-xs text-muted-foreground">kondisi baik</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20">
              <CardTitle>Persediaan per Bahan</CardTitle>
              <CardDescription>Jumlah stok masing-masing bahan</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="qty" fill="#2D7A3E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-amber-50 border-b border-secondary/20">
              <CardTitle>Distribusi Urgensi Kadaluarsa</CardTitle>
              <CardDescription>Status kadaluarsa persediaan</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expiryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expiryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Grid */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-lg">
              <Warehouse className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Daftar Persediaan</CardTitle>
              <CardDescription>Detail semua bahan tersedia</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input
              placeholder="Cari bahan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-primary/30 focus:border-primary"
            />
          </div>

          {filteredSupplies.length === 0 ? (
            <Alert className="bg-amber-50 border border-secondary/30">
              <AlertCircle className="h-4 w-4 text-secondary" />
              <AlertDescription className="text-secondary">Tidak ada persediaan tersedia</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSupplies.map((supply) => (
                <div
                  key={supply.id}
                  className={`rounded-lg p-4 space-y-3 hover:shadow-md transition-all border-0 ${getUrgencyBg(supply.expiry_days)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{supply.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {supply.qty} {supply.unit}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-semibold ${getUrgencyColor(supply.expiry_days)}`}
                      >
                        {supply.expiry_days}d
                      </span>
                      {supply.expiry_days <= 2 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Urgent</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-foreground/10 pt-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Kondisi:</span> {supply.freshness}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Dari:</span> {supply.owner_name}
                    </p>
                  </div>

                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white font-medium rounded-lg">
                    Lihat Detail
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
