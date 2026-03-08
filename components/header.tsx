'use client'

import React from 'react'
import { ShieldCheck, Activity } from 'lucide-react'

export function Header({ children }: { children?: React.ReactNode }) {
  const [time, setTime] = React.useState<string | null>(null)

  React.useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }))
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-2xl transition-all duration-300">
      {/* Animated Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 opacity-30 animate-pulse" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 pt-4 sm:pt-5 pb-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4 overflow-hidden w-full md:w-auto">
            {/* Premium Logo Design */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 sm:-inset-1.5 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-40 group-hover:opacity-100 transition duration-500 group-hover:duration-200" />
              <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg ring-1 ring-white/30 transform transition-transform group-hover:scale-105 active:scale-95">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow-md" />
              </div>
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate leading-none">
                  Verification <span className="text-primary">System</span>
                </h1>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0" />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em] sm:tracking-[0.15em] opacity-80 pl-0.5 truncate leading-none mt-1">
                Enterprise Verification System
              </p>
            </div>
          </div>

          {/* Right Side Header Content */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 sm:gap-5">
            <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-4 sm:pr-5">
              <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">System Engine</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Activity className="h-3 w-3 text-primary animate-bounce shrink-0" />
                <span className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-tighter truncate">Live Monitoring</span>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end flex-1 sm:flex-none">
              <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">Last Update</span>
              <span className="text-[11px] sm:text-xs font-bold text-foreground bg-secondary/50 px-2.5 py-1 rounded-md border border-border/50 min-w-[100px] sm:min-w-[120px] text-center w-full sm:w-auto truncate">
                {time ? (
                  <span className="flex items-center justify-center gap-1">
                    <span className="inline-block whitespace-nowrap">{time} Ready</span>
                  </span>
                ) : 'Initialising...'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Slot */}
        {children && (
          <div className="mt-3 pt-3 border-t border-white/5">
            {children}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-50" />
    </header>
  )
}
