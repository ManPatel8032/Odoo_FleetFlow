import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired - clear auth
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  register(email: string, password: string, name: string) {
    return this.client.post('/auth/register', { email, password, name });
  }

  getCurrentUser() {
    return this.client.get('/auth/me');
  }

  logout() {
    return this.client.post('/auth/logout');
  }

  // Vehicle endpoints
  getVehicles() {
    return this.client.get('/vehicles');
  }

  getVehicleById(id: string) {
    return this.client.get(`/vehicles/${id}`);
  }

  createVehicle(data: any) {
    return this.client.post('/vehicles', data);
  }

  updateVehicle(id: string, data: any) {
    return this.client.patch(`/vehicles/${id}`, data);
  }

  deleteVehicle(id: string) {
    return this.client.delete(`/vehicles/${id}`);
  }

  updateVehicleStatus(id: string, status: string) {
    return this.client.patch(`/vehicles/${id}/status`, { status });
  }

  // Trip endpoints
  getTrips(filters?: { status?: string; driverId?: string }) {
    return this.client.get('/trips', { params: filters });
  }

  getTripById(id: string) {
    return this.client.get(`/trips/${id}`);
  }

  createTrip(data: any) {
    return this.client.post('/trips', data);
  }

  updateTrip(id: string, data: any) {
    return this.client.patch(`/trips/${id}`, data);
  }

  updateTripStatus(id: string, status: string, additionalData?: any) {
    return this.client.patch(`/trips/${id}/status`, { status, ...additionalData });
  }

  // Driver endpoints
  getDrivers(filters?: { status?: string }) {
    return this.client.get('/drivers', { params: filters });
  }

  getDriverById(id: string) {
    return this.client.get(`/drivers/${id}`);
  }

  createDriver(data: any) {
    return this.client.post('/drivers', data);
  }

  updateDriver(id: string, data: any) {
    return this.client.patch(`/drivers/${id}`, data);
  }

  updateDriverStatus(id: string, status: string) {
    return this.client.patch(`/drivers/${id}/status`, { status });
  }

  deleteDriver(id: string) {
    return this.client.delete(`/drivers/${id}`);
  }

  checkLicenseExpiry() {
    return this.client.get('/drivers/license-expiry');
  }

  // Maintenance endpoints
  getMaintenanceLogs(filters?: { status?: string; vehicleId?: string }) {
    return this.client.get('/maintenance', { params: filters });
  }

  getMaintenanceById(id: string) {
    return this.client.get(`/maintenance/${id}`);
  }

  createMaintenance(data: any) {
    return this.client.post('/maintenance', data);
  }

  updateMaintenance(id: string, data: any) {
    return this.client.patch(`/maintenance/${id}`, data);
  }

  updateMaintenanceStatus(id: string, data: any) {
    return this.client.patch(`/maintenance/${id}/status`, typeof data === 'string' ? { status: data } : data);
  }

  deleteMaintenance(id: string) {
    return this.client.delete(`/maintenance/${id}`);
  }

  // Analytics endpoints
  getAnalytics() {
    return this.client.get('/analytics');
  }

  exportReport(type: 'vehicles' | 'drivers' | 'trips') {
    return this.client.get(`/analytics/export?type=${type}`, { responseType: 'blob' });
  }

  // Profile endpoints
  updateProfile(data: { name?: string; phone?: string; address?: string }) {
    return this.client.patch('/auth/profile', data);
  }

  changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.client.post('/auth/change-password', data);
  }

  // Dashboard endpoints
  getDashboardStats() {
    return this.client.get('/dashboard/stats');
  }

  getFleetStats() {
    return this.client.get('/dashboard/fleet-stats');
  }
}

export const apiClient = new ApiClient();
