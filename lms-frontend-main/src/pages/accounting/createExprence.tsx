import { useCreateTransactionMutation } from "@/app/store/services/accounting.service";
import { ExprenceForm } from "@/features/exprence-form";
export const CreateExprence = () => {
  const [postTransaction,{isLoading}]=useCreateTransactionMutation()

  return (
    <ExprenceForm
      type="create"
      initialValues={{
        type:"",
        amount: "",
        comment: "",
        paymentType: "",
        studentId: "",
        userId: "",
        expenseType: "",
        profitType: ""
      }}
      submitForm={postTransaction}
      isLoading={isLoading}
    />
  );
};
