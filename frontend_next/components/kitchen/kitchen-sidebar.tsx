"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Search, ChefHat, Thermometer, Camera, LogOut, Menu, X } from "lucide-react"

interface KitchenSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export default function KitchenSidebar({ activeTab, onTabChange, onLogout }: KitchenSidebarProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "search", label: "Cari Supplier", icon: Search },
    { id: "cook", label: "Dapur & Produksi", icon: ChefHat },
    { id: "iot", label: "Smart Storage", icon: Thermometer },
    { id: "qc", label: "Quality Control", icon: Camera },
  ]

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-40 bg-white border border-border"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-border z-30 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border">
            <h2 className="text-xl font-bold text-foreground">Bekal Bangsa</h2>
            <p className="text-xs text-muted-foreground mt-1">SPPG Control Center</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id)
                    setOpen(false)
                  }}
                  className={`w-full justify-start gap-3 text-base font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-primary text-white shadow-md"
                      : "bg-transparent text-foreground hover:bg-primary/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              onClick={onLogout}
              className="w-full justify-start gap-3 text-base font-medium bg-red-50 text-red-600 hover:bg-red-100"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  )
}
