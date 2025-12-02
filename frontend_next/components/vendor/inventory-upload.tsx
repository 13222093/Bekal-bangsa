"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, MapPin, AlertCircle, X, RotateCcw, CheckCircle2, Trash2, Plus } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SupplyItem {
  name: string
  qty: number
  unit: string
  freshness: string
  expiry_days: number
  note?: string
  owner_name: string
  location: string
  latitude?: number
  longitude?: number
  photo_url?: string
}

export default function InventoryUpload() {
  const [uploadMode, setUploadMode] = useState<"camera" | "upload">("camera")
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [detectedItems, setDetectedItems] = useState<SupplyItem[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)

  const handleGetLocation = () => {
    setLoadingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
          setLoadingLocation(false)
        },
        (error) => {
          if (!error.message.includes("secure origin")) {
            console.error("Error getting location:", error)
          }
          // Fallback to Monas, Jakarta for Demo/Dev
          setLocation({
            lat: -6.175392,
            lon: 106.827153,
          })
          setLoadingLocation(false)
        },
      )
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setCameraActive(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Tidak dapat mengakses kamera. Silakan gunakan upload file.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d")
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        context.drawImage(videoRef.current, 0, 0)
        const imageData = canvasRef.current.toDataURL("image/jpeg")
        setPreviewUrl(imageData)
        stopCamera()
        handleAnalyzePhoto(imageData)
      }
    }
  }

  const handleAnalyzePhoto = async (imageData: string) => {
    setAnalyzing(true)
    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" })

      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()

      const analyzeFormData = new FormData()
      analyzeFormData.append("file", file)

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        body: analyzeFormData,
      })
      const analyzeData = await analyzeRes.json()
      console.log("AI Analysis Result (Camera):", analyzeData)

      if (analyzeData.items) {
        const itemsWithLocation = analyzeData.items.map((item: SupplyItem) => ({
          ...item,
          owner_name: "UMKM Vendor",
          location: location ? `Lat: ${location.lat}, Lon: ${location.lon}` : "Tidak terdeteksi",
          latitude: location?.lat,
          longitude: location?.lon,
          photo_url: uploadData.url,
        }))
        setDetectedItems(itemsWithLocation)
      } else {
        console.warn("No items detected or invalid format:", analyzeData)
        alert("AI tidak dapat mendeteksi item. Coba foto yang lebih jelas.")
      }
    } catch (error) {
      console.error("Error analyzing photo:", error)
      alert("Gagal menganalisis foto")
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string)
      handleAnalyzePhotoFile(file)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyzePhotoFile = async (file: File) => {
    setAnalyzing(true)
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const uploadData = await uploadRes.json()

      const analyzeFormData = new FormData()
      analyzeFormData.append("file", file)

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        body: analyzeFormData,
      })
      const analyzeData = await analyzeRes.json()
      console.log("AI Analysis Result:", analyzeData)

      if (analyzeData.items) {
        const itemsWithLocation = analyzeData.items.map((item: SupplyItem) => ({
          ...item,
          owner_name: "UMKM Vendor",
          location: location ? `Lat: ${location.lat}, Lon: ${location.lon}` : "Tidak terdeteksi",
          latitude: location?.lat,
          longitude: location?.lon,
          photo_url: uploadData.url,
        }))
        setDetectedItems(itemsWithLocation)
      } else {
        console.warn("No items detected or invalid format:", analyzeData)
        alert("AI tidak dapat mendeteksi item. Coba foto yang lebih jelas.")
      }
    } catch (error) {
      console.error("Error uploading/analyzing:", error)
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const handleSubmit = async () => {
    if (detectedItems.length === 0) return

    try {
      const response = await fetch("/api/supplies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(detectedItems),
      })
      const result = await response.json()
      alert("Persediaan berhasil disimpan!")
      setDetectedItems([])
      setPreviewUrl(null)
    } catch (error) {
      console.error("Error submitting supplies:", error)
      alert("Gagal menyimpan persediaan")
    }
  }

  const resetCapture = () => {
    setPreviewUrl(null)
    setDetectedItems([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const updateItem = (index: number, field: keyof SupplyItem, value: any) => {
    const newItems = [...detectedItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setDetectedItems(newItems)
  }

  const addManualItem = () => {
    setDetectedItems([
      ...detectedItems,
      {
        name: "",
        qty: 1,
        unit: "kg",
        freshness: "Segar",
        expiry_days: 7,
        owner_name: "UMKM Vendor",
        location: location ? `Lat: ${location.lat}, Lon: ${location.lon}` : "Tidak terdeteksi",
        latitude: location?.lat,
        longitude: location?.lon,
        photo_url: previewUrl || undefined, // Use preview URL if available
      },
    ])
  }

  const removeManualItem = (index: number) => {
    const newItems = [...detectedItems]
    newItems.splice(index, 1)
    setDetectedItems(newItems)
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md overflow-hidden p-0">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white border-b border-emerald-700 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">Upload & Analisis Persediaan</CardTitle>
              <CardDescription className="text-emerald-50 text-sm mt-1">
                Ambil foto atau upload persediaan Anda. AI akan mendeteksi item, jumlah, dan kesegaran.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Location Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGetLocation}
              disabled={loadingLocation}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium"
            >
              <MapPin className="w-4 h-4" />
              {loadingLocation ? "Mendapatkan lokasi..." : "Dapatkan Lokasi GPS"}
            </Button>
            {location && (
              <div className="flex-1 bg-emerald-50 border border-primary/30 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                <p className="text-sm text-primary">
                  Lokasi terdeteksi: {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Tab Section */}
          <div className="flex gap-2 border-b-2 border-border">
            <button
              onClick={() => {
                setUploadMode("camera")
                stopCamera()
              }}
              className={`px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-2 ${uploadMode === "camera"
                ? "text-secondary border-b-secondary"
                : "text-muted-foreground hover:text-foreground border-b-transparent"
                }`}
            >
              <Camera className="w-4 h-4 inline mr-2" />
              Ambil Foto (Prioritas)
            </button>
            <button
              onClick={() => {
                setUploadMode("upload")
                stopCamera()
              }}
              className={`px-4 py-3 font-medium text-sm transition-all border-b-2 -mb-2 ${uploadMode === "upload"
                ? "text-secondary border-b-secondary"
                : "text-muted-foreground hover:text-foreground border-b-transparent"
                }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          </div>

          {/* Camera Mode */}
          {uploadMode === "camera" && (
            <div className="space-y-4">
              {!cameraActive ? (
                <Button
                  onClick={startCamera}
                  className="w-full bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold rounded-lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Aktifkan Kamera
                </Button>
              ) : (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg border-2 border-secondary bg-black"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={capturePhoto}
                      className="flex-1 bg-secondary hover:bg-secondary/90 text-white py-6 text-lg font-semibold rounded-lg"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Ambil Foto
                    </Button>
                    <Button
                      onClick={stopCamera}
                      variant="outline"
                      className="flex-1 py-6 text-lg rounded-lg bg-transparent"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload Mode */}
          {uploadMode === "upload" && (
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-xl p-10 text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="bg-white p-4 rounded-full w-16 h-16 mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="font-bold text-gray-700 text-lg mb-1">Klik atau drag foto di sini</p>
                <p className="text-sm text-gray-500">Format: PNG, JPG. Maksimal 5MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading || analyzing}
              />
            </div>
          )}

          {/* Loading States */}
          {uploading && (
            <Alert className="bg-blue-50 border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">Mengunggah file...</AlertDescription>
            </Alert>
          )}
          {analyzing && (
            <Alert className="bg-blue-50 border border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-600">Menganalisis foto dengan AI...</AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-4">
              <img
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                className="w-full max-h-96 object-cover rounded-lg border-2 border-secondary/30"
              />
              <Button onClick={resetCapture} variant="outline" className="w-full rounded-lg bg-transparent">
                <RotateCcw className="w-4 h-4 mr-2" />
                Ambil Foto Lagi
              </Button>
            </div>
          )}

          {/* Hidden canvas for camera capture */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Detected Items (Editable) */}
      {detectedItems.length > 0 && (
        <Card className="border-0 shadow-md border-l-4 border-l-secondary">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-amber-50 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-secondary" />
              Item yang Terdeteksi ({detectedItems.length})
            </CardTitle>
            <Button onClick={addManualItem} size="sm" variant="outline" className="bg-white hover:bg-gray-50">
              <Plus className="w-4 h-4 mr-2" /> Tambah Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              {detectedItems.map((item, idx) => (
                <div key={idx} className="bg-emerald-50 border border-primary/20 p-4 rounded-lg space-y-3 relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeManualItem(idx)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nama Barang</Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateItem(idx, "name", e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label>Jumlah</Label>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(idx, "qty", parseFloat(e.target.value) || 0)}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Satuan</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(idx, "unit", e.target.value)}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Kondisi</Label>
                      <Select value={item.freshness} onValueChange={(val: string) => updateItem(idx, "freshness", val)}>
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Segar">Segar</SelectItem>
                          <SelectItem value="Sedang">Sedang</SelectItem>
                          <SelectItem value="Buruk">Buruk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Estimasi Kadaluwarsa (Hari)</Label>
                      <Input
                        type="number"
                        value={item.expiry_days}
                        onChange={(e) => updateItem(idx, "expiry_days", parseInt(e.target.value) || 0)}
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Catatan AI</Label>
                    <Input
                      value={item.note || ""}
                      onChange={(e) => updateItem(idx, "note", e.target.value)}
                      className="bg-white text-muted-foreground italic"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg py-6"
            >
              Simpan Persediaan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
