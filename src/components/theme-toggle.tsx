'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="テーマ切り替え"
      className="h-9 w-9"
    >
      {/* マウント前はサーバーと同じ出力を保証するため両アイコンを非表示 */}
      <Sun className={`h-[1.2rem] w-[1.2rem] ${mounted && theme === 'dark' ? 'block' : 'hidden'}`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] ${mounted && theme === 'dark' ? 'hidden' : 'block'}`} />
    </Button>
  )
}