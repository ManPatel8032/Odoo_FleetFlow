// User and Authentication Types
export type UserRole = "ADMIN" | "MANAGER" | "DRIVER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  createdAt: Date;
}

export interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole, name: string) => void;
  logout: () => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

// Vehicle Types
export type VehicleStatus = "active" | "inactive" | "maintenance" | "retired";

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  status: VehicleStatus;
  lastLocation: {
    lat: number;
    lng: number;
    address: string;
    timestamp: Date;
  };
  fuelLevel: number; // percentage
  mileage: number;
  assignedDriverId?: string;
  purchaseDate: Date;
  nextServiceDate: Date;
  vin: string;
  color: string;
}

// Driver Types
export type DriverStatus = "active" | "inactive" | "on_leave" | "suspended";

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: Date;
  status: DriverStatus;
  assignedVehicleId?: string;
  joinDate: Date;
  totalTrips: number;
  totalDistance: number;
  totalFuelUsed: number;
  rating: number;
  activeTrips: number;
}

// Trip Types
export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  status: TripStatus;
  startTime: Date;
  endTime?: Date;
  scheduledTime: Date;
  distance: number; // in km
  fuelUsed?: number;
  costPerKm: number;
  totalCost?: number;
  cargo?: string;
  notes?: string;
}

// Maintenance Types
export type MaintenanceType = "routine" | "repair" | "inspection" | "emergency";
export type MaintenanceStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface MaintenanceTask {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  estimatedCost?: number;
  notes?: string;
  assignedTo?: string;
  priority: "low" | "medium" | "high" | "urgent";
}

// Fuel Record Types
export interface FuelRecord {
  id: string;
  vehicleId: string;
  driverId: string;
  date: Date;
  amount: number; // liters
  cost: number;
  location: string;
  odometer: number;
  notes?: string;
}

// Alert Types
export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = 
  | "fuel_low" 
  | "maintenance_due" 
  | "vehicle_offline" 
  | "speeding" 
  | "irregular_route" 
  | "accident" 
  | "license_expiry";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  vehicleId?: string;
  driverId?: string;
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// Analytics Types
export interface DailyMetrics {
  date: Date;
  tripsCompleted: number;
  totalDistance: number;
  totalFuelUsed: number;
  totalCost: number;
  vehiclesOnline: number;
  activeTrips: number;
}

export interface VehicleMetrics {
  vehicleId: string;
  totalTrips: number;
  totalDistance: number;
  totalFuelUsed: number;
  averageFuelConsumption: number;
  lastServiceDate: Date;
  nextServiceDate: Date;
  maintenanceCount: number;
}

// Permissions Matrix Type
export interface RolePermissions {
  canViewDashboard: boolean;
  canViewVehicles: boolean;
  canEditVehicles: boolean;
  canViewDrivers: boolean;
  canEditDrivers: boolean;
  canViewTrips: boolean;
  canCreateTrips: boolean;
  canEditTrips: boolean;
  canViewMaintenance: boolean;
  canCreateMaintenance: boolean;
  canViewAnalytics: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewUsers: boolean;
  canManageUsers: boolean;
}
