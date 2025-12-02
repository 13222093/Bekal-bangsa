"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Package, Loader2 } from "lucide-react"
import MenuRecommendation from "./menu-recommendation"
import ExpiryAlerts from "./expiry-alerts"
import InventoryList from "@/components/common/inventory-list"
import KitchenOrderHistory from "./kitchen-order-history"
import KitchenLocation from "./kitchen-location"

export default function KitchenDashboardOverview() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/kitchen")
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
  }

  // Fallback if no data
  const compositionData = analytics?.composition || []
  const qualityData = analytics?.quality || []
  const metrics = analytics?.metrics || { total_items: 0, total_qty: 0, warning_count: 0 }

  // Colors for Pie Chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  return (
    <div className="space-y-6">
      {/* GPS Location Status */}
      <KitchenLocation />

      {/* Alert Banner */}
      <ExpiryAlerts />

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-blue-600">Total Item Terdata</p>
            <p className="text-3xl font-bold text-blue-800">{metrics.total_items} Item</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-green-600">Total Kuantitas</p>
            <p className="text-3xl font-bold text-green-800">{metrics.total_qty} Unit</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-600">Perlu Segera Digunakan</p>
            <p className="text-3xl font-bold text-amber-800">{metrics.warning_count} Item</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart A: Composition (Pie) */}
        <Card className="border-0 shadow-md overflow-hidden py-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20 py-6">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Komposisi Stok
            </CardTitle>
            <CardDescription>Distribusi barang berdasarkan jenis</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={compositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {compositionData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart B: Quality (Bar) */}
        <Card className="border-0 shadow-md overflow-hidden py-0 gap-0">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20 py-6">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Kualitas & Kuantitas
            </CardTitle>
            <CardDescription>Jumlah stok per item berdasarkan status</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={qualityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="fresh" stackId="a" fill="#10B981" name="Segar" />
                <Bar dataKey="warning" stackId="a" fill="#F59E0B" name="Peringatan" />
                <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Kritis" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Menu Recommendation */}
      <MenuRecommendation />

      {/* Inventory List */}
      <InventoryList role="kitchen" />

      {/* Transaction History */}
      <KitchenOrderHistory />
    </div>
  )
}
