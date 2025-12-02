"use client"

import { useState, useEffect } from "react"
import VendorNavbar from "./vendor-navbar"
import VendorSidebar from "./vendor-sidebar"
import ConnectionStatus from "./connection-status"
import InventoryHealth from "./inventory-health"
import QuickInsights from "./quick-insights"
import InventoryList from "@/components/common/inventory-list"
import InventoryUpload from "./inventory-upload"
import OrderList from "./order-list"
import SppgSearch from "./sppg-search"

interface VendorDashboardProps {
  onLogout: () => void
}

export default function VendorDashboard({ onLogout }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "upload" | "orders" | "sppg" | "history" | "settings">("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/vendor")
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error("Error fetching vendor analytics:", error)
      }
    }
    fetchAnalytics()
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case "upload":
        return <InventoryUpload />
      case "orders":
        return <OrderList />
      case "sppg":
        return <SppgSearch />
      case "history":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-muted-foreground">
            <p>Fitur riwayat transaksi akan segera tersedia.</p>
          </div>
        )
      case "settings":
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-muted-foreground">
            <p>Pengaturan akun akan segera tersedia.</p>
          </div>
        )
      case "dashboard":
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <ConnectionStatus />
            <InventoryHealth data={analytics?.inventory_health} />
            <QuickInsights data={analytics} />
            <InventoryList role="vendor" />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <VendorNavbar vendorName="Pak Asep" onLogout={onLogout} onMenuToggle={setSidebarOpen} />

      <div className="flex">
        <VendorSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab as any}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 bg-gray-50/50 min-h-[calc(100vh-64px)]">
          <div className="w-full px-6 py-8">{renderContent()}</div>
        </main>
      </div>
    </div>
  )
}
