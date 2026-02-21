import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      totalDrivers,
      activeDrivers,
      totalTrips,
      completedTrips,
      inProgressTrips,
      pendingMaintenance,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { status: 'MAINTENANCE' } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { status: 'ACTIVE' } }),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: 'COMPLETED' } }),
      prisma.trip.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenanceLog.count({ where: { status: 'PENDING' } }),
    ]);

    // Calculate KPIs
    const trips = await prisma.trip.findMany({
      include: { vehicle: true },
    });

    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalFuelCost = trips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
    const completedTripsData = trips.filter((t) => t.status === 'COMPLETED');
    const avgTripDistance = completedTripsData.length > 0 ? totalDistance / completedTripsData.length : 0;

    // Get top drivers
    const topDrivers = await prisma.driver.findMany({
      orderBy: { rating: 'desc' },
      take: 5,
      include: { user: true },
    });

    // Get recent trips
    const recentTrips = await prisma.trip.findMany({
      orderBy: { startTime: 'desc' },
      take: 10,
      include: { vehicle: true, driver: true },
    });

    // Get fuel efficiency
    const vehicles = await prisma.vehicle.findMany();
    const avgFuelLevel = vehicles.length > 0 ? vehicles.reduce((sum, v) => sum + v.fuelLevel, 0) / vehicles.length : 0;

    res.json({
      success: true,
      data: {
        kpis: {
          totalVehicles,
          activeVehicles,
          vehiclesInMaintenance,
          totalDrivers,
          activeDrivers,
          totalTrips,
          completedTrips,
          inProgressTrips,
          pendingMaintenance,
          totalDistance,
          totalFuelCost,
          avgTripDistance,
          avgFuelLevel: Math.round(avgFuelLevel),
        },
        topDrivers,
        recentTrips,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFleetStats = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    const trips = await prisma.trip.findMany({ include: { vehicle: true } });

    const fuelCostByVehicle = vehicles.map((v) => {
      const vehicleTrips = trips.filter((t) => t.vehicleId === v.id);
      const totalCost = vehicleTrips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
      return { vehicleId: v.id, plateNumber: v.plateNumber, fuelCost: totalCost };
    });

    const utilizationRate =
      vehicles.length > 0
        ? (trips.filter((t) => ['IN_PROGRESS', 'COMPLETED'].includes(t.status)).length / vehicles.length) * 100
        : 0;

    res.json({
      success: true,
      data: {
        fuelCostByVehicle,
        utilizationRate: Math.round(utilizationRate),
        totalVehicles: vehicles.length,
        totalTrips: trips.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
