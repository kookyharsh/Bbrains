// Shared API Types

export type LogCategory = "AUTH" | "ACADEMIC" | "MARKET" | "FINANCE" | "USER" | "SYSTEM";

export interface ApiUser {
    id: string
    username: string
    email: string
    type: "student" | "teacher" | "admin" | "staff" | "superadmin"
    roles?: {
        role?: ApiRole
    }[]
    userDetails?: {
        firstName: string
        lastName: string
        avatar?: string
        sex?: string
        dob?: string
        phone?: string
        bio?: string
        teacherSubjects?: string[]
    }
    wallet?: { id: string; balance: number }
    xp?: { xp: number; level: number }
    enrollments?: { courseId: number; course: { name: string; id: number; standard?: string } }[]
    classTeacherCourse?: { id: number; name: string; standard?: string } | null
}

export interface ApiAssignment {
    id: number
    courseId: number
    createdById?: string | null
    title: string
    description?: string
    content?: string
    file?: string // Added missing file property
    rewardPoints?: number
    dueDate: string
    createdAt: string
    course?: { id?: number; name: string; standard?: string }
    createdBy?: {
        id: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
    submission?: ApiSubmission
    status?: string
    _count?: { submissions: number }
}

export interface ApiAnnouncement {
    id: number
    userId: string
    title: string
    description?: string
    createdAt: string
    user?: { 
        username: string; 
        type: string;
        userDetails?: {
            firstName: string;
            lastName: string;
            avatar?: string;
        }
    }
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
    productType?: "digital" | "physical"
    metadata?: {
        productType?: "digital" | "physical"
        rejectionReason?: string
        [key: string]: unknown
    }
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
    user?: {
        username: string
        avatar?: string | null
    }
}

export interface ApiTransaction {
    id: number
    userId: string
    recordedById?: string | null
    relatedUserId?: string | null
    entryGroupId?: string | null
    transactionDate: string
    amount: number | string
    type: "credit" | "debit"
    category?: "salary" | "fee" | "transfer" | "other" | string
    status: "success" | "failed" | "pending"
    paymentMode?: string | null
    referenceId?: string | null
    primaryRecord?: boolean
    note?: string
    user?: ApiUser | null
    relatedUser?: ApiUser | null
    recordedByUser?: ApiUser | null
}

export interface ApiCourse {
    id: number
    name: string
    description?: string
    standard?: string
    subjects?: string[]
    feePerStudent?: number | string
    durationValue?: number
    durationUnit?: "months" | "years"
    studentCapacity?: number
    timetable?: {
        day: string
        subject: string
        startTime: string
        endTime: string
        room?: string | null
    }[]
    classTeacherId?: string | null
    classTeacher?: {
        id: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
}

export interface ApiSubmission {
    id: number
    assignmentId: number
    userId: string
    filePath: string
    content?: string | null
    reviewStatus?: "submitted" | "completed" | "incomplete"
    reviewRemark?: string | null
    reviewedAt?: string | null
    reviewedBy?: string | null
    xpAwardedAt?: string | null
    submittedAt: string
    user?: {
        id?: string
        username: string
        email?: string
        userDetails?: {
            firstName?: string
            lastName?: string
            avatar?: string | null
        }
    }
    reviewer?: {
        id?: string
        username: string
        userDetails?: {
            firstName?: string
            lastName?: string
        }
    } | null
    assignment?: {
        id?: number
        title: string
        description?: string
        dueDate?: string
        file?: string
        rewardPoints?: number
        courseId?: number
        course?: { name: string; standard?: string }
    }
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

export interface DashboardData {
  user: ApiUser;
  stats: {
    totalCourses: number;
    xp: number;
    level: number;
    nextLevelRequiredXp?: number;
    walletBalance: number;
    leaderboardRank: number | null;
    totalAchievements: number;
    streak: number;
  };
  wallet: {
    id?: string;
    balance: number | string;
    pinSet?: boolean;
  };
  attendance: {
    total: number;
    present: number;
    absent: number;
    percentage: number;
    records?: Array<Record<string, unknown>>;
  };
  leaderboard: Array<Record<string, unknown>>;
  announcements: ApiAnnouncement[];
  recentGrades?: {
    assignment: { title: string };
    grade: string | number;
    gradedAt: string;
  }[];
  events: Array<Record<string, unknown>>;
  streak: {
    current: number;
    longest: number;
  };
  feeSummary?: {
    currency: string;
    totalFee: number;
    paidAmount: number;
    remainingAmount: number | null;
    configured: boolean;
  };
}
