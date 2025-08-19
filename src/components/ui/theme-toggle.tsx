import { Moon, Sun, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ui/theme-provider"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="glass">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all theme-forest:rotate-0 theme-forest:scale-100 theme-sunrise:rotate-0 theme-sunrise:scale-100 theme-beach:rotate-0 theme-beach:scale-100 theme-sunset:rotate-0 theme-sunset:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          ☀️ Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          🌙 Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          💻 System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("forest")}>
          🌲 Forest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunrise")}>
          🌅 Sunrise
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("beach")}>
          🏖️ Beach
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunset")}>
          🌇 Sunset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}