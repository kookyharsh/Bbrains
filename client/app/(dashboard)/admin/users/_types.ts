import type { ApiUser } from "@/lib/types/api";

export type UserDetails = ApiUser;

export interface ManagerForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  sex: string;
  dob: string;
  phone: string;
  bio: string;
  collegeId: string;
}

export const emptyManagerForm: ManagerForm = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  sex: "other",
  dob: "",
  phone: "",
  bio: "",
  collegeId: "",
};

export function hasManagerRole(user: Pick<ApiUser, "roles"> | null | undefined): boolean {
  return Boolean(
    user?.roles?.some((entry) =>
      entry?.role?.name?.toLowerCase().includes("manager")
    )
  );
}
