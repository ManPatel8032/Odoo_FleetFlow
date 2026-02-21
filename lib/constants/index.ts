import { 
  UserRole, 
  RolePermissions, 
  Vehicle, 
  Driver, 
  Trip, 
  MaintenanceTask, 
  Alert,
  FuelRecord 
} from "@/lib/types";

// Role Definitions
export const ROLES: UserRole[] = ["admin", "manager", "driver"];

// Role Labels
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Fleet Manager",
  driver: "Driver",
};

// Role Descriptions
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access and management",
  manager: "Fleet and operations management",
  driver: "Driver app and trip management",
};

// Permissions Matrix
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canViewVehicles: true,
    canEditVehicles: true,
    canViewDrivers: true,
    canEditDrivers: true,
    canViewTrips: true,
    canCreateTrips: true,
    canEditTrips: true,
    canViewMaintenance: true,
    canCreateMaintenance: true,
    canViewAnalytics: true,
    canViewSettings: true,
    canEditSettings: true,
    canViewUsers: true,
    canManageUsers: true,
  },
  manager: {
    canViewDashboard: true,
    canViewVehicles: true,
    canEditVehicles: false,
    canViewDrivers: true,
    canEditDrivers: false,
    canViewTrips: true,
    canCreateTrips: true,
    canEditTrips: true,
    canViewMaintenance: true,
    canCreateMaintenance: true,
    canViewAnalytics: true,
    canViewSettings: false,
    canEditSettings: false,
    canViewUsers: false,
    canManageUsers: false,
  },
  driver: {
    canViewDashboard: true,
    canViewVehicles: true,
    canEditVehicles: false,
    canViewDrivers: false,
    canEditDrivers: false,
    canViewTrips: true,
    canCreateTrips: false,
    canEditTrips: false,
    canViewMaintenance: false,
    canCreateMaintenance: false,
    canViewAnalytics: false,
    canViewSettings: false,
    canEditSettings: false,
    canViewUsers: false,
    canManageUsers: false,
  },
};

// Vehicle Status Colors
export const VEHICLE_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  inactive: "bg-gray-100 text-gray-800 border-gray-300",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-300",
  retired: "bg-red-100 text-red-800 border-red-300",
};

// Driver Status Colors
export const DRIVER_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 border-green-300",
  inactive: "bg-gray-100 text-gray-800 border-gray-300",
  on_leave: "bg-blue-100 text-blue-800 border-blue-300",
  suspended: "bg-red-100 text-red-800 border-red-300",
};

// Trip Status Colors
export const TRIP_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

// Maintenance Status Colors
export const MAINTENANCE_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800 border-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 border-yellow-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

// Alert Severity Colors
export const ALERT_SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-300",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

// Demo Email Options
export const DEMO_EMAILS = [
  "admin@fleetflow.com",
  "john.manager@fleetflow.com",
  "sarah.driver@fleetflow.com",
  "mike.driver@fleetflow.com",
];

// Mock Data Generator Functions
export function generateMockVehicles(): Vehicle[] {
  const makes = ["Toyota", "Volvo", "Mercedes-Benz", "Scania", "MAN"];
  const models = ["Hiace", "FH16", "Actros", "R440", "TGX"];
  const statuses = ["active", "inactive", "maintenance", "retired"] as const;
  const colors = ["White", "Black", "Blue", "Silver", "Red"];

  const vehicles: Vehicle[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)];
    const model = models[Math.floor(Math.random() * models.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    vehicles.push({
      id: `VEH-${String(i).padStart(3, "0")}`,
      plateNumber: `FL-${String(i).padStart(4, "0")}`,
      make,
      model,
      year: 2020 + Math.floor(Math.random() * 4),
      status,
      lastLocation: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lng: -74.0060 + (Math.random() - 0.5) * 0.1,
        address: `Location ${i}`,
        timestamp: new Date(Date.now() - Math.random() * 3600000),
      },
      fuelLevel: Math.floor(Math.random() * 100),
      mileage: 50000 + Math.floor(Math.random() * 200000),
      assignedDriverId: i <= 15 ? `DRV-${String(Math.floor(i / 1.5)).padStart(3, "0")}` : undefined,
      purchaseDate: new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      nextServiceDate: new Date(Date.now() + Math.random() * 7776000000),
      vin: `VIN${String(i).padStart(11, "0")}`,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
  
  return vehicles;
}

export function generateMockDrivers(): Driver[] {
  const firstNames = ["John", "Sarah", "Mike", "Emma", "David", "Lisa", "Robert", "Jennifer", "James", "Maria"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez"];

  const drivers: Driver[] = [];
  
  for (let i = 1; i <= 15; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    drivers.push({
      id: `DRV-${String(i).padStart(3, "0")}`,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@fleetflow.com`,
      phone: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000).padStart(10, "0")}`,
      licenseNumber: `DL${String(i).padStart(7, "0")}`,
      licenseExpiry: new Date(Date.now() + Math.random() * 63072000000),
      status: ["active", "inactive", "on_leave", "suspended"][Math.floor(Math.random() * 4)] as any,
      assignedVehicleId: `VEH-${String(Math.floor(Math.random() * 15) + 1).padStart(3, "0")}`,
      joinDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      totalTrips: Math.floor(Math.random() * 1000) + 50,
      totalDistance: Math.floor(Math.random() * 500000) + 10000,
      totalFuelUsed: Math.floor(Math.random() * 50000) + 1000,
      rating: (Math.random() * 2 + 3).toFixed(1) as any,
      activeTrips: Math.floor(Math.random() * 5),
    });
  }
  
  return drivers;
}

export function generateMockTrips(): Trip[] {
  const origins = [
    { address: "New York, NY", lat: 40.7128, lng: -74.0060 },
    { address: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
    { address: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
    { address: "Houston, TX", lat: 29.7604, lng: -95.3698 },
    { address: "Phoenix, AZ", lat: 33.4484, lng: -112.0742 },
  ];
  
  const destinations = [
    { address: "Boston, MA", lat: 42.3601, lng: -71.0589 },
    { address: "Miami, FL", lat: 25.7617, lng: -80.1918 },
    { address: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
    { address: "Denver, CO", lat: 39.7392, lng: -104.9903 },
    { address: "Atlanta, GA", lat: 33.7490, lng: -84.3880 },
  ];

  const trips: Trip[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const destination = destinations[Math.floor(Math.random() * destinations.length)];
    const status = ["scheduled", "in_progress", "completed", "cancelled"][Math.floor(Math.random() * 4)] as any;
    
    const startTime = new Date(Date.now() - Math.random() * 7776000000);
    const endTime = new Date(startTime.getTime() + Math.random() * 86400000);
    const distance = Math.floor(Math.random() * 2000) + 100;
    
    trips.push({
      id: `TRP-${String(i).padStart(4, "0")}`,
      driverId: `DRV-${String(Math.floor(Math.random() * 15) + 1).padStart(3, "0")}`,
      vehicleId: `VEH-${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`,
      origin,
      destination,
      status,
      startTime,
      endTime: status === "completed" ? endTime : undefined,
      scheduledTime: new Date(startTime.getTime() - Math.random() * 604800000),
      distance,
      fuelUsed: status === "completed" ? Math.floor(distance / 5) + Math.floor(Math.random() * 20) : undefined,
      costPerKm: 1.5 + Math.random() * 1.5,
      totalCost: status === "completed" ? distance * (1.5 + Math.random() * 1.5) : undefined,
      cargo: `Cargo Type ${Math.floor(Math.random() * 5) + 1}`,
      notes: status === "completed" ? "Trip completed successfully" : undefined,
    });
  }
  
  return trips;
}

export function generateMockMaintenance(): MaintenanceTask[] {
  const types = ["routine", "repair", "inspection", "emergency"] as const;
  const statuses = ["scheduled", "in_progress", "completed", "cancelled"] as const;
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const descriptions = [
    "Oil change",
    "Tire rotation",
    "Brake inspection",
    "Engine diagnostics",
    "Transmission service",
    "Battery replacement",
    "Filter replacement",
    "Fluid check",
  ];

  const tasks: MaintenanceTask[] = [];
  
  for (let i = 1; i <= 30; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    
    const scheduledDate = new Date(Date.now() + Math.random() * 7776000000);
    const completedDate = status === "completed" ? new Date(scheduledDate.getTime() - Math.random() * 86400000) : undefined;
    
    tasks.push({
      id: `MNT-${String(i).padStart(4, "0")}`,
      vehicleId: `VEH-${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`,
      type,
      status,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      scheduledDate,
      completedDate,
      cost: Math.floor(Math.random() * 5000) + 200,
      estimatedCost: Math.floor(Math.random() * 6000) + 200,
      notes: status === "completed" ? "Task completed" : "Pending",
      assignedTo: `MEC-${String(Math.floor(Math.random() * 5) + 1).padStart(2, "0")}`,
      priority,
    });
  }
  
  return tasks;
}

export function generateMockAlerts(): Alert[] {
  const types = ["fuel_low", "maintenance_due", "vehicle_offline", "speeding", "irregular_route", "accident", "license_expiry"] as const;
  const severities = ["info", "warning", "critical"] as const;

  const alerts: Alert[] = [];
  
  for (let i = 1; i <= 20; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    
    alerts.push({
      id: `ALR-${String(i).padStart(4, "0")}`,
      type,
      severity,
      vehicleId: `VEH-${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`,
      driverId: Math.random() > 0.5 ? `DRV-${String(Math.floor(Math.random() * 15) + 1).padStart(3, "0")}` : undefined,
      message: `Alert: ${type.replace(/_/g, " ")} detected`,
      createdAt: new Date(Date.now() - Math.random() * 604800000),
      acknowledged: Math.random() > 0.3,
      acknowledgedBy: Math.random() > 0.5 ? "admin@fleetflow.com" : undefined,
      acknowledgedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 86400000) : undefined,
    });
  }
  
  return alerts;
}

export function generateMockFuelRecords(): FuelRecord[] {
  const records: FuelRecord[] = [];
  const locations = ["Gas Station A", "Gas Station B", "Truck Stop C", "Fuel Depot D", "Petrol Center E"];

  for (let i = 1; i <= 40; i++) {
    records.push({
      id: `FUL-${String(i).padStart(4, "0")}`,
      vehicleId: `VEH-${String(Math.floor(Math.random() * 20) + 1).padStart(3, "0")}`,
      driverId: `DRV-${String(Math.floor(Math.random() * 15) + 1).padStart(3, "0")}`,
      date: new Date(Date.now() - Math.random() * 7776000000),
      amount: Math.floor(Math.random() * 200) + 20,
      cost: Math.floor(Math.random() * 1000) + 100,
      location: locations[Math.floor(Math.random() * locations.length)],
      odometer: 50000 + Math.floor(Math.random() * 200000),
      notes: "Fuel refilled",
    });
  }
  
  return records;
}
