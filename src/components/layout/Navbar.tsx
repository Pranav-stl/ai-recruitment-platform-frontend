import { useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { MobileSidebar } from "../../components/layout/MobileSidebar";

/**
 * Sticky top bar. Renders the mobile nav trigger on small screens
 * (the desktop Sidebar handles its own header on large screens).
 *
 * Theme toggle is a visual placeholder only — wire it up to your
 * actual theme provider later, no auth or API calls here.
 */
export function Navbar() {
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
      <MobileSidebar />

      <div className="flex-1">
        <span className="hidden text-sm font-medium text-muted-foreground sm:inline">
          Welcome back
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setIsDark((prev) => !prev)}
        >
          {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
            JD
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}