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

    // Validate cargo weight against vehicle capacity
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    if (data.cargoWeight > vehicle.capacity) {
      return res.status(400).json({
        success: false,
        error: `Cargo weight (${data.cargoWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`,
      });
    }

    // Generate trip number
    const tripCount = await prisma.trip.count();
    const tripNumber = `TRIP-${Date.now()}-${tripCount + 1}`;

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

    // Update vehicle status if trip is completed
    if (status === 'COMPLETED') {
      if (trip.vehicle && fuelUsed) {
        await prisma.vehicle.update({
          where: { id: trip.vehicleId },
          data: {
            fuelLevel: Math.max(0, trip.vehicle.fuelLevel - (fuelUsed / 50) * 100), // Rough fuel consumption
            mileage: trip.vehicle.mileage + (trip.distance || 0),
          },
        });
      }

      // Update driver stats
      if (trip.driver) {
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

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status,
        actualEndTime,
        fuelUsed,
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
