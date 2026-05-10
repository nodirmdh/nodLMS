import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
const data = [1, 2, 3];
export const LoaderLesson = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <fieldset className="grid gap-6 rounded-lg border p-4 ">
        <legend className="-ml-1 px-1 text-sm font-medium">{t("name")}</legend>
        <div className="flex justify-between">
          <div className="text-sm">
              <span className="text-red-800 font-medium">
                <Skeleton className="h-6 w-32" />
              </span>
                <Skeleton className="h-6 w-64 mt-2" />
          </div>
        </div>
        <div className="text-sm">
          <Skeleton className="h-6 w-32" />
          
            <Skeleton className="h-6 w-32 mt-2" />
          
        </div>
        <div className="flex flex-col text-sm">
        </div>
      </fieldset>
      <fieldset className="grid gap-6 rounded-lg border p-4">
        <legend className="-ml-1 px-1 text-sm font-medium">
          {t("students", { ns: "nav" })}
        </legend>
        <div className="flex justify-between align-middle ">
          <div className="flex pt-2">
            {t("checkStudents", { ns: "lessons" })}
          </div>
        </div>
        <table className="w-full rounded-lg text-xs">
          <thead className="rounded-lg">
            <tr className="border border-gray-300 ">
              <th className="text-left pl-2  pr-2 w-8 py-[12px]">
                <Skeleton className="h-4 w-5" />
              </th>
              <th className=" px-4 text-left ">
                <Skeleton className="h-4 w-18" />
              </th>
              <th className=" px-4  text-left ">
                <Skeleton className="h-4 w-20" />
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((el) => {
              return (
                <tr key={el} className="border-[1px] border-gray-300 w-full">
                  <td className="py-[12px] pl-2 ">
                    <Skeleton className="h-4 w-5" />
                  </td>
                  <td className="py-2 px-4 ">
                    <Skeleton className="h-4 w-18" />
                  </td>
                  <td className="py-2 px-4 text-center">
                    <Skeleton className="h-4 w-12" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </fieldset>
    </>
  );
};
