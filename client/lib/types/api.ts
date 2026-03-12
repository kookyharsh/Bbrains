// Shared API Types

export interface ApiUser {
    id: string
    username: string
    email: string
    type: "student" | "teacher" | "admin" | "staff"
    userDetails?: {
        firstName: string
        lastName: string
        avatar?: string
        sex?: string
        dob?: string
        phone?: string
    }
    wallet?: { id: string; balance: number }
    xp?: { xp: number; level: number }
    enrollments?: { courseId: number; course: { name: string; id: number } }[]
}

export interface ApiAssignment {
    id: number
    courseId: number
    title: string
    description?: string
    content?: string
    dueDate: string
    createdAt: string
    course?: { name: string }
    _count?: { submissions: number }
}

export interface ApiAnnouncement {
    id: number
    userId: string
    title: string
    description?: string
    createdAt: string
    user?: { username: string; type: string }
}

export interface ApiProduct {
    id: number
    name: string
    description?: string
    price: number | string
    stock: number
    image?: string
    approval: "pending" | "approved" | "rejected"
    createdAt: string
    creator?: { username: string; type: string }
}

export interface ApiRole {
    id: number
    name: string
    description?: string
}

export interface ApiAchievement {
    id: number
    name: string
    description?: string
    icon?: string
    requiredXp: number | string
    category?: string
}

export interface ApiAuditLog {
    id: number
    userId?: string
    category: string
    action: string
    entity: string
    entityId: string
    change?: Record<string, unknown>
    reason?: string
    createdAt: string
    user?: { username: string }
}

export interface ApiTransaction {
    id: number
    userId: string
    transactionDate: string
    amount: number | string
    type: "credit" | "debit"
    status: "success" | "failed" | "pending"
    note?: string
}

export interface ApiCourse {
    id: number
    name: string
    description?: string
}

export interface ApiSubmission {
    id: number
    assignmentId: number
    userId: string
    filePath: string
    submittedAt: string
    user?: { username: string }
    assignment?: { title: string }
}

export interface ApiGrade {
    id: number
    userId: string
    assignmentId: number
    grade: string
    gradedAt: string
    gradedBy: string
    assignment?: { title: string }
    user?: { username: string }
}

export type LogCategory = "AUTH" | "ACADEMIC" | "MARKET" | "FINANCE" | "USER" | "SYSTEM"

