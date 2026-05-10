import { FormEvent, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetMeQuery,
  usePostSetFillalMutation,
} from "@/app/store/services/user.service";
import { ButtonLoading } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";

import { useToast } from "@/components/ui/use-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RootState, useAppDispatch } from "@/app/store/store.config.ts";

import { LogOut } from "lucide-react";
import { resetAuth } from "@/app/store/features/auth.feature";
import {
  changeBranch,
  changeLanguage,
  logout,
} from "@/app/store/features/user.feature.ts";

export const Settings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { i18n, t } = useTranslation("setting");
  const [updateFillal, { isLoading }] = usePostSetFillalMutation();
  const { data, isSuccess } = useGetMeQuery();
  const userId = useSelector((state: RootState) => state.userState.id);
  const currentLang = useSelector((state: RootState) => state.userState.lang);

  const branchId = useSelector((state: RootState) => state.userState.branch);

  const [branch, setBranch] = useState(String(branchId ? branchId : 1));

  const [language, setLanguage] = useState(currentLang);

  const handleLang = (lang: string) => {
    setLanguage(lang);
  };

  const handleBranch = (branchId: string) => {
    setBranch(branchId);
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateFillal({
      id: userId,
      data: {
        lang: language,
        branch: +branch,
      },
    })
      .then((res: any) => {
        if (res.data.id) {
          return toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch(() => {
        toast({
          title: t("error", { ns: "common" }),
          description: ``,
          variant: "destructive",
        });
      });

    if (language) {
      i18n
        .changeLanguage(language)
        .then(() => dispatch(changeLanguage(language)));
    }

    if (branch) {
      dispatch(changeBranch(Number(branch)));
    }
  };

  const exit = () => {
    dispatch(resetAuth());
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <div
      className="relative flex-col items-start gap-8 block md:flex"
      x-chunk="dashboard-03-chunk-0"
    >
      <form className="grid w-full items-start gap-6" onSubmit={saveSettings}>
        <fieldset className="grid gap-6 rounded-lg border p-4">
          <legend className="-ml-1 px-1 text-sm font-medium">
            {t("settings")}
          </legend>
          <div className="grid gap-3">
            <Label htmlFor="language">{t("branch")}</Label>
            <Select
              value={String(branch)}
              onValueChange={(value) => handleBranch(value)}
            >
              <SelectTrigger
                id="branch"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder={t("selectbranch")} />
              </SelectTrigger>
              <SelectContent>
                {isSuccess && data?.branches?.length > 0
                  ? data.branches.map(
                      (branch: { id: number; name: string }) => (
                        <SelectItem
                          key={branch.id.toString()}
                          value={`${branch.id}`}
                        >
                          {branch.name}
                        </SelectItem>
                      )
                    )
                  : ""}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="language">{t("language")}</Label>
            <Select
              value={language}
              onValueChange={(value) => handleLang(value)}
            >
              <SelectTrigger
                id="language"
                className="items-start [&_[data-description]]:hidden"
              >
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ru">Русский</SelectItem>
                <SelectItem value="uzKir">Узбекский</SelectItem>
                <SelectItem value="uzLat">O`zbekcha</SelectItem>
                <SelectItem value="qq">Qaraqalpaqsha</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between flex-wrap items-center w-full">
            <ButtonLoading
              isLoading={isLoading}
              size="sm"
              className="w-1/2 text-xs p-1 "
            >
              {t("saveSettings")}
            </ButtonLoading>
            <Button
              variant="ghost"
              size="sm"
              onClick={exit}
              className="text-xs w-1/2"
            >
              <LogOut className="w-4 h-4 mr-2" />{" "}
              {t("logout", { ns: "common" })}
            </Button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};
