"use client"

import { useState } from "react"
import KitchenSidebar from "./kitchen-sidebar"
import KitchenDashboardOverview from "./kitchen-dashboard-overview"
import CookingProduction from "./cooking-production"
import IoTMonitoring from "./iot-monitoring"
import ScanFoodQC from "./scan-food-qc"
import SupplierSearchOrder from "./supplier-search-order"
import KitchenOrderHistory from "./kitchen-order-history"
import NotificationBell from "@/components/notifications/notification-bell"

interface KitchenDashboardProps {
  onLogout: () => void
}

export default function KitchenDashboard({ onLogout }: KitchenDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard")

  const handleLogout = () => {
    onLogout()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Layout */}
      <KitchenSidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 bg-slate-50/50 min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20 lg:relative shadow-sm transition-all duration-300">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "search" && "Cari Supplier & Bahan"}
                {activeTab === "cook" && "Dapur & Produksi"}
                {activeTab === "iot" && "Smart Storage Monitoring"}
                {activeTab === "qc" && "Quality Control"}
                {activeTab === "history" && "Riwayat Transaksi"}
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Selamat Datang, Kitchen Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {activeTab === "dashboard" && <KitchenDashboardOverview />}
          {activeTab === "search" && <SupplierSearchOrder />}
          {activeTab === "cook" && <CookingProduction />}
          {activeTab === "iot" && <IoTMonitoring />}
          {activeTab === "qc" && <ScanFoodQC />}
          {activeTab === "history" && <KitchenOrderHistory />}
        </div>
      </main>
    </div >
  )
}
