import { api, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  type: string;
  avatar?: string;
  xp?: number;
  level?: number;
}

export interface DashboardData {
  user: User;
  wallet: WalletData;
  attendance: AttendanceData;
  leaderboard: LeaderboardEntry[];
  announcements: Announcement[];
  events: Event[];
  streak: StreakData;
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
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
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
  date: string;
  status: 'present' | 'absent' | 'late';
  courseName?: string;
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
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type?: string;
}

export interface StreakData {
  current: number;
  longest: number;
  lastActiveDate?: string;
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
  id: string;
  name: string;
  code: string;
  description?: string;
  teacherId?: string;
  teacher?: User;
  enrolledStudents?: number;
  isEnrolled?: boolean;
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

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  courseId: number;
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

  claimDaily: async (): Promise<ApiResponse<{ xp: number; streak: number }>> => {
    return api.post<{ xp: number; streak: number }>('/user/claim-daily');
  },
};

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  courseId: number;
  course?: {
    name: string;
  };
  status?: string;
}

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
  getAttendance: async (): Promise<ApiResponse<AttendanceData>> => {
    return api.get<AttendanceData>('/attendance');
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

  getCourse: async (id: string): Promise<ApiResponse<Course>> => {
    return api.get<Course>(`/courses/${id}`);
  },

  createCourse: async (data: {
    name: string;
    code: string;
    description?: string;
  }): Promise<ApiResponse<Course>> => {
    return api.post<Course>('/courses', data);
  },

  updateCourse: async (id: string, data: {
    name?: string;
    code?: string;
    description?: string;
  }): Promise<ApiResponse<Course>> => {
    return api.put<Course>(`/courses/${id}`, data);
  },

  deleteCourse: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/courses/${id}`);
  },

  getCourseStudents: async (id: string): Promise<ApiResponse<User[]>> => {
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

  enroll: async (courseId: string): Promise<ApiResponse<void>> => {
    return api.post<void>('/enrollments', { courseId });
  },

  unenroll: async (courseId: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/enrollments/me/${courseId}`);
  },

  getCourseEnrollments: async (courseId: string): Promise<ApiResponse<User[]>> => {
    return api.get<User[]>(`/enrollments/course/${courseId}`);
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

export const marketApi = {
  getProducts: async (page = 1, limit = 20): Promise<ApiResponse<{ data: Product[]; pagination: { page: number; limit: number; total: number } }>> => {
    return api.get(`/market/products?page=${page}&limit=${limit}`);
  },
  
  getProduct: async (id: number): Promise<ApiResponse<Product>> => {
    return api.get(`/market/products/${id}`);
  },
  
  createProduct: async (data: { name: string; description?: string; price: number; stock: number; imageUrl?: string; metadata?: ProductMetadata }): Promise<ApiResponse<Product>> => {
    return api.post('/market/products', data);
  },
  
  buyNow: async (productId: number, quantity: number, pin: string): Promise<ApiResponse<unknown>> => {
    return api.post('/market/buy-now', { productId, quantity, pin });
  },
  
  getCart: async (): Promise<ApiResponse<unknown[]>> => {
    return api.get('/market/cart');
  },
  
  addToCart: async (productId: number, quantity: number): Promise<ApiResponse<void>> => {
    return api.post('/market/cart', { productId, quantity });
  },
  
  checkout: async (pin: string): Promise<ApiResponse<unknown>> => {
    return api.post('/market/checkout', { pin });
  },
};

export const themeApi = {
  getThemes: async (page = 1, limit = 20): Promise<ApiResponse<{ data: Product[]; pagination: { page: number; limit: number; total: number } }>> => {
    return api.get(`/market/themes?page=${page}&limit=${limit}`);
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

export const libraryApi = {
  getLibrary: async (category?: string, page = 1, limit = 20): Promise<ApiResponse<{ data: LibraryItem[]; pagination: { page: number; limit: number; total: number } }>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.append('category', category);
    return api.get(`/market/library?${params.toString()}`);
  },
  
  getDownloadUrl: async (productId: number): Promise<ApiResponse<{ url: string }>> => {
    return api.get(`/market/library/${productId}/download`);
  },
};
