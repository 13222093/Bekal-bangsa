"use client"

import { useState } from "react"
import RoleSelector from "@/components/role-selector"
import VendorDashboard from "@/components/vendor/vendor-dashboard"
import KitchenDashboard from "@/components/kitchen/kitchen-dashboard"
import ErrorBoundary from "@/components/shared/error-boundary"

export default function Home() {
  const [userRole, setUserRole] = useState<"vendor" | "kitchen" | null>(null)

  if (!userRole) {
    return <RoleSelector onSelectRole={setUserRole} />
  }

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-background">
        {userRole === "vendor" ? (
          <VendorDashboard onLogout={() => setUserRole(null)} />
        ) : (
          <KitchenDashboard onLogout={() => setUserRole(null)} />
        )}
      </main>
    </ErrorBoundary>
  )
}
