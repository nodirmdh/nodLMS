import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { SlidersHorizontal } from "lucide-react";
export const LoadingMentor: React.FC = () => {
  const { t } = useTranslation(["common", "role", "mentor"]);
  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="pb-1 font-semibold tracking-tight first:mt-0">
          {t("mentors", { ns: "mentor" })}
        </h2>
        <Button className="mr-4" variant="ghost">
          <SlidersHorizontal className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid 2xl:grid-cols-3 gap-[40px] lg:grid-cols-3 sm:grid-cols-2 text">
        <div className="max-w-sm mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-blue-800 transition-transform transform ">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className=" w-10 h-10 rounded-[50%]" />
              <div className="lg:text-xl font-bold md:text-lg text-blue-800 sm:text-sm">
                <Skeleton className=" w-[200px] h-7" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 h-8 max-h-7 lg:text-xl">
              <Skeleton className=" w-32 h-6" />
            </div>
          </div>
        </div>
        <div className="max-w-sm mx-auto bg-white shadow-lg rounded-xl overflow-hidden border border-blue-800 transition-transform transform ">
          <div className="p-8">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className=" w-10 h-10 rounded-[50%]" />
              <div className="lg:text-xl font-bold md:text-lg text-blue-800 sm:text-sm">
                <Skeleton className=" w-[200px] h-7" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 h-8 max-h-7 lg:text-xl">
              <Skeleton className=" w-32 h-6" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
