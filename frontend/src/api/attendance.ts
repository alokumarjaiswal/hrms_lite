import { apiClient } from './client';
import type { Attendance, AttendanceCreate, AttendanceUpdate } from '../types';

// Get all attendance records (with optional filters)
export const getAttendance = async (params?: {
  date?: string;
  status?: 'PRESENT' | 'ABSENT';
  employee?: string;
}): Promise<Attendance[]> => {
  const response = await apiClient.get<Attendance[]>('/attendance/', { params });
  return response.data;
};

// Get single attendance record
export const getAttendanceRecord = async (id: number): Promise<Attendance> => {
  const response = await apiClient.get<Attendance>(`/attendance/${id}/`);
  return response.data;
};

// Create attendance record
export const createAttendance = async (
  data: AttendanceCreate
): Promise<Attendance> => {
  const response = await apiClient.post<Attendance>('/attendance/', data);
  return response.data;
};

// Update attendance record
export const updateAttendance = async (
  id: number,
  data: AttendanceUpdate
): Promise<Attendance> => {
  const response = await apiClient.patch<Attendance>(`/attendance/${id}/`, data);
  return response.data;
};

// Delete attendance record
export const deleteAttendance = async (id: number): Promise<void> => {
  await apiClient.delete(`/attendance/${id}/`);
};

// Get attendance for specific employee
export const getEmployeeAttendance = async (
  employeeId: string
): Promise<Attendance[]> => {
  const response = await apiClient.get<Attendance[]>('/attendance/', {
    params: { employee: employeeId },
  });
  return response.data;
};
