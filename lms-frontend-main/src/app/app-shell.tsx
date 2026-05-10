import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/sidebar";
import useIsCollapsed from "@/hooks/use-is-collapsed";
import { useSelector } from "react-redux";
import { RootState } from "./store/store.config";

export default function AppShell() {
  const [isCollapsed, setIsCollapsed] = useIsCollapsed();
  const authenticated = useSelector(
    (state: RootState) => state.authState.authenticated
  );

  if (!authenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="relative h-full overflow-hidden bg-background">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        id="content"
        className={`overflow-x-hidden transition-[margin] md:overflow-y-hidden p-4 ${
          isCollapsed ? "md:ml-14" : "md:ml-64"
        } h-full`}
      >
        <Outlet />
      </main>
    </div>
  );
}
