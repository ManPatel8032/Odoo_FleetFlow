import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '@/middleware/auth';
import { CreateVehicleSchema, UpdateVehicleSchema } from '../../../shared/validation/schemas';

const prisma = new PrismaClient();

export const getVehicles = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: { take: 5, orderBy: { startTime: 'desc' } },
        maintenanceLogs: { take: 3, orderBy: { createdAt: 'desc' } },
      },
    });

    res.json({ success: true, data: vehicles });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getVehicleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { startTime: 'desc' } },
        maintenanceLogs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateVehicleSchema.parse(req.body);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...data,
        status: 'ACTIVE',
        fuelLevel: 100,
      },
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = UpdateVehicleSchema.parse(req.body);

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteVehicle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if vehicle has active trips
    const activeTrips = await prisma.trip.count({
      where: { vehicleId: id, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
    });

    if (activeTrips > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete vehicle with active trips',
      });
    }

    await prisma.vehicle.delete({ where: { id } });

    res.json({ success: true, message: 'Vehicle deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateVehicleStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, data: vehicle });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
