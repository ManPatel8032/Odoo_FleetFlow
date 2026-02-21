import { z } from 'zod';

// Auth Schemas
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const OAuthSchema = z.object({
  token: z.string(),
  provider: z.enum(['google']),
});

// Vehicle Schemas
export const CreateVehicleSchema = z.object({
  plateNumber: z.string(),
  vin: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  color: z.string().optional(),
  type: z.string(),
  capacity: z.number().positive('Capacity must be positive'),
  nextServiceDate: z.coerce.date(),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial();

// Driver Schemas
export const CreateDriverSchema = z.object({
  licenseNumber: z.string(),
  licenseExpiry: z.coerce.date(),
});

// Trip Schemas
const TripBaseSchema = z.object({
  vehicleId: z.string(),
  driverId: z.string(),
  originAddress: z.string(),
  destAddress: z.string(),
  cargoWeight: z.number().positive('Cargo weight must be positive'),
  startTime: z.coerce.date(),
  estimatedEndTime: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const CreateTripSchema = TripBaseSchema.refine(
  () => {
    // Weight validation: no trip should exceed vehicle capacity
    // This will be checked in the controller with actual vehicle data
    return true;
  },
  { message: 'Cargo weight validation failed' }
);

export const UpdateTripSchema = TripBaseSchema.partial();

export const TripStatusUpdateSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  actualEndTime: z.coerce.date().optional(),
  fuelUsed: z.number().positive().optional(),
});

// Maintenance Schemas
export const CreateMaintenanceSchema = z.object({
  vehicleId: z.string(),
  issueType: z.string(),
  description: z.string(),
  cost: z.number().positive('Cost must be positive'),
  dueDate: z.coerce.date(),
});

export const UpdateMaintenanceSchema = CreateMaintenanceSchema.partial();

export const MaintenanceStatusSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  completedDate: z.coerce.date().optional(),
});

// Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type Login = z.infer<typeof LoginSchema>;
export type Register = z.infer<typeof RegisterSchema>;
export type OAuth = z.infer<typeof OAuthSchema>;
export type CreateVehicle = z.infer<typeof CreateVehicleSchema>;
export type UpdateVehicle = z.infer<typeof UpdateVehicleSchema>;
export type CreateTrip = z.infer<typeof CreateTripSchema>;
export type UpdateTrip = z.infer<typeof UpdateTripSchema>;
export type TripStatusUpdate = z.infer<typeof TripStatusUpdateSchema>;
export type CreateMaintenance = z.infer<typeof CreateMaintenanceSchema>;
export type UpdateMaintenance = z.infer<typeof UpdateMaintenanceSchema>;
export type MaintenanceStatus = z.infer<typeof MaintenanceStatusSchema>;
