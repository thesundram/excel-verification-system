'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Code2, Layers, Search, Terminal } from 'lucide-react'

export function QRFormatGuide() {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/60 backdrop-blur-md shadow-lg group transition-all hover:border-primary/40">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground tracking-tight">QR Smart Extraction</h4>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest opacity-70">Format Reference Guide</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Delimited Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 text-[10px] uppercase font-black tracking-widest">
                <Layers className="h-3 w-3 mr-1" />
                Delimited
              </Badge>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {['MR008-01', 'BATCH|002', '5590:12'].map((ex) => (
                <div key={ex} className="bg-muted/30 p-2 rounded border border-border/50 text-center">
                  <code className="text-[11px] font-bold text-foreground tracking-tighter">{ex}</code>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Supported Separators: <span className="text-foreground font-bold px-1.5 py-0.5 bg-muted rounded border border-border/50 mx-0.5">-</span> <span className="text-foreground font-bold px-1.5 py-0.5 bg-muted rounded border border-border/50 mx-0.5">|</span> <span className="text-foreground font-bold px-1.5 py-0.5 bg-muted rounded border border-border/50 mx-0.5">,</span> <span className="text-foreground font-bold px-1.5 py-0.5 bg-muted rounded border border-border/50 mx-0.5">:</span>
            </p>
          </div>

          {/* JSON Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-accent/5 text-accent border-accent/10 text-[10px] uppercase font-black tracking-widest">
                <Code2 className="h-3 w-3 mr-1" />
                Structured JSON
              </Badge>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <div className="bg-muted/50 p-3 rounded-lg border border-border/50 relative group/code">
              <Terminal className="absolute top-3 right-3 h-3 w-3 text-muted-foreground opacity-30 group-hover/code:opacity-100 transition-opacity" />
              <pre className="text-[10px] font-bold leading-relaxed overflow-x-auto scrollbar-none">
                <span className="text-primary">{'{'}</span>
                <br />
                &nbsp;&nbsp;<span className="text-accent">&quot;batch_no&quot;</span>: <span className="text-emerald-500">&quot;MR008&quot;</span>,
                <br />
                &nbsp;&nbsp;<span className="text-accent">&quot;container_no&quot;</span>: <span className="text-emerald-500">&quot;001&quot;</span>
                <br />
                <span className="text-primary">{'}'}</span>
              </pre>
            </div>
          </div>

          {/* Multiline Support */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-amber-500/5 text-amber-500 border-amber-500/10 text-[10px] uppercase font-black tracking-widest">
                <Layers className="h-3 w-3 mr-1" />
                Multiline Text
              </Badge>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
            </div>
            <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
              <p className="text-[10px] font-bold font-mono text-foreground leading-normal italic opacity-80">
                Batch No: MR008<br />
                Container No: 001<br />
                SSCC: 3890123...
              </p>
            </div>
          </div>

          {/* Extraction Logic */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="mt-0.5 h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Info className="h-2.5 w-2.5 text-primary" />
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
                <span className="text-foreground font-bold">Matching Logic:</span> The system automatically maps <span className="text-primary font-bold">Batch Number</span> and identifies <span className="text-primary font-bold">S.NO</span>. For SSCC formats, the first 2 digits are often extracted as the sequence number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
