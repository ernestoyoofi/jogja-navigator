
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  MapPin, 
  CheckCircle2, 
  Circle,
  Clock,
  Navigation,
  User,
  LogIn,
  Trash2
} from 'lucide-react';
import { ChatMessage, Spot } from './types';
import { getTravelAdvice } from './services/geminiService';
import InteractiveMap from './components/InteractiveMap';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Sugeng Rawuh! Saya Sugeng, guide lokal kamu. Mau jalan-jalan ke mana di Jogja hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedSpots, setSavedSpots] = useState<Spot[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Format history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getTravelAdvice(userMsg, history);
    
    setMessages([...newMessages, { role: 'model', text: response.text }]);
    
    if (response.newSpots) {
      // Add unique spots only
      setSavedSpots(prev => {
        const existingIds = new Set(prev.map(s => s.name)); // matching by name for demo
        const filtered = response.newSpots!.filter(s => !existingIds.has(s.name));
        return [...prev, ...filtered];
      });
    }
    
    setIsLoading(false);
  };

  const toggleSpot = (id: string) => {
    setSavedSpots(prev => prev.map(s => 
      s.id === id ? { ...s, isCompleted: !s.isCompleted } : s
    ));
  };

  const removeSpot = (id: string) => {
    setSavedSpots(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar */}
      <header className="h-14 border-b border-gray-100 flex items-center justify-between px-6 z-50 bg-white">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded flex items-center justify-center text-white shadow-sm">
            <Navigation className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 tracking-tight">JogjaNavigator</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
          <LogIn className="w-4 h-4" />
          Login
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Panel */}
        <aside className="w-[380px] border-r border-gray-100 flex flex-col bg-white">
          <div className="p-5 border-b border-gray-50">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ask Sugeng</h2>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-emerald-500 text-white font-medium rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200/50 shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 items-center text-gray-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-100">
            <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Mau ke mana hari ini?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-12 text-sm font-bold text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all shadow-inner"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-1.5 top-1.5 w-9 h-9 bg-emerald-500 text-white rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Center: Real Map */}
        <main className="flex-1 relative bg-gray-50">
          <InteractiveMap spots={savedSpots} />
          
          {/* Quick Tip Overlay */}
          <div className="absolute bottom-6 left-6 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-gray-100 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Interactive Map Connected</p>
          </div>
        </main>

        {/* Right: Location List */}
        <aside className="w-[320px] border-l border-gray-100 flex flex-col bg-gray-50/30">
          <div className="p-5 border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-gray-900">My Locations</h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {savedSpots.filter(s => s.isCompleted).length}/{savedSpots.length}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Your Travel Checklist</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {savedSpots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No spots added yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">Chat with Sugeng to get recommendations!</p>
                </div>
              </div>
            ) : (
              savedSpots.map((spot) => (
                <div 
                  key={spot.id} 
                  className={`group bg-white rounded-xl p-4 border transition-all hover:shadow-md ${
                    spot.isCompleted ? 'border-emerald-100 bg-emerald-50/20' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => toggleSpot(spot.id)}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${spot.isCompleted ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-400'}`}
                    >
                      {spot.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold truncate ${spot.isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {spot.name}
                        </h3>
                        <button 
                          onClick={() => removeSpot(spot.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {spot.description}
                      </p>
                      {spot.time && (
                        <div className="flex items-center gap-1.5 mt-2.5 text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span className="text-[9px] font-bold uppercase tracking-widest">{spot.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {savedSpots.length > 0 && (
            <div className="p-4 bg-white border-t border-gray-100">
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
                Generate Directions
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
