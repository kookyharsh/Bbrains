export interface UserDetails {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "student" | "teacher" | "admin";
  status: "active" | "inactive";
  joinDate: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
  };
  bio?: string;
}

export const mockUsers: UserDetails[] = [
  { 
    id: "u1", username: "alex_j", email: "alex@uni.edu", firstName: "Alex", lastName: "Johnson", 
    role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0101",
    address: { street: "123 College Ave", city: "Boston", state: "MA", zipCode: "02115", country: "USA" },
    emergencyContact: { name: "John Johnson", phone: "+1 555-0102", relationship: "Father" }
  },
  { 
    id: "u2", username: "sarah_j", email: "sarah@uni.edu", firstName: "Sarah", lastName: "Jenkins", 
    role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0103",
    address: { street: "456 Oak Street", city: "Cambridge", state: "MA", zipCode: "02139", country: "USA" },
    emergencyContact: { name: "Mary Jenkins", phone: "+1 555-0104", relationship: "Mother" }
  },
  { 
    id: "u3", username: "dr_smith", email: "smith@uni.edu", firstName: "Robert", lastName: "Smith", 
    role: "teacher", status: "active", joinDate: "2024-01-15", phone: "+1 555-0105",
    address: { street: "789 Faculty Lane", city: "Boston", state: "MA", zipCode: "02115", country: "USA" },
    bio: "Professor of Computer Science with 15 years of experience."
  },
  { 
    id: "u4", username: "prof_johnson", email: "johnson@uni.edu", firstName: "Emily", lastName: "Johnson", 
    role: "teacher", status: "active", joinDate: "2023-08-20", phone: "+1 555-0106",
    address: { street: "321 Academic Blvd", city: "Cambridge", state: "MA", zipCode: "02138", country: "USA" },
    bio: "Department Head for Mathematics."
  },
  { 
    id: "u5", username: "mike_c", email: "mike@uni.edu", firstName: "Michael", lastName: "Chang", 
    role: "student", status: "inactive", joinDate: "2025-09-01" 
  },
  { 
    id: "u6", username: "emily_d", email: "emily@uni.edu", firstName: "Emily", lastName: "Davis", 
    role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0107",
    address: { street: "555 Student Way", city: "Boston", state: "MA", zipCode: "02115", country: "USA" }
  },
  { 
    id: "u7", username: "admin_adams", email: "adams@uni.edu", firstName: "Principal", lastName: "Adams", 
    role: "admin", status: "active", joinDate: "2020-01-01", phone: "+1 555-0108",
    address: { street: "100 Admin Building", city: "Boston", state: "MA", zipCode: "02115", country: "USA" }
  },
  { 
    id: "u8", username: "jane_w", email: "jane@uni.edu", firstName: "Jane", lastName: "Wilson", 
    role: "student", status: "active", joinDate: "2025-09-01", phone: "+1 555-0109",
    address: { street: "777 University Ave", city: "Boston", state: "MA", zipCode: "02115", country: "USA" },
    emergencyContact: { name: "Robert Wilson", phone: "+1 555-0110", relationship: "Father" }
  },
];
