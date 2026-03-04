import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Button
      data-ocid="header.theme_toggle"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="w-9 h-9 rounded-xl hover:bg-secondary/80"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-foreground" />
      ) : (
        <Sun className="w-4 h-4 text-foreground" />
      )}
    </Button>
  );
}
