"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Trash2, Clock, AlertTriangle, Info } from "lucide-react"

interface InboxMessage {
  id: number
  type: "expiry" | "alert" | "info"
  title: string
  message: string
  timestamp: string
  read: boolean
  itemName?: string
  daysLeft?: number
}

export default function KitchenInbox() {
  const [messages, setMessages] = useState<InboxMessage[]>([
    {
      id: 1,
      type: "expiry",
      title: "Bahan Segera Kadaluarsa",
      message: "Telur dari vendor Semarang akan kadaluarsa dalam 1 hari",
      timestamp: "2 menit lalu",
      read: false,
      itemName: "Telur",
      daysLeft: 1,
    },
    {
      id: 2,
      type: "alert",
      title: "Kondisi Penyimpanan Tidak Optimal",
      message: "Suhu penyimpanan melebihi batas ideal (> 4°C)",
      timestamp: "30 menit lalu",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "Pesanan Baru Diterima",
      message: "SPPG Bekasi memesan 50kg beras putih",
      timestamp: "1 jam lalu",
      read: true,
    },
  ])

  const deleteMessage = (id: number) => {
    setMessages(messages.filter((m) => m.id !== id))
  }

  const markAsRead = (id: number) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "expiry":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case "alert":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />
      default:
        return <Bell className="w-5 h-5 text-primary" />
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case "expiry":
        return "bg-red-50 border-l-4 border-l-red-500"
      case "alert":
        return "bg-yellow-50 border-l-4 border-l-yellow-500"
      case "info":
        return "bg-blue-50 border-l-4 border-l-blue-500"
      default:
        return "bg-emerald-50 border-l-4 border-l-primary"
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length
  const expiryCount = messages.filter((m) => m.type === "expiry" && !m.read).length

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 p-2 rounded-lg">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Inbox Notifikasi</CardTitle>
                <CardDescription>Kelola peringatan dan notifikasi penting</CardDescription>
              </div>
            </div>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">{unreadCount}</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
              <TabsTrigger value="all">
                Semua {messages.length > 0 && <span className="ml-1 text-xs">({messages.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Belum Baca {unreadCount > 0 && <span className="ml-1 text-xs">({unreadCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="expiry">
                Kadaluarsa {expiryCount > 0 && <span className="ml-1 text-xs">({expiryCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="archived">Hapus</TabsTrigger>
            </TabsList>

            {/* All Messages */}
            <TabsContent value="all" className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Tidak ada notifikasi</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-4 space-y-2 cursor-pointer transition-all hover:shadow-md ${getMessageColor(msg.type)} ${
                      !msg.read ? "font-semibold" : ""
                    }`}
                    onClick={() => markAsRead(msg.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getIcon(msg.type)}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm">{msg.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteMessage(msg.id)
                        }}
                        className="flex-shrink-0 hover:bg-black/10 rounded p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {msg.daysLeft && msg.daysLeft <= 2 && (
                      <div className="ml-8 bg-red-100 border border-red-300 rounded px-2 py-1">
                        <p className="text-xs font-semibold text-red-700">
                          {msg.itemName} - {msg.daysLeft} hari tersisa
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Unread Messages */}
            <TabsContent value="unread" className="space-y-3">
              {messages.filter((m) => !m.read).length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Tidak ada notifikasi belum baca</p>
                </div>
              ) : (
                messages
                  .filter((m) => !m.read)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-4 space-y-2 cursor-pointer transition-all hover:shadow-md ${getMessageColor(msg.type)}`}
                      onClick={() => markAsRead(msg.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getIcon(msg.type)}
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">{msg.title}</p>
                            <p className="text-sm text-muted-foreground">{msg.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMessage(msg.id)
                          }}
                          className="flex-shrink-0 hover:bg-black/10 rounded p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>

            {/* Expiry Messages */}
            <TabsContent value="expiry" className="space-y-3">
              {messages.filter((m) => m.type === "expiry").length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-muted-foreground">Tidak ada peringatan kadaluarsa</p>
                </div>
              ) : (
                messages
                  .filter((m) => m.type === "expiry")
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`rounded-lg p-4 space-y-2 cursor-pointer transition-all hover:shadow-md ${getMessageColor(msg.type)}`}
                      onClick={() => markAsRead(msg.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getIcon(msg.type)}
                          <div className="flex-1">
                            <p className="font-semibold text-foreground text-sm">{msg.title}</p>
                            <p className="text-sm text-muted-foreground">{msg.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">{msg.timestamp}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteMessage(msg.id)
                          }}
                          className="flex-shrink-0 hover:bg-black/10 rounded p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </TabsContent>

            {/* Empty State for Archived */}
            <TabsContent value="archived" className="space-y-3">
              <div className="text-center py-8">
                <Trash2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">Tidak ada notifikasi yang dihapus</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
