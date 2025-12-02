"use client"

import { MapPin, Building2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface ConnectionStatusProps {
  location?: string
  kitchenHub?: string
  distance?: number
  isConnected?: boolean
}

export default function ConnectionStatus({
  location = "Pasar Kramat Jati, Jakarta Timur",
  kitchenHub = "Dapur Umum Jaktim 01",
  distance = 2.5,
  isConnected = true,
}: ConnectionStatusProps) {
  return (
    <Card className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Lokasi */}
          <div className="flex items-start gap-4 group">
            <div className="p-2 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
              <MapPin className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Lokasi Anda</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{location}</p>
            </div>
          </div>

          {/* Mitra SPPG */}
          <div className="flex items-start gap-4 group">
            <div className="p-2 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Mitra SPPG</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{kitchenHub}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-4 group">
            <div className={`p-2 rounded-full transition-colors ${isConnected ? "bg-green-50 group-hover:bg-green-100" : "bg-red-50 group-hover:bg-red-100"}`}>
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Status</p>
              <div className={`flex items-center gap-1.5 text-sm font-semibold ${isConnected ? "text-green-700" : "text-red-700"}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                {isConnected ? "Terhubung" : "Terputus"}
              </div>
            </div>
          </div>

          {/* Distance */}
          <div className="flex items-start gap-4 group">
            <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Jarak</p>
              <p className="text-sm font-semibold text-gray-900 leading-tight">{distance} km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
