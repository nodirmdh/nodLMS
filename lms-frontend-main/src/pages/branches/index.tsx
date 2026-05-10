import { Table, TableLoading } from "@/components/table";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";

import { useGetAllBranchesQuery } from "@/app/store/services/branch.service";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { NoItems } from "@/components/no-items/no-items";

export const BranchesPage = () => {
  const [dataPage, setDataPage] = useState<number>(1);
  const { t } = useTranslation(["branch"]);
  const { data, isSuccess, isLoading } = useGetAllBranchesQuery({
    page: dataPage,
  });
  const location = useLocation();

  return (
    <>
      <div className="flex items-center pt-2 pb-2">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("title")}
        </h2>
        <div className="flex items-center ml-auto">
          <Link to="/branches/create">
            <Button size="sm">{t("create")}</Button>
          </Link>
        </div>
      </div>
      {isLoading ? (
        <TableLoading columns={["name", "address"]} tag={"branch"} />
      ) : (
        isSuccess &&
        (data?.data?.length > 0 ? (
          <Table
            data={data.data}
            columns={["name", "address"]}
            path={"branches"}
            tag={"branch"}
            withAction
            total={data.total}
            page={dataPage}
            setPage={setDataPage}
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
