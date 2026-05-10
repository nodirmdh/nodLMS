import { Table, TableLoading } from "@/components/table";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { useForm } from "react-hook-form";
import { PopoverContent } from "@radix-ui/react-popover";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
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
import { Link, useLocation } from "react-router-dom";
import { Select } from "@/components/select";
import { useGetResponsiblesSelectQuery } from "@/app/store/services/user.service";
import { useGetUsersSelectQuery } from "@/app/store/services/user.service";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn, toUrlParams } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { useGetAllBonusesQuery } from "@/app/store/services/bonuses.service";
import { SlidersHorizontal } from "lucide-react";
import { NoItems } from "@/components/no-items/no-items";

const filterSchema = z.object({
  userId: z.string().optional(),
  avtorId: z.string().optional(),
  data: z.date().optional(),
});

export const BonusesPage = () => {
  const [filter, setFilter] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dataPage, setDataPage] = useState<number>(1);
  const { t } = useTranslation("bonus");
  const { data, isSuccess, isLoading } = useGetAllBonusesQuery({
    filter: filter,
    page: dataPage,
  });
  const location = useLocation();
  const users = useGetUsersSelectQuery();
  const resposible = useGetResponsiblesSelectQuery();

  const form = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      userId: "",
    },
  });
  const cancelFilter = () => {
    setFilter("");
    form.reset({ userId: "", avtorId: "" });
    setMenuOpen(false);
    setMenuOpen(false);
  };

  const onSubmit = (values: {
    userId?: string;
    avtorId?: string;
    data?: Date;
  }) => {
    setFilter(toUrlParams({ ...values, data: `${values.data}` }));
    setMenuOpen(false);
  };

  return (
    <>
      <div className="flex items-center pt-2 pb-2">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("title")}
        </h2>
        <div className="flex items-center ml-auto">
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button className="mr-4 " variant="ghost">
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72">
              <DropdownMenuLabel>
                {t("filter", { ns: "common" })}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Form {...form}>
                <form
                  className="w-full max-w-4xl p-2 px-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("userId", { ns: "fines" })}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={users.data ? users.data : []}
                              placeholder={t("selectStaffs", { ns: "fines" })}
                              namespace={"staff"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="avtorId"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2 grow"}>
                          <FormLabel>{t("avtorId", { ns: "fines" })}</FormLabel>
                          <FormControl>
                            <Select
                              field={field}
                              options={resposible.data ? resposible.data : []}
                              placeholder={t("selectResponsible", {
                                ns: "fines",
                              })}
                              namespace={"staff"}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="py-2">
                    <FormField
                      control={form.control}
                      name="data"
                      render={({ field }) => (
                        <FormItem className={"grid gap-2"}>
                          <FormLabel>{t("data", { ns: "fines" })}</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  size="sm"
                                  variant={"outline"}
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>
                                      {t("pickDate", { ns: "fines" })}
                                    </span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 z-10">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
                      {t("cancel", { ns: "common" })}
                    </Button>
                  </div>
                </form>
              </Form>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/bonuses/create">
            <Button size="sm">{t("CREATE", { ns: "bonus" })}</Button>
          </Link>
        </div>
      </div>
      {isLoading ? (
        <TableLoading
          columns={["name", "amount", "date", "user"]}
          tag={"bonus"}
        />
      ) : (
        isSuccess &&
        (data.data.length > 0 ? (
          <Table
            data={data.data}
            columns={["name", "amount", "date", "user"]}
            path={"bonuses"}
            tag={"fine"}
            withAction
            total={data.total}
            setPage={setDataPage}
            page={dataPage}
          />
        ) : (
          <NoItems
            head={t("noItem", { ns: "group" })}
            location={location.pathname}
          />
        ))
      )}
    </>
  );
};
