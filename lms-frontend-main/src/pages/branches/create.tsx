import { useCreateBranchMutation } from "@/app/store/services/branch.service";
import { BranchForm } from "@/features/branch-form";

export const CreateBranchPage = () => {
  const [createBranch,{isLoading}] = useCreateBranchMutation();

  return (
    <BranchForm
      type={"create"}
      initialValues={{ name: "", address: "" }}
      submitForm={createBranch}
      isLoading={isLoading}
    />
  );
};
