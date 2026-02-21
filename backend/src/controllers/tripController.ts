import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { CreateTripSchema, UpdateTripSchema, TripStatusUpdateSchema } from '../validation/schemas';

const prisma = new PrismaClient();

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { status, driverId } = req.query;

    const trips = await prisma.trip.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(driverId && { driverId: driverId as string }),
      },
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { startTime: 'desc' },
    });

    res.json({ success: true, data: trips });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    res.json({ success: true, data: trip });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateTripSchema.parse(req.body);

    // Validate vehicle exists and is available
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    if (vehicle.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        error: `Vehicle ${vehicle.plateNumber} is not available (status: ${vehicle.status})`,
      });
    }

    // Validate cargo weight against vehicle capacity
    if (data.cargoWeight > vehicle.capacity) {
      return res.status(400).json({
        success: false,
        error: `Cargo weight (${data.cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`,
      });
    }

    // Validate driver exists
    const driverUser = await prisma.user.findUnique({
      where: { id: data.driverId },
      include: { drivers: true },
    });

    if (!driverUser) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Check driver has valid license (not expired)
    if (driverUser.drivers) {
      if (new Date(driverUser.drivers.licenseExpiry) < new Date()) {
        return res.status(400).json({
          success: false,
          error: 'Driver license has expired. Cannot assign to trip.',
        });
      }

      if (driverUser.drivers.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: `Driver is not available (status: ${driverUser.drivers.status})`,
        });
      }
    }

    // Check vehicle doesn't have an active trip already
    const activeVehicleTrip = await prisma.trip.count({
      where: { vehicleId: data.vehicleId, status: { in: ['IN_PROGRESS'] } },
    });
    if (activeVehicleTrip > 0) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle already has an active trip',
      });
    }

    // Generate trip number
    const tripCount = await prisma.trip.count();
    const tripNumber = `TRIP-${String(tripCount + 1).padStart(4, '0')}`;

    const trip = await prisma.trip.create({
      data: {
        tripNumber,
        ...data,
        status: 'SCHEDULED',
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    res.status(201).json({ success: true, data: trip });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = UpdateTripSchema.partial().parse(req.body);

    const trip = await prisma.trip.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        driver: true,
      },
    });

    res.json({ success: true, data: trip });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateTripStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, actualEndTime, fuelUsed } = TripStatusUpdateSchema.parse(req.body);

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      return res.status(404).json({ success: false, error: 'Trip not found' });
    }

    // Enforce lifecycle: SCHEDULED -> IN_PROGRESS -> COMPLETED/CANCELLED
    const validTransitions: Record<string, string[]> = {
      SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (!validTransitions[trip.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot transition from ${trip.status} to ${status}`,
      });
    }

    // When dispatching (IN_PROGRESS), mark vehicle and driver as on-trip
    if (status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'INACTIVE' }, // On trip
      });

      const driverProfile = await prisma.driver.findUnique({ where: { userId: trip.driverId } });
      if (driverProfile) {
        await prisma.driver.update({
          where: { userId: trip.driverId },
          data: { activeTrips: { increment: 1 } },
        });
      }
    }

    // When completed, update vehicle/driver stats and mark available
    if (status === 'COMPLETED') {
      // Update vehicle mileage and fuel, set back to ACTIVE
      const updateData: any = { status: 'ACTIVE' };
      if (fuelUsed && trip.vehicle) {
        updateData.fuelLevel = Math.max(0, trip.vehicle.fuelLevel - (fuelUsed / 50) * 100);
        updateData.mileage = trip.vehicle.mileage + (trip.distance || 0);
      }
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: updateData,
      });

      // Update driver stats
      const driverProfile = await prisma.driver.findUnique({ where: { userId: trip.driverId } });
      if (driverProfile) {
        await prisma.driver.update({
          where: { userId: trip.driverId },
          data: {
            totalTrips: { increment: 1 },
            totalDistance: { increment: trip.distance || 0 },
            activeTrips: { decrement: 1 },
          },
        });
      }
    }

    // When cancelled, set vehicle/driver back to available
    if (status === 'CANCELLED' && trip.status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'ACTIVE' },
      });

      const driverProfile = await prisma.driver.findUnique({ where: { userId: trip.driverId } });
      if (driverProfile) {
        await prisma.driver.update({
          where: { userId: trip.driverId },
          data: { activeTrips: { decrement: 1 } },
        });
      }
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status,
        actualEndTime: actualEndTime || (status === 'COMPLETED' ? new Date() : undefined),
        fuelUsed,
        fuelCost: fuelUsed ? fuelUsed * 1.5 : undefined, // $1.50 per liter estimate
      },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    res.json({ success: true, data: updatedTrip });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
