import React, {createContext, useContext, useEffect, useState} from 'react'

export const ThemeContext = createContext({});


// export const ThemeProvider = ThemeContext.Provider;


export const ThemeProvider = ({children}) => {
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

export default function useTheme () {
  return useContext(ThemeContext);
};