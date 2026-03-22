import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext()

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  )
  const [isHighContrast, setIsHighContrast] = useState(
    () => localStorage.getItem("high-contrast") === "true"
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark", "high-contrast")

    if (isHighContrast) {
      root.classList.add("high-contrast")
    } else if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme, isHighContrast])

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    isHighContrast,
    toggleHighContrast: () => {
      const newVal = !isHighContrast
      localStorage.setItem("high-contrast", newVal.toString())
      setIsHighContrast(newVal)
    }
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
