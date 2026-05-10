import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetOneTransactionQuery } from "@/app/store/services/accounting.service";
import { formatAmount, formatPhoneNumber, toAuthRoleCheck } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store/store.config";
export const FinansView = () => {
  const { id } = useParams<string>();
  const { data } = useGetOneTransactionQuery(id as string);
  const { t } = useTranslation("accounting");
  const role = useSelector((state: RootState) => state.userState.role);

  return (
    <section className="p-3 ">
      <div className="flex flex-col">
        <div className="flex items-center">
          <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
            {t("title")} - {t(data?.type?data?.type:"")}
          </h4>
          <div className="ml-auto">
            {toAuthRoleCheck(role, ["CEO"]) && <Link to={`/accounting/update/${data?.id}`}>
              <Button className="text-sm p-4">{t("edit", { ns: "mentor" })}</Button>
            </Link>}
          </div>
        </div>
       
        <div className="mt-2 flex flex-col w-full">
          <fieldset className="grid gap-6 rounded-lg border p-4 mb-6">
            <legend className="-ml-1 px-1 text-sm font-medium">
              {t("data", { ns: "student" })}
            </legend>
            <div className="grid gap-y-4">
              <div className="grid grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("fio", { ns: "student" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.user?.fio?<Link to = {`/staffs/${data.user.id}`}>{data?.user?.fio}</Link>:(<Link to = {`/students/${data?.student?.id}`}>{data?.student?.fio}</Link>)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("date", { ns: "student" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.date ? format(data.date,"dd.MM.yyyy") : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t(data?.expenseType?data?.expenseType:data?.profitType as string)}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {formatAmount(data?.amount?data?.amount:0)} {t("sum", { ns: "list" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("phone", { ns: "student" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {formatPhoneNumber(data?.user?.phone?data.user.phone:"0")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 2xl:grid-cols-4 xl:grid-cols-4 lg:grid-cols-4 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("paymentType")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.paymentType?t(data?.paymentType):""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("comment")}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.comment?data?.comment:"")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("author",{ns:'fine'})}
                  </p>
                  <Link to={`/staffs/${data?.authorId}`}>
                  <p className="text-sm font-medium leading-none">
                    {t(data?.author?data?.author.fio:"")}
                  </p>
                  </Link>
                </div>
              </div>
            </div>
          </fieldset>
          <div className="flex gap-x-6"></div>
        </div>
      </div>
    </section>
  );
};
