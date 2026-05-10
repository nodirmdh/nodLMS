import {
  useGetOneTransactionQuery,
  usePatchTransactionMutation
} from "@/app/store/services/accounting.service";
import { ExprenceForm } from "@/features/exprence-form";
import { useParams } from "react-router-dom";
export const UpdateExprence = () => {
  const [patchTransaction]=usePatchTransactionMutation()
  const { id } = useParams<string>();
  const { data,isSuccess } = useGetOneTransactionQuery(id as string);
  const onSubmit = async (value: any) => {
    if (id) {
      const respons = await patchTransaction({ data: value, id: id });
      return respons
    }
    return {data:{title:"ozgerdi"}}
  };
  if(!isSuccess){
    return <></>
  }
  return (
    <ExprenceForm
      type="update"
      initialValues={{
        type:data?.type||"",
        amount: data?.amount?`${data?.amount}`:"",
        comment: data?.comment?data?.comment:"",
        paymentType: data?.paymentType?data?.paymentType:"",
        studentId: data?.studentId?`${data?.studentId}`:"",
        userId: data?.userId?`${data?.userId}`:"",
        expenseType: data?.expenseType?data?.expenseType:"",
        profitType: data?.profitType?`${data?.profitType}`:""
      }}
      student={data.student}
      submitForm={onSubmit}
      isLoading={false}
    />
  );
};
