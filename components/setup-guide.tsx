'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileUp, CheckCircle, BarChart3 } from 'lucide-react'

export function SetupGuide() {
  const steps = [
    {
      number: 1,
      title: 'Upload Your Excel File',
      description: 'Navigate to the Upload tab and select your Excel file (.xlsx or .xls)',
      icon: FileUp,
      details: ['Ensure your Excel has "Batch no" and "S.NO" columns', 'File will be parsed and stored in memory'],
    },
    {
      number: 2,
      title: 'Start QR Verification',
      description: 'Go to the Verification tab and begin scanning QR codes',
      icon: CheckCircle,
      details: [
        'Click "Start Scanner" to activate your camera',
        'Align QR codes with the scan frame',
        'Matched rows will highlight green automatically',
      ],
    },
    {
      number: 3,
      title: 'Track Your Progress',
      description: 'Check the Dashboard tab to view completion metrics',
      icon: BarChart3,
      details: ['View total, verified, and remaining items', 'Export results when batch is complete'],
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Quick Start Guide</h3>
        <p className="mt-1 text-sm text-muted-foreground">Follow these three simple steps to get started</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const IconComponent = step.icon
          return (
            <Card key={step.number} className="overflow-hidden border-border/50 p-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.number}
                  </div>
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <h4 className="mb-2 font-semibold text-foreground">{step.title}</h4>
                  <p className="mb-3 text-sm text-muted-foreground">{step.description}</p>
                  <ul className="space-y-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="border-primary/20 bg-primary/5 p-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Pro Tip:</span> Your data is stored in your browser session.
          Refreshing the page will clear all data. Always export your results before closing.
        </p>
      </Card>
    </div>
  )
}
