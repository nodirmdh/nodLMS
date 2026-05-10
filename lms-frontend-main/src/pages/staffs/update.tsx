import {
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/app/store/services/user.service";

import { StaffForm } from "@/features/staff-form";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IUserCreate } from "../../common/types/user.interface";

export const UpdateStaffPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, refetch, isSuccess } = useGetUserQuery(id as string);
  const [updateUser, userMutation] = useUpdateUserMutation();
  if (!isLoading && !data) {
    navigate(-1);
  }
  if (!data) {
  }

  useEffect(() => {
    refetch();
  }, []);

  const submitForm = (values: IUserCreate) => {
    if (data?.id) {
      const responce = updateUser({ ...values, id: data.id });
      return responce;
    }
    return { message: "error", error: "" };
  };

  return isSuccess ? (
    <StaffForm
      type="update"
      initialValues={{
        fio: data.fio || "",
        phone: data.phone,
        phoneSecond: data.phoneSecond || "",
        documentSeries: data.documentSeries || "",
        documentNo: data.documentNo || "",
        role: data.role || "",
        salaryMentorType: data.salaryMentorType || "",
        salaryMentor: `${data.salaryMentor}` || "0",
        salary: `${data.salary ? data.salary : "0"}` || "0",
        telegram: data.telegram || "",
        sex: data.sex || "",
        birthday: data.birthday || "",
        socialStatus: data.socialStatus || "",
        education: data.education || "",
        familyStatus: data.familyStatus || "",
        address: data.address || "",
        cardNo: data.cardNo || "",
        cardPlaceholder: data.cardPlaceholder || "",
        status: data.status || "",
        branches: data.branches.length
          ? data.branches.map(
              (branch: { id: number; name: string }) => branch.id
            )
          : [1],
        avatar: data.avatar ? data.avatar : "",
      }}
      submitForm={submitForm}
      isLoading={userMutation.isLoading}
      id={id}
    />
  ) : (
    ""
  );
};
