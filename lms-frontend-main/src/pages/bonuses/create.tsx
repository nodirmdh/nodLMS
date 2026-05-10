import { useCreateBonusMutation } from "@/app/store/services/bonuses.service";
import { FineForm } from "@/features/fines-form/fines-form";
export const CreateBonus = () => {
  const [createFine, { isLoading }] = useCreateBonusMutation();
  return (
    <FineForm
      formType="BONUS"
      type="CREATE"
      initialValues={{
        name: "",
        userId: "",
        amount: "",
        comment: "",
      }}
      submitForm={createFine}
      isLoading={isLoading}
    />
  );
};
