import { useState } from "react";
import { Menu, Radar } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "../../components/ui/sheet";
import { Button } from "../../components/ui/button";
import { SidebarNav } from "../../components/layout/SidebarNav";

/**
 * Slide-in navigation for small screens. Visually mirrors the desktop
 * Sidebar. Open state is local component state — no global store needed.
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
    <SheetTrigger
  render={
    <Button variant="ghost" size="icon" className="lg:hidden" />
  }
>
  <Menu />
</SheetTrigger>

      <SheetContent side="left" className="flex w-64 flex-col border-border bg-card p-0">
        {/* Visually hidden but required by Radix for a11y; sidebar already shows the title below */}
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>

        <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
            <Radar className="h-[18px] w-[18px] text-primary" strokeWidth={2.25} />
          </div>
          <span className="text-sm font-semibold tracking-tight">TalentSync</span>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}