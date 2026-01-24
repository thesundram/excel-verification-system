'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

export function QRFormatGuide() {
  return (
    <Card className="border-border/50 bg-secondary/30 p-4">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Supported QR Code Formats</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Your QR codes should contain batch number and container number in one of these formats:
            </p>
          </div>

          <div className="space-y-2">
            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                Format 1: Delimited
              </Badge>
              <div className="space-y-1 text-xs">
                <p className="font-mono text-foreground">ABC123-1001</p>
                <p className="font-mono text-foreground">BATCH456|2005</p>
                <p className="font-mono text-foreground">XYZ789,3010</p>
                <p className="text-muted-foreground">
                  Separators: <span className="font-mono">- | , : ;</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <Badge variant="outline" className="text-xs">
                Format 2: JSON
              </Badge>
              <div className="space-y-1 text-xs">
                <p className="font-mono break-words text-foreground">
                  {'{'}
                  &quot;batch_no&quot;: &quot;ABC123&quot;, &quot;container_no&quot;: &quot;1001&quot;
                  {'}'}
                </p>
                <p className="font-mono break-words text-foreground">
                  {'{'}
                  &quot;Batch No&quot;: &quot;BATCH456&quot;, &quot;Container No&quot;: &quot;2005&quot;
                  {'}'}
                </p>
              </div>
            </div>

            <div className="border-t border-border/50 pt-2">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Matching Logic:</span> The system extracts the first 2 digits
                of the container number as S.NO for matching against your Excel data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
