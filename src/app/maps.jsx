"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Map, Marker, NavigationControl } from "@vis.gl/react-maplibre"
import "maplibre-gl/dist/maplibre-gl.css"
import { apiQuery } from "@/lib/api-client"
import {
  Send,
  MapPin,
  CheckCircle2,
  Circle,
  Clock,
  Navigation as NavIcon,
  LogIn,
  LogOut,
  Trash2,
  Star,
  MessageSquare,
  Plus,
  ChevronLeft,
  User,
  Loader2,
} from "lucide-react"

// ---- Main App ----
export default function Maps() {
  // Auth state
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  // Chat state
  const [messages, setMessages] = useState([
    { role: "model", text: "Sugeng Rawuh! Saya Sugeng, guide lokal kamu. Mau jalan-jalan ke mana di Jogja hari ini?" }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatId, setChatId] = useState(null)
  const [chatHistory, setChatHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Location state
  const [locations, setLocations] = useState([])
  const [mapCenter, setMapCenter] = useState({ longitude: 110.3695, latitude: -7.7956 })
  const [mapMarkers, setMapMarkers] = useState([])

  // Geolocation
  const [userCoords, setUserCoords] = useState({ latitude: -7.7956, longitude: 110.3695 })

  const scrollRef = useRef(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          setMapCenter({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        },
        () => { } // fallback: pake default jogja
      )
    }
  }, [])

  // Check auth on mount
  useEffect(() => {
    apiQuery("user:profile").then((res) => {
      if (res?.data) {
        setUser(res.data)
        // Load chat history & location list
        loadChatHistory()
        loadLocations()
      }
      setAuthChecked(true)
    }).catch(() => {
      setAuthChecked(true)
    })
  }, [])

  const loadChatHistory = useCallback(async () => {
    const res = await apiQuery("chat:history")
    if (res?.data?.list) {
      setChatHistory(res.data.list)
    }
  }, [])

  const loadLocations = useCallback(async () => {
    const res = await apiQuery("location:list")
    if (res?.data?.list) {
      setLocations(res.data.list)
      // Update markers dari locations
      const markers = res.data.list
        .filter(l => l.latitude && l.longitude && l.latitude !== 0)
        .map(l => ({
          id: l.id || l._id,
          name: l.name,
          latitude: l.latitude,
          longitude: l.longitude,
          isFinish: l.is_finish,
        }))
      setMapMarkers(markers)
    }
  }, [])

  // ---- Chat Submit ----
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || !user) return

    const userMsg = input.trim()
    setMessages(prev => [...prev, { role: "user", text: userMsg }])
    setInput("")
    setIsLoading(true)

    try {
      const payload = {
        message: userMsg,
        latitude: userCoords.latitude,
        longitude: userCoords.longitude,
      }
      if (chatId) payload.id = chatId
      const res = await apiQuery("chat:submit", payload)

      if (res?.data) {
        // Set chat ID kalau baru
        if (res.data.id) {
          setChatId(res.data.id)
        }
        // Response bisa punya summary + location ATAU summary + buttons
        const aiText = res.data.summary || "Hmm, Sugeng bingung nih. Coba tanya lagi ya!"
        setMessages(prev => [
          ...prev,
          {
            role: "model",
            text: aiText,
            locations: res.data.location || [],
            buttons: res.data.buttons || [],
          }
        ])

        // Update map markers dari response
        if (res.data.location?.length) {
          const newMarkers = res.data.location.map((loc, i) => ({
            id: `resp-${Date.now()}-${i}`,
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            address: loc.address,
          }))
          setMapMarkers(prev => [...prev, ...newMarkers])
          // Center map ke lokasi pertama
          if (res.data.location[0]) {
            setMapCenter({
              latitude: res.data.location[0].latitude,
              longitude: res.data.location[0].longitude,
            })
          }
        }

        // Refresh chat history
        loadChatHistory()
      } else if (res?.error) {
        setMessages(prev => [...prev, { role: "model", text: `Error: ${res.message || res.error}` }])
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: "model", text: "Waduh, ada masalah koneksi. Coba lagi ya!" }])
    }

    setIsLoading(false)
  }

  // ---- Button Response (suggestion buttons) ----
  const handleButtonClick = (text) => {
    setInput(text)
  }

  // ---- Load a specific chat ----
  const handleLoadChat = async (id) => {
    const res = await apiQuery("chat:load", { id })
    if (res?.data?.list) {
      const loaded = res.data.list.map(item => ({
        role: item.type === "user" ? "user" : "model",
        text: item.content?.message || item.content?.summary || item.content?.user_context || "",
        locations: item.content?.location || [],
        buttons: item.content?.buttons || [],
      }))
      setMessages(loaded)
      setChatId(id)
      setShowHistory(false)

      // Collect all location markers from loaded chat
      const allLocs = res.data.list
        .filter(item => item.content?.location?.length)
        .flatMap(item => item.content.location)
      if (allLocs.length) {
        const markers = allLocs.map((loc, i) => ({
          id: `loaded-${i}`,
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
        }))
        setMapMarkers(markers)
        setMapCenter({ latitude: allLocs[0].latitude, longitude: allLocs[0].longitude })
      }
    }
  }

  // ---- Delete chat ----
  const handleDeleteChat = async (id) => {
    await apiQuery("chat:delete", { id })
    loadChatHistory()
    if (chatId === id) {
      handleNewChat()
    }
  }

  // ---- New chat ----
  const handleNewChat = () => {
    setChatId(null)
    setMessages([
      { role: "model", text: "Sugeng Rawuh! Saya Sugeng, guide lokal kamu. Mau jalan-jalan ke mana di Jogja hari ini?" }
    ])
    setMapMarkers([])
    loadLocations()
  }

  // ---- Location actions ----
  const handleAddToList = async (locationId) => {
    const res = await apiQuery("location:add-list", { id: locationId })
    if (res?.data?.success) {
      loadLocations()
    }
  }

  const handleRemoveFromList = async (planningId) => {
    const res = await apiQuery("location:rm-list", { id: planningId })
    if (res?.data?.success) {
      loadLocations()
    }
  }

  const handleRateLocation = async (planningId, rating) => {
    const res = await apiQuery("location:rating", { id: planningId, rating })
    if (res?.data?.success) {
      loadLocations()
    }
  }

  // ---- Logout ----
  const handleLogout = () => {
    // Clear cookie by expires
    document.cookie = "jogjanavigator-auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setUser(null)
    setMessages([
      { role: "model", text: "Sugeng Rawuh! Saya Sugeng, guide lokal kamu. Login dulu ya biar bisa chat!" }
    ])
    setChatHistory([])
    setLocations([])
    setMapMarkers([])
  }

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ======= NAVBAR ======= */}
      <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 z-50 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center text-white shadow-sm">
            <NavIcon className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">JogjaNavigator</h1>
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{user.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </div>
        ) : (
          <button
            onClick={() => { window.location.href = "/api/auth?typelogin=1" }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ======= LEFT: CHAT PANEL ======= */}
        <aside className="w-[380px] border-r border-gray-100 flex flex-col bg-white shrink-0">
          {/* Chat Header */}
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            {showHistory ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-700">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Riwayat Chat</h2>
              </div>
            ) : (
              <>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ask Sugeng</h2>
                {user && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowHistory(true)}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                      title="Riwayat chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNewChat}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all"
                      title="Chat baru"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {showHistory ? (
            /* ---- Chat History List ---- */
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <MessageSquare className="w-8 h-8 text-gray-200" />
                  <p className="text-xs text-gray-400">Belum ada riwayat chat</p>
                </div>
              ) : (
                chatHistory.map((ch) => (
                  <div
                    key={ch.id}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleLoadChat(ch.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{ch.title || "Percakapan"}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(ch.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteChat(ch.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* ---- Chat Messages ---- */
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                {messages.map((m, i) => (
                  <div key={i}>
                    <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                        ? "bg-emerald-500 text-white font-medium rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/50 shadow-sm"
                        }`}>
                        {m.text}
                      </div>
                    </div>
                    {/* Location chips dari AI response */}
                    {m.locations?.length > 0 && (
                      <div className="mt-2 ml-1 space-y-1.5">
                        {m.locations.map((loc, li) => (
                          <div key={li} className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{loc.name}</p>
                              {loc.address && <p className="text-[10px] text-gray-500 truncate">{loc.address}</p>}
                            </div>
                            {user && loc._id && (
                              <button
                                onClick={() => handleAddToList(loc._id)}
                                className="text-emerald-500 hover:text-emerald-600 shrink-0"
                                title="Tambah ke daftar"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Button suggestions */}
                    {m.buttons?.length > 0 && (
                      <div className="mt-2 ml-1 flex flex-wrap gap-1.5">
                        {m.buttons.map((btn, bi) => (
                          <button
                            key={bi}
                            onClick={() => handleButtonClick(btn)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-emerald-300 transition-all"
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-2 items-center text-gray-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "-0.15s" }} />
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "-0.3s" }} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-5 border-t border-gray-100">
                {user ? (
                  <div className="relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Mau ke mana hari ini?"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      className="absolute right-1.5 top-1.5 w-9 h-9 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { window.location.href = "/api/auth?typelogin=1" }}
                    className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login untuk mulai chat
                  </button>
                )}
              </div>
            </>
          )}
        </aside>

        {/* ======= CENTER: MAP ======= */}
        <main className="flex-1 relative bg-gray-50">
          <Map
            initialViewState={{
              longitude: mapCenter.longitude,
              latitude: mapCenter.latitude,
              zoom: 13,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle="https://tiles.openfreemap.org/styles/bright"
          >
            <NavigationControl position="top-right" />
            {mapMarkers.map((marker) => (
              <Marker
                key={marker.id}
                longitude={marker.longitude}
                latitude={marker.latitude}
                anchor="bottom"
              >
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${marker.isFinish ? "bg-gray-400" : "bg-emerald-500"
                    }`}>
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  <div className="mt-1 bg-white/95 backdrop-blur px-2 py-0.5 rounded-md shadow text-[10px] font-bold text-gray-800 whitespace-nowrap max-w-[120px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                    {marker.name}
                  </div>
                </div>
              </Marker>
            ))}
          </Map>

          {/* Map Status Overlay */}
          <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Interactive Map Connected</p>
          </div>
        </main>

        {/* ======= RIGHT: LOCATION LIST ======= */}
        <aside className="w-[320px] border-l border-gray-100 flex flex-col bg-gray-50/30 shrink-0">
          <div className="p-5 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-900">My Locations</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {locations.filter(l => l.is_finish).length}/{locations.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Your Travel Checklist</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!user ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Login dulu ya</p>
                  <p className="text-[11px] text-gray-400 mt-1">Biar bisa simpan lokasi kunjunganmu!</p>
                </div>
              </div>
            ) : locations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Belum ada lokasi</p>
                  <p className="text-[11px] text-gray-400 mt-1">Tanya Sugeng buat rekomendasi tempat!</p>
                </div>
              </div>
            ) : (
              locations.map((loc) => (
                <div
                  key={loc.id || loc._id}
                  className={`group bg-white rounded-xl p-4 border transition-all hover:shadow-md ${loc.is_finish ? "border-emerald-100 bg-emerald-50/20" : "border-gray-100"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => !loc.is_finish && handleRateLocation(loc.id || loc._id, 5)}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${loc.is_finish ? "text-emerald-500" : "text-gray-300 hover:text-emerald-400"
                        }`}
                      title={loc.is_finish ? "Sudah selesai" : "Tandai selesai"}
                    >
                      {loc.is_finish ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold truncate ${loc.is_finish ? "text-gray-400 line-through" : "text-gray-900"
                          }`}>
                          {loc.name}
                        </h3>
                        <button
                          onClick={() => handleRemoveFromList(loc.id || loc._id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {loc.address && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {loc.address}
                        </p>
                      )}
                      {loc.rating > 0 && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{loc.rating}/10</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}