import { IPostBonus } from "@/common/types/bonus-fines.interface";
import {
  useUpDateBonusMutation,
  useGetBonusQuery,
} from "@/app/store/services/bonuses.service";

import { FineForm } from "@/features/fines-form/fines-form";
import { useParams } from "react-router-dom";
export const UpDateBonus = () => {
  const [upDate, dates] = useUpDateBonusMutation();
  const { id } = useParams<string>();
  const { data, isSuccess } = useGetBonusQuery(id as string);
  if (!isSuccess) {
    return <> </>;
  }
  const onSubmit = async (value: IPostBonus) => {
    if (id) {
      const response = await upDate({ data: value, id: id });
      return response;
    }
    return { data: { title: "ozgerdi" } };
  };
  return (
    <FineForm
      formType="BONUS"
      type="UPDATE"
      initialValues={{
        name: data.name,
        userId: `${data.userId}`,
        amount: `${data.amount}`,
        comment: data.comment,
      }}
      submitForm={onSubmit}
      isLoading={dates.isLoading}
    />
  );
};
