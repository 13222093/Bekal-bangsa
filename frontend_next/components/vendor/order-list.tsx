"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Order {
  id: number
  supply_name: string
  qty_ordered: number
  buyer_name: string
  status: "pending" | "confirmed" | "completed"
  created_at: string
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders/umkm")
        const data = await response.json()
        console.log("[v0] Orders:", data)
        setOrders(data.orders || [])
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await response.json()
      console.log("[v0] Update result:", result)
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o)))
    } catch (error) {
      console.error("Error updating order:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Memuat pesanan...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Masuk</CardTitle>
          <CardDescription>Daftar pesanan dari SPPG untuk persediaan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Tidak ada pesanan saat ini</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(order.status)}
                        <p className="font-semibold text-foreground">{order.supply_name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">Dari: {order.buyer_name}</p>
                      <p className="text-sm text-muted-foreground">Jumlah: {order.qty_ordered} unit</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  {order.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(order.id, "confirmed")}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      Konfirmasi
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
