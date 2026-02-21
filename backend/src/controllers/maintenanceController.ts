import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { CreateMaintenanceSchema, UpdateMaintenanceSchema, MaintenanceStatusSchema } from '../validation/schemas';

const prisma = new PrismaClient();

export const getMaintenanceLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { status, vehicleId } = req.query;

    const logs = await prisma.maintenanceLog.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(vehicleId && { vehicleId: vehicleId as string }),
      },
      include: {
        vehicle: true,
        loggedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMaintenanceById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: true,
        loggedBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!log) {
      return res.status(404).json({ success: false, error: 'Maintenance log not found' });
    }

    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const data = CreateMaintenanceSchema.parse(req.body);

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    // Auto-set vehicle status to MAINTENANCE ("In Shop")
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: 'MAINTENANCE' },
    });

    const log = await prisma.maintenanceLog.create({
      data: {
        ...data,
        userId: req.user!.id,
        status: 'PENDING',
      },
      include: {
        vehicle: true,
        loggedBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = UpdateMaintenanceSchema.parse(req.body);

    const log = await prisma.maintenanceLog.update({
      where: { id },
      data,
      include: {
        vehicle: true,
        loggedBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: log });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateMaintenanceStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, completedDate } = MaintenanceStatusSchema.parse(req.body);

    const log = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!log) {
      return res.status(404).json({ success: false, error: 'Maintenance log not found' });
    }

    // If maintenance is completed, check if there are other pending maintenance for this vehicle
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      const otherPending = await prisma.maintenanceLog.count({
        where: {
          vehicleId: log.vehicleId,
          id: { not: id },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      // If no other pending maintenance, set vehicle back to ACTIVE
      if (otherPending === 0) {
        await prisma.vehicle.update({
          where: { id: log.vehicleId },
          data: { status: 'ACTIVE' },
        });
      }
    }

    const updatedLog = await prisma.maintenanceLog.update({
      where: { id },
      data: {
        status,
        completedDate: completedDate || (status === 'COMPLETED' ? new Date() : undefined),
      },
      include: {
        vehicle: true,
        loggedBy: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({ success: true, data: updatedLog });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const log = await prisma.maintenanceLog.findUnique({ where: { id } });
    if (!log) {
      return res.status(404).json({ success: false, error: 'Maintenance log not found' });
    }

    await prisma.maintenanceLog.delete({ where: { id } });

    // Check if vehicle should return to ACTIVE
    const otherPending = await prisma.maintenanceLog.count({
      where: {
        vehicleId: log.vehicleId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (otherPending === 0) {
      await prisma.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: 'ACTIVE' },
      });
    }

    res.json({ success: true, message: 'Maintenance log deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
