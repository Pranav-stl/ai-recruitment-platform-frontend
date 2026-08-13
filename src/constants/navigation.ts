import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  Sparkles,
  UserCircle,
  Settings,
} from "lucide-react";
import type { NavItem } from "../types/navigation";

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/candidate/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
  {
    label: "Resume",
    href: "/candidate/resume",
    icon: FileText,
  },
  {
    label: "Applications",
    href: "/candidate/applications",
    icon: ClipboardList,
  },
  {
    label: "AI Match",
    href: "/candidate/match-analysis",
    icon: Sparkles,
  },
  {
    label: "Profile",
    href: "/candidate/profile",
    icon: UserCircle,
  },
  {
    label: "Settings",
    href: "/candidate/settings",
    icon: Settings,
  },
];