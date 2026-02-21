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
    const scheduledTrips = await prisma.trip.count({ where: { status: 'SCHEDULED' } });

    const totalDistance = trips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalFuelCost = trips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
    const completedTripsData = trips.filter((t) => t.status === 'COMPLETED');
    const avgTripDistance = completedTripsData.length > 0 ? totalDistance / completedTripsData.length : 0;

    // Pending cargo (total cargo weight of scheduled trips)
    const pendingCargo = trips
      .filter((t) => t.status === 'SCHEDULED')
      .reduce((sum, t) => sum + t.cargoWeight, 0);

    // Utilization rate: % of fleet currently assigned (on trip)
    const utilizationRate = totalVehicles > 0
      ? Math.round(((totalVehicles - activeVehicles) / totalVehicles) * 100)
      : 0;

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

    // Maintenance alerts
    const overdueMaintenance = await prisma.vehicle.count({
      where: { nextServiceDate: { lt: new Date() }, status: { not: 'RETIRED' } },
    });

    // License expiry alerts (Safety Officer view)
    const expiringLicenses = await prisma.driver.findMany({
      where: {
        licenseExpiry: { lt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }, // within 30 days
        status: { not: 'SUSPENDED' },
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { licenseExpiry: 'asc' },
    });

    // Financial summary (Financial Analyst view)
    const totalFuelSpend = trips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      where: { status: 'COMPLETED' },
      include: { vehicle: { select: { id: true, plateNumber: true } } },
    });
    const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalOperationalCost = totalFuelSpend + totalMaintenanceCost;

    // Per-vehicle operational cost (Fuel + Maintenance)
    const vehicleCosts = vehicles.map(v => {
      const vTrips = trips.filter(t => t.vehicleId === v.id);
      const fuelCost = vTrips.reduce((s, t) => s + (t.fuelCost || 0), 0);
      const maintCost = maintenanceLogs.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
      return {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        fuelCost,
        maintenanceCost: maintCost,
        totalCost: fuelCost + maintCost,
      };
    });

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
          scheduledTrips,
          pendingMaintenance,
          pendingCargo,
          utilizationRate,
          overdueMaintenance,
          totalDistance,
          totalFuelCost,
          avgTripDistance,
          avgFuelLevel: Math.round(avgFuelLevel),
          totalFuelSpend,
          totalMaintenanceCost,
          totalOperationalCost,
        },
        topDrivers,
        recentTrips,
        expiringLicenses,
        vehicleCosts,
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
