"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bot, User, Send, Mic, Volume2, StopCircle, Loader2, ChefHat } from "lucide-react"

interface Message {
  id: number
  role: "user" | "ai"
  text: string
}

export default function KitchenChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "ai",
      text: "Halo Chef! 👋 Saya Asisten Dapur AI. Saya tahu semua stok di gudang Anda. Mau masak apa hari ini? Atau butuh saran belanja?"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Suggested Prompts
  const suggestions = [
    "Rekomendasi menu dari stok hari ini",
    "Bahan apa yang mau habis?",
    "Resep ayam goreng krispi",
    "Saya butuh ide masakan sayur"
  ]

  // Auto scroll ke bawah
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // --- FITUR SUARA: Speech to Text ---
  const startRecording = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'id-ID' // Bahasa Indonesia
      recognition.interimResults = false
      
      recognition.onstart = () => setIsRecording(true)
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
      }
      
      recognition.onend = () => setIsRecording(false)
      
      recognition.start()
    } else {
      alert("Browser Anda tidak mendukung fitur suara.")
    }
  }

  // --- FITUR SUARA: Text to Speech ---
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
        setIsSpeaking(false)
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'id-ID'
      utterance.rate = 1.0
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return

    // 1. Tambah pesan user
    const newUserMsg: Message = { id: Date.now(), role: "user", text }
    setMessages(prev => [...prev, newUserMsg])
    setInput("")
    setLoading(true)

    try {
      // 2. Kirim ke API
      const token = localStorage.getItem("token")
      const res = await fetch("/api/kitchen/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      })
      
      const data = await res.json()
      
      // 3. Tambah balasan AI
      const newAiMsg: Message = { 
        id: Date.now() + 1, 
        role: "ai", 
        text: data.reply || "Maaf, saya sedang mengalami gangguan." 
      }
      setMessages(prev => [...prev, newAiMsg])
      
    } catch (error) {
      console.error("Chat error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[calc(100vh-140px)] flex flex-col border-0 shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-emerald-50 border-b py-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="w-6 h-6 text-primary" />
          Chef Assistant AI
        </CardTitle>
        <CardDescription>Ngobrol dengan AI yang paham stok gudang Anda</CardDescription>
      </CardHeader>

      {/* Chat Area */}
      <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50/50">
        <ScrollArea className="h-full p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === "user" ? "bg-blue-100" : "bg-emerald-100"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-blue-600" /> : <ChefHat className="w-5 h-5 text-emerald-600" />}
                </div>
                
                <div className={`rounded-lg p-3 max-w-[80%] text-sm shadow-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.role === "ai" && (
                    <button 
                      onClick={() => speakText(msg.text)}
                      className="mt-2 flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {isSpeaking ? <StopCircle className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                      {isSpeaking ? "Stop Bicara" : "Dengarkan"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="bg-white border border-gray-100 rounded-lg p-3 rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 overflow-x-auto flex gap-2 whitespace-nowrap">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors border border-emerald-100"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <CardFooter className="p-3 bg-white border-t">
        <div className="flex w-full gap-2 items-center">
          <Button
            variant="outline"
            size="icon"
            className={`shrink-0 rounded-full ${isRecording ? "bg-red-100 text-red-600 border-red-200 animate-pulse" : ""}`}
            onClick={startRecording}
          >
            <Mic className="w-5 h-5" />
          </Button>
          
          <Input 
            placeholder={isRecording ? "Mendengarkan..." : "Tanya Chef AI (Ketik atau Bicara)..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="rounded-full bg-slate-50 border-slate-200 focus-visible:ring-emerald-500"
          />
          
          <Button 
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            size="icon"
            className="shrink-0 rounded-full bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}