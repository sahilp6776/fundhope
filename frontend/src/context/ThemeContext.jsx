// Dark mode context – persists theme preference in localStorage
import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default to light mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('fundhope-theme')
    return saved === 'dark'
  })

  useEffect(() => {
    // Apply or remove 'dark' class on root element
    if (isDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('fundhope-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('fundhope-theme', 'light')
    }
  }, [isDark])

  const toggleTheme = () => setIsDark((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for easy access
export const useTheme = () => useContext(ThemeContext)
