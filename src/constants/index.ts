import {
  Users,
  UserCircle,
  CheckCircle,
  Image,
  TrendingUp,
  Camera,
  DollarSign,
  Key,
  Settings,
} from "lucide-react";

export const dashboardSection = [
  {
    relation: "dashboard",
    name: "Dashboard",
    icon: TrendingUp,
    path: "/",
  },
];

export const managementSection = [
  { relation: "creators", name: "Creators", icon: Users, path: "/creators" },
  {
    relation: "employees",
    name: "Employees",
    icon: UserCircle,
    path: "/employees",
  },
  { relation: "tasks", name: "Tasks", icon: CheckCircle, path: "/tasks" },
];

export const contentSection = [
  { relation: "library", name: "Library", icon: Image, path: "/library" },
  {
    relation: "marketing",
    name: "Marketing",
    icon: TrendingUp,
    path: "/marketing",
  },
  { relation: "costumes", name: "Costumes", icon: Camera, path: "/costumes" },
];

export const financialSection = [
  {
    relation: "financials",
    name: "Financials",
    icon: DollarSign,
    path: "/financials",
  },
];

export const settingsSection = [
  {
    relation: "credentials",
    name: "Credentials",
    icon: Key,
    path: "/credentials",
  },
  { relation: "settings", name: "Settings", icon: Settings, path: "/settings" },
];
