import {
  LayoutDashboard,
  Users,
  Megaphone,
  FileText,
  Contact,
  Settings,
} from "lucide-react";

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const dashboardMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Companies",
    path: "/companies",
    icon: Users,
  },
  {
    title: "Contacts",
    path: "/contacts",
    icon: Contact,
  },
  {
    title: "Campaigns",
    path: "/campaigns",
    icon: Megaphone,
  },
  {
    title: "Templates",
    path: "/templates",
    icon: FileText,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
