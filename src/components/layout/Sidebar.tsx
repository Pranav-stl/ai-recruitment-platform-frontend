import { Radar } from "lucide-react";
import { SidebarNav } from "../../components/layout/SidebarNav";


export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Radar className="h-[18px] w-[18px] text-primary" strokeWidth={2.25} />
        </div>
        <span className="text-sm font-semibold tracking-tight">TalentSync</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      <div className="border-t border-border p-4">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          AI Match Engine online
        </p>
      </div>
    </aside>
  );
}