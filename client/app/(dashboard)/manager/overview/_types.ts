export interface ManagerOverviewPeopleStats {
    teachers: number
    otherStaff: number
    totalStaff: number
    classes: number
    students: number
    boys: number
    girls: number
    others: number
}

export interface ManagerOverviewFinanceStats {
    currency: string
    feesReceived: number
    feesReceivedSource: "config" | "transactions" | "unavailable"
    salaryPaid: number | null
    salaryPaidSource: "config" | "transactions" | "unavailable"
}

export interface ManagerOverviewAttendanceStats {
    totalRecords: number
    present: number
    absent: number
    late: number
    teacherRecords: number
    staffRecords: number
    latestMarkedAt: string | null
    source: "records" | "unavailable"
}

export interface ManagerOverviewProfile {
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
    ownIncomeReceived: number | null
    ownIncomeSource: "tagged-transactions" | "unavailable"
    roles: string[]
}

export interface ManagerOverviewInstitutionProfile {
    id: number
    name: string
    email: string
    regNo: string
    createdAt: string
    address: string | null
}

export interface ManagerOverviewStats {
    people: ManagerOverviewPeopleStats
    finance: ManagerOverviewFinanceStats
    attendance: ManagerOverviewAttendanceStats
    manager: ManagerOverviewProfile
    institution: ManagerOverviewInstitutionProfile | null
}

export const emptyManagerStats: ManagerOverviewStats = {
    people: {
        teachers: 0,
        otherStaff: 0,
        totalStaff: 0,
        classes: 0,
        students: 0,
        boys: 0,
        girls: 0,
        others: 0,
    },
    finance: {
        currency: "INR",
        feesReceived: 0,
        feesReceivedSource: "unavailable",
        salaryPaid: null,
        salaryPaidSource: "unavailable",
    },
    attendance: {
        totalRecords: 0,
        present: 0,
        absent: 0,
        late: 0,
        teacherRecords: 0,
        staffRecords: 0,
        latestMarkedAt: null,
        source: "unavailable",
    },
    manager: {
        id: "",
        username: "",
        email: "",
        type: "staff",
        createdAt: "",
        avatar: null,
        firstName: "",
        lastName: "",
        phone: "",
        bio: "",
        walletBalance: 0,
        ownIncomeReceived: null,
        ownIncomeSource: "unavailable",
        roles: [],
    },
    institution: null,
}
