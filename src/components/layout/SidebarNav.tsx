
import { NavLink } from "react-router-dom";
import {
  CANDIDATE_NAV_ITEMS,
  RECRUITER_NAV_ITEMS,
} from "../../constants/navigation";
import { useAuth } from "../../auth/useAuth";
import { cn } from "../../lib/utils";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const { user } = useAuth();

  const items =
    user?.role === "RECRUITER"
      ? RECRUITER_NAV_ITEMS
      : CANDIDATE_NAV_ITEMS;

  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
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
