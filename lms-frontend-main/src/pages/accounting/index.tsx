import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Table, TableLoading } from "@/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form.tsx";
import { Select } from "@/components/select";
import YearMounthCalendar from "@/components/mounth-year-picker/mounth-yaer-picker";
import { useGetAllTransactionsQuery } from "@/app/store/services/accounting.service";
import { PopoverContent } from "@radix-ui/react-popover";
import { SlidersHorizontal } from "lucide-react";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, toAuthRoleCheck, toUrlParams } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { formatAmount } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
const filterSchema = z.object({
  role: z.string().optional(),
  date: z.coerce.date().optional(),
  paymentType: z.string().optional(),
});

export const AccountingPage = () => {
  const [transValue, setTransValue] = useState<string>("out");
  const [menuOpen, setMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { t } = useTranslation("accounting");
  const role = useSelector((state: RootState) => state.userState.role);
  const [filter, setFilter] = useState<string>("");
  const { data, isSuccess, isLoading } = useGetAllTransactionsQuery({
    value: transValue,
    page: page,
    filter: filter,
  });
  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      role: "",
    },
  });
  const cancelFilter = () => {
    setMenuOpen(false);
    setFilter("");
    form.reset();
  };

  const onSubmit = (values: z.infer<typeof filterSchema>) => {
    setFilter(
      toUrlParams({ ...values, date: values.date?.toLocaleDateString() })
    );
    setMenuOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 p-1 pt-6">
      <div className="block 2xl:flex xl:flex lg:flex md:flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <div className="flex items-center space-x-2">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                {" "}
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Form {...form}>
                <form
                  className="w-full max-w-4xl p-2 px-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 mb-4"}>
                        <FormLabel>{t("role", { ns: "common" })}</FormLabel>
                        <FormControl>
                          <Select
                            field={field}
                            options={[
                              { value: "admin", label: t("admin") },
                              { value: "manager", label: t("manager") },
                              { value: "assistent", label: t("assistient") },
                              { value: "mentor", label: t("mentor") },
                              { value: "CEO", label: t("CEO") },
                            ]}
                            placeholder={t("roleSelect", { ns: "role" })}
                            namespace={"staff"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 pb-4"}>
                        <FormLabel>{t("date", { ns: "student" })}</FormLabel>
                        <FormControl>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                size="sm"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>{t("pickdate", { ns: "groups" })}</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 z-10">
                              <YearMounthCalendar
                                onMonthChange={field.onChange}
                                currentMonth={
                                  field.value ? field.value : new Date()
                                }
                                setOpen={setOpen}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem className={"grid gap-2 mb-4"}>
                        <FormLabel>
                          {t("paymentType", { ns: "accounting" })}
                        </FormLabel>
                        <FormControl>
                          <Select
                            field={field}
                            options={[
                              {
                                label: t("cash", { ns: "accounting" }),
                                value: "cash",
                              },

                              {
                                label: t("click", { ns: "accounting" }),
                                value: "click",
                              },
                              {
                                label: t("card", { ns: "accounting" }),
                                value: "card",
                              },
                              {
                                label: t("transfer", { ns: "accounting" }),
                                value: "transfer",
                              },
                            ]}
                            placeholder={t("paymentType", { ns: "accounting" })}
                            namespace={"staff"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className=" flex w-full gap-4 mt-4">
                    <Button className="w-1/2 flex  items-center " size="sm">
                      {t("apply", { ns: "common" })}
                    </Button>
                    <Button
                      className="w-1/2"
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={cancelFilter}
                    >
                      {t("cancel", { ns: "staff" })}
                    </Button>
                  </div>
                </form>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/accounting/debtors">
            <Button size="sm" variant="outline">
              {t("listDebtors")}
            </Button>
          </Link>
          {toAuthRoleCheck(role, ["CEO"]) && (
            <Link to="/accounting/create">
              <Button
                size="sm"
                className=" text-xs 2xl:text-sm xl:text-sm lg:text-sm md:text-sm"
              >
                {t("create")}
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("balance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.balance ? formatAmount(Math.floor(data?.balance)) : "0"}{" "}
              {t("sum", { ns: "list" })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("entry")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.in ? formatAmount(Math.floor(data?.in)) : "0"}{" "}
              {t("sum", { ns: "list" })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("expenses")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {" "}
              {data?.out ? formatAmount(Math.floor(data?.out)) : "0"}{" "}
              {t("sum", { ns: "list" })}
            </div>
          </CardContent>
        </Card>
      </div>
      <Tabs
        defaultValue="account"
        className="w-[400px]"
        onValueChange={(value) => setTransValue(value)}
        value={transValue}
      >
        <TabsList>
          <TabsTrigger value="in">{t("in")}</TabsTrigger>
          <TabsTrigger value="out">{t("out")}</TabsTrigger>
        </TabsList>
      </Tabs>
      {isLoading ? (
        <TableLoading
          columns={["type", "fio", "amount", "comment", "date"]}
          tag={"accounting"}
        />
      ) : (
        isSuccess &&
        data && (
          <Table
            data={data?.data}
            tag={"accounting"}
            columns={["type", "fio", "amount", "comment", "date"]}
            path={`accounting`}
            withAction
            setPage={setPage}
            page={page}
            total={data.total || 0}
          />
        )
      )}
    </div>
  );
};
