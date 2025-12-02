"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function KitchenLocation() {
    const [location, setLocation] = useState<{ lat: number; long: number } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Manual Input State
    const [manualLat, setManualLat] = useState("-6.175392")
    const [manualLong, setManualLong] = useState("106.827153")
    const [isEditing, setIsEditing] = useState(false)

    const getLocation = () => {
        setLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError("Geolocation is not supported")
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    long: position.coords.longitude,
                })
                setManualLat(position.coords.latitude.toString())
                setManualLong(position.coords.longitude.toString())
                setLoading(false)
            },
            (err) => {
                if (!err.message.includes("secure origin")) {
                    console.error("Geolocation Error:", err.message)
                }
                // Fallback to Monas
                setLocation({ lat: -6.175392, long: 106.827153 })
                setError("GPS Blocked (Non-HTTPS). Using Default Location.")
                setLoading(false)
            }
        )
    }

    const handleManualUpdate = () => {
        setLocation({
            lat: parseFloat(manualLat),
            long: parseFloat(manualLong)
        })
        setIsEditing(false)
        setError(null)
    }

    useEffect(() => {
        getLocation()
    }, [])

    return (
        <Card className="border-0 shadow-md overflow-hidden py-0 gap-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-200" />
                        <h3 className="font-bold text-lg">Lokasi SPPG Terdeteksi</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs bg-white/10 hover:bg-white/20 text-white ml-2"
                            onClick={() => setIsEditing(!isEditing)}
                        >
                            {isEditing ? "Batal" : "Ubah Lokasi"}
                        </Button>
                    </div>

                    {isEditing ? (
                        <div className="bg-white/10 p-3 rounded-lg space-y-2 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-blue-200">Latitude</label>
                                    <input
                                        type="text"
                                        value={manualLat}
                                        onChange={(e) => setManualLat(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-blue-200">Longitude</label>
                                    <input
                                        type="text"
                                        value={manualLong}
                                        onChange={(e) => setManualLong(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <Button
                                size="sm"
                                onClick={handleManualUpdate}
                                className="w-full bg-white text-blue-700 hover:bg-blue-50"
                            >
                                Update Lokasi
                            </Button>
                        </div>
                    ) : loading ? (
                        <div className="flex items-center gap-2 text-blue-100">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mencari koordinat GPS...</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {error && (
                                <div className="flex items-center gap-2 text-yellow-200 bg-yellow-900/20 px-2 py-1 rounded mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-xs">{error}</span>
                                </div>
                            )}
                            <div className="flex gap-4">
                                <div className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm">
                                    <span className="text-xs text-blue-200 block">Latitude</span>
                                    <span className="font-mono font-medium">{location?.lat.toFixed(6)}</span>
                                </div>
                                <div className="bg-white/10 px-3 py-1 rounded backdrop-blur-sm">
                                    <span className="text-xs text-blue-200 block">Longitude</span>
                                    <span className="font-mono font-medium">{location?.long.toFixed(6)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden sm:block ml-4">
                    <div className="bg-white/10 p-3 rounded-full">
                        <Navigation className="w-8 h-8 text-blue-200" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
