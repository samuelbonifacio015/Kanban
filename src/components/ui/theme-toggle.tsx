import { Moon, Sun, Palette, TreePine, Sunrise, Waves, Sunset, Fish, Sparkles, Moon as Midnight, Candy } from "lucide-react"

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
          <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all theme-forest:rotate-0 theme-forest:scale-100 theme-sunrise:rotate-0 theme-sunrise:scale-100 theme-beach:rotate-0 theme-beach:scale-100 theme-sunset:rotate-0 theme-sunset:scale-100 theme-ocean:rotate-0 theme-ocean:scale-100 theme-aurora:rotate-0 theme-aurora:scale-100 theme-midnight:rotate-0 theme-midnight:scale-100 theme-candy:rotate-0 theme-candy:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="w-4 h-4 mr-2" />
          ☀️ Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="w-4 h-4 mr-2" />
          🌙 Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Palette className="w-4 h-4 mr-2" />
          💻 System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("forest")}>
          <TreePine className="w-4 h-4 mr-2" />
          🌲 Forest
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunrise")}>
          <Sunrise className="w-4 h-4 mr-2" />
          🌅 Sunrise
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("beach")}>
          <Waves className="w-4 h-4 mr-2" />
          🏖️ Beach
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("sunset")}>
          <Sunset className="w-4 h-4 mr-2" />
          🌇 Sunset
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("ocean")}>
          <Fish className="w-4 h-4 mr-2" />
          🌊 Ocean
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("aurora")}>
          <Sparkles className="w-4 h-4 mr-2" />
          ✨ Aurora
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("midnight")}>
          <Midnight className="w-4 h-4 mr-2" />
          🌌 Midnight
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("candy")}>
          <Candy className="w-4 h-4 mr-2" />
          🍬 Candy
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}