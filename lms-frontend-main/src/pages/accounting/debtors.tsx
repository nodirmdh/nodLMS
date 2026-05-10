import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetAllDebtorsQuery,
  useSendSmsMutation,
} from "@/app/store/services/accounting.service";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useTranslation } from "react-i18next";
import { formatAmount, formatPhoneNumber } from "@/lib/utils";
import { ButtonLoading } from "@/components/ui/loading-button";
import { NoItems } from "@/components/no-items/no-items";

const DebtorsAccounting: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data, isLoading } = useGetAllDebtorsQuery();
  const [sendSms, sendSmsData] = useSendSmsMutation();
  const [userData, setUserData] = useState<
    {
      id: number;
      fio: string;
      phone: string;
      balance: number;
      sendSms: boolean;
      motherPhone: string;
      fatherPhone: string;
    }[]
  >([]);

  const hendleCkick = (index: number, check: boolean) => {
    setUserData((prev) => {
      const newUserDate = [...prev];
      newUserDate[index] = {
        ...newUserDate[index],
        sendSms: check,
      };
      return newUserDate;
    });
  };
  const clickSendSms = () => {
    const data = userData.filter((el) => {
      if (el.sendSms) {
        return {
          fio: el.fio,
          phone: el.phone,
          balance: el.balance,
          motherPhone: el.motherPhone,
          fatherPhone: el.fatherPhone,
        };
      }
    });
    sendSms(data)
      .then((res: any) => {
        if (res.data.success) {
          toast({
            title: t("success", { ns: "common" }),
            description: ``,
          });
        }
      })
      .catch(() => {});
  };

  const allClick = () => {
    setUserData(() => {
      return userData.map((el) => {
        return { ...el, sendSms: true };
      });
    });
  };
  useEffect(() => {
    if (data) {
      const updatedUserData = data.map((el: any) => ({
        id: el.id,
        fio: el.fio,
        phone: el.phone,
        balance: el.balance,
        sendSms: false,
        motherPhone: el.montherPhone,
        fatherPhone: el.fatherPhone,
      }));
      setUserData(updatedUserData);
    }
  }, [data]);
  const { t } = useTranslation("accounting");
  return (
    <section>
      <div className="flex justify-between items-center mb-8 mt-4">
        <h3 className="font-bold text-xl">
          {t("debtors", { ns: "accounting" })}
        </h3>
        <Button size="sm" onClick={allClick}>
          {t("selectAll", { ns: "accounting" })}
        </Button>
      </div>
      {isLoading ? (
        <>loading</>
      ) : userData.length > 0 ? (
        <>
          <div className="border rounded-lg w-full">
            <div className="relative w-full overflow-auto">
              <Table className=" text-[13px] md:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[18px] md:w-[32px]">№</TableHead>
                    <TableHead className="">{t("fio")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead>{t("father", { ns: "students" })}</TableHead>
                    <TableHead>{t("monther", { ns: "students" })}</TableHead>
                    <TableHead>{t("balance", { ns: "accounting" })}</TableHead>
                    <TableHead className="w-[32px]">
                      {t("select", { ns: "group" })}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userData.map((item, index) => {
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="w-[18px]">{index + 1}</TableCell>
                        <Link to={`/students/${item.id}`}>
                          <TableCell className="font-medium">
                            {item.fio}
                          </TableCell>
                        </Link>
                        <TableCell>{formatPhoneNumber(item.phone)}</TableCell>
                        <TableCell>
                          {formatPhoneNumber(item.fatherPhone)}
                        </TableCell>
                        <TableCell>
                          {formatPhoneNumber(item.motherPhone)}
                        </TableCell>
                        <TableCell className="text-right px-4">
                          {formatAmount(Math.floor(item.balance / 1000) * 1000)}
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={item.sendSms}
                            onCheckedChange={(check: any) =>
                              hendleCkick(index, check)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex gap-8 mt-4 w-full">
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => navigate("/accounting")}
                className="w-1/2"
              >
                {t("cancel", { ns: "common" })}
              </Button>
              <ButtonLoading
                onClick={() => clickSendSms()}
                isLoading={sendSmsData.isLoading}
                size="sm"
                className="w-1/2"
              >
                {t("sendSms")}
              </ButtonLoading>
            </div>
          </div>
        </>
      ) : (
        <>
          <NoItems head={t("noItem", { ns: "group" })} />
        </>
      )}
    </section>
  );
};

export { DebtorsAccounting };
