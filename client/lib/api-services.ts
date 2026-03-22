import { api, ApiResponse } from './api';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  type: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  sex?: string;
  wallet?: {
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

export const userApi = {
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
  getAttendance: async (params?: { startDate?: string; endDate?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<AttendanceRecord[]>(`/attendance${query}`);
  },

  getStudentHistory: async (studentId: string, params?: { startDate?: string; endDate?: string; status?: string }): Promise<ApiResponse<AttendanceRecord[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<AttendanceRecord[]>(`/attendance/student/${studentId}${query}`);
  },

  markAttendance: async (data: {
    studentId: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    notes?: string;
  }): Promise<ApiResponse<AttendanceRecord>> => {
    return api.post<AttendanceRecord>('/attendance/mark', data);
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
  getMessages: async (chatId?: string, limit = 200): Promise<ApiResponse<any[]>> => {
    const query = new URLSearchParams();
    if (chatId) query.append('chatId', chatId);
    query.append('limit', String(limit));
    return api.get<any[]>(`/chat/messages?${query.toString()}`);
  },

  getMembers: async (): Promise<ApiResponse<any[]>> => {
    return api.get<any[]>(`/chat/members`);
  },

  getMyProfile: async (): Promise<ApiResponse<any>> => {
    return api.get<any>(`/chat/me`);
  },

  sendMessage: async (data: {
    content: string;
    chatId?: string;
    mentions?: string[];
    replyTo?: string;
    attachments?: { url: string; type: string; name?: string }[];
  }): Promise<ApiResponse<any>> => {
    return api.post<any>('/chat/messages', data);
  },
};
