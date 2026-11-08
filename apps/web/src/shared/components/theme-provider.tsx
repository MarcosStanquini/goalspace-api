import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'goalspace.theme'

const ThemeContext = createContext<{
  theme: Theme
  resolvedTheme: Theme
  setTheme: (theme: Theme) => void
}>({ theme: 'light', resolvedTheme: 'light', setTheme: () => {} })

// O script em index.html aplica a classe antes da primeira pintura
function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme(next: Theme) {
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          // Sem armazenamento o tema vale só para esta sessão
        }
        setThemeState(next)
      },
    }),
    [theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
