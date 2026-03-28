import type { ApiUser } from "@/lib/types/api"
export type { ApiUser }

export function fullName(u?: { firstName?: string; lastName?: string } | null): string {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

export interface TeacherForm {
    username: string
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    sex: string
    dob: string
    phone: string
    collegeId: string
}

export const emptyTeacherForm: TeacherForm = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    sex: "other",
    dob: "",
    phone: "",
    collegeId: "",
}

export function initForm(teacher?: ApiUser): TeacherForm {
    if (!teacher) return { ...emptyTeacherForm }
    return {
        username: teacher.username,
        email: teacher.email,
        password: "",
        confirmPassword: "",
        firstName: teacher.userDetails?.firstName ?? "",
        lastName: teacher.userDetails?.lastName ?? "",
        sex: teacher.userDetails?.sex ?? "other",
        dob: teacher.userDetails?.dob?.slice(0, 10) ?? "",
        phone: teacher.userDetails?.phone ?? "",
        collegeId: "",
    }
}
