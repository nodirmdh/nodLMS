import {
  useGetFineQuery,
  useUpDateFineMutation,
} from "@/app/store/services/fines.service";
import { IPostBonus } from "@/common/types/bonus-fines.interface";
import { FineForm } from "@/features/fines-form";
import { useParams } from "react-router-dom";
export const UpDateFine = () => {
  const [upDate, dates] = useUpDateFineMutation();
  const { id } = useParams<string>();
  const { data, isSuccess } = useGetFineQuery(id as string);
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
      formType="FINE"
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
