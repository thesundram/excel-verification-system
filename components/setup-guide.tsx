'use client'

import { Card } from '@/components/ui/card'
import { FileUp, CheckCircle, BarChart3, ArrowRight, Zap } from 'lucide-react'

export function SetupGuide() {
  const steps = [
    {
      number: 1,
      title: 'Upload Dataset',
      description: 'Import your Excel inventory file (.xlsx).',
      icon: FileUp,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      details: ['Needs "Batch no" & "S.NO" columns', 'Stored securely in session memory'],
    },
    {
      number: 2,
      title: 'QR Verification',
      description: 'Scan items to match against dataset.',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      details: [
        'Real-time camera scanning',
        'Auto-highlighting matched rows',
      ],
    },
    {
      number: 3,
      title: 'Export Intelligence',
      description: 'Track progress and save results.',
      icon: BarChart3,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      details: ['Live metrics dashboard', 'Export verified data to CSV'],
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full opacity-50" />
        <div className="pl-6">
          <h3 className="text-2xl font-black text-foreground tracking-tight italic">Quick Start Protocol</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Follow these steps to initialize the verification engine</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((step, idx) => {
          const IconComponent = step.icon
          return (
            <div key={step.number} className="group relative">
              {/* Step Connection Line (Desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[80%] right-[-20%] h-[2px] bg-gradient-to-r from-border via-border to-transparent z-0">
                  <ArrowRight className="absolute -right-2 -top-2 h-4 w-4 text-border" />
                </div>
              )}

              <Card className="relative overflow-hidden border-border/50 bg-card/40 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30 z-10">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl ${step.bgColor} ${step.color} ring-1 ring-inset ring-foreground/5 shadow-inner`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-4xl font-black text-muted-foreground/10 select-none">0{step.number}</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{step.title}</h4>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed mb-4">{step.description}</p>
                    
                    <div className="space-y-2.5">
                      {step.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-start gap-2.5">
                          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full ${step.bgColor} border border-current opacity-40 shrink-0`} />
                          <span className="text-[11px] font-bold text-muted-foreground/80 leading-tight uppercase tracking-wider">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30 transition-opacity ${step.color}`} />
              </Card>
            </div>
          )
        })}
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000" />
        <Card className="relative border-primary/20 bg-primary/5 p-5 flex items-start gap-4 backdrop-blur-md">
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <div>
            <h5 className="text-sm font-black text-primary uppercase tracking-widest mb-1">Session Protocol Information</h5>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Data is ephemeral and stored in active memory. <span className="text-foreground font-bold">Refreshing the system will clear all current progress.</span> Ensure critical verified datasets are exported regularly via the Dashboard.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
