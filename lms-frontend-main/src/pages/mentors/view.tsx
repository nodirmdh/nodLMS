import { useGetMentorQuery } from "@/app/store/services/mentor.service";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Table } from "@/components/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { formatAmount, formatDate, formatPhoneNumber } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import ForbiddenPage from "../forbidden-page/forbidden-page";
import { format } from "date-fns";

export const ViewMentor = () => {
  const { id } = useParams<string>();
  const { data, isLoading } = useGetMentorQuery(id as string);
  const { t } = useTranslation("mentor");
  if (!isLoading && !data) {
    return <ForbiddenPage />;
  }
  return (
    <section className="p-3">
      <div className="flex flex-col">
        <div className="flex items-center gap-8 py-2 xs:flex flex-col md:flex-row">
          <Avatar className="w-16 h-16 flex justify-center items-center">
            <AvatarImage
              className="rounded-full w-[100%] h-[100%]"
              src={
                data?.user.avatar
                  ? `${import.meta.env.VITE_API_URL}${(
                      data.user.avatar as string
                    ).substring(1)}`
                  : "/assets/images/user.png"
              }
              alt="@shadcn"
            />
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
          <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
            {t("mentor")} - {data?.user.fio}
          </h4>
          <div className="xs:mx-auto md:ml-auto">
            <Link to={`/staffs/update/${data?.user.id}`}>
              <Button className="text-sm p-4" size="sm">
                {" "}
                {t("edit", { ns: "mentor" })}
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-2 flex flex-col w-full">
          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6 bg-white">
            <legend className="-ml-1 px-1 lg:text-sm sm:text-xs font-medium">
              {t("data")}
            </legend>
            <div className="grid gap-y-4">
              <div className="grid xs:grid-cols-1 xl:grid-cols-4 lg:grid-cols-4 gap-4 border-b pb-4  sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="lg:text-base xs:text-sm text-muted-foreground">
                    {t("fio")}
                  </p>
                  <p className="text-sm font-medium leading-none fs-[12px]">
                    {data?.user.fio}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("phone")}</p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.phone && formatPhoneNumber(data?.user.phone)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("address")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.address}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("birthday")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user?.birthday
                      ? formatDate(data.user.birthday)
                      : t("noBirthday", { ns: "nav" })}
                  </p>
                </div>
              </div>
              <div className="grid xs:grid-cols-1 xl:grid-cols-4 lg:grid-cols-4 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("salary")}</p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.salaryMentorType === "percentLesson"
                      ? `${data.user.salaryMentor}% (Проц.урок)`
                      : data?.user.salaryMentorType === "fixedLesson"
                      ? `${formatAmount(data.user.salaryMentor)} ${t("sum", {
                          ns: "list",
                        })} (за урок)`
                      : data?.user.salaryMentorType === "fixed"
                      ? `${formatAmount(data.user.salaryMentor)} ${t("sum", {
                          ns: "list",
                        })}`
                      : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("phoneSecond")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.phoneSecond &&
                      formatPhoneNumber(data.user.phoneSecond)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("telegram")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.telegram}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("email")}</p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user.cardPlaceholder}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("status")}</p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.user.status ? data?.user.status : "", {
                      ns: "status",
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{t("sex")}</p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.user.sex ? data?.user.sex : "", { ns: "status" })}
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
          <div className="grid md:grid-cols-2 gap-8">
            <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full p-6 bg-white shadow-sm">
              <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
                {t("nowBalanse", { ns: "mentor" })}
              </legend>
              <div className="text-2xl font-bold">
                {data?.user?.availableBalance
                  ? formatAmount(data?.user?.availableBalance)
                  : 0}
                {" " + t("sum", { ns: "list" })}
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium">
                    {t("totalBalanse", { ns: "mentor" })}:{" "}
                  </span>
                  <span className="text-sm ml-auto">
                    {data?.user?.acceptedBalance
                      ? formatAmount(Math.floor(data?.user?.acceptedBalance))
                      : 0}{" "}
                    {" " + t("sum", { ns: "list" })}
                  </span>
                </div>
                <div className="flex items-center">
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">
                    {t("studentDeptors", { ns: "mentor" })}:{" "}
                  </span>
                  <span className="text-sm ml-auto">
                    {formatAmount(
                      Math.floor(
                        data?.user?.balance ? data?.user?.balance : 0
                      ).toString()
                    )}{" "}
                    {t("sum", { ns: "list" })}
                  </span>
                </div>
              </div>
            </fieldset>
            <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full bg-white shadow-sm">
              <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
                {t("studentBonuses")}
              </legend>
              {data?.studentBonuses.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm md:text-base border-b-2 p-2 pb-2 last:border-none"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">
                        {format(item.date, "dd.MM.yyyy")}
                      </p>
                      <p className=" font-medium text-gray-900">
                        {t(item.name, { ns: "accounting" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
                    </p>
                  </div>
                </div>
              ))}
            </fieldset>
          </div>
          <div className="grid gap-8 flex-col w-full lg:grid-cols-2 py-4">
            <fieldset className="grid gap-6 rounded-lg border border-gray-300 p-6 h-auto bg-white shadow-sm">
              <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
                {t("title", { ns: "bonus" })}
              </legend>
              <div className="flex flex-col justify-center">
                {data?.user?.bonusesReceived.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm md:text-base border-b-2 py-2 last:border-none"
                  >
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">
                          {format(item.date, "dd.MM.yyyy")}
                        </p>
                        <p className=" font-medium text-gray-900">
                          {t(item.name, { ns: "accounting" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {item.amount.toLocaleString()}{" "}
                        {t("sum", { ns: "list" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-6 rounded-lg border border-gray-300 p-6 h-auto bg-white shadow-sm">
              <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
                {t("title", { ns: "fines" })}
              </legend>
              <div className="flex flex-col justify-center">
                {data?.user?.finesReceived.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm md:text-base border-b-2 py-2 last:border-none"
                  >
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-xs text-gray-500">
                          {format(item.date, "dd.MM.yyyy")}
                        </p>
                        <p className=" font-medium text-gray-900">
                          {t(item.name, { ns: "accounting" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        {item.amount.toLocaleString()}{" "}
                        {t("sum", { ns: "list" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="flex-col w-full lg:grid-cols-2 py-4">
            <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full bg-white shadow-sm">
              <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
                {t("salary")}
              </legend>
              {data?.user?.transactions.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm md:text-base border-b-2 p-2 pb-2 last:border-none"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="font-medium text-md text-gray-900">
                        {format(item.date, "dd.MM.yyyy")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t(item.paymentType, { ns: "accounting" })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
                    </p>
                  </div>
                </div>
              ))}
            </fieldset>
          </div>
          <div className="w-full">
            <h2 className="-ml-1 px-1 lg:text-xl font-medium  w-ful  sm:text-lg mb-4">
              {t("courses", { ns: "nav" })}
            </h2>
            <Table
              data={data?.courses ? data?.courses : []}
              columns={["name", "price"]}
              path=""
              tag="course"
              withAction={false}
              withPagination={false}
            />
          </div>
          <h2 className="-ml-1 px-1 lg:text-xl font-medium  p-4 w-ful  sm:text-lg">
            {t("groups")}
          </h2>
          <div className="hidden sm:block">
            <Table
              data={data?.groups || []}
              columns={["name", "status", "startTime", "endTime"]}
              path={"groups"}
              withAction={false}
              tag="groups"
            />
          </div>

          <div className="block sm:hidden">
            <Table
              data={data?.groups || []}
              columns={["name", "status", "startTime", "endTime"]}
              path={"groups"}
              withAction={false}
              tag="groups"
            />
          </div>
          <h2 className="-ml-1 px-1 lg:text-xl font-medium  p-4 w-full sm:text-lg">
            {t("lessons")}
          </h2>
          <Table
            data={data?.lessons || []}
            columns={["name", "status", "date", "startTime"]}
            path={"lessons"}
            withAction={false}
            tag="lessons"
          />
        </div>
      </div>
    </section>
  );
};
