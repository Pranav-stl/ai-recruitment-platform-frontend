import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../constants/navigation";
import { cn } from "../../lib/utils";

interface SidebarNavProps {
  /** Called after a link is clicked — used to close the mobile sheet */
  onNavigate?: () => void;
}


export function SidebarNav({ onNavigate }: SidebarNavProps) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )
            }
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}