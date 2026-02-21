import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { CreateDriverSchema } from '../validation/schemas';

const prisma = new PrismaClient();

export const getDrivers = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const drivers = await prisma.driver.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true } },
        assignedVehicles: {
          where: { unassignedAt: null },
          include: { vehicle: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: drivers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDriverById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true, role: true } },
        assignedVehicles: {
          include: { vehicle: true },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Get driver's trips
    const trips = await prisma.trip.findMany({
      where: { driverId: driver.userId },
      include: { vehicle: true },
      orderBy: { startTime: 'desc' },
      take: 20,
    });

    // Calculate safety score based on completed trips ratio
    const totalTrips = await prisma.trip.count({ where: { driverId: driver.userId } });
    const completedTrips = await prisma.trip.count({
      where: { driverId: driver.userId, status: 'COMPLETED' },
    });
    const cancelledTrips = await prisma.trip.count({
      where: { driverId: driver.userId, status: 'CANCELLED' },
    });

    const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
    const safetyScore = Math.min(5, driver.rating);

    res.json({
      success: true,
      data: {
        ...driver,
        trips,
        stats: {
          totalTrips,
          completedTrips,
          cancelledTrips,
          completionRate: Math.round(completionRate),
          safetyScore: safetyScore.toFixed(1),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, licenseNumber, licenseExpiry, name, email, password } = req.body;

    // If userId provided, create driver profile for existing user
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check if driver profile already exists
      const existing = await prisma.driver.findUnique({ where: { userId } });
      if (existing) {
        return res.status(400).json({ success: false, error: 'Driver profile already exists for this user' });
      }

      const driver = await prisma.driver.create({
        data: {
          userId,
          licenseNumber,
          licenseExpiry: new Date(licenseExpiry),
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      return res.status(201).json({ success: true, data: driver });
    }

    // Otherwise create a new user + driver profile
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email required for new driver' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || 'driver123', 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'DRIVER',
      },
    });

    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.status(201).json({ success: true, data: driver });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { licenseNumber, licenseExpiry, status, name, phone } = req.body;

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Update driver profile
    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: {
        ...(licenseNumber && { licenseNumber }),
        ...(licenseExpiry && { licenseExpiry: new Date(licenseExpiry) }),
        ...(status && { status }),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
      },
    });

    // Update user profile if name/phone provided
    if (name || phone) {
      await prisma.user.update({
        where: { id: driver.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    res.json({ success: true, data: updatedDriver });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateDriverStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // If suspending, check for active trips
    if (status === 'SUSPENDED' || status === 'INACTIVE') {
      const driver = await prisma.driver.findUnique({ where: { id } });
      if (driver) {
        const activeTrips = await prisma.trip.count({
          where: {
            driverId: driver.userId,
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          },
        });

        if (activeTrips > 0) {
          return res.status(400).json({
            success: false,
            error: 'Cannot change status: driver has active trips',
          });
        }
      }
    }

    const updatedDriver = await prisma.driver.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    res.json({ success: true, data: updatedDriver });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const checkLicenseExpiry = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiredDrivers = await prisma.driver.findMany({
      where: { licenseExpiry: { lt: now } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const expiringSoonDrivers = await prisma.driver.findMany({
      where: {
        licenseExpiry: { gte: now, lte: thirtyDaysFromNow },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.json({
      success: true,
      data: {
        expired: expiredDrivers,
        expiringSoon: expiringSoonDrivers,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteDriver = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    // Check for active trips
    const activeTrips = await prisma.trip.count({
      where: {
        driverId: driver.userId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    if (activeTrips > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete driver with active trips',
      });
    }

    await prisma.driver.delete({ where: { id } });

    res.json({ success: true, message: 'Driver deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
