"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import ExpiryAlerts from "./expiry-alerts"

interface DashboardStats {
  total_supplies: number
  expiring_soon: number
  cooked_today: number
  avg_temp: number
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulate getting stats - in real app would fetch from backend
        setStats({
          total_supplies: 156,
          expiring_soon: 12,
          cooked_today: 48,
          avg_temp: 2.5,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return <p className="text-center text-muted-foreground">Memuat...</p>
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-accent" />
              Total Persediaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_supplies}</div>
            <p className="text-xs text-muted-foreground">unit bahan</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Akan Kadaluarsa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiring_soon}</div>
            <p className="text-xs text-muted-foreground">dalam 3 hari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Diproduksi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cooked_today}</div>
            <p className="text-xs text-muted-foreground">porsi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Suhu Rata-rata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_temp}°C</div>
            <p className="text-xs text-muted-foreground">dalam range ideal</p>
          </CardContent>
        </Card>
      </div>

      {/* Expiry Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Notifikasi Penting
          </CardTitle>
          <CardDescription>Item yang akan segera kadaluarsa</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpiryAlerts />
        </CardContent>
      </Card>
    </div>
  )
}
