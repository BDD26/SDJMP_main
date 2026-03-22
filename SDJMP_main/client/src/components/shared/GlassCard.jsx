import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function GlassCard({ className, children, hoverEffect = false, ...props }) {
  return (
    <Card 
      className={cn(
        "border-none shadow-xl glass transition-all duration-300", 
        hoverEffect && "hover:shadow-2xl hover:scale-[1.02] cursor-pointer group",
        className
      )} 
      {...props}
    >
      {children}
    </Card>
  )
}
