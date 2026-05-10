import { useEffect, useState } from "react";
import { ChevronDown, Menu, User, X } from "lucide-react";
import { Layout } from "@/app/layouts";
import { Button } from "../../ui/button";
import Nav from "../nav/nav";
import { cn, toAuthRoleCheck } from "@/lib/utils";
import { links } from "../links/links";
import { Link } from "react-router-dom";
import { useGetMeQuery } from "@/app/store/services/user.service";
import { useMediaQuery } from "react-responsive";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Sidebar({
  className,
  isCollapsed,
  setIsCollapsed,
}: SidebarProps) {
  const { data } = useGetMeQuery();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });
  const [navOpened, setNavOpened] = useState(false);
  useEffect(() => {
    if (navOpened) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navOpened]);

  return (
    <div className="pt-[45px] 2xl:pt-0 xl:pt-0 lg:pt-0 md:py-0 overflow-hidden mb-[40px]">
      <aside
        className={cn(
          `fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh ${
            isCollapsed ? "md:w-14" : "md:w-64"
          }`,
          className
        )}
      >
        <div
          onClick={() => setNavOpened(false)}
          className={`absolute inset-0 transition-[opacity] delay-100 duration-700 ${
            navOpened ? "h-svh opacity-50" : "h-0 opacity-0"
          } w-full bg-black md:hidden`}
        />
        <Layout fixed className={navOpened ? "h-svh" : ""}>
          {/* Header */}
          <Layout.Header
            sticky
            className="z-50 flex justify-between px-4 py-3 shadow-sm md:px-4"
          >
            <Link
              to={"/"}
              className={`flex justify-center items-center px-1 ${
                !isCollapsed ? "gap-0" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="241 240.012 120.486 19.975"
                width={112}
              >
                <path
                  d="m258.4 236.207-8-3c-.3-.1-.5-.1-.8 0l-8 3c-.3.1-.6.5-.6.9s.3.8.6.9l8 3c.2.1.3.1.4.1.1 0 .2 0 .4-.1l8-3c.3-.1.6-.5.6-.9s-.3-.8-.6-.9z"
                  fill="#7000ff"
                  transform="translate(0 6.88)"
                />
                <path
                  d="M250 253.107c-.1 0-.2 0-.4-.1l-8-3c-.3-.1-.6-.5-.6-.9v-8c0-.6.4-1 1-1s1 .4 1 1v7.3l7 2.6 7-2.6v-7.3c0-.6.4-1 1-1s1 .4 1 1v8c0 .4-.3.8-.6.9l-8 3c-.2.1-.3.1-.4.1z"
                  fill="#7000ff"
                  transform="translate(0 6.88)"
                />
                <path
                  className={`flex flex-col justify-end truncate ${
                    isCollapsed ? "invisible w-0" : "visible w-auto"
                  }`}
                  d="M280.126 257.167h-11.582q-.274 0-.508-.098-.234-.097-.405-.268t-.269-.405q-.097-.235-.097-.508v-12.725h2.539v11.465h10.322zm18.158 0h-2.559v-8.34l-4.502 7.92q-.166.303-.464.459-.298.156-.639.156-.333 0-.621-.156t-.454-.459l-4.521-7.92v8.34h-2.539v-12.92q0-.439.259-.781.258-.342.678-.459.205-.049.41-.034.205.014.396.088.19.073.347.205.156.131.263.317l5.782 10.049 5.781-10.049q.224-.371.62-.527.395-.157.825-.049.41.117.674.459.264.342.264.781zm16.402-4.121q0 .752-.19 1.352-.191.601-.503 1.06-.313.459-.732.781-.42.323-.87.528-.449.205-.913.302-.464.098-.874.098h-9.795v-2.539h9.795q.733 0 1.138-.43.405-.429.405-1.152 0-.352-.107-.645-.108-.293-.308-.507-.2-.215-.488-.332-.288-.118-.64-.118h-5.84q-.615 0-1.328-.219-.713-.22-1.323-.708-.61-.489-1.016-1.28-.405-.791-.405-1.933 0-1.143.405-1.929.406-.786 1.016-1.279.61-.493 1.323-.713.713-.22 1.328-.22h8.643v2.539h-8.643q-.722 0-1.127.44-.406.439-.406 1.162 0 .732.406 1.157.405.425 1.127.425h5.86q.41.01.869.112.459.103.913.317.454.215.864.542.41.328.728.787.317.459.503 1.054.185.596.185 1.348zm16.091 3.037q0 .273-.103.508-.102.234-.273.405-.171.171-.406.269-.234.097-.498.097-.234 0-.473-.088-.239-.087-.425-.283l-9.277-9.687v9.863h-2.539v-12.92q0-.391.219-.708.22-.317.562-.474.361-.146.742-.073t.654.357l9.278 9.677v-9.863h2.539zm14.461-4.639h-8.017v-2.558h8.017zm1.143 5.723h-9.16q-.528 0-1.153-.186-.625-.185-1.157-.61t-.889-1.103q-.356-.679-.356-1.665v-9.161q0-.263.098-.498.097-.234.268-.41.171-.176.406-.273.234-.098.507-.098h11.436v2.539h-10.176v7.901q0 .498.264.761.263.264.771.264h9.141zm15.105-11.465h-5.595v11.465h-2.54v-11.465h-5.605v-2.539h13.74z"
                  fill="#7000ff"
                />
              </svg>
            </Link>

            {/* Toggle Button in mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Toggle Navigation"
              aria-controls="sidebar-menu"
              aria-expanded={navOpened}
              onClick={() => setNavOpened((prev) => !prev)}
            >
              {navOpened ? <X /> : <Menu />}
            </Button>
          </Layout.Header>

          {/* Navigation links */}
          <Nav
            id="sidebar-menu"
            className={`z-40 h-full flex-1 overflow-auto ${
              navOpened
                ? "max-h-screen"
                : "max-h-0 py-0 md:max-h-screen md:py-2"
            }`}
            closeNav={() => setNavOpened(false)}
            isCollapsed={isCollapsed}
            links={links}
          />
          {/* Scrollbar width toggle button */}

          <Button
            onClick={() => setIsCollapsed((prev) => !prev)}
            size="icon"
            variant="outline"
            className="absolute -right-5 top-1/2 z-50 hidden rounded-full md:inline-flex"
          >
            <ChevronDown
              className={`h-4 w-4 ${isCollapsed ? "-rotate-90" : "rotate-90"}`}
            />
          </Button>
        </Layout>
      </aside>
      {!isSmallScreen && (
        <div className=" bg-background w-full h-[45px] fixed flex justify-end items-center shadow-sm gap-4 pr-4 border-b-[1px]">
          <Avatar className="w-[35px] h-[35px] border-[2px] border-gray-600">
            <AvatarImage
              src={
                data?.avatar
                  ? `${import.meta.env.VITE_API_URL}${(
                      data?.avatar as string
                    ).substring(1)}`
                  : "/assets/images/user.png"
              }
              alt="@shadcn"
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          {data?.role &&
          toAuthRoleCheck(data?.role, ["mentor"]) &&
          data?.mentorId ? (
            <>
              <Link to={`/mentors/${data?.mentorId}`}>
                {data?.fio ? data?.fio : ""}
              </Link>
            </>
          ) : (
            <>
              <p className=" font-bold text-sm text-black">
                {data?.fio ? data?.fio : ""}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
