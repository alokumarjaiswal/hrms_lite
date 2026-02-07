import { apiClient } from './client';
import type { Employee, EmployeeCreate, EmployeeUpdate } from '../types';

// Get all employees
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await apiClient.get<Employee[]>('/employees/');
  return response.data;
};

// Get single employee by ID
export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await apiClient.get<Employee>(`/employees/${id}/`);
  return response.data;
};

// Create new employee
export const createEmployee = async (data: EmployeeCreate): Promise<Employee> => {
  const response = await apiClient.post<Employee>('/employees/', data);
  return response.data;
};

// Update employee
export const updateEmployee = async (
  id: string,
  data: EmployeeUpdate
): Promise<Employee> => {
  const response = await apiClient.patch<Employee>(`/employees/${id}/`, data);
  return response.data;
};

// Delete employee
export const deleteEmployee = async (id: string): Promise<void> => {
  await apiClient.delete(`/employees/${id}/`);
};
