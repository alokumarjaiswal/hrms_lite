import { apiClient } from './client';
import type { DashboardStats } from '../types';

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStats>('/dashboard/');
  return response.data;
};
