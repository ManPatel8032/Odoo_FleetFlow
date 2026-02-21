import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany();
    const trips = await prisma.trip.findMany({
      include: { vehicle: true, driver: true },
    });
    const maintenance = await prisma.maintenanceLog.findMany();

    const completedTrips = trips.filter((t) => t.status === 'COMPLETED');

    // Total distance and fuel
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distance || 0), 0);
    const totalFuelUsed = completedTrips.reduce((sum, t) => sum + (t.fuelUsed || 0), 0);
    const totalFuelCost = completedTrips.reduce((sum, t) => sum + (t.fuelCost || 0), 0);
    const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
    const totalOperationalCost = totalFuelCost + totalMaintenanceCost;

    // Fuel efficiency: km per liter
    const fuelEfficiency = totalFuelUsed > 0 ? totalDistance / totalFuelUsed : 0;

    // Cost per km
    const costPerKm = totalDistance > 0 ? totalOperationalCost / totalDistance : 0;

    // Per-vehicle metrics
    const vehicleMetrics = vehicles.map((v) => {
      const vTrips = completedTrips.filter((t) => t.vehicleId === v.id);
      const vMaintenance = maintenance.filter((m) => m.vehicleId === v.id);
      const vDistance = vTrips.reduce((s, t) => s + (t.distance || 0), 0);
      const vFuelUsed = vTrips.reduce((s, t) => s + (t.fuelUsed || 0), 0);
      const vFuelCost = vTrips.reduce((s, t) => s + (t.fuelCost || 0), 0);
      const vMaintenanceCost = vMaintenance.reduce((s, m) => s + m.cost, 0);
      const vTotalCost = vFuelCost + vMaintenanceCost;

      return {
        vehicleId: v.id,
        plateNumber: v.plateNumber,
        make: v.make,
        model: v.model,
        status: v.status,
        totalTrips: vTrips.length,
        totalDistance: Math.round(vDistance),
        totalFuelUsed: Math.round(vFuelUsed * 10) / 10,
        totalFuelCost: Math.round(vFuelCost),
        maintenanceCost: Math.round(vMaintenanceCost),
        totalOperationalCost: Math.round(vTotalCost),
        fuelEfficiency: vFuelUsed > 0 ? Math.round((vDistance / vFuelUsed) * 10) / 10 : 0,
        costPerKm: vDistance > 0 ? Math.round((vTotalCost / vDistance) * 100) / 100 : 0,
      };
    });

    // Per-driver metrics
    const drivers = await prisma.driver.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    const driverMetrics = drivers.map((d) => {
      const dTrips = completedTrips.filter((t) => t.driverId === d.userId);
      const dDistance = dTrips.reduce((s, t) => s + (t.distance || 0), 0);
      const dFuelUsed = dTrips.reduce((s, t) => s + (t.fuelUsed || 0), 0);

      return {
        driverId: d.id,
        name: d.user.name,
        email: d.user.email,
        totalTrips: d.totalTrips,
        completedTrips: dTrips.length,
        totalDistance: Math.round(dDistance),
        totalFuelUsed: Math.round(dFuelUsed * 10) / 10,
        fuelEfficiency: dFuelUsed > 0 ? Math.round((dDistance / dFuelUsed) * 10) / 10 : 0,
        rating: d.rating,
        status: d.status,
      };
    });

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrips = completedTrips
      .filter((t) => t.actualEndTime && new Date(t.actualEndTime) >= sixMonthsAgo)
      .reduce(
        (acc, t) => {
          const month = new Date(t.actualEndTime!).toISOString().substring(0, 7);
          if (!acc[month]) {
            acc[month] = { trips: 0, distance: 0, fuelCost: 0, maintenanceCost: 0 };
          }
          acc[month].trips++;
          acc[month].distance += t.distance || 0;
          acc[month].fuelCost += t.fuelCost || 0;
          return acc;
        },
        {} as Record<string, { trips: number; distance: number; fuelCost: number; maintenanceCost: number }>
      );

    // Add maintenance costs to monthly trends
    maintenance
      .filter((m) => m.completedDate && new Date(m.completedDate) >= sixMonthsAgo)
      .forEach((m) => {
        const month = new Date(m.completedDate!).toISOString().substring(0, 7);
        if (!monthlyTrips[month]) {
          monthlyTrips[month] = { trips: 0, distance: 0, fuelCost: 0, maintenanceCost: 0 };
        }
        monthlyTrips[month].maintenanceCost += m.cost;
      });

    res.json({
      success: true,
      data: {
        overview: {
          totalDistance: Math.round(totalDistance),
          totalFuelUsed: Math.round(totalFuelUsed * 10) / 10,
          totalFuelCost: Math.round(totalFuelCost),
          totalMaintenanceCost: Math.round(totalMaintenanceCost),
          totalOperationalCost: Math.round(totalOperationalCost),
          fuelEfficiency: Math.round(fuelEfficiency * 10) / 10,
          costPerKm: Math.round(costPerKm * 100) / 100,
          totalTrips: trips.length,
          completedTrips: completedTrips.length,
        },
        vehicleMetrics,
        driverMetrics,
        monthlyTrends: Object.entries(monthlyTrips)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const exportReport = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query; // 'vehicles', 'drivers', 'trips'

    let csvData = '';

    if (type === 'vehicles') {
      const vehicles = await prisma.vehicle.findMany();
      const trips = await prisma.trip.findMany({ where: { status: 'COMPLETED' } });
      const maintenance = await prisma.maintenanceLog.findMany();

      csvData = 'Plate Number,Make,Model,Year,Type,Capacity (kg),Mileage (km),Status,Fuel Level,Total Trips,Fuel Cost,Maintenance Cost,Total Cost\n';
      vehicles.forEach((v) => {
        const vTrips = trips.filter((t) => t.vehicleId === v.id);
        const vFuelCost = vTrips.reduce((s, t) => s + (t.fuelCost || 0), 0);
        const vMaintCost = maintenance.filter((m) => m.vehicleId === v.id).reduce((s, m) => s + m.cost, 0);
        csvData += `${v.plateNumber},${v.make},${v.model},${v.year},${v.type},${v.capacity},${v.mileage},${v.status},${v.fuelLevel},${vTrips.length},${vFuelCost.toFixed(2)},${vMaintCost.toFixed(2)},${(vFuelCost + vMaintCost).toFixed(2)}\n`;
      });
    } else if (type === 'drivers') {
      const drivers = await prisma.driver.findMany({
        include: { user: { select: { name: true, email: true } } },
      });

      csvData = 'Name,Email,License Number,License Expiry,Total Trips,Total Distance (km),Rating,Status\n';
      drivers.forEach((d) => {
        csvData += `${d.user.name},${d.user.email},${d.licenseNumber},${d.licenseExpiry.toISOString().split('T')[0]},${d.totalTrips},${d.totalDistance},${d.rating},${d.status}\n`;
      });
    } else if (type === 'trips') {
      const trips = await prisma.trip.findMany({
        include: {
          vehicle: true,
          driver: { select: { name: true } },
        },
        orderBy: { startTime: 'desc' },
      });

      csvData = 'Trip Number,Vehicle,Driver,Origin,Destination,Cargo (kg),Status,Distance (km),Fuel Used (L),Fuel Cost,Start Time\n';
      trips.forEach((t) => {
        csvData += `${t.tripNumber},${t.vehicle.plateNumber},${t.driver.name},${t.originAddress},${t.destAddress},${t.cargoWeight},${t.status},${t.distance || 0},${t.fuelUsed || 0},${t.fuelCost || 0},${t.startTime.toISOString()}\n`;
      });
    } else {
      return res.status(400).json({ success: false, error: 'Invalid export type. Use: vehicles, drivers, or trips' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=fleetflow-${type}-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvData);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
