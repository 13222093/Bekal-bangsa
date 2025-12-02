"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock, ShoppingBag } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Order {
    id: number
    supply_name: string
    qty_ordered: number
    buyer_name: string
    status: "pending" | "confirmed" | "completed"
    created_at: string
    supplies?: {
        item_name: string
        unit: string
        price_per_unit: number
    }
}

export default function KitchenOrderHistory() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Reusing the UMKM endpoint as it returns all orders with supply details
                const response = await fetch("/api/orders/umkm")
                const data = await response.json()
                // Filter for orders where buyer is SPPG (or just show all for demo)
                // For this demo, we assume all orders are relevant
                setOrders(data.orders || data || [])
            } catch (error) {
                console.error("Error fetching orders:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [])

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
            <Card className="border-0 shadow-md overflow-hidden py-0 gap-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 py-6">
                    <CardTitle className="flex items-center gap-2 text-purple-800">
                        <ShoppingBag className="w-5 h-5" />
                        Riwayat Transaksi
                    </CardTitle>
                    <CardDescription>Memuat riwayat...</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                    <p className="text-center text-muted-foreground">Memuat data...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 shadow-md overflow-hidden py-0 gap-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100 py-6">
                <CardTitle className="flex items-center gap-2 text-purple-800">
                    <ShoppingBag className="w-5 h-5" />
                    Riwayat Transaksi
                </CardTitle>
                <CardDescription className="text-purple-600">
                    Status pesanan bahan baku ke UMKM
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
                {orders.length === 0 ? (
                    <Alert className="bg-purple-50 border-purple-200">
                        <AlertCircle className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-purple-800">Belum ada riwayat transaksi</AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <div key={order.id} className="border border-border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusIcon(order.status)}
                                            <p className="font-semibold text-foreground">
                                                {order.supplies?.item_name || order.supply_name || "Item Tidak Diketahui"}
                                            </p>
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Jumlah: {order.qty_ordered} {order.supplies?.unit || "unit"}</p>
                                            <p className="text-xs">Dipesan pada: {new Date(order.created_at).toLocaleDateString("id-ID", {
                                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusBadge(order.status)}`}>
                                        {order.status === "pending" ? "Menunggu Konfirmasi" :
                                            order.status === "confirmed" ? "Dikonfirmasi" :
                                                order.status === "completed" ? "Selesai" : order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
