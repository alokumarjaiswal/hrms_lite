// Employee Model
export interface Employee {
  id: string; // UUID
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
  updated_at: string;
  total_present_days?: number; // Annotated field from backend
}

export interface EmployeeCreate {
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
}

export interface EmployeeUpdate {
  employee_id?: string;
  full_name?: string;
  email?: string;
  department?: string;
}

// Attendance Model
export interface Attendance {
  id: number;
  employee: string; // UUID reference
  employee_name: string; // From serializer
  employee_id: string; // From serializer
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT';
  created_at: string;
  updated_at: string;
}

export interface AttendanceCreate {
  employee: string; // UUID
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT';
}

export interface AttendanceUpdate {
  status: 'PRESENT' | 'ABSENT';
}

// Dashboard Stats
export interface DashboardStats {
  total_employees: number;
  today_stats: {
    date: string;
    present: number;
    absent: number;
    unmarked: number;
  };
}

// API Error Response
export interface ApiError {
  detail?: string;
  [key: string]: any;
}
