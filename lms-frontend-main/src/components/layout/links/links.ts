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

const lessonRole:string[]=["CEO", "assistent", "manager", "admin"]

const links: SideLink[] = [
  {
    to: "/",
    label: "dashboard",
    icon: Home,
    role: ["CEO", "assistent", "manager", "mentor", "admin"],
  },
  {
    to: "/leeds",
    label: "leeds",
    icon: ClipboardPlus,
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
    to: "/exams",
    label: "exams",
    icon: BookCheck,
    role: ["CEO", "admin", "assistent", "mentor"],
  },
  {
    to: "",
    label: "branch",
    icon: ExternalLink,
    role: ["CEO","admin"],
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
        role: ["CEO","admin"],
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
    to: "/settings",
    label: "settings",
    icon: Settings,
    role: ["CEO", "assistent", "manager", "mentor", "admin"],
  },
];

export {links,lessonRole}