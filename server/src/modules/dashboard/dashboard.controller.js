import prisma from '../../utils/prisma.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// GET /dashboard
export const getDashboard = async (req, res) => {
    try {
        const { id, type } = req.user;

        switch (type) {
            case 'student':
                return await studentDashboard(id, res);
            case 'teacher':
                return await teacherDashboard(id, res);
            case 'admin':
                return await adminDashboard(res);
            default:
                return await studentDashboard(id, res);
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard' });
    }
};

async function studentDashboard(userId, res) {
    try {
        const [user, enrollments, xp, achievements, wallet, recentGrades, leaderboardPos, announcements, recentClaims] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, username: true, email: true, type: true,
                    userDetails: { select: { avatar: true, firstName: true, lastName: true } },
                    college: { select: { name: true } }
                }
            }),
            prisma.enrollment.findMany({
                where: { userId },
                include: { course: { select: { name: true, id: true } } }
            }),
            prisma.xp.findUnique({ where: { userId } }),
            prisma.userAchievements.findMany({
                where: { userId },
                include: { achievement: true },
                take: 5,
                orderBy: { unlockedAt: 'desc' }
            }),
            prisma.wallet.findUnique({
                where: { userId },
                select: { balance: true }
            }),
            prisma.grade.findMany({
                where: { userId },
                include: { assignment: { select: { title: true } } },
                take: 5,
                orderBy: { gradedAt: 'desc' }
            }),
            prisma.leaderboard.findFirst({
                where: { userId, category: 'allTime' },
                select: { rank: true, score: true }
            }),
            prisma.announcement.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            type: true,
                            userDetails: {
                                select: {
                                    avatar: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.auditLog.findMany({
                where: {
                    userId: userId,
                    action: "DAILY_CLAIM"
                },
                orderBy: { createdAt: 'desc' },
                take: 30
            })
        ]);

        // Normalize user profile for frontend: flatten avatar and names
        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
            collegeName: user?.college?.name
        };
        const streak = calculateStreak(recentClaims);

        let nextLevel = null;
        if (xp) {
            nextLevel = await prisma.level.findFirst({
                where: { levelNumber: xp.level + 1 }
            });
        }

        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalCourses: enrollments?.length || 0,
                xp: Number(xp?.xp) || 0,
                level: xp?.level || 1,
                nextLevelRequiredXp: nextLevel ? Number(nextLevel.requiredXp) : null,
                walletBalance: Number(wallet?.balance) || 0,
                leaderboardRank: leaderboardPos?.rank || null,
                totalAchievements: achievements?.length || 0,
                streak: streak
            },
            enrollments: enrollments || [],
            recentGrades: recentGrades || [],
            recentAchievements: achievements || [],
            announcements: announcements || []
        });
    } catch (error) {
        console.error('Student Dashboard error details:', error);
        throw error;
    }
}

// Helper function to calculate streak from daily claims
function calculateStreak(claims) {
    if (!claims || !Array.isArray(claims) || claims.length === 0) return 0;

    // Sort claims by date (newest first)
    const sortedClaims = [...claims].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    let streak = 0;
    const currentDateRef = new Date(now);
    currentDateRef.setHours(0, 0, 0, 0);

    for (const claim of sortedClaims) {
        const claimDate = new Date(claim.createdAt);
        claimDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((currentDateRef - claimDate) / oneDay);

        // If the claim is from today or is the next expected day in the streak
        if (diffDays === streak) {
            streak++;
        } else if (diffDays > streak) {
            // Gap in streak, break
            break;
        }
    }

    return streak;
}


async function teacherDashboard(userId, res) {
    try {
        const [user, totalStudents, totalCourses, recentSubmissions, totalSubmissions, totalGrades, xp] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, email: true, type: true, userDetails: true }
            }),
            prisma.user.count({ where: { type: 'student' } }),
            prisma.course.count(),
            prisma.submission.findMany({
                include: {
                    user: { select: { username: true } },
                    assignment: { select: { title: true } }
                },
                take: 10,
                orderBy: { submittedAt: 'desc' }
            }),
            prisma.submission.count(),
            prisma.grade.count(), // Assuming one grade per submission, simplified count
            prisma.xp.findUnique({ where: { userId } }),
        ]);

        // Normalize user profile for frontend
        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
        };
        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalStudents,
                totalCourses,
                // xp/level shown in admin/teacher dashboards as XP progress
                xp: Number(xp?.xp) || 0,
                level: xp?.level || 1,
                pendingGrades: totalSubmissions - totalGrades // Simple approximation
            },
            recentSubmissions
        });
    } catch (error) {
        console.error('Teacher Dashboard error details:', error);
        throw error;
    }
}

async function adminDashboard(res) {
    try {
        const [totalUsers, totalStudents, totalTeachers, totalCourses, totalProducts, totalOrders, recentLogs, systemStats] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { type: 'student' } }),
            prisma.user.count({ where: { type: 'teacher' } }),
            prisma.course.count(),
            prisma.product.count(),
            prisma.order.count(),
            prisma.auditLog.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { username: true } } }
            }),
            prisma.wallet.aggregate({
                _sum: { balance: true },
                _count: { _all: true }
            })
        ]);

        // Normalize user profile for frontend
        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
        };
        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalUsers,
                totalStudents,
                totalTeachers,
                totalCourses,
                totalProducts,
                totalOrders,
                totalWallets: systemStats._count._all,
                totalWalletBalance: Number(systemStats._sum.balance) || 0
            },
            recentLogs
        });
    } catch (error) {
        console.error('Admin Dashboard error details:', error);
        throw error;
    }
}
