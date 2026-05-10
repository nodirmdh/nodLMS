import { Link } from "react-router-dom";
import { Button, buttonVariants } from "../../ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { cn } from "@/lib/utils";
import useCheckActiveNav from "@/hooks/use-check-active-nav";
import { SideLink } from "../links/links";
import { ChevronDown, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toAuthRoleCheck } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
import { useGetMeQuery } from "@/app/store/services/user.service";
import { useMediaQuery } from "react-responsive";

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  links: SideLink[];
  closeNav: () => void;
}

export default function Nav({
  links,
  isCollapsed,
  className,
  closeNav,
}: NavProps) {
  const { data } = useGetMeQuery();
  const isSmallScreen = useMediaQuery({ query: "(max-width: 768px)" });

  const role = useSelector((state: RootState) => state.userState.role);
  const renderLink = ({ sub, ...rest }: SideLink) => {
    const key = `${rest.label}-${rest.to}`;
    if (isCollapsed && sub)
      return (
        <>
          <NavLinkIconDropdown
            {...rest}
            sub={sub}
            key={key}
            closeNav={closeNav}
          />
        </>
      );

    if (isCollapsed)
      return <NavLinkIcon {...rest} key={key} closeNav={closeNav} />;

    if (sub && toAuthRoleCheck(["CEO", "admin"], role))
      return (
        <NavLinkDropdown {...rest} sub={sub} key={key} closeNav={closeNav} />
      );

    return <NavLink {...rest} key={key} closeNav={closeNav} />;
  };

  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group border-b bg-background py-2 transition-[max-height,padding] duration-500 data-[collapsed=true]:py-2 md:border-none",
        className
      )}
    >
      <TooltipProvider delayDuration={0}>
        <nav className="grid gap-1 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          {links.map(renderLink)}
        </nav>
      </TooltipProvider>
      <div className="px-6 flex gap-2 pt-2 text-xs">
        {isSmallScreen &&
          (data?.role &&
          toAuthRoleCheck(data?.role, ["mentor"]) &&
          data.mentorId ? (
            <>
              <User />
              <Link to={`/mentors/${data?.mentorId}`}>
                {data?.fio ? data?.fio : ""}
              </Link>
            </>
          ) : (
            <>
              <User />
              <p className=" font-bold text-sm text-black">
                {data?.fio ? data?.fio : ""}
              </p>
            </>
          ))}
      </div>
    </div>
  );
}

interface NavLinkProps extends SideLink {
  subLink?: boolean;
  closeNav: () => void;
}

function NavLink({
  icon: Icon,
  label,
  to,
  closeNav,
  role,
  subLink = false,
}: NavLinkProps) {
  const { t } = useTranslation("nav");
  const { checkActiveNav } = useCheckActiveNav();
  const user = useSelector((state: RootState) => state.userState);

  if (!role) {
    return (
      <>
        <Link
          to={to}
          onClick={closeNav}
          className={cn(
            buttonVariants({
              variant: checkActiveNav(to) ? "secondary" : "ghost",
              size: "sm",
            }),
            "h-12 justify-start text-wrap rounded-none px-6 text-xs",
            subLink && "h-10 w-full border-l border-l-slate-200 px-2"
          )}
          aria-current={checkActiveNav(to) ? "page" : undefined}
        >
          <div className="mr-2">
            <Icon />
          </div>
          {t(label as string)}
        </Link>
      </>
    );
  }
  if (!toAuthRoleCheck(user.role, role)) {
    return <></>;
  }
  return (
    <Link
      to={to}
      onClick={closeNav}
      className={cn(
        buttonVariants({
          variant: checkActiveNav(to) ? "secondary" : "ghost",
          size: "sm",
        }),
        "h-12 justify-start text-wrap rounded-none px-6 text-xs",
        subLink && "h-10 w-full border-l border-l-slate-200 px-2"
      )}
      aria-current={checkActiveNav(to) ? "page" : undefined}
    >
      <div className="mr-2">
        <Icon />
      </div>
      {t(label as string)}
    </Link>
  );
}

function NavLinkDropdown({ label, icon: Icon, sub, closeNav }: NavLinkProps) {
  const { t } = useTranslation("nav");
  const { checkActiveNav } = useCheckActiveNav();
  const isChildActive = !!sub?.find((s) => checkActiveNav(s.to));
  const user = useSelector((state: RootState) => state.userState);
  return (
    <Collapsible defaultOpen={isChildActive}>
      <CollapsibleTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "group h-12 w-full justify-start rounded-none px-6 text-xs"
        )}
      >
        <div className="mr-2">
          <Icon />
        </div>
        {t(label as string)}
        <span
          className={cn(
            'ml-auto transition-all group-data-[state="open"]:-rotate-180'
          )}
        >
          <ChevronDown />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="collapsibleDropdown" asChild>
        <ul>
          {sub!.map((sublink) => {
            if (!sublink.role) {
              return <></>;
            }
            if (!toAuthRoleCheck(sublink.role, user.role)) {
              return <></>;
            }
            return (
              <li key={sublink.label} className="my-1 ml-8">
                <NavLink {...sublink} subLink closeNav={closeNav} />
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavLinkIcon({ label, icon: Icon, to }: NavLinkProps) {
  const { t } = useTranslation("nav");
  const { checkActiveNav } = useCheckActiveNav();
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          to={to}
          className={cn(
            buttonVariants({
              variant: checkActiveNav(to) ? "secondary" : "ghost",
              size: "icon",
            }),
            "h-12 w-12"
          )}
        >
          <Icon />
          <span className="sr-only">{label}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {t(label as string)}
      </TooltipContent>
    </Tooltip>
  );
}

function NavLinkIconDropdown({ icon: Icon, label, sub }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav();
  const { t } = useTranslation("nav");

  /* Open collapsible by default
   * if one of child element is active */
  const isChildActive = !!sub?.find((s) => checkActiveNav(s.to));
  const user = useSelector((state: RootState) => state.userState);

  return (
    <DropdownMenu>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant={isChildActive ? "secondary" : "ghost"}
              size="icon"
              className="h-12 w-12"
            >
              <Icon />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {t(label as string)}
          <ChevronDown size={18} className="-rotate-90 text-muted-foreground" />
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" align="start" sideOffset={4}>
        <DropdownMenuLabel>{t(label as string)}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sub!.map(({ icon: SubIcon, label, to, role }) => {
          if (!role) {
            return <></>;
          }
          if (!toAuthRoleCheck(role, user.role)) {
            return <></>;
          }
          return (
            <DropdownMenuItem key={`${label}-${to}`} asChild>
              <Link
                to={to}
                className={checkActiveNav(to) ? "bg-secondary" : ""}
              >
                <SubIcon />{" "}
                <span className="ml-2 max-w-52 text-wrap">
                  {t(label as string)}
                </span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
