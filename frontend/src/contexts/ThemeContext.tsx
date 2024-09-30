import React, { createContext, useContext, useEffect, useState } from 'react'

export const ThemeContext = createContext({});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(null)

  useEffect(() => {

  }, [])

  return (
    <ThemeContext.Provider value={{
      isDark, setIsDark
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default function useTheme() {
  return useContext(ThemeContext);
};