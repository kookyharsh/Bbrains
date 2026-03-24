import type { ApiUser } from "@/lib/types/api";

export type UserDetails = ApiUser;

export const mockUsers: ApiUser[] = [
  { 
    id: "u1", username: "alex_j", email: "alex@uni.edu", type: "student",
    userDetails: { 
        firstName: "Alex", lastName: "Johnson", phone: "+1 555-0101" 
    }
  },
  { 
    id: "u2", username: "sarah_j", email: "sarah@uni.edu", type: "student",
    userDetails: { 
        firstName: "Sarah", lastName: "Jenkins", phone: "+1 555-0103" 
    }
  },
  { 
    id: "u3", username: "dr_smith", email: "smith@uni.edu", type: "teacher",
    userDetails: { 
        firstName: "Robert", lastName: "Smith", phone: "+1 555-0105",
        bio: "Professor of Computer Science with 15 years of experience."
    }
  },
  { 
    id: "u4", username: "prof_johnson", email: "johnson@uni.edu", type: "teacher",
    userDetails: { 
        firstName: "Emily", lastName: "Johnson", phone: "+1 555-0106",
        bio: "Department Head for Mathematics."
    }
  },
  { 
    id: "u5", username: "mike_c", email: "mike@uni.edu", type: "student"
  },
  { 
    id: "u6", username: "emily_d", email: "emily@uni.edu", type: "student",
    userDetails: { 
        firstName: "Emily", lastName: "Davis", phone: "+1 555-0107" 
    }
  },
  { 
    id: "u7", username: "admin_adams", email: "adams@uni.edu", type: "admin",
    userDetails: { 
        firstName: "Principal", lastName: "Adams", phone: "+1 555-0108"
    }
  },
  { 
    id: "u8", username: "jane_w", email: "jane@uni.edu", type: "student",
    userDetails: { 
        firstName: "Jane", lastName: "Wilson", phone: "+1 555-0109"
    }
  },
];
