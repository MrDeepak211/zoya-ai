import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Heart } from 'lucide-react';
import zoyaImg from '../../zoya_ai.jpeg';

export type Emotion = 'neutral' | 'happy' | 'shy' | 'excited' | 'thinking' | 'sad' | 'surprised' | 'loving' | 'worried';

export interface Customization {
  hairColor: number; // 0-360 hue rotation
  outfitColor: number;
  accessory: 'none' | 'glasses' | 'ribbon' | 'headphones';
  glowColor: string;
}

interface AvatarProps {
  emotion: Emotion;
  isListening: boolean;
  isSpeaking: boolean;
  vocalEnergy?: number;
  customization?: Customization;
}

export default function ZoyaAvatar({ 
  emotion, 
  isListening, 
  isSpeaking, 
  vocalEnergy = 0,
  customization = { hairColor: 0, outfitColor: 0, accessory: 'none', glowColor: '#ff71ce' }
}: AvatarProps) {
  const particles = useMemo(() => Array.from({ length: 40 }), []);

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* Background Glow Aura - Enhanced with Customizable Color */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ 
          scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
        className="absolute w-[140%] h-[140%] rounded-full blur-[100px]"
        style={{ 
          background: `radial-gradient(circle, ${customization.glowColor}33 0%, ${customization.glowColor}1a 50%, transparent 70%)` 
        }}
      />

      {/* Main Avatar Container with breathing and floating */}
      <motion.div 
        animate={{ 
          y: [-15, 15, -15],
          scale: [1, 1.01, 1],
        }}
        transition={{ 
          y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="relative z-10 w-full h-full max-sm:max-w-[340px] max-w-lg aspect-[3/4] flex items-center justify-center"
      >
        {/* Holographic "Stage" at the base */}
        <div 
          className="absolute -bottom-10 w-4/5 h-10 blur-2xl rounded-[100%] animate-pulse" 
          style={{ backgroundColor: `${customization.glowColor}1a` }}
        />
        
        <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(255,113,206,0.4)] border-2 border-pink-neon/30 holographic-card holo-distortion">
          <div className="holo-scanline opacity-40" />
          
          {/* Glass Reflection Overlay */}
          <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                x: ['-100%', '200%'],
                opacity: [0, 0.15, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear",
                delay: 2
              }}
              className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
          </div>
          
          <motion.div
            animate={{
              scale: isSpeaking ? [1, 1.05, 1] : 1,
              filter: isListening ? `brightness(1.2) hue-rotate(${customization.hairColor}deg)` : `brightness(1) hue-rotate(${customization.hairColor}deg)`,
            }}
            className="w-full h-full relative"
          >
            <img 
              src={zoyaImg} 
              alt="Zoya" 
              className="w-full h-full object-cover scale-110 object-top"
              referrerPolicy="no-referrer"
            />

            {/* Accessory Overlays */}
            {customization.accessory === 'glasses' && (
              <div className="absolute top-[35%] left-1/2 -translate-x-1/2 w-1/2 flex justify-center z-30 opacity-60">
                 <div className="w-16 h-6 border-2 border-black/40 rounded-full flex gap-4">
                    <div className="w-6 h-6 border-2 border-cyan-neon/40 rounded-full bg-cyan-neon/10" />
                    <div className="w-6 h-6 border-2 border-cyan-neon/40 rounded-full bg-cyan-neon/10" />
                 </div>
              </div>
            )}

            {customization.accessory === 'ribbon' && (
              <div className="absolute top-[15%] right-[25%] z-30 drop-shadow-[0_0_5px_pink]">
                 <Heart className="w-8 h-8 text-pink-neon fill-pink-neon rotate-12" />
              </div>
            )}

            {customization.accessory === 'headphones' && (
              <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90%] z-30 pointer-events-none">
                 <div className="w-full h-12 border-t-8 border-x-8 border-gray-900/60 rounded-t-full flex justify-between items-end px-2">
                    <div className="w-12 h-16 bg-gradient-to-br from-pink-neon/40 to-purple-neon/40 rounded-xl border border-white/20 glow-pink" />
                    <div className="w-12 h-16 bg-gradient-to-bl from-pink-neon/40 to-purple-neon/40 rounded-xl border border-white/20 glow-pink" />
                 </div>
              </div>
            )}

            {/* Stage/Lighting Shadow on character */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_30%_20%,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-40 mix-blend-multiply" />

            {/* Virtual Blinking Effect */}
            <motion.div 
              animate={{ 
                height: [0, 0, 0, 0, 50, 0, 0],
                top: ["40%", "40%", "40%", "40%", "30%", "40%", "40%"],
                opacity: [0, 0, 0, 0, 0.4, 0, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.8, 0.85, 0.9, 0.95, 1]
              }}
              className="absolute inset-x-0 bg-black/40 z-20 pointer-events-none"
            />
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent opacity-90" />
          
          {/* Parallax Dust Particles within the Hologram */}
          <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
            {Array.from({ length: 15 }).map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [-20, 20],
                  x: [-10, 10],
                  opacity: [0, 0.5, 0]
                }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                className="absolute w-[1px] h-[1px] bg-white opacity-20"
                style={{ 
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 13) % 100}%`
                }}
              />
            ))}
          </div>
          
          {/* Enhanced Scanning Line */}
          <motion.div 
            animate={{ top: ['-20%', '120%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-[6px] bg-gradient-to-b from-transparent via-pink-neon/60 to-transparent shadow-[0_0_20px_pink] z-30"
          />

          {/* Digital Glitch Overlays */}
          <div className="absolute top-6 right-8 text-[10px] font-mono text-pink-neon/60 uppercase tracking-[0.5em] z-40 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
            AI_INTERFACE_3.2
          </div>
        </div>

        {/* Improved AI Bunny Companion */}
        <motion.div 
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 10, -10, 0],
            x: isSpeaking ? [220, 250, 220] : 220
          }}
          transition={{ 
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 5, repeat: Infinity, ease: "linear" }
          }}
          className="absolute right-0 top-1/4 -translate-y-1/2 translate-x-24 z-30 hidden lg:block"
        >
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Bunny Ears with glow */}
            <div 
              className="absolute top-0 left-6 w-7 h-14 rounded-full blur-[2px] -rotate-12 border shadow-[0_0_10px_pink]" 
              style={{ backgroundColor: `${customization.glowColor}66`, borderColor: customization.glowColor }}
            />
            <div 
              className="absolute top-0 right-6 w-7 h-14 rounded-full blur-[2px] rotate-12 border shadow-[0_0_10px_pink]"
              style={{ backgroundColor: `${customization.glowColor}66`, borderColor: customization.glowColor }}
            />
            
            <div 
              className="absolute inset-x-0 bottom-4 h-1/2 rounded-full blur-2xl animate-pulse" 
              style={{ backgroundColor: `${customization.glowColor}33` }}
            />
            <div 
              className="glass-panel w-24 h-24 rounded-full border-2 flex flex-col items-center justify-center overflow-hidden"
              style={{ borderColor: `${customization.glowColor}99` }}
            >
               <motion.div 
                animate={{ scaleY: [1, 0.1, 1] }} 
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="flex gap-3 mb-1"
               >
                  <div className="w-2.5 h-2.5 bg-pink-neon rounded-full shadow-[0_0_10px_pink]" />
                  <div className="w-2.5 h-2.5 bg-pink-neon rounded-full shadow-[0_0_10px_pink]" />
               </motion.div>
               <motion.div 
                animate={{ scaleX: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-8 h-2 border-b-2 border-pink-neon rounded-full" 
               />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Richer Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 800 - 400, 
              y: Math.random() * 800 - 400, 
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -400 - 100],
              opacity: [0, 0.6, 0],
              scale: [null, Math.random() * 1.5],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: Math.random() * 6 + 4, 
              repeat: Infinity, 
              delay: Math.random() * 10,
              ease: "linear"
            }}
            className={cn(
              "absolute w-1 h-1 rounded-full",
              i % 3 === 0 ? "bg-pink-neon shadow-[0_0_8px_pink]" : 
              i % 3 === 1 ? "bg-cyan-neon shadow-[0_0_8px_cyan]" : 
              "bg-purple-neon shadow-[0_0_8px_purple]"
            )}
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>
    </div>
  );
}
