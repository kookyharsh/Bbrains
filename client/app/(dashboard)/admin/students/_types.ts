export { type ApiUser } from "@/lib/types/api"

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
}
