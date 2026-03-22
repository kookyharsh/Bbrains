export interface OverviewStats {
    teachers: number
    students: number
    products: number
    pending: number
    roles: number
    achievements: number
    announcements: number
    assignments: number
}

export const emptyStats: OverviewStats = {
    teachers: 0,
    students: 0,
    products: 0,
    pending: 0,
    roles: 0,
    achievements: 0,
    announcements: 0,
    assignments: 0,
}
