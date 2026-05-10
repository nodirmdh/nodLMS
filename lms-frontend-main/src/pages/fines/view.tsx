import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetFineQuery } from "@/app/store/services/fines.service";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/utils";
import { format } from "date-fns";
export const ViewFines = () => {
  const { id } = useParams<string>();
  const { data } = useGetFineQuery(id as string);
  const { t } = useTranslation("fines");
  return (
    <section className="p-3 ">
      <div className="flex flex-col">
        <div className="flex items-center flex-col justify-center md:flex-row md:justify-between">
          <h4 className="pb-1 text-xl font-semibold tracking-tight first:mt-0">
            {t("title")} -{" "}
            {<Link to={`/staffs/${data?.user.id}`}>{data?.user.fio}</Link>}
          </h4>
          <div className="md:ml-auto">
            <Link to={`/fines/update/${id}`}>
              <Button className="text-sm p-4">
                {t("edit", { ns: "mentor" })}
              </Button>
            </Link>
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
                    {t("name", { ns: "fine" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("date", { ns: "student" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {data?.date ? format(data.date, "dd.MM.yyyy") : ""}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("summa", { ns: "group" })}
                  </p>
                  <p className="text-sm font-medium leading-none">
                    {formatAmount(data?.amount ?? "")}{" "}
                    {t("sum", { ns: "list" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("comment", { ns: "accounting" })}
                  </p>
                  <p>{data?.comment}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {t("author", { ns: "fine" })}
                  </p>
                  <p>
                    {
                      <Link to={`/staffs/${data?.author.id}`}>
                        {data?.author.fio}
                      </Link>
                    }
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </section>
  );
};
