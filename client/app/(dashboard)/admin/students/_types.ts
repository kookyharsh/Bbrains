import type { ApiUser } from "@/lib/types/api"
export type { ApiUser }

export function fullName(u?: { firstName?: string; lastName?: string } | null): string {
    if (!u) return "—"
    return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "—"
}

export function fmtCurrency(n: number | string): string {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(n))
}

export interface StudentForm {
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
    classId: string
}

export const emptyStudentForm: StudentForm = {
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
    classId: "",
}

export function initStudentForm(student?: ApiUser): StudentForm {
    if (!student) return { ...emptyStudentForm }
    return {
        username: student.username,
        email: student.email,
        password: "",
        confirmPassword: "",
        firstName: student.userDetails?.firstName ?? "",
        lastName: student.userDetails?.lastName ?? "",
        sex: student.userDetails?.sex ?? "other",
        dob: student.userDetails?.dob?.slice(0, 10) ?? "",
        phone: student.userDetails?.phone ?? "",
        collegeId: "",
        classId: student.enrollments?.[0]?.courseId ? String(student.enrollments[0].courseId) : "",
    }
}
