import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/use-theme"

export function ThemeToggleBtn() {
  const { theme, setTheme } = useTheme()
  const nextTheme = theme === "light" ? "dark" : "light"

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label="Toggle theme"
      className="relative rounded-3xl dark:bg-accent cursor-pointer"
    >
      <Sun
        size={10}
        className={`transition-transform duration-600 ease-in-out 
          ${theme === "light" ? "scale-100 rotate-0" : "scale-0 -rotate-90"}`}
      />
      <Moon
        size={10}
        className={`absolute transition-transform duration-600 ease-in-out 
          ${theme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
      />
    </Button>
  )
}
