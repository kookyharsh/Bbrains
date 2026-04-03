export interface OverviewPeopleStats {
    teachers: number
    managers: number
    staff: number
    students: number
    studentToTeacherRatio: number | null
}

export interface OverviewStudentStats {
    total: number
    boys: number
    girls: number
    others: number
}

export interface OverviewFinanceTransaction {
    amount: number
    type: "credit" | "debit"
    transactionDate: string
    note: string
}

export interface OverviewFinanceStats {
    currency: string
    feePerStudent: number
    receivedIncome: number
    accruedIncome: number
    receivableIncome: number
    receivedSource: "config" | "transactions"
    accruedSource: "classes" | "config" | "unavailable"
    latestTransactions: OverviewFinanceTransaction[]
}

export interface OverviewAdminProfile {
    id: string
    username: string
    email: string
    type: string
    createdAt: string
    avatar: string | null
    firstName: string
    lastName: string
    phone: string
    bio: string
    walletBalance: number
    roles: string[]
}

export interface OverviewInstitutionProfile {
    id: number
    name: string
    email: string
    regNo: string
    createdAt: string
    address: string | null
}

export interface OverviewStats {
    people: OverviewPeopleStats
    students: OverviewStudentStats
    finance: OverviewFinanceStats
    admin: OverviewAdminProfile
    institution: OverviewInstitutionProfile | null
}

export const emptyStats: OverviewStats = {
    people: {
        teachers: 0,
        managers: 0,
        staff: 0,
        students: 0,
        studentToTeacherRatio: null,
    },
    students: {
        total: 0,
        boys: 0,
        girls: 0,
        others: 0,
    },
    finance: {
        currency: "INR",
        feePerStudent: 0,
        receivedIncome: 0,
        accruedIncome: 0,
        receivableIncome: 0,
        receivedSource: "transactions",
        accruedSource: "unavailable",
        latestTransactions: [],
    },
    admin: {
        id: "",
        username: "",
        email: "",
        type: "admin",
        createdAt: "",
        avatar: null,
        firstName: "",
        lastName: "",
        phone: "",
        bio: "",
        walletBalance: 0,
        roles: [],
    },
    institution: null,
}
