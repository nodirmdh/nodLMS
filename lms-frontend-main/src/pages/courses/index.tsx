import { Table, TableLoading } from "@/components/table";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useGetAllCoursesQuery } from "@/app/store/services/course.service";
import { NoItems } from "@/components/no-items/no-items";

export const CoursesPage = () => {
  const { t } = useTranslation(["course", "common"]);
  const { data, isSuccess, isLoading } = useGetAllCoursesQuery({});
  const location = useLocation();
  return (
    <>
      <div className="flex items-center pt-2 pb-2">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("title")}
        </h2>
        <div className="flex items-center ml-auto">
          <Link to={`/courses/create`}>
            <Button size="sm">{t("create")}</Button>
          </Link>
        </div>
      </div>
      {isLoading ? (
        <TableLoading
          columns={["name", "price", "groups", "students"]}
          tag={"course"}
        />
      ) : (
        isSuccess &&
        (data.length > 0 ? (
          <Table
            data={data}
            columns={["name", "price", "groups", "students"]}
            path={"courses"}
            tag={"course"}
            withAction
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
