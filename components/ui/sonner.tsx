'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="top-right"
      richColors={true}
      expand={true}
      toastOptions={{
         classNames: {
            toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
               'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
               'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            success: 'group-[.toaster]:bg-emerald-500 group-[.toaster]:text-white group-[.toaster]:border-emerald-600',
            error: 'group-[.toaster]:bg-red-500 group-[.toaster]:text-white group-[.toaster]:border-red-600',
            warning: 'group-[.toaster]:bg-yellow-500 group-[.toaster]:text-white group-[.toaster]:border-yellow-600',
         },
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
