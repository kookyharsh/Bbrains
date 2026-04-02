import axios, { AxiosInstance } from "axios"

export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const API_BASE_URL = getBaseUrl();

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

export async function getAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      return cookieStore.get("token")?.value || null;
    } catch {
      return null;
    }
  }

  const stored = localStorage.getItem("auth_token");
  if (stored && stored !== "null" && stored !== "undefined") {
    return stored;
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'An error occurred',
        error: data.error || data.message,
      };
    }

    return {
      ...data,
      success: true,
      data: (data.data !== undefined ? data.data : data) as T,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const api = {
  get: <T>(endpoint: string) => makeRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) => makeRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  }),
  put: <T>(endpoint: string, body?: unknown) => makeRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  }),
  patch: <T>(endpoint: string, body?: unknown) => makeRequest<T>(endpoint, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  }),
  delete: <T>(endpoint: string) => makeRequest<T>(endpoint, { method: 'DELETE' }),
  getAuthToken,
};

// --- HTTP Axios Client ---

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

export async function getAuthedClient(): Promise<AxiosInstance> {
  const token = await getAuthToken()

  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

// --- Domain Services ---

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  type: "student" | "teacher" | "admin" | "staff";
  teacherSubjects?: string[];
  roles?: {
    role?: {
      name?: string;
      description?: string;
    };
  }[];
  avatar?: string;
  bio?: string;
  phone?: string;
  sex?: string;
  wallet?: {
    id: string;
    balance: number | string;
  };
  xp?: {
    xp: number;
    level: number;
  };
  userAchievements?: {
    achievement: Achievement;
  }[];
  grades?: Grade[];
  enrollments?: {
    courseId: number;
    course: {
      id: number;
      name: string;
      standard?: string;
    };
  }[];
  classTeacherCourse?: {
    id: number;
    name: string;
    standard?: string;
  } | null;
}

export interface DashboardData {
  user: User;
  stats: {
    totalCourses: number;
    xp: number;
    level: number;
    currentLevelRequiredXp?: number;
    nextLevelRequiredXp?: number;
    walletBalance: number;
    leaderboardRank: number | null;
    totalAchievements: number;
    streak: number;
  };
  wallet: WalletData;
  attendance: AttendanceData;
  leaderboard: LeaderboardEntry[];
  announcements: Announcement[];
  events: Event[];
  streak: StreakData;
  feeSummary?: FeeSummary;
}

export interface FeeSummary {
  currency: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number | null;
  configured: boolean;
}

export interface WalletData {
  id?: string;
  balance: number | string;
  pinSet?: boolean;
  user?: {
    username?: string;
    email?: string;
  };
}

export interface Transaction {
  id: string | number;
  userId: string;
  amount: number | string;
  type: string;
  description: string;
  transactionDate: string;
  createdAt: string;
  status: string;
  note?: string;
}

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  percentage: number;
  records: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  userId?: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
  markedBy?: string;
  marker?: {
    username: string;
    userDetails?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  xp: number;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    type: string;
    userDetails?: {
      avatar?: string | null;
      firstName: string;
      lastName: string;
    };
  };
}


export interface Event {
  id: string | number;
  title: string;
  description?: string;
  date: string;
  startDate: string;
  endDate: string;
  time?: string;
  location?: string;
  type?: string;
}

export interface StreakData {
  id: number;
  userId: string;
  currentStreak: number;
  lastClaimedAt: string | null;
  canClaim: boolean;
  hoursUntilNextClaim: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface Course {
  id: string | number;
  name: string;
  description?: string;
  standard?: string;
  subjects?: string[];
  subjectProgress?: SubjectChapterProgress[];
  feePerStudent?: number | string;
  durationValue?: number;
  durationUnit?: "months" | "years";
  studentCapacity?: number;
  timetable?: ClassTimetableEntry[];
  classTeacherId?: string | null;
  classTeacher?: {
    id: string;
    username: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
    };
  } | null;
  teacherId?: string;
  teacher?: User;
  enrolledStudents?: number;
  isEnrolled?: boolean;
  _count?: {
    enrollments?: number;
    assignments?: number;
  };
}

export interface SubjectChapterProgress {
  subject: string;
  totalChapters: number;
  completedChapters: number;
}

export interface ClassTimetableEntry {
  day: string;
  subject: string;
  startTime: string;
  endTime: string;
  room?: string | null;
}

export interface Grade {
  id: string;
  assignmentName: string;
  courseName: string;
  grade: number;
  maxGrade: number;
  feedback?: string;
  submittedAt: string;
}

export interface AssessmentStudent {
  id: string;
  username: string;
  email?: string;
  userDetails?: {
    firstName?: string;
    lastName?: string;
    avatar?: string | null;
  };
}

export interface AssessmentCourseOption {
  id: number;
  name: string;
  standard?: string | null;
  subjects: string[];
  availableSubjects: string[];
  studentCount: number;
}

export interface AssessmentResult {
  id?: number;
  studentId: string;
  marksObtained: number | string;
  remark?: string | null;
  createdAt?: string;
  updatedAt?: string;
  student?: AssessmentStudent;
}

export interface Assessment {
  id: number;
  courseId: number;
  createdById: string;
  subject: string;
  topic: string;
  assessmentType: "test" | "exam";
  assessmentDate: string;
  totalMarks: number | string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: number;
    name: string;
    standard?: string | null;
  };
  createdBy?: {
    id: string;
    username: string;
    userDetails?: {
      firstName?: string;
      lastName?: string;
    };
  };
  results: AssessmentResult[];
}

export interface AssessmentSetupData {
  teacherSubjects: string[];
  courses: AssessmentCourseOption[];
  eligibleStudents: AssessmentStudent[];
}

export interface AssessmentSubmission {
  courseId: number;
  subject: string;
  topic: string;
  assessmentType: "test" | "exam";
  assessmentDate: string;
  totalMarks: number;
  results: {
    studentId: string;
    marksObtained: number;
    remark?: string;
  }[];
}

export interface StudentAssessmentResult {
  id: number;
  assessmentId: number;
  studentId: string;
  marksObtained: number | string;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
  assessment: {
    id: number;
    subject: string;
    topic: string;
    assessmentType: "test" | "exam";
    assessmentDate: string;
    totalMarks: number | string;
    course?: {
      id: number;
      name: string;
      standard?: string | null;
    };
    createdBy?: {
      username: string;
      userDetails?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
}

export interface ChatAttachment {
  url: string;
  type: string;
  name?: string;
}

export interface ChatMessageRecord {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  role: string;
  content: string;
  mentions: string[];
  replyToMessageId?: string | null;
  attachments: ChatAttachment[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface ChatMemberProfile {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  pronouns: string;
  grade: string;
  roles: string[];
  type: string;
}

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  courseId: number;
  file?: string;
  course?: {
    name: string;
  };
  status?: string;
}

export const dashboardApi = {
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    return api.get<DashboardData>('/dashboard');
  },
  getUser: async (): Promise<ApiResponse<User>> => {
    return api.get<User>('/user/me');
  },
  searchUsers: async (query: string): Promise<ApiResponse<User[]>> => {
    return api.get<User[]>(`/user/search?q=${encodeURIComponent(query)}`);
  },
  claimDaily: async (): Promise<ApiResponse<{ xp: number; coins: number; streak: StreakData }>> => {
    return api.post<{ xp: number; coins: number; streak: StreakData }>('/user/claim-daily');
  },
};

export const userApi = {
  getStudents: async (): Promise<ApiResponse<User[]>> => {
    return api.get<User[]>('/user/students');
  },
  updateProfile: async (id: string, data: { username?: string }): Promise<ApiResponse<User>> => {
    return api.put<User>(`/user/update/${id}`, data);
  },
  updateDetails: async (data: { 
    firstName?: string; 
    lastName?: string; 
    avatar?: string; 
    sex?: string; 
    dob?: string; 
    phone?: string; 
    bio?: string;
  }): Promise<ApiResponse<any>> => {
    return api.put<any>('/user/me/details', data);
  },
};

export interface AssignmentSubmission {
  assignmentId: number;
  content: string;
  fileUrl?: string;
}

export const assignmentApi = {
  getAssignments: async (courseId?: number): Promise<ApiResponse<Assignment[]>> => {
    const url = courseId ? `/academic/assignments?courseId=${courseId}` : '/academic/assignments';
    return api.get<Assignment[]>(url);
  },
  submitAssignment: async (data: AssignmentSubmission): Promise<ApiResponse<any>> => {
    return api.post('/academic/submissions', data);
  },
};

export const walletApi = {
  getWallet: async (): Promise<ApiResponse<WalletData>> => {
    return api.get<WalletData>('/wallet/me');
  },
  getBalance: async (): Promise<ApiResponse<{ balance: number }>> => {
    return api.get<{ balance: number }>('/wallet/balance');
  },
  setupPin: async (pin: string): Promise<ApiResponse<void>> => {
    return api.post<void>('/wallet/setup', { pin });
  },
  changePin: async (oldPin: string, newPin: string): Promise<ApiResponse<void>> => {
    return api.put<void>('/wallet/pin', { oldPin, newPin });
  },
  verifyPin: async (pin: string): Promise<ApiResponse<{ valid: boolean }>> => {
    return api.post<{ valid: boolean }>('/wallet/verify-pin', { pin });
  },
  transfer: async (toUserId: string, amount: number, pin: string): Promise<ApiResponse<void>> => {
    return api.post<void>('/wallet/transfer', { recipientWalletId: toUserId, amount, pin });
  },
  getHistory: async (): Promise<ApiResponse<Transaction[]>> => {
    return api.get<Transaction[]>('/wallet/history');
  },
};

export const attendanceApi = {
  getAttendance: async (params?: { startDate?: string; endDate?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<AttendanceRecord[]>(`/attendance${query}`);
  },
  getStudentHistory: async (studentId: string, params?: { startDate?: string; endDate?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<AttendanceRecord[]>(`/attendance/student/${studentId}${query}`);
  },
  getAttendanceByDate: async (date: string): Promise<ApiResponse<AttendanceRecord[]>> => {
    return api.get<AttendanceRecord[]>(`/attendance/by-date?date=${encodeURIComponent(date)}`);
  },
  markAttendance: async (data: {
    studentId: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post<AttendanceRecord>('/attendance/mark', data);
  },
  markAttendanceBulk: async (data: {
    studentIds: string[];
    date: string;
    status: 'present' | 'absent' | 'late';
  }): Promise<ApiResponse<AttendanceRecord[]>> => {
    return api.post<AttendanceRecord[]>('/attendance/mark-bulk', data);
  },
};

export const leaderboardApi = {
  getLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    return api.get<LeaderboardEntry[]>('/leaderboard');
  },
  getMyPosition: async (): Promise<ApiResponse<LeaderboardEntry>> => {
    return api.get<LeaderboardEntry>('/leaderboard/me');
  },
};

export const announcementApi = {
  getAnnouncements: async (): Promise<ApiResponse<Announcement[]>> => {
    return api.get<Announcement[]>('/announcements');
  },
  createAnnouncement: async (data: {
    title: string;
    description: string;
    category?: string;
  }): Promise<ApiResponse<Announcement>> => {
    return api.post<Announcement>('/announcements', data);
  },
  deleteAnnouncement: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/announcements/${id}`);
  },
};

export const eventApi = {
  getEvents: async (): Promise<ApiResponse<Event[]>> => {
    return api.get<Event[]>('/events');
  },
  getUpcomingEvents: async (): Promise<ApiResponse<Event[]>> => {
    return api.get<Event[]>('/events/upcoming');
  },
  createEvent: async (data: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    location?: string;
  }): Promise<ApiResponse<Event>> => {
    return api.post<Event>('/events', data);
  },
};

export const achievementApi = {
  getMyAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    return api.get<Achievement[]>('/achievements/me');
  },
  getAchievements: async (): Promise<ApiResponse<Achievement[]>> => {
    return api.get<Achievement[]>('/achievements');
  },
};

export const courseApi = {
  getCourses: async (): Promise<ApiResponse<Course[]>> => {
    return api.get<Course[]>('/courses');
  },
  getCourse: async (id: string | number): Promise<ApiResponse<Course>> => {
    return api.get<Course>(`/courses/${id}`);
  },
  createCourse: async (data: {
    name: string;
    description?: string;
    standard: string;
    subjects: string[];
    subjectProgress?: SubjectChapterProgress[];
    feePerStudent: number;
    durationValue: number;
    durationUnit: "months" | "years";
    studentCapacity: number;
    timetable: ClassTimetableEntry[];
  }): Promise<ApiResponse<Course>> => {
    return api.post<Course>('/courses', data);
  },
  updateCourse: async (id: string | number, data: {
    name?: string;
    description?: string;
    standard?: string;
    subjects?: string[];
    subjectProgress?: SubjectChapterProgress[];
    feePerStudent?: number;
    durationValue?: number;
    durationUnit?: "months" | "years";
    studentCapacity?: number;
    timetable?: ClassTimetableEntry[];
  }): Promise<ApiResponse<Course>> => {
    return api.put<Course>(`/courses/${id}`, data);
  },
  deleteCourse: async (id: string | number): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/courses/${id}`);
  },
  getCourseStudents: async (id: string | number): Promise<ApiResponse<User[]>> => {
    return api.get<User[]>(`/courses/${id}/students`);
  },
};

export const gradeApi = {
  getMyGrades: async (): Promise<ApiResponse<Grade[]>> => {
    return api.get<Grade[]>('/grades/me');
  },
  getStudentGrades: async (userId: string): Promise<ApiResponse<Grade[]>> => {
    return api.get<Grade[]>(`/grades/student/${userId}`);
  },
  submitGrade: async (data: {
    userId: string;
    assignmentId: string;
    grade: number;
    feedback?: string;
  }): Promise<ApiResponse<Grade>> => {
    return api.post<Grade>('/grades', data);
  },
  updateGrade: async (id: string, data: {
    grade: number;
    feedback?: string;
  }): Promise<ApiResponse<Grade>> => {
    return api.put<Grade>(`/grades/${id}`, data);
  },
};

export const enrollmentApi = {
  getMyEnrollments: async (): Promise<ApiResponse<Course[]>> => {
    return api.get<Course[]>('/enrollments/me');
  },
  enroll: async (courseId: string | number): Promise<ApiResponse<void>> => {
    return api.post<void>('/enrollments', { courseId });
  },
  unenroll: async (courseId: string | number): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/enrollments/me/${courseId}`);
  },
  getCourseEnrollments: async (courseId: string | number): Promise<ApiResponse<User[]>> => {
    return api.get<User[]>(`/enrollments/course/${courseId}`);
  },
};

export const assessmentApi = {
  getSetup: async (params?: { courseId?: number; date?: string }): Promise<ApiResponse<AssessmentSetupData>> => {
    const query = new URLSearchParams();
    if (params?.courseId) query.set('courseId', String(params.courseId));
    if (params?.date) query.set('date', params.date);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return api.get<AssessmentSetupData>(`/assessments/setup${suffix}`);
  },
  getTeacherAssessments: async (): Promise<ApiResponse<Assessment[]>> => {
    return api.get<Assessment[]>('/assessments');
  },
  getAssessment: async (id: number | string): Promise<ApiResponse<Assessment>> => {
    return api.get<Assessment>(`/assessments/${id}`);
  },
  createAssessment: async (data: AssessmentSubmission): Promise<ApiResponse<Assessment>> => {
    return api.post<Assessment>('/assessments', data);
  },
  updateAssessment: async (id: number | string, data: AssessmentSubmission): Promise<ApiResponse<Assessment>> => {
    return api.put<Assessment>(`/assessments/${id}`, data);
  },
  getMyResults: async (): Promise<ApiResponse<StudentAssessmentResult[]>> => {
    return api.get<StudentAssessmentResult[]>('/assessments/results/me');
  },
};

export const transactionApi = {
  getMyTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    return api.get<Transaction[]>('/transactions/me');
  },
  getTransaction: async (id: string): Promise<ApiResponse<Transaction>> => {
    return api.get<Transaction>(`/transactions/${id}`);
  },
};

export const streakApi = {
  getStreak: async (): Promise<ApiResponse<StreakData>> => {
    return api.get<StreakData>('/streak');
  },
  claimStreak: async (): Promise<ApiResponse<StreakData>> => {
    return api.post<StreakData>('/streak/claim');
  },
};

export interface Notification {
  id: number;
  userId: string;
  title: string;
  message?: string;
  type: string;
  relatedId?: string;
  readAt?: string;
  createdAt: string;
}

export const notificationApi = {
  getNotifications: async (unreadOnly = false): Promise<ApiResponse<{ notifications: Notification[]; unreadCount: number }>> => {
    return api.get(`/notifications?unreadOnly=${unreadOnly}`);
  },
  markRead: async (id: number): Promise<ApiResponse<void>> => {
    return api.post(`/notifications/mark-read/${id}`, {});
  },
  markAllRead: async (): Promise<ApiResponse<void>> => {
    return api.post('/notifications/mark-all-read', {});
  },
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return api.get('/notifications/unread-count');
  },
};

export interface SystemConfig {
    id: number;
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    description?: string;
    updatedAt: string;
}

export const configApi = {
    getConfigs: async (): Promise<ApiResponse<SystemConfig[]>> => {
        return api.get('/config');
    },
    updateConfig: async (data: Partial<SystemConfig>): Promise<ApiResponse<SystemConfig>> => {
        return api.post('/config', data);
    },
    deleteConfig: async (key: string): Promise<ApiResponse<void>> => {
        return api.delete(`/config/${key}`);
    },
    getPublicConfigs: async (): Promise<ApiResponse<any>> => {
        return api.get('/config/public');
    }
};

export interface Suggestion {
    id: number;
    userId: string;
    title: string;
    content: string;
    status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
    createdAt: string;
    user?: {
        username: string;
        userDetails?: { firstName: string; lastName: string };
    };
}

export const suggestionApi = {
    getSuggestions: async (status?: string): Promise<ApiResponse<Suggestion[]>> => {
        const query = status ? `?status=${status}` : '';
        return api.get(`/suggestions${query}`);
    },
    createSuggestion: async (data: { title: string; content: string }): Promise<ApiResponse<Suggestion>> => {
        return api.post('/suggestions', data);
    },
    updateStatus: async (id: number, status: string): Promise<ApiResponse<Suggestion>> => {
        return api.put(`/suggestions/${id}/status`, { status });
    },
    deleteSuggestion: async (id: number): Promise<ApiResponse<void>> => {
        return api.delete(`/suggestions/${id}`);
    }
};

export interface LevelThreshold {
  levelNumber: number;
  requiredXp: number;
}

export const xpApi = {
  getLevels: async (): Promise<ApiResponse<LevelThreshold[]>> => {
    return api.get<LevelThreshold[]>('/xp/levels');
  },
  createLevel: async (levelNumber: number, requiredXp: number): Promise<ApiResponse<LevelThreshold>> => {
    return api.post<LevelThreshold>('/xp/levels', { levelNumber, requiredXp });
  },
  updateLevel: async (levelNumber: number, requiredXp: number): Promise<ApiResponse<LevelThreshold>> => {
    return api.put<LevelThreshold>(`/xp/levels/${levelNumber}`, { requiredXp });
  },
  deleteLevel: async (levelNumber: number): Promise<ApiResponse<LevelThreshold>> => {
    return api.delete<LevelThreshold>(`/xp/levels/${levelNumber}`);
  },
};

export interface ProductMetadata {
  category?: string;
  fileUrl?: string;
  fileType?: string;
  previewImages?: string[];
  themeConfig?: Record<string, unknown>;
  version?: string;
  downloads?: number;
}

export interface Product {
  id: number;
  creatorId: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  stock: number;
  approval: 'pending' | 'approved' | 'rejected';
  metadata?: ProductMetadata;
  createdAt: string;
}

export interface LibraryItem {
  id: number;
  productId: number;
  name: string;
  description?: string;
  image?: string;
  category: string;
  fileUrl?: string;
  fileType?: string;
  themeConfig?: Record<string, unknown>;
  version?: string;
  purchasedAt: string;
  creator: string;
}

export const libraryApi = {
  getLibrary: async (
    category?: string,
    page = 1,
    limit = 20
  ): Promise<ApiResponse<LibraryItem[]>> => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (category) params.set('category', category);
    return api.get<LibraryItem[]>(`/market/library?${params.toString()}`);
  },
  getDownloadUrl: async (productId: number): Promise<ApiResponse<{ url: string }>> => {
    return api.get<{ url: string }>(`/market/library/${productId}/download`);
  },
  getActiveTheme: async (): Promise<ApiResponse<{ id: number; name: string } | null>> => {
    return api.get<{ id: number; name: string } | null>('/market/library/active-theme');
  },
};

export const marketApi = {
  getProducts: async (page = 1, limit = 20): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>(`/market/products?page=${page}&limit=${limit}`);
  },
  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    return api.get<Product>(`/market/products/${id}`);
  },
  createProduct: async (data: { name: string; description?: string; price: number; stock: number; imageUrl?: string; metadata?: ProductMetadata }): Promise<ApiResponse<Product>> => {
    return api.post<Product>('/market/products', data);
  },
  buyNow: async (productId: number, quantity: number, pin: string): Promise<ApiResponse<unknown>> => {
    return api.post<unknown>('/market/buy-now', { productId, quantity, pin });
  },
  getCart: async (): Promise<ApiResponse<unknown[]>> => {
    return api.get<unknown[]>('/market/cart');
  },
  addToCart: async (productId: number, quantity: number): Promise<ApiResponse<void>> => {
    return api.post<void>('/market/cart', { productId, quantity });
  },
  checkout: async (pin: string): Promise<ApiResponse<unknown>> => {
    return api.post<unknown>('/market/checkout', { pin });
  },
  getMyProducts: async (): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>('/market/my-products');
  },
  updateProduct: async (id: number, data: { name?: string; description?: string; price?: number; stock?: number; imageUrl?: string; metadata?: ProductMetadata }): Promise<ApiResponse<Product>> => {
    return api.put<Product>(`/market/products/${id}`, data);
  },
  requestEditReview: async (id: number, data: { name?: string; description?: string; price?: number; stock?: number; imageUrl?: string; metadata?: ProductMetadata }): Promise<ApiResponse<Product>> => {
    return api.post<Product>(`/market/products/${id}/request-edit`, data);
  },
};

export const themeApi = {
  getThemes: async (page = 1, limit = 20): Promise<ApiResponse<Product[]>> => {
    return api.get<Product[]>(`/market/themes?page=${page}&limit=${limit}`);
  },
  getTheme: async (id: number): Promise<ApiResponse<Product>> => {
    return api.get(`/market/themes/${id}`);
  },
  buyTheme: async (productId: number, pin: string): Promise<ApiResponse<void>> => {
    return api.post('/market/buy-now', { productId, quantity: 1, pin });
  },
  applyTheme: async (productId: number): Promise<ApiResponse<{ themeId: number }>> => {
    return api.post(`/market/library/${productId}/apply`, {});
  },
  getActiveTheme: async (): Promise<ApiResponse<Product | null>> => {
    return api.get('/market/library/active-theme');
  },
  getDownloadUrl: async (productId: number): Promise<ApiResponse<{ url: string }>> => {
    return api.get(`/market/library/${productId}/download`);
  },
};

export const chatApi = {
  getMessages: async (chatId?: string, limit = 50, before?: string): Promise<ApiResponse<any[]>> => {
    const query = new URLSearchParams();
    if (chatId) query.append('chatId', chatId);
    query.append('limit', String(limit));
    if (before) query.append('before', before);
    return api.get<any[]>(`/chat/messages?${query.toString()}`);
  },
  getMembers: async (): Promise<ApiResponse<ChatMemberProfile[]>> => {
    return api.get<ChatMemberProfile[]>(`/chat/members`);
  },
  getMyProfile: async (): Promise<ApiResponse<ChatMemberProfile>> => {
    return api.get<ChatMemberProfile>(`/chat/me`);
  },
  sendMessage: async (
    content: string,
    attachments: ChatAttachment[] = [],
    mentions: string[] = [],
    replyTo?: string
  ): Promise<ApiResponse<ChatMessageRecord>> => {
    return api.post<ChatMessageRecord>('/chat/messages', {
      content,
      attachments,
      mentions,
      replyTo
    });
  },
  deleteMessage: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/chat/messages/${id}`);
  },
  editMessage: async (id: string, content: string, mentions: string[] = []): Promise<ApiResponse<ChatMessageRecord>> => {
    return api.put<ChatMessageRecord>(`/chat/messages/${id}`, { content, mentions });
  }
};
