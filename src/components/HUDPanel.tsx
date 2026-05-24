import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface HUDPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function HUDPanel({ title, children, className, icon }: HUDPanelProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("glass-panel rounded-2xl p-4 holographic-card border-l-4 border-pink-neon holo-distortion", className)}
    >
      <div className="holo-scanline" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        {icon && <div className="text-pink-neon">{icon}</div>}
        <h3 className="text-[10px] font-mono text-pink-neon uppercase tracking-widest font-bold">{title}</h3>
      </div>
      <div className="space-y-3 font-sans text-xs relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export function StatRow({ label, value, progress, color = "pink" }: { label: string, value: string | number, progress?: number, color?: "pink" | "purple" | "cyan" }) {
  const colorMap = {
    pink: "bg-pink-neon",
    purple: "bg-purple-neon",
    cyan: "bg-cyan-neon"
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center opacity-70">
        <span className="text-[9px] font-mono uppercase tracking-tighter">{label}</span>
        <span className="text-white font-mono text-[10px]">{value}</span>
      </div>
      {progress !== undefined && (
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full shadow-[0_0_8px_currentColor]", colorMap[color])}
            style={{ color: progress > 50 ? 'inherit' : 'transparent' }}
          />
        </div>
      )}
    </div>
  );
}

export function CircularClock({ time }: { time: Date }) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90">
        <circle 
          cx="64" cy="64" r="60" 
          fill="none" stroke="currentColor" strokeWidth="1" 
          className="text-pink-neon/20"
        />
        <motion.circle 
          cx="64" cy="64" r="60" 
          fill="none" stroke="currentColor" strokeWidth="2" 
          className="text-pink-neon"
          strokeDasharray="377"
          animate={{ strokeDashoffset: 377 - (377 * (time.getSeconds() / 60)) }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-2xl font-display font-light text-pink-neon glow-pink">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
        </div>
        <div className="text-[8px] font-mono opacity-60 uppercase mt-1">
          {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </div>
        <div className="text-[8px] font-mono opacity-40 uppercase">
          {time.toLocaleDateString([], { weekday: 'long' })}
        </div>
      </div>
    </div>
  );
}
