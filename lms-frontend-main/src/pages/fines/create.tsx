import { useCreateFineMutation } from "@/app/store/services/fines.service";
import { FineForm } from "@/features/fines-form";
export const CreateFines = () => {
  const [createFine, { isLoading }] = useCreateFineMutation();
  return (
    <FineForm
      formType="FINE"
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
