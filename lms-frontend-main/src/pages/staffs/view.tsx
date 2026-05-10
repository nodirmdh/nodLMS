import { useGetUserQuery } from "@/app/store/services/user.service";
import { Button } from "@/components/ui/button";
import { formatAmount, formatPhoneNumber, toAuthRoleCheck } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { ArrowDownRight, ArrowUpRight, User } from "lucide-react";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";

export const ViewStaffPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(["staff", "role", "status"]);
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetUserQuery(id as string);
  const role = useSelector((state: RootState) => state.userState.role);

  if (isLoading) {
    return <div className="flex">{t("loading", { ns: "lessons" })}</div>;
  }

  if (isError) {
    navigate(-1);
    return;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-8 py-2 xs:flex flex-col md:flex-row">
        <Avatar className="w-16 h-16 flex justify-center items-center">
          <AvatarImage
            className="rounded-full w-[100%] h-[100%]"
            src={
              data?.avatar
                ? `${import.meta.env.VITE_API_URL}${(
                    data.avatar as string
                  ).substring(1)}`
                : "/assets/images/user.png"
            }
            alt="@shadcn"
          />
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
        <div className="w-auto flex pb-1 gap-1 font-semibold tracking-tight flex-col first:mt-0 pt-1 md:flex-col lg:flex-row">
          <h2>{data?.fio}</h2>-
          {data?.role.map((role: string, index: number) => (
            <h2 key={index}>
              {t(role, { ns: "role" })}
              {index !== data?.role.length - 1 && ","}
            </h2>
          ))}
        </div>
        <div className="xs:mx-auto md:ml-auto">
          {toAuthRoleCheck(role, ["CEO"]) && (
            <Link to={`/staffs/update/${data?.id}`}>
              <Button className="text-sm py-1" size="sm">
                {t("edit", { ns: "common" })}
              </Button>
            </Link>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-col w-full">
        <fieldset className="grid gap-6 rounded-lg border p-4 mb-6 bg-white">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("data")}
          </legend>
          <div className="grid gap-y-4">
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("fio")}</p>
                <p className="text-sm font-medium leading-none">{data?.fio}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-medium leading-none">
                  {t(data?.status ? data?.status : "", { ns: "status" })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("role")}</p>
                <p className="text-sm font-medium leading-none flex gap-1">
                  {data?.role?.map((role: string, index: number) => (
                    <span
                      className="text-sm font-medium leading-none"
                      key={index}
                    >
                      {t(role, { ns: "role" })}
                      {index !== data.role.length - 1 && ","}
                    </span>
                  ))}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("birthday")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.birthday
                    ? formatDate(data.birthday)
                    : t("noBirthday", { ns: "nav" })}
                </p>
              </div>
            </div>
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("phone")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.phone && formatPhoneNumber(data.phone)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("phoneSecond")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.phoneSecond && formatPhoneNumber(data?.phoneSecond)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("telegram")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.telegram}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("email")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.email && data.email}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("address")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.address}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("documentSeries")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.documentSeries}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("documentNo")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.documentNo}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("sex")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.sex && t(`sex.${data.sex}`)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("education")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.education && t(`education.${data.education}`)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("employmentFamilyStatus")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.familyStatus &&
                    t(`employmentFamilyStatus.${data.familyStatus}`)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("employmentStatus")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.socialStatus &&
                    t(`employmentStatus.${data.socialStatus}`)}
                </p>
              </div>
            </div>
            <div className="grid xs:grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("status")}</p>
                <p className="text-sm font-medium leading-none">
                  {t(`${data?.status}`, { ns: "status" })}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{t("price")}</p>
                <p className="text-sm font-medium leading-none">
                  {data?.salary
                    ? data.salaryMentorType === "fixedLesson"
                      ? `${formatAmount(data.salary)} ${t("sum", {
                          ns: "list",
                        })} + ${formatAmount(
                          data?.salaryMentor ? data.salaryMentor : ""
                        )} ${t("sum", {
                          ns: "list",
                        })} (мент.урок)`
                      : data.salaryMentorType === "percentLesson"
                      ? `${formatAmount(data.salary)} ${t("sum", {
                          ns: "list",
                        })} + ${data.salaryMentor}% (мент.проц)`
                      : data.salaryMentorType === "fixed"
                      ? `${formatAmount(data.salary)} ${t("sum", {
                          ns: "list",
                        })} + ${formatAmount(
                          data?.salaryMentor ? data?.salaryMentor : ""
                        )} ${t("sum", {
                          ns: "list",
                        })} (мент.мес)`
                      : ""
                    : data?.salaryMentorType === "percentLesson"
                    ? `${data?.salaryMentor}% (Проц.урок)`
                    : data?.salaryMentorType === "fixedLesson"
                    ? `${formatAmount(
                        data?.salaryMentor ? data.salaryMentor : ""
                      )} ${t("sum", {
                        ns: "list",
                      })} (Фикс.Урок)`
                    : data?.salaryMentorType === "fixed"
                    ? `${formatAmount(
                        data?.salaryMentor ? data.salaryMentor : ""
                      )} ${t("sum", {
                        ns: "list",
                      })}`
                    : ""}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("cardNumber")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.cardNo}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {t("cardPlaceholder")}
                </p>
                <p className="text-sm font-medium leading-none">
                  {data?.cardPlaceholder}
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
              {data?.availableBalance
                ? formatAmount(data?.availableBalance)
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
                  {data?.acceptedBalance
                    ? formatAmount(Math.floor(data?.acceptedBalance))
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
                    Math.floor(data?.balance ? data?.balance : 0).toString()
                  )}{" "}
                  {t("sum", { ns: "list" })}
                </span>
              </div>
            </div>
          </fieldset>
          <fieldset className="grid gap-4 rounded-lg border border-gray-300 px-4 w-full bg-white shadow-sm">
            <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
              {t("salary")}
            </legend>
            {data?.transactions?.map((item: any, index: number) => (
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
        <div className="grid gap-8 flex-col w-full lg:grid-cols-2 py-4">
          <fieldset className="grid gap-6 rounded-lg border border-gray-300 p-6 h-auto bg-white shadow-sm">
            <legend className="-ml-1 px-2 text-base font-semibold text-gray-800">
              {t("title", { ns: "bonus" })}
            </legend>
            <div className="flex flex-col justify-center">
              {data?.bonusesReceived?.map((item: any, index: number) => (
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
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
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
              {data?.finesReceived?.map((item: any, index: number) => (
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
                      {item.amount.toLocaleString()} {t("sum", { ns: "list" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
};
