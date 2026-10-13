
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ClipboardList,
  Sparkles,
  UserCircle,
  Settings,
  Users,
  PlusCircle,
} from "lucide-react";
import type { NavItem } from "../types/navigation";

export const CANDIDATE_NAV_ITEMS: NavItem[] = [
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
    href: "/candidate/applications",
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

export const RECRUITER_NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/recruiter/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Jobs",
    href: "/recruiter/jobs",
    icon: Briefcase,
  },
  {
    label: "Create Job",
    href: "/recruiter/jobs/create",
    icon: PlusCircle,
  },
  {
    label: "Applicants",
    href: "/recruiter/applicants",
    icon: Users,
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
