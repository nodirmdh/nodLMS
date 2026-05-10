import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  User,
  ChevronRight,
  ChevronLeft,
  CircleCheckBig,
  UserRoundCheck,
} from "lucide-react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "../ui/skeleton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge.tsx";
import { useTranslation } from "react-i18next";
import { formatAmount, formatPhoneNumber } from "@/lib/utils";
import { format } from "date-fns";

interface getColumnsProps {
  columns: string[];
  withAction?: boolean;
  path?: string;
}

const getColumns = ({
  columns,
  withAction,
  path,
}: getColumnsProps): ColumnDef<any>[] => {
  const { t } = useTranslation(["common", "role", "status", "course"]);

  const cols: ColumnDef<any>[] = columns.map((column: any) => ({
    accessorKey: column,
    header: column,
    cell: ({ row }) => {
      if (column === "name" && (path === "branches" || path === "courses")) {
        return <div className=" select-none">{row.getValue("name")}</div>;
      } else if (column === "status") {
        const status = row.getValue("status");
        return (
          <Badge
            className={`mr-2 last:mr-0 ${
              status === "waiting" || status === "new" || status === "stopped"
                ? "text-whitebg-primary bg-primary text-white opacity-80"
                : status === "waitingConfirm" ||
                  status === "vacation" ||
                  status === "frozen"
                ? "text-whitebg-primary opacity-80 text-white bg-purple-600"
                : status === "completed" ||
                  status === "active" ||
                  status === "work" ||
                  status === "passed"
                ? "text-whitebg-primary opacity-80 text-white bg-green-400 "
                : " bg-red-600 text-white"
            }`}
          >
            {t(row.getValue(column) as string, { ns: "status" })}
          </Badge>
        );
      }
      if (column === "phone") {
        return <div>{formatPhoneNumber(row.getValue("phone"))}</div>;
      }
      if (column === "phone") {
        return <div>{formatPhoneNumber(row.getValue("phone"))}</div>;
      }
      if (column === "amount") {
        return (
          <div>
            {Intl.NumberFormat().format(row.getValue("amount"))}{" "}
            {t("sum", { ns: "list" })}
          </div>
        );
      }
      if (column === "fromDate") {
        return (
          <div className="capitalize">
            {`${row.getValue(column)}`.split("T")[0]}
          </div>
        );
      } else if (column === "attended") {
        return row.getValue("attended") ? (
          <CircleCheckBig className="text-green-600 text-2xl" />
        ) : (
          <UserRoundCheck className="text-red-600 text-2xl" />
        );
      }
      if (column === "fio" && path === "accounting") {
        const fio = row.original?.user?.fio || row.original?.student?.fio;

        return (
          <Link to={`/${path}/${row.original.id}`} className="mr-2 last:mr-0">
            {fio}
          </Link>
        );
      }
      if (column === "type" && path === "accounting") {
        const type = row.original?.expenseType || row.original?.profitType;
        return (
          <Link to={`/${path}/${row.original.id}`} className="mr-2 last:mr-0">
            {t(type, { ns: "accounting" })}
          </Link>
        );
      }
      if (column === "avatar") {
        return (
          <Link to={`/${path}/${row.original.id}`}>
            <Avatar>
              <AvatarImage
                src={
                  row.getValue(column)
                    ? `${import.meta.env.VITE_API_URL}${(
                        row.getValue(column) as string
                      ).substring(1)}`
                    : "/assets/images/user.png"
                }
                alt="@shadcn"
              />
              <AvatarFallback>
                <User />
              </AvatarFallback>
            </Avatar>
          </Link>
        );
      }
      if (column === "name" && path === "groups") {
        return (
          <Link
            to={`/${path}/${row.original.groupId || row.original.id}`}
            className="mr-2 last:mr-0"
          >
            {row.getValue(column)}
          </Link>
        );
      }
      if (column === "discount") {
        return (
          <p>
            {row.getValue(column) ? formatAmount(row.getValue(column)) : 0}{" "}
            {t("sum", { ns: "list" })}
          </p>
        );
      }

      if (column === "fio" || path === "groups") {
        return (
          <Link to={`/${path}/${row.original.id}`} className="mr-2 last:mr-0">
            {row.getValue(column)}
          </Link>
        );
      } else if (column === "branches" || path === "students") {
        const values = row.getValue(column) as Array<string>;
        return values.map((val) => (
          <Badge key={val} className="mr-2 last:mr-0">
            {val}
          </Badge>
        ));
      } else if (column === "role") {
        return t(row.getValue(column) as string, { ns: "role" });
      } else if (column === "duration") {
        return t(
          `duration.${
            row.getValue(column) === 1
              ? "month"
              : (row.getValue(column) as number) > 1 &&
                (row.getValue(column) as number) < 5
              ? "month_plural"
              : "month_pluralGenitive"
          }`,
          {
            count: row.getValue(column),
            ns: "course",
          }
        );
      } else if (column === "groups") {
        if (typeof row.getValue(column) === "number") {
          return <div className="capitalize">{row.getValue(column)}</div>;
        }
        const values = row.getValue(column) as Array<string>;
        return values.map((val) => (
          <Badge key={val} className="mr-2 last:mr-0">
            {val}
          </Badge>
        ));
      } else if (
        column === "date" ||
        column === "startDate" ||
        column === "fromDate"
      ) {
        return (
          <div className="capitalize">
            {format(row.getValue(column), "dd.MM.yyyy")}
          </div>
        );
      }
      if (column === "price") {
        return (
          <div>
            <p>
              {Intl.NumberFormat().format(row.getValue("price"))}{" "}
              {t("sum", { ns: "list" })}
            </p>
          </div>
        );
      }
      if (
        (column === "name" && path) ||
        path === "lessons" ||
        path === "accounting"
      ) {
        return (
          <Link to={`/${path}/${row.original.id}`}>{row.getValue(column)}</Link>
        );
      } else {
        return <div className="capitalize">{row.getValue(column)}</div>;
      }
    },
  }));

  if (withAction) {
    cols.push({
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Link
                  to={`/${path}/update/${row.original.id}`}
                  className="w-full"
                >
                  {t("edit")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return cols;
};

interface TableProps {
  columns: string[];
  data: any[];
  withAction?: boolean;
  withPagination?: boolean;
  path: string;
  tag: string;
  total?: number;
  setPage?: (page: number) => void;
  page?: number;
}

export const Table = ({
  columns,
  data,
  withAction = true,
  withPagination = true,
  path,
  tag,
  total,
  setPage,
  page,
}: TableProps) => {
  const { t } = useTranslation(tag);
  const table = useReactTable({
    data,
    columns: getColumns({ columns, withAction, path }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-lg border w-full">
      <UITable className="w-full overflow-hidden ">
        <TableHeader className="overflow-hidden text-xs  sm:text-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="bg-secondary text-black font-medium"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        typeof header.column.columnDef.header === "string"
                          ? t(header.column.columnDef.header)
                          : header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className={withPagination ? "border-b" : ""}>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 bg-white text-center"
              >
                {t("no.results", { ns: "nores" })}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </UITable>
      {withPagination &&
        (total && page && setPage ? (
          <div className="bg-secondary text-black w-full text-xs flex gap-4 p-2 border-0 sm:text-sm">
            <Button
              className="text-black "
              size="sm"
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <strong>
                {page} {t("of", { ns: "status" })} {Math.ceil(total / 10)}
              </strong>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={Math.ceil(total / 10) > page ? false : true}
              className="text-black"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        ) : (
          <div className="bg-secondary text-black w-full flex gap-4 p-2 border-0 text-xs sm:text-base">
            <Button
              className="text-black "
              size="sm"
              variant="outline"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <span className="flex items-center gap-1 text-xs sm:text-sm">
              <strong>
                {table.getState().pagination.pageIndex + 1}{" "}
                {t("of", { ns: "status" })}{" "}
                {table.getPageCount().toLocaleString()}
              </strong>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-black"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        ))}
    </div>
  );
};

const getColumnsLoading = ({
  columns,
  withAction,
}: getColumnsProps): ColumnDef<any>[] => {
  const { t } = useTranslation(["common", "role", "status"]);

  const cols: ColumnDef<any>[] = columns.map((column: any) => ({
    accessorKey: column,
    header: column,
    cell: ({}) => {
      if (column === "avatar") {
        return <Skeleton className="w-10 h-10 rounded-[50%]" />;
      } else {
        return <Skeleton className="w-32 h-6" />;
      }
    },
  }));

  if (withAction) {
    cols.push({
      id: "actions",
      enableHiding: false,
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{t("edit")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return cols;
};

interface TablePropsLoading {
  columns: string[];
  withAction?: boolean;
  withPagination?: boolean;
  tag: string;
}

export const TableLoading = ({
  columns,
  withAction = true,
  withPagination = true,
  tag,
}: TablePropsLoading) => {
  const { t } = useTranslation(tag);
  const table = useReactTable({
    data: columns,
    columns: getColumnsLoading({ columns, withAction }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <>
      <div className="rounded-lg border w-full">
        <UITable className="w-full overflow-hidden ">
          <TableHeader className="overflow-hidden sm:text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="bg-secondary text-black font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          typeof header.column.columnDef.header === "string"
                            ? t(header.column.columnDef.header)
                            : header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className={withPagination ? "border-b" : ""}>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </UITable>
        <div className="bg-secondary text-black w-full flex gap-4 p-2 border-0 text-xs sm:text-sm">
          <Button
            className="text-black "
            size="sm"
            variant="outline"
            disabled={true}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="flex items-center gap-1 text-xs sm:text-base">
            <strong>1 {t("of", { ns: "status" })} 1</strong>
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={true}
            className="text-black"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
};
