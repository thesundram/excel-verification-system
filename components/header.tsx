'use client'

import React from 'react'
import { ShieldCheck, Activity } from 'lucide-react'

export function Header() {
  const [time, setTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-2xl transition-all duration-300">
      {/* Animated Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-30 animate-pulse" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Premium Logo Design */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-2xl blur-lg opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-2xl ring-1 ring-white/30 transform transition-transform group-hover:scale-105 active:scale-95">
                <ShieldCheck className="h-7 w-7 text-white drop-shadow-lg" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground bg-clip-text">
                  Verification <span className="text-primary">System</span>
                </h1>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-80 pl-0.5">
                Enterprise Verification System
              </p>
            </div>
          </div>

          {/* Right Side Header Content */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">System Engine</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Activity className="h-3 w-3 text-primary animate-bounce" />
                <span className="text-xs font-black text-primary uppercase tracking-tighter">Live Monitoring active</span>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Last Update</span>
              <span className="text-xs font-bold text-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border/50 min-w-[120px] text-center">
                {time ? `${time} System Ready` : 'Initialising...'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
    </header>
  )
}
