import React from 'react'

export function PageHeader({ title, description, children, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight font-heading">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-base md:text-lg">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}
