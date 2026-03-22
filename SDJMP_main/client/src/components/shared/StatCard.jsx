import React from 'react'
import { CardContent } from '@/components/ui/card'
import { GlassCard } from './GlassCard'
import { cn } from '@/lib/utils'

export function StatCard({ icon: Icon, title, value, description, trend, trendUp = true, className }) {
  return (
    <GlassCard hoverEffect={true} className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <Icon className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
          {trend && (
            <span className={cn("text-xs font-bold", trendUp ? "text-success" : "text-destructive")}>
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</h3>
        <p className="text-3xl font-black mt-1">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 font-medium">{description}</p>
        )}
      </CardContent>
    </GlassCard>
  )
}
