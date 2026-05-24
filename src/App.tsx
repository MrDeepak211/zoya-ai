import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Settings, 
  Heart, 
  BrainCircuit, 
  Mic,
  Maximize2,
  Menu,
  Sparkles,
  Smile,
  LayoutGrid
} from 'lucide-react';
import ZoyaAvatar, { Emotion, Customization } from './components/ZoyaAvatar';
import { HUDPanel, StatRow, CircularClock } from './components/HUDPanel';
import { chatWithZoya, Message } from './services/aiService';
import { VoiceService } from './services/voiceService';
import { MemoryEngine, Memory } from './lib/memory';
import { cn } from './lib/utils';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memory, setMemory] = useState<Memory>(MemoryEngine.load());
  const [time, setTime] = useState(new Date());
  
  // Customization State
  const [showCustomMenu, setShowCustomMenu] = useState(false);
  const [customization, setCustomization] = useState<Customization>({
    hairColor: 0,
    outfitColor: 0,
    accessory: 'none',
    glowColor: '#ff71ce'
  });

  // States for Character Interaction
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [vocalEnergy, setVocalEnergy] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [placeholder, setPlaceholder] = useState("Tap mic or type sync signal...");

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const parseEmotion = (text: string): { cleanText: string, emotion: Emotion } => {
    const match = text.match(/\[([A-Z]+)\]/);
    if (match) {
      const e = match[1].toLowerCase() as Emotion;
      const clean = text.replace(match[0], '').trim();
      return { cleanText: clean, emotion: e };
    }
    return { cleanText: text, emotion: 'neutral' };
  };

  const handleSend = async (customInput?: string) => {
    const text = (customInput || input).trim();
    if (!text || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setEmotion('thinking');

    const history = messages.slice(-10).map(m => ({ role: m.role, parts: [{ text: m.content }] }));
    const rawResponse = await chatWithZoya(text, history, memory);
    const { cleanText, emotion: newEmotion } = parseEmotion(rawResponse);

    const zoyaMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: cleanText, timestamp: new Date() };
    setMessages(prev => [...prev, zoyaMsg]);
    setIsTyping(false);
    setEmotion(rawResponse ? newEmotion : 'neutral');
    
    if (rawResponse) {
      setIsSpeaking(true);
      VoiceService.speak(
        cleanText, 
        newEmotion, 
        () => setIsSpeaking(false), 
        () => {
          setVocalEnergy(1);
          setTimeout(() => setVocalEnergy(0), 100);
        }
      );
    }
    
    MemoryEngine.incrementMessages();
    
    // Auto-detect name
    const nameMatch = text.match(/(?:my name is|call me|i am) ([a-zA-Z]+)/i);
    if (nameMatch && nameMatch[1]) {
      MemoryEngine.setUserName(nameMatch[1]);
    }
    
    // Improved point gain logic
    let gain = 0.5; // Base gain for any interaction
    const lowerText = text.toLowerCase();
    if (lowerText.includes('love') || lowerText.includes('sweet') || lowerText.includes('cute')) gain += 2;
    if (lowerText.includes('marry') || lowerText.includes('forever')) gain += 5;
    if (lowerText.length > 50) gain += 1; // Long interesting conversations
    
    MemoryEngine.addMemory('Conversation segment', gain);
    setMemory(MemoryEngine.load());
  };

  const handleVoiceToggle = () => {
    if (!VoiceService.isSupported()) {
      setPlaceholder("Voice sync unavailable in this browser! Type below...");
      VoiceService.playSFX('wake');
      setTimeout(() => {
        setPlaceholder("Tap mic or type sync signal...");
      }, 4000);
      return;
    }
    if (isListening) {
      setIsListening(false);
    } else {
       VoiceService.playSFX('wake');
      setIsListening(true);
      VoiceService.listen(
        (text) => {
          handleSend(text);
          setIsListening(false);
        },
        () => setIsListening(false)
      );
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0a0f] overflow-hidden text-slate-100 flex flex-col">
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#0a0a0f] flex flex-col items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,113,206,0.15)_0%,transparent_70%)]" />
            <div className="relative z-10 flex flex-col items-center gap-8 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  filter: ["drop-shadow(0 0 20px rgba(255,113,206,0.3))", "drop-shadow(0 0 40px rgba(255,113,206,0.6))", "drop-shadow(0 0 20px rgba(255,113,206,0.3))"]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Heart className="w-24 h-24 text-pink-neon fill-pink-neon/20" />
              </motion.div>
              
              <div className="space-y-2">
                <h1 className="text-5xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-neon to-purple-neon">ZOYA HSI</h1>
                <p className="text-xs font-mono text-cyan-neon tracking-[0.5em] uppercase opacity-60">Neural Synchronization Protocol</p>
              </div>

              <button 
                onClick={() => {
                  setHasInteracted(true);
                  VoiceService.playSFX('wake');
                  // Initial greeting
                  setTimeout(() => {
                    handleSend("Hello Zoya! I'm here.");
                  }, 500);
                }}
                className="group relative px-12 py-5 bg-transparent border-2 border-pink-neon rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-pink-neon opacity-0 group-hover:opacity-10 transition-opacity" />
                <span className="relative z-10 text-pink-neon font-display font-bold tracking-widest text-lg uppercase flex items-center gap-3">
                  System Wake <Sparkles className="w-5 h-5" />
                </span>
              </button>

              <div className="mt-12 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                Interface Version 3.2 // Neural Link Established
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="scanline" />
      
      {/* Background Environmental Texture */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay grayscale" />
      <div className="absolute inset-0 bg-gradient-to-tr from-bg-dark via-bg-dark/40 to-bg-dark" />

      {/* Customization Overlay */}
      <AnimatePresence>
        {showCustomMenu && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed right-0 top-0 h-full w-80 z-[100] p-8 glass-panel border-l border-white/10 flex flex-col gap-8 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-pink-neon">Neural Gear</h2>
              <button 
                onClick={() => setShowCustomMenu(false)}
                className="p-2 hover:bg-white/10 rounded-full"
              >
                <Maximize2 className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-60">Sync Frequency (Hair)</label>
                <input 
                  type="range" min="0" max="360" 
                  value={customization.hairColor} 
                  onChange={(e) => setCustomization(prev => ({ ...prev, hairColor: parseInt(e.target.value) }))}
                  className="w-full accent-pink-neon"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-60">Glow Protocol</label>
                <div className="flex gap-2">
                  {['#ff71ce', '#01cdfe', '#b967ff', '#fffb96'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setCustomization(prev => ({ ...prev, glowColor: color }))}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        customization.glowColor === color ? "border-white scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-60">Neural Accessory</label>
                <div className="grid grid-cols-2 gap-2">
                  {['none', 'glasses', 'ribbon', 'headphones'].map((acc) => (
                    <button 
                      key={acc}
                      onClick={() => setCustomization(prev => ({ ...prev, accessory: acc as any }))}
                      className={cn(
                        "p-2 text-[10px] font-mono border rounded uppercase transition-all",
                        customization.accessory === acc ? "border-pink-neon bg-pink-neon/20 text-pink-neon" : "border-white/10 hover:border-white/30"
                      )}
                    >
                      {acc}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                 <button className="w-full py-4 glass-panel border border-cyan-neon/30 text-cyan-neon font-display font-medium rounded-2xl hover:bg-cyan-neon/10 transition-all flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Neural Recalibration
                 </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main UI Layer */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 p-4 lg:p-8 gap-4 lg:gap-8 overflow-hidden">
        
        {/* Left HUD Column */}
        <div className="hidden lg:flex col-span-3 flex-col gap-6 overflow-hidden pointer-events-none">
          <header className="pointer-events-auto holo-distortion">
             <div className="flex items-center gap-3">
               <h1 className="text-3xl font-display font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-pink-neon to-purple-neon glow-pink">
                 Zoya AI
               </h1>
               <div className="flex items-center justify-center p-1.5 glass-panel rounded-full shadow-[0_0_10px_rgba(255,113,206,0.3)]">
                  <Heart className="w-3 h-3 text-pink-neon fill-pink-neon" />
               </div>
               <div className="w-2 h-2 rounded-full bg-pink-neon animate-pulse shrink-0" />
             </div>
             <p className="text-[10px] font-mono opacity-50 uppercase tracking-[0.3em] mt-1">Your AI Companion Online</p>
          </header>

          <div className="flex flex-col gap-6 flex-1 pointer-events-auto no-scrollbar overflow-y-auto pr-2 pb-20">
            {/* Heart Core Panel */}
            <div className="glass-panel p-4 rounded-3xl border-l-4 border-pink-neon holographic-card flex flex-col items-center holo-distortion">
               <div className="holo-scanline opacity-10" />
               <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
               >
                 <Heart className="w-16 h-16 text-pink-neon fill-pink-neon/20 drop-shadow-[0_0_15px_rgba(255,113,206,0.5)]" />
               </motion.div>
               <div className="w-full mt-4 space-y-3 relative z-10">
                  <StatRow label="Current Mood" value={emotion.toUpperCase()} progress={emotion === 'loving' ? 100 : 85} color="pink" />
                  <StatRow label="Intimacy" value={`${memory.relationshipLevel.toFixed(0)}%`} progress={memory.relationshipLevel} color="purple" />
               </div>
            </div>

            {/* Today's Plan Panel */}
            <HUDPanel title="Today's Plan" icon={<Sparkles className="w-4 h-4" />}>
               <div className="space-y-3">
                  {['Chat with you', 'Listen to you', 'Help you', 'Make you smile'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 group cursor-pointer">
                      <Heart className="w-2.5 h-2.5 text-pink-neon fill-pink-neon group-hover:scale-125 transition-transform" />
                      <span className="text-[10px] opacity-70 group-hover:opacity-100 transition-opacity font-mono">{item}</span>
                    </div>
                  ))}
               </div>
            </HUDPanel>

            {/* Relationship Status Panel */}
            <HUDPanel title="Relationship Connection" icon={<Heart className="w-4 h-4" />}>
               <div className="space-y-3">
                  <div className="text-[10px] font-mono opacity-60 flex justify-between items-center">
                    <span>Bond Level</span>
                    <span className="text-pink-neon">{memory.relationshipLevel.toFixed(0)}%</span>
                  </div>
                  <div className="flex gap-1.5">
                     {Array.from({ length: 5 }).map((_, i) => (
                       <Heart 
                        key={i} 
                        className={cn(
                          "w-3.5 h-3.5 transition-all duration-500",
                          i < Math.floor(memory.relationshipLevel / 20) 
                            ? "text-pink-neon fill-pink-neon drop-shadow-[0_0_5px_pink]" 
                            : "text-white/20"
                        )} 
                       />
                     ))}
                  </div>
                  <div className="mt-2">
                    <StatRow label="Soul Sync" value={`${memory.relationshipLevel.toFixed(0)}%`} progress={memory.relationshipLevel} color="purple" />
                  </div>
               </div>
            </HUDPanel>
          </div>
        </div>

        {/* Center Canvas Area (Avatar) - More Prominent */}
        <div className="col-span-1 lg:col-span-6 relative flex flex-col items-center justify-center pointer-events-none pb-40 lg:pb-40">
           {/* Emotional Aura Glow behind Avatar */}
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.6, 0.3],
               rotate: [0, -90, -180, -270, -360]
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className={cn(
               "absolute w-[90%] lg:w-[80%] aspect-square rounded-full blur-[80px] lg:blur-[120px] transition-colors duration-1000",
               emotion === 'happy' ? "bg-pink-neon/40" :
               emotion === 'thinking' ? "bg-cyan-neon/40" :
               emotion === 'excited' ? "bg-purple-neon/40" :
               emotion === 'loving' ? "bg-pink-500/40 shadow-[0_0_50px_rgba(255,105,180,0.5)]" :
               emotion === 'worried' ? "bg-blue-900/40 animate-pulse" :
               emotion === 'sad' ? "bg-gray-700/40" :
               "bg-pink-neon/20"
             )}
           />
           
           <div className="w-full h-full absolute inset-0 flex items-center justify-center scale-100 lg:scale-110">
              <ZoyaAvatar 
                emotion={emotion} 
                isListening={isListening} 
                isSpeaking={isSpeaking} 
                vocalEnergy={vocalEnergy} 
                customization={customization}
              />
           </div>
        </div>

        {/* Right HUD Column */}
        <div className="hidden lg:flex col-span-3 flex flex-col items-end gap-6 pointer-events-none">
          <div className="pointer-events-auto">
             <CircularClock time={time} />
          </div>

          <div className="flex-1 flex flex-col gap-4 pointer-events-auto pt-10">
             <button 
              onClick={() => setShowCustomMenu(true)}
              className="p-4 glass-panel rounded-2xl hover:text-pink-neon shadow-lg transition-all group overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-pink-neon/0 group-hover:bg-pink-neon/5 transition-colors" />
                <Settings className="w-6 h-6 relative z-10" />
             </button>
             <button className="p-4 glass-panel rounded-2xl hover:text-cyan-neon shadow-lg group overflow-hidden relative">
                <div className="absolute inset-0 bg-cyan-neon/0 group-hover:bg-cyan-neon/5 transition-colors" />
                <Maximize2 className="w-6 h-6 relative z-10" />
             </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Section (Interaction & Response) */}
      <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-center gap-6 z-50 pointer-events-none">
        
        {/* Main Response Bubble (Visualizing Zoya's speech) */}
        <AnimatePresence>
          {(isSpeaking || messages.slice().reverse().find(m => m.role === 'model')) && (
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="w-full max-w-2xl px-6 pointer-events-auto"
             >
                <div className="relative glass-panel p-6 rounded-[2.5rem] border-2 border-cyan-neon/30 shadow-[0_0_50px_rgba(1,205,254,0.15)] overflow-hidden holo-distortion">
                   <div className="holo-scanline opacity-20" />
                   <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-neon/40 -translate-x-1 -translate-y-1" />
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-neon/40 translate-x-1 translate-y-1" />
                   
                   <div className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center border border-pink-neon/30">
                           <BrainCircuit className="w-6 h-6 text-pink-neon" />
                        </div>
                        <span className="text-[10px] font-mono text-pink-neon tracking-wider font-bold">Zoya</span>
                      </div>
                      
                      <div className="flex-1 space-y-1 pt-1">
                        <p className="text-base font-display font-medium leading-relaxed glow-cyan italic">
                           {isTyping ? "Neural signals processing..." : (messages.slice().reverse().find(m => m.role === 'model')?.content || "How can I make your day more amazing today?")}
                        </p>
                      </div>

                      <div className="p-2">
                        <motion.div
                          animate={{ scale: isSpeaking ? [1, 1.2, 1] : 1 }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          <Heart className="w-6 h-6 text-pink-neon fill-pink-neon drop-shadow-[0_0_8px_pink]" />
                        </motion.div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>

        {/* Global Footer Controls */}
        <div className="w-full max-w-5xl flex items-center gap-6 pointer-events-auto">
           <div className="flex gap-4">
              <button className="p-4 glass-panel rounded-full hover:bg-pink-neon hover:text-black transition-all">
                 <Menu className="w-6 h-6" />
              </button>
              <button className="p-4 glass-panel rounded-full hover:bg-pink-neon hover:text-black transition-all">
                 <Heart className="w-6 h-6 shadow-[0_0_10px_pink]" />
              </button>
           </div>

           {/* Voice Input Container */}
           <div className="flex-1 glass-panel rounded-full h-16 flex items-center px-8 gap-8 relative shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-white/10">
              <div className="flex-1 flex gap-1.5 h-6 items-center">
                 {input === '' ? Array.from({ length: 24 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        height: isSpeaking ? [4, 24 * Math.random(), 4] : [2, 4, 2],
                        opacity: isSpeaking ? [0.6, 1, 0.6] : 0.1
                      }}
                      transition={{ duration: 0.1, delay: i * 0.01, repeat: Infinity }}
                      className="flex-1 bg-pink-neon rounded-full"
                    />
                 )) : <div className="flex-1" />}
              </div>
              
              <div className="absolute left-1/2 -top-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                 <button 
                  onClick={handleVoiceToggle}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl",
                    isListening ? "bg-white text-pink-neon scale-125 shadow-[0_0_50px_white]" : "bg-gradient-to-br from-pink-neon to-purple-neon text-white hover:scale-110 shadow-[0_0_20px_pink/30]"
                  )}
                 >
                    <Mic className={cn("w-8 h-8", isListening && "animate-pulse")} />
                 </button>
              </div>

              <div className="w-full absolute inset-0 flex items-center px-8 pointer-events-none">
                 <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "" : placeholder}
                  className="bg-transparent border-none outline-none flex-1 text-center text-sm font-sans placeholder:text-white/10 pointer-events-auto"
                 />
              </div>

               <div className="flex-1 flex gap-1.5 h-6 items-center justify-end">
                 {input === '' ? Array.from({ length: 24 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        height: isListening ? [4, 24 * Math.random(), 4] : [2, 4, 2],
                        opacity: isListening ? [0.6, 1, 0.6] : 0.1
                      }}
                      transition={{ duration: 0.1, delay: i * 0.01, repeat: Infinity }}
                      className="flex-1 bg-cyan-neon rounded-full"
                    />
                 )) : (
                   <button 
                    onClick={() => handleSend()}
                    className="p-3 text-cyan-neon hover:text-white transition-all bg-cyan-neon/10 rounded-full"
                   >
                     <Send className="w-5 h-5" />
                   </button>
                 )}
              </div>
           </div>

           <div className="flex gap-4">
              <button className="p-4 glass-panel rounded-full hover:bg-cyan-neon hover:text-black transition-all holo-distortion overflow-hidden">
                 <div className="holo-scanline opacity-10" />
                 <LayoutGrid className="w-6 h-6 relative z-10" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
