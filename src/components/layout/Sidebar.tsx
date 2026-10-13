
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Radar, LogOut } from "lucide-react";
import { SidebarNav } from "../../components/layout/SidebarNav";
import { AuthContext } from "../../auth/AuthContext";

export function Sidebar() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) {
    throw new Error("Sidebar must be rendered inside AuthProvider");
  }

  const handleSignOut = () => {
    auth.logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <Radar
            className="h-[18px] w-[18px] text-primary"
            strokeWidth={2.25}
          />
        </div>
        <span className="text-sm font-semibold tracking-tight">
          TalentSync
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav />
      </div>

      <div className="border-t border-border p-4 space-y-3">
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          AI Match Engine online
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}