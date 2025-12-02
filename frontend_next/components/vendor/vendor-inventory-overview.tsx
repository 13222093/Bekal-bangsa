"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Warehouse, TrendingUp } from "lucide-react"

interface VendorSupply {
  name: string
  quantity: number
  unit: string
  freshness: string
}

export default function VendorInventoryOverview() {
  const [supplies, setSupplies] = useState<VendorSupply[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const response = await fetch("/api/supplies/vendor")
        const data = await response.json()
        setSupplies(data.supplies || [])
      } catch (error) {
        console.error("Error fetching vendor supplies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSupplies()
  }, [])

  const barChartData = supplies.map((s) => ({
    name: s.name.substring(0, 8),
    quantity: s.quantity,
  }))

  const freshnessData = [
    {
      name: "Segar",
      value: supplies.filter((s) => s.freshness === "Segar").length,
    },
    {
      name: "Sedang",
      value: supplies.filter((s) => s.freshness === "Sedang").length,
    },
    {
      name: "Buruk",
      value: supplies.filter((s) => s.freshness === "Buruk").length,
    },
  ].filter((f) => f.value > 0)

  const COLORS = ["#2D7A3E", "#D97E1A", "#EF4444"]

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Memuat persediaan...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-primary" />
              Total Item
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-foreground">{supplies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">item tersedia</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-amber-50 border-b border-secondary/20 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              Total Kuantitas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-foreground">{supplies.reduce((sum, s) => sum + s.quantity, 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">unit seluruh persediaan</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-primary/20 pb-3">
            <CardTitle className="text-sm">Kondisi Terbaik</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-primary">
              {supplies.filter((s) => s.freshness === "Segar").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">item segar</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        {barChartData.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20">
              <CardTitle>Persediaan per Item</CardTitle>
              <CardDescription>Jumlah stok untuk setiap bahan</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
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
                  <Bar dataKey="quantity" fill="#2D7A3E" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart */}
        {freshnessData.length > 0 && (
          <Card className="border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-amber-50 border-b border-secondary/20">
              <CardTitle>Distribusi Kesegaran</CardTitle>
              <CardDescription>Kondisi kesegaran persediaan</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={freshnessData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {freshnessData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
