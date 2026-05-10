import { createBrowserRouter } from "react-router-dom";
import { AuthPage } from "@/pages/auth";
import { SettingsPage } from "@/pages/settings.tsx";
import { CoursesPage } from "@/pages/courses";
import { CreateCoursePage } from "@/pages/courses/create.tsx";
import { StaffsPage } from "@/pages/staffs";
import { CreateStaffPage } from "@/pages/staffs/create.tsx";
import { MentorsPage } from "@/pages/mentors";
import { AccountingPage } from "@/pages/accounting";
import { GroupsPage } from "@/pages/groups";
import { LeedsPage } from "@/pages/leeds";
import { StudentsPage } from "@/pages/students";
import { AuthConfirmPage } from "@/pages/auth/confirm.tsx";
import { BranchesPage } from "@/pages/branches";
import { CreateBranchPage } from "@/pages/branches/create";
import { UpdateBranchPage } from "@/pages/branches/update";
import { ViewStaffPage } from "@/pages/staffs/view";
import { UpdateStaffPage } from "@/pages/staffs/update";
import { UpdateCoursePage } from "@/pages/courses/update";
import { CreateGroupPage } from "@/pages/groups/create";
import { LessonViewPage } from "@/pages/lessons/view";
import { UpdateGroupPage } from "@/pages/groups/update";
import { CreateStudent } from "@/pages/students/create";
import { UpdateStudentPage } from "@/pages/students/update";
import { GroupInfo } from "@/pages/groups/group-info";
import { ViewMentor } from "@/pages/mentors/view";
import { ViewStudent } from "@/pages/students/view";
import { UpdateLeedsPage } from "@/pages/leeds/update";
import { FinesPage } from "@/pages/fines";
import { BonusesPage } from "@/pages/bonuses";
import { CreateFines } from "@/pages/fines/create";
import { UpDateFine } from "@/pages/fines/upDate";
import { CreateBonus } from "@/pages/bonuses/create";
import { UpDateBonus } from "@/pages/bonuses/upDate";
import { CreateExprence } from "@/pages/accounting/createExprence";
import { CheckStudent } from "@/pages/lessons/check-student";
import { DebtorsAccounting } from "@/pages/accounting/debtors";
import { Exams } from "@/pages/exams";
import { CreateExam } from "@/pages/exams/create";
import { ExamView } from "@/pages/exams/view";
import { UpDateExam } from "@/pages/exams/update";
import { ViewBonus } from "@/pages/bonuses/view";
import { ViewFines } from "@/pages/fines/view";
import { LeedToStudent } from "@/pages/leeds/to-stundent";
import { FinansView } from "@/pages/accounting/view";
import { UpdateExprence } from "@/pages/accounting/update";
import ForbiddenPage from "@/pages/forbidden-page/forbidden-page";
import { toAuthRoleCheck } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "./store/store.config";
import NotFound from "@/pages/not-found/not-found";
import { Jurnal } from "@/pages/groups/jurnal";

const RoleCheck = ({
  element,
  allowedRoles,
}: {
  element: JSX.Element;
  allowedRoles: string[];
}) => {
  const role = useSelector((state: RootState) => state.userState.role);
  return toAuthRoleCheck(role, allowedRoles) ? element : <ForbiddenPage />;
};

export const routes = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/auth/confirm",
    element: <AuthConfirmPage />,
  },
  {
    path: "/",
    lazy: async () => {
      const AppShell = await import("@/app/app-shell");
      return { Component: AppShell.default };
    },
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (await import("@/pages/dashboard")).default,
        }),
      },
      {
        path: "/lessons/:id",
        element: <LessonViewPage />,
      },
      {
        path: "/lessons/:id/check",
        element: <CheckStudent />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/branches",
        element: (
          <RoleCheck element={<BranchesPage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/branches/create",
        element: (
          <RoleCheck element={<CreateBranchPage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/branches/update/:id",
        element: (
          <RoleCheck element={<UpdateBranchPage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/courses",
        element: <RoleCheck element={<CoursesPage />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/courses/create",
        element: (
          <RoleCheck element={<CreateCoursePage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/courses/update/:id",
        element: (
          <RoleCheck element={<UpdateCoursePage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/staffs",
        element: (
          <RoleCheck element={<StaffsPage />} allowedRoles={["CEO", "admin"]} />
        ),
      },
      {
        path: "/staffs/:id",
        element: (
          <RoleCheck
            element={<ViewStaffPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/staffs/create",
        element: (
          <RoleCheck element={<CreateStaffPage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/staffs/update/:id",
        element: (
          <RoleCheck element={<UpdateStaffPage />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/mentors",
        element: (
          <RoleCheck
            element={<MentorsPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },

      {
        path: "/mentors/:id",
        element: (
          <RoleCheck
            element={<ViewMentor />}
            allowedRoles={["CEO", "admin", "mentor"]}
          />
        ),
      },
      {
        path: "/accounting",
        element: (
          <RoleCheck
            element={<AccountingPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/accounting/:id",
        element: (
          <RoleCheck element={<FinansView />} allowedRoles={["CEO", "admin"]} />
        ),
      },
      {
        path: "/accounting/update/:id",
        element: (
          <RoleCheck element={<UpdateExprence />} allowedRoles={["CEO"]} />
        ),
      },
      {
        path: "/accounting/debtors",
        element: (
          <RoleCheck
            element={<DebtorsAccounting />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/accounting/create",
        element: (
          <RoleCheck element={<CreateExprence />} allowedRoles={["CEO"]} />
        ),
      },

      {
        path: "/groups",
        element: <GroupsPage />,
      },
      {
        path: "/groups/:id",
        element: <GroupInfo />,
      },
      {
        path: "/groups/:id/jurnal",
        element: <Jurnal />,
      },
      {
        path: "/groups/create",
        element: (
          <RoleCheck
            element={<CreateGroupPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/groups/update/:id",
        element: (
          <RoleCheck
            element={<UpdateGroupPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/leeds",
        element: (
          <RoleCheck
            element={<LeedsPage />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/leeds/:id",
        element: (
          <RoleCheck
            element={<UpdateLeedsPage />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/leeds/:id/student",
        element: (
          <RoleCheck
            element={<LeedToStudent />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/students",
        element: (
          <RoleCheck
            element={<StudentsPage />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/students/create",
        element: (
          <RoleCheck
            element={<CreateStudent />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/students/update/:id",
        element: (
          <RoleCheck
            element={<UpdateStudentPage />}
            allowedRoles={["CEO", "admin"]}
          />
        ),
      },
      {
        path: "/students/:id",
        element: (
          <RoleCheck
            element={<ViewStudent />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/fines",
        element: <RoleCheck element={<FinesPage />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/fines/create",
        element: <RoleCheck element={<CreateFines />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/fines/:id",
        element: <RoleCheck element={<ViewFines />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/fines/update/:id",
        element: <RoleCheck element={<UpDateFine />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/bonuses",
        element: <RoleCheck element={<BonusesPage />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/bonuses/:id",
        element: <RoleCheck element={<ViewBonus />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/bonuses/create",
        element: <RoleCheck element={<CreateBonus />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/bonuses/update/:id",
        element: <RoleCheck element={<UpDateBonus />} allowedRoles={["CEO"]} />,
      },
      {
        path: "/exams",
        element: <Exams />,
      },
      {
        path: "/exams/create",
        element: (
          <RoleCheck
            element={<CreateExam />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "/exams/:id",
        element: <ExamView />,
      },
      {
        path: "/exams/update/:id",
        element: (
          <RoleCheck
            element={<UpDateExam />}
            allowedRoles={["CEO", "admin", "manager"]}
          />
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
