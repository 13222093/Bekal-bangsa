"use client"

import { useState } from "react"
import KitchenSidebar from "./kitchen-sidebar"
import KitchenDashboardOverview from "./kitchen-dashboard-overview"
import CookingProduction from "./cooking-production"
import IoTMonitoring from "./iot-monitoring"
import ScanFoodQC from "./scan-food-qc"
import SupplierSearchOrder from "./supplier-search-order"
import KitchenChatbot from "./kitchen-chatbot"

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
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <header className="bg-white border-b border-border shadow-sm sticky top-0 z-10 lg:relative">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "chat" && <KitchenChatbot />} {/* <-- Tambah ini */}
              {activeTab === "search" && "Cari Supplier & Bahan"}
              {activeTab === "cook" && "Dapur & Produksi"}
              {activeTab === "iot" && "Smart Storage Monitoring"}
              {activeTab === "qc" && "Quality Control"}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {activeTab === "dashboard" && <KitchenDashboardOverview />}
          {activeTab === "search" && <SupplierSearchOrder />}
          {activeTab === "cook" && <CookingProduction />}
          {activeTab === "iot" && <IoTMonitoring />}
          {activeTab === "qc" && <ScanFoodQC />}
        </div>
      </main>
    </div>
  )
}
