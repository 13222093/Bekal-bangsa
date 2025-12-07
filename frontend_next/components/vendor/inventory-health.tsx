"use client"

import { Leaf, AlertTriangle, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface InventoryHealthProps {
  data?: {
    fresh: number
    warning: number
    expired: number
  }
}

export default function InventoryHealth({ data }: InventoryHealthProps) {
  const { fresh, warning, expired } = data || { fresh: 0, warning: 0, expired: 0 }
  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-4">Status Stok Hari Ini</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stok Segar */}
        <Card className="bg-gradient-to-br from-green-50 to-white border border-green-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-green-600 font-semibold mb-2">Stok Segar</p>
                <p className="text-3xl md:text-4xl font-bold text-green-700 tracking-tight">{fresh}</p>
                <p className="text-xs text-green-600/80 mt-2 font-medium">Kualitas terjaga</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segera Habis */}
        <Card className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-amber-600 font-semibold mb-2">Segera Habis</p>
                <p className="text-3xl md:text-4xl font-bold text-amber-700 tracking-tight">{warning}</p>
                <p className="text-xs text-amber-600/80 mt-2 font-medium">Habis dalam &lt; 2 hari</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kadaluwarsa */}
        <Card className="bg-gradient-to-br from-red-50 to-white border border-red-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-red-600 font-semibold mb-2">Kadaluwarsa</p>
                <p className="text-3xl md:text-4xl font-bold text-red-700 tracking-tight">{expired}</p>
                <p className="text-xs text-red-600/80 mt-2 font-medium">Perlu tindakan segera</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
