import type { LucideIcon } from "lucide-react";
 

export interface NavItem {
  /** Display label shown next to the icon */
  label: string;
  href: string;
  icon: LucideIcon;
}
 