import { useNavigate, useParams } from "react-router-dom";
import {
  BranchBody,
  useGetBranchQuery,
  useUpdateBranchMutation,
} from "@/app/store/services/branch.service";
import { BranchForm } from "@/features/branch-form";
import { useEffect } from "react";

export const UpdateBranchPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, refetch } = useGetBranchQuery(id as string);
  const [updateBranch] = useUpdateBranchMutation();

  if (!isLoading && !data) {
    navigate(-1);
    return null;
  }

  useEffect(() => {
    refetch();
  }, []);

  const submitForm = (values: BranchBody) =>
    updateBranch({ ...values, id: data.id });

  return (
    <BranchForm type={"update"} initialValues={data} submitForm={submitForm} isLoading={isLoading}/>
  );
};
