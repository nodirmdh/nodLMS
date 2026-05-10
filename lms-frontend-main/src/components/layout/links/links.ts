import {
  Album,
  Brain,
  BriefcaseBusiness,
  ClipboardPlus,
  FileCheck2,
  FileMinus2,
  FileSliders,
  GraduationCap,
  Home,
  Users,
  Workflow,
  BookCheck,
  ExternalLink,
  Settings,
  ListChecks,
  PiggyBank,
  CreditCard,
  BookOpen,
  BarChart3,
} from "lucide-react";

export interface NavLink {
  label?: string;
  to: string;
  icon: any;
  role?: string[];
}

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

const lessonRole: string[] = ["CEO", "assistent", "manager", "admin"];

const links: SideLink[] = [
  {
    to: "/",
    label: "dashboard",
    icon: Home,
    role: ["CEO", "assistent", "manager", "mentor", "admin"],
  },
  {
    to: "/dashboard-ceo",
    label: "ceoDashboard",
    icon: BarChart3,
    role: ["CEO", "admin"],
  },
  {
    to: "/leeds",
    label: "leeds",
    icon: ClipboardPlus,
    role: ["CEO", "assistent", "manager", "admin"],
  },
  {
    to: "/tasks",
    label: "tasks",
    icon: ListChecks,
    role: ["CEO", "assistent", "manager", "admin"],
  },
  {
    to: "/groups",
    label: "groups",
    icon: Album,
    role: ["CEO", "assistent", "manager", "admin", "mentor"],
  },
  {
    to: "/students",
    label: "students",
    icon: GraduationCap,
    role: ["CEO", "assistent", "manager", "admin"],
  },
  {
    to: "/mentors",
    label: "mentors",
    icon: BriefcaseBusiness,
    role: ["CEO"],
  },
  {
    to: "/homework",
    label: "homework",
    icon: BookOpen,
    role: ["CEO", "admin", "mentor"],
  },
  {
    to: "/exams",
    label: "exams",
    icon: BookCheck,
    role: ["CEO", "admin", "assistent", "mentor"],
  },
  {
    to: "/debtors",
    label: "debtors",
    icon: PiggyBank,
    role: ["CEO", "admin", "manager"],
  },
  {
    to: "/payment-plans",
    label: "paymentPlans",
    icon: CreditCard,
    role: ["CEO", "admin", "manager"],
  },
  {
    to: "",
    label: "branch",
    icon: ExternalLink,
    role: ["CEO", "admin"],
    sub: [
      {
        to: "/staffs",
        label: "staff",
        icon: Users,
        role: ["CEO", "admin"],
      },
      {
        to: "/accounting",
        label: "accounting",
        icon: FileSliders,
        role: ["CEO", "admin"],
      },
      {
        to: "/fines",
        label: "fines",
        icon: FileMinus2,
        role: ["CEO"],
      },
      {
        to: "/bonuses",
        label: "bonuses",
        icon: FileCheck2,
        role: ["CEO"],
      },
      {
        to: "/courses",
        label: "courses",
        icon: Brain,
        role: ["CEO"],
      },
      {
        to: "/branches",
        label: "branches",
        icon: Workflow,
        role: ["CEO"],
      },
    ],
  },
  {
    to: "/admin/notification-templates",
    label: "notificationTemplates",
    icon: Settings,
    role: ["CEO", "admin"],
  },
  {
    to: "/settings",
    label: "settings",
    icon: Settings,
    role: ["CEO", "assistent", "manager", "mentor", "admin"],
  },
];

export { links, lessonRole };
