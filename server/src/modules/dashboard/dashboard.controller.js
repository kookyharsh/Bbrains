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
                return await adminDashboard(id, res);
            default:
                return await studentDashboard(id, res);
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ success: false, message: error.message || 'Failed to fetch dashboard' });
    }
};

const feePerStudentKeys = [
    'ANNUAL_STUDENT_FEE',
    'STUDENT_FEE',
    'FEE_PER_STUDENT',
    'TUITION_FEE',
    'ANNUAL_FEE_PER_STUDENT',
];

const receivedIncomeKeys = [
    'TOTAL_FEES_RECEIVED',
    'FEES_RECEIVED',
    'TOTAL_INCOME_RECEIVED',
    'RECEIVED_INCOME',
];

const salaryPaidKeys = [
    'TOTAL_SALARY_PAID',
    'SALARY_PAID',
    'PAYROLL_PAID',
];

const currencyKeys = ['CURRENCY', 'CURRENCY_CODE'];
const feeNoteKeywords = ['fee', 'fees', 'tuition', 'admission'];
const salaryNoteKeywords = ['salary', 'payroll', 'stipend', 'wage', 'wages'];
const incomeNoteKeywords = ['salary', 'income', 'allowance', 'commission', 'payout', 'payment'];

function parseConfigValue(config) {
    if (!config) return null;

    switch (config.type) {
        case 'number':
            return Number(config.value);
        case 'boolean':
            return config.value === 'true';
        case 'json':
            try {
                return JSON.parse(config.value);
            } catch {
                return config.value;
            }
        default:
            return config.value;
    }
}

function firstDefinedConfig(configMap, keys, fallback = null) {
    for (const key of keys) {
        if (configMap.has(key)) {
            const value = parseConfigValue(configMap.get(key));
            if (value !== null && value !== undefined && value !== '') {
                return value;
            }
        }
    }
    return fallback;
}

function formatAddress(address) {
    if (!address) return null;

    return [
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.postalCode,
        address.country,
    ]
        .filter(Boolean)
        .join(', ');
}

function buildNoteFilters(keywords) {
    return keywords.map((keyword) => ({
        note: {
            contains: keyword,
            mode: 'insensitive',
        },
    }));
}

function buildTransactionSignalFilters(category, legacyKeywords = []) {
    return [
        {
            category,
        },
        ...buildNoteFilters(legacyKeywords),
    ];
}

function toPlainNumber(value, fallback = 0) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'bigint') return Number(value);
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

async function getCustomRoleNames(userId) {
    const roles = await prisma.userRoles.findMany({
        where: { userId },
        select: {
            role: {
                select: {
                    name: true,
                },
            },
        },
    });

    return roles
        .map((entry) => entry.role?.name)
        .filter(Boolean);
}

export const getAdminOverview = async (req, res) => {
    try {
        const adminId = req.user.id;

        const [
            adminUser,
            students,
            teachersCount,
            staffCount,
            roleCounts,
            configs,
            courses,
            feeTaggedCredits,
            latestTransactions,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: adminId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    type: true,
                    createdAt: true,
                    college: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            regNo: true,
                            createdAt: true,
                            address: true,
                        },
                    },
                    userDetails: {
                        select: {
                            avatar: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            bio: true,
                        },
                    },
                    wallet: {
                        select: {
                            balance: true,
                        },
                    },
                    roles: {
                        select: {
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.user.findMany({
                where: { type: 'student' },
                select: {
                    id: true,
                    wallet: {
                        select: {
                            balance: true,
                        },
                    },
                    userDetails: {
                        select: {
                            sex: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where: { type: 'teacher' } }),
            prisma.user.count({ where: { type: 'staff' } }),
            prisma.role.findMany({
                select: {
                    name: true,
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
            }),
            prisma.systemConfig.findMany(),
            prisma.course.findMany({
                select: {
                    feePerStudent: true,
                    _count: {
                        select: {
                            enrollments: true,
                        },
                    },
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
            prisma.transactionHistory.findMany({
                where: {
                    status: 'success',
                    OR: [
                        {
                            category: 'fee',
                            type: 'credit',
                        },
                        {
                            category: 'salary',
                            type: 'debit',
                        },
                    ],
                },
                select: {
                    amount: true,
                    type: true,
                    transactionDate: true,
                    note: true,
                },
                orderBy: { transactionDate: 'desc' },
                take: 5,
            }),
        ]);

        if (!adminUser) {
            return sendError(res, 'Admin user not found', 404);
        }

        const configMap = new Map(configs.map((config) => [config.key, config]));

        const studentsCount = students.length;
        const boysCount = students.filter((student) => student.userDetails?.sex === 'male').length;
        const girlsCount = students.filter((student) => student.userDetails?.sex === 'female').length;
        const otherStudentsCount = Math.max(studentsCount - boysCount - girlsCount, 0);

        const managerCount = roleCounts
            .filter((role) => role.name.toLowerCase().includes('manager'))
            .reduce((sum, role) => sum + role._count.users, 0);

        const otherStaffCount = Math.max(staffCount - managerCount, 0);
        const studentToTeacherRatio = teachersCount > 0
            ? Number((studentsCount / teachersCount).toFixed(1))
            : null;

        const configuredReceivedIncome = Number(firstDefinedConfig(configMap, receivedIncomeKeys, 0) || 0);
        const transactionReceivedIncome = Number(feeTaggedCredits._sum.amount || 0);
        const receivedIncome = configuredReceivedIncome || transactionReceivedIncome;
        const accruedIncome = courses.reduce((sum, course) => {
            const classFee = Number(course.feePerStudent || 0);
            const enrolledStudents = Number(course._count?.enrollments || 0);
            return sum + (classFee * enrolledStudents);
        }, 0);
        const receivableIncome = Math.max(accruedIncome - receivedIncome, 0);
        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');

        const currentRoles = adminUser.roles
            .map((entry) => entry.role?.name)
            .filter(Boolean);

        return sendSuccess(res, {
            people: {
                teachers: teachersCount,
                managers: managerCount,
                staff: otherStaffCount,
                students: studentsCount,
                studentToTeacherRatio,
            },
            students: {
                total: studentsCount,
                boys: boysCount,
                girls: girlsCount,
                others: otherStudentsCount,
            },
            finance: {
                currency,
                feePerStudent: 0,
                receivedIncome,
                accruedIncome,
                receivableIncome,
                receivedSource: configuredReceivedIncome > 0 ? 'config' : 'transactions',
                accruedSource: courses.some((course) => Number(course.feePerStudent || 0) > 0) ? 'classes' : 'unavailable',
                latestTransactions: latestTransactions.map((transaction) => ({
                    amount: Number(transaction.amount || 0),
                    type: transaction.type,
                    transactionDate: transaction.transactionDate,
                    note: transaction.note || '',
                })),
            },
            admin: {
                id: adminUser.id,
                username: adminUser.username,
                email: adminUser.email,
                type: adminUser.type,
                createdAt: adminUser.createdAt,
                avatar: adminUser.userDetails?.avatar || null,
                firstName: adminUser.userDetails?.firstName || '',
                lastName: adminUser.userDetails?.lastName || '',
                phone: adminUser.userDetails?.phone || '',
                bio: adminUser.userDetails?.bio || '',
                walletBalance: Number(adminUser.wallet?.balance || 0),
                roles: currentRoles,
            },
            institution: adminUser.college
                ? {
                    id: adminUser.college.id,
                    name: adminUser.college.name,
                    email: adminUser.college.email,
                    regNo: adminUser.college.regNo,
                    createdAt: adminUser.college.createdAt,
                    address: formatAddress(adminUser.college.address),
                }
                : null,
        });
    } catch (error) {
        console.error('Admin Overview error details:', error);
        return sendError(res, 'Failed to fetch admin overview', 500);
    }
};

export const getManagerOverview = async (req, res) => {
    try {
        const managerId = req.user.id;
        const customRoleNames = await getCustomRoleNames(managerId);
        const hasManagerRole = customRoleNames.some((role) => role.toLowerCase().includes('manager'));

        if (req.user.type !== 'admin' && !hasManagerRole) {
            return sendError(res, 'Not authorized to access manager overview', 403);
        }

        const [
            managerUser,
            students,
            teachersCount,
            staffCount,
            totalCourses,
            configs,
            feeTaggedCredits,
            salaryTaggedDebits,
            anySalaryTransactions,
            ownTaggedCreditTotal,
            ownTaggedCreditCount,
            privilegedAttendanceRecords,
            latestPrivilegedAttendance,
        ] = await Promise.all([
            prisma.user.findUnique({
                where: { id: managerId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    type: true,
                    createdAt: true,
                    college: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            regNo: true,
                            createdAt: true,
                            address: true,
                        },
                    },
                    userDetails: {
                        select: {
                            avatar: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            bio: true,
                        },
                    },
                    wallet: {
                        select: {
                            balance: true,
                        },
                    },
                    roles: {
                        select: {
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            prisma.user.findMany({
                where: { type: 'student' },
                select: {
                    id: true,
                    userDetails: {
                        select: {
                            sex: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where: { type: 'teacher' } }),
            prisma.user.count({ where: { type: 'staff' } }),
            prisma.course.count(),
            prisma.systemConfig.findMany(),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.count({
                where: {
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId: managerId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.transactionHistory.count({
                where: {
                    userId: managerId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('salary', salaryNoteKeywords),
                },
            }),
            prisma.attendance.findMany({
                where: {
                    user: {
                        is: {
                            type: {
                                in: ['teacher', 'staff'],
                            },
                        },
                    },
                },
                select: {
                    status: true,
                    user: {
                        select: {
                            type: true,
                        },
                    },
                },
            }),
            prisma.attendance.findFirst({
                where: {
                    user: {
                        is: {
                            type: {
                                in: ['teacher', 'staff'],
                            },
                        },
                    },
                },
                orderBy: {
                    date: 'desc',
                },
                select: {
                    date: true,
                },
            }),
        ]);

        if (!managerUser) {
            return sendError(res, 'Manager user not found', 404);
        }

        const configMap = new Map(configs.map((config) => [config.key, config]));

        const studentsCount = students.length;
        const boysCount = students.filter((student) => student.userDetails?.sex === 'male').length;
        const girlsCount = students.filter((student) => student.userDetails?.sex === 'female').length;
        const otherStudentsCount = Math.max(studentsCount - boysCount - girlsCount, 0);

        const configuredFeesReceived = Number(firstDefinedConfig(configMap, receivedIncomeKeys, 0) || 0);
        const transactionFeesReceived = Number(feeTaggedCredits._sum.amount || 0);
        const feesReceived = configuredFeesReceived || transactionFeesReceived || 0;
        const feesReceivedSource = configuredFeesReceived > 0
            ? 'config'
            : transactionFeesReceived > 0
                ? 'transactions'
                : 'unavailable';

        const configuredSalaryPaid = firstDefinedConfig(configMap, salaryPaidKeys, null);
        const salaryPaidFromConfig = configuredSalaryPaid !== null && configuredSalaryPaid !== undefined && configuredSalaryPaid !== ''
            ? Number(configuredSalaryPaid)
            : null;
        const salaryPaidFromTransactions = anySalaryTransactions > 0
            ? Number(salaryTaggedDebits._sum.amount || 0)
            : null;
        const salaryPaid = salaryPaidFromConfig ?? salaryPaidFromTransactions;
        const salaryPaidSource = salaryPaidFromConfig !== null
            ? 'config'
            : salaryPaidFromTransactions !== null
                ? 'transactions'
                : 'unavailable';

        const ownTaggedIncomeCount = ownTaggedCreditCount || 0;
        const ownIncomeReceived = ownTaggedIncomeCount > 0
            ? Number(ownTaggedCreditTotal._sum.amount || 0)
            : null;
        const ownIncomeSource = ownTaggedIncomeCount > 0
            ? 'tagged-transactions'
            : 'unavailable';

        const attendanceSummary = privilegedAttendanceRecords.reduce((summary, record) => {
            summary.totalRecords += 1;

            if (record.status === 'present') summary.present += 1;
            if (record.status === 'absent') summary.absent += 1;
            if (record.status === 'late') summary.late += 1;

            if (record.user?.type === 'teacher') summary.teacherRecords += 1;
            if (record.user?.type === 'staff') summary.staffRecords += 1;

            return summary;
        }, {
            totalRecords: 0,
            present: 0,
            absent: 0,
            late: 0,
            teacherRecords: 0,
            staffRecords: 0,
        });

        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');
        const currentRoles = managerUser.roles
            .map((entry) => entry.role?.name)
            .filter(Boolean);

        return sendSuccess(res, {
            people: {
                teachers: teachersCount,
                otherStaff: staffCount,
                totalStaff: teachersCount + staffCount,
                classes: totalCourses,
                students: studentsCount,
                boys: boysCount,
                girls: girlsCount,
                others: otherStudentsCount,
            },
            finance: {
                currency,
                feesReceived,
                feesReceivedSource,
                salaryPaid,
                salaryPaidSource,
            },
            attendance: {
                ...attendanceSummary,
                latestMarkedAt: latestPrivilegedAttendance?.date || null,
                source: attendanceSummary.totalRecords > 0 ? 'records' : 'unavailable',
            },
            manager: {
                id: managerUser.id,
                username: managerUser.username,
                email: managerUser.email,
                type: managerUser.type,
                createdAt: managerUser.createdAt,
                avatar: managerUser.userDetails?.avatar || null,
                firstName: managerUser.userDetails?.firstName || '',
                lastName: managerUser.userDetails?.lastName || '',
                phone: managerUser.userDetails?.phone || '',
                bio: managerUser.userDetails?.bio || '',
                walletBalance: Number(managerUser.wallet?.balance || 0),
                ownIncomeReceived,
                ownIncomeSource,
                roles: currentRoles,
            },
            institution: managerUser.college
                ? {
                    id: managerUser.college.id,
                    name: managerUser.college.name,
                    email: managerUser.college.email,
                    regNo: managerUser.college.regNo,
                    createdAt: managerUser.college.createdAt,
                    address: formatAddress(managerUser.college.address),
                }
                : null,
        });
    } catch (error) {
        console.error('Manager Overview error details:', error);
        return sendError(res, 'Failed to fetch manager overview', 500);
    }
};

async function studentDashboard(userId, res) {
    try {
        const [
            user,
            enrollments,
            xp,
            achievements,
            wallet,
            recentGrades,
            leaderboardPos,
            leaderboardEntries,
            xpLeaderboard,
            announcements,
            recentClaims,
            configs,
            feeDebits,
            feeCredits,
            ] = await Promise.all([
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
                include: { course: { select: { name: true, id: true, feePerStudent: true } } }
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
            prisma.$queryRaw`SELECT "xpRank" as rank, "totalXp" as score FROM "leaderboard_view" WHERE "userId" = ${userId} LIMIT 1`,
            prisma.$queryRaw`SELECT "userId", "username", "firstName", "lastName", "avatar", "totalXp", "totalPoints", "xpRank" as rank FROM "leaderboard_view" ORDER BY "xpRank" ASC LIMIT 5`,
            prisma.xp.findMany({
                orderBy: { xp: 'desc' },
                take: 5,
                include: {
                    user: {
                        select: {
                            username: true,
                            userDetails: { select: { avatar: true, firstName: true, lastName: true } }
                        }
                    }
                }
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
            }),
            prisma.systemConfig.findMany(),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId,
                    type: 'debit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
            prisma.transactionHistory.aggregate({
                _sum: {
                    amount: true,
                },
                where: {
                    userId,
                    type: 'credit',
                    status: 'success',
                    OR: buildTransactionSignalFilters('fee', feeNoteKeywords),
                },
            }),
        ]);

        const userLeaderboardPos = leaderboardPos && leaderboardPos[0] ? leaderboardPos[0] : null;
        const normalizedLeaderboardPos = userLeaderboardPos
            ? {
                rank: toPlainNumber(userLeaderboardPos.rank, null),
                score: toPlainNumber(userLeaderboardPos.score, 0),
            }
            : null;

        // Normalize user profile for frontend: flatten avatar and names
        const userProfile = {
            ...user,
            avatar: user?.userDetails?.avatar,
            firstName: user?.userDetails?.firstName,
            lastName: user?.userDetails?.lastName,
            collegeName: user?.college?.name
        };
        const streak = calculateStreak(recentClaims);
        const configMap = new Map(configs.map((config) => [config.key, config]));
        const currency = String(firstDefinedConfig(configMap, currencyKeys, 'INR') || 'INR');
        const totalFee = (enrollments || []).reduce(
            (sum, enrollment) => sum + Number(enrollment.course?.feePerStudent || 0),
            0
        );
        const debitFeePayments = Number(feeDebits._sum.amount || 0);
        const creditFeePayments = Number(feeCredits._sum.amount || 0);
        const paidAmount = debitFeePayments > 0 ? debitFeePayments : creditFeePayments;
        const hasConfiguredFee = totalFee > 0;
        const remainingAmount = hasConfiguredFee
            ? Math.max(totalFee - paidAmount, 0)
            : null;

        let currentLevel = null;
        let nextLevel = null;
        const userLevel = xp?.level || 1;
        if (xp) {
            currentLevel = await prisma.level.findFirst({
                where: { levelNumber: userLevel }
            });
            nextLevel = await prisma.level.findFirst({
                where: { levelNumber: userLevel + 1 }
            });
        }

        const currentLevelXp = currentLevel 
            ? Number(currentLevel.requiredXp) 
            : (userLevel - 1) * 1000;
        const nextLevelXp = nextLevel 
            ? Number(nextLevel.requiredXp) 
            : (nextLevel === null ? null : userLevel * 1000);

        // Fallback leaderboard if needed
        const finalLeaderboard = leaderboardEntries && leaderboardEntries.length > 0 
            ? leaderboardEntries.map((entry) => ({
                userId: entry.userId,
                totalXp: toPlainNumber(entry.totalXp, 0),
                totalPoints: toPlainNumber(entry.totalPoints, 0),
                rank: toPlainNumber(entry.rank, 0),
                username: entry.username,
                firstName: entry.firstName,
                lastName: entry.lastName,
                avatar: entry.avatar,
            }))
            : (xpLeaderboard || []).map((entry, index) => ({
                userId: entry.userId,
                totalXp: toPlainNumber(entry.xp, 0),
                rank: index + 1,
                username: entry.user?.username,
                firstName: entry.user?.userDetails?.firstName,
                lastName: entry.user?.userDetails?.lastName,
                avatar: entry.user?.userDetails?.avatar
            }));

        return sendSuccess(res, {
            user: userProfile,
            stats: {
                totalCourses: enrollments?.length || 0,
                xp: Number(xp?.xp) || 0,
                level: xp?.level || 1,
                currentLevelRequiredXp: currentLevelXp,
                nextLevelRequiredXp: nextLevelXp,
                walletBalance: Number(wallet?.balance) || 0,
                leaderboardRank: normalizedLeaderboardPos?.rank || null,
                totalAchievements: achievements?.length || 0,
                streak: streak
            },
            enrollments: enrollments || [],
            recentGrades: recentGrades || [],
            recentAchievements: achievements || [],
            leaderboard: finalLeaderboard,
            announcements: announcements || [],
            feeSummary: {
                currency,
                totalFee,
                paidAmount,
                remainingAmount,
                configured: hasConfiguredFee,
            }
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

async function adminDashboard(userId, res) {
    try {
        const [user, totalUsers, totalStudents, totalTeachers, totalCourses, totalProducts, totalOrders, recentLogs, systemStats] = await Promise.all([
            prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, email: true, type: true, userDetails: true }
            }),
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
