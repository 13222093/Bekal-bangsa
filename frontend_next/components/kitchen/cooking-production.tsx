"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Flame } from "lucide-react"

interface CookingSession {
  id: number
  menu_name: string
  qty_produced: number
  calories: string
  protein: string
  shelf_life: string
  status: "cooking" | "completed"
}

export default function CookingProduction() {
  const [menuName, setMenuName] = useState("")
  const [quantity, setQuantity] = useState("")
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([])
  const [sessions, setSessions] = useState<CookingSession[]>([])
  const [loading, setLoading] = useState(false)

  const handleStartCooking = async () => {
    if (!menuName || !quantity) return

    setLoading(true)
    try {
      const response = await fetch("/api/kitchen/cook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menu_name: menuName,
          qty_produced: Number.parseInt(quantity),
          ingredients_ids: selectedIngredients,
        }),
      })
      const data = await response.json()
      console.log("[v0] Cook response:", data)

      // Add new session
      const newSession: CookingSession = {
        id: sessions.length + 1,
        menu_name: menuName,
        qty_produced: Number.parseInt(quantity),
        calories: "450 kcal",
        protein: "15g",
        shelf_life: "8 jam",
        status: "cooking",
      }
      setSessions([newSession, ...sessions])
      setMenuName("")
      setQuantity("")
      setSelectedIngredients([])
    } catch (error) {
      console.error("Error starting cooking:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = (sessionId: number) => {
    setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, status: "completed" as const } : s)))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-accent" />
            Produksi Menu
          </CardTitle>
          <CardDescription>Mulai memasak dan kelola sesi produksi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Nama Menu (misal: Telur Balado)"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
            <Input
              placeholder="Jumlah Porsi"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button
              onClick={handleStartCooking}
              disabled={!menuName || !quantity || loading}
              className="w-full bg-accent text-accent-foreground hover:bg-secondary flex items-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {loading ? "Memproses..." : "Mulai Memasak"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      {sessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sesi Produksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{session.menu_name}</p>
                      <p className="text-sm text-muted-foreground">{session.qty_produced} porsi</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold ${
                        session.status === "cooking" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {session.status === "cooking" ? "Sedang Memasak" : "Selesai"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Kalori</p>
                      <p className="font-semibold text-foreground">{session.calories}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Protein</p>
                      <p className="font-semibold text-foreground">{session.protein}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground text-xs">Shelf-life</p>
                      <p className="font-semibold text-foreground">{session.shelf_life}</p>
                    </div>
                  </div>

                  {session.status === "cooking" && (
                    <Button
                      size="sm"
                      onClick={() => handleComplete(session.id)}
                      className="w-full bg-green-500 text-white hover:bg-green-600"
                    >
                      Tandai Selesai
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
