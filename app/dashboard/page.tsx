"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Activity, AlertTriangle, Fuel, Wrench, Loader } from "lucide-react";
import { apiClient } from "@/services/api";

interface DashboardStats {
  kpis: {
    totalVehicles: number;
    activeVehicles: number;
    vehiclesInMaintenance: number;
    totalDrivers: number;
    activeDrivers: number;
    totalTrips: number;
    completedTrips: number;
    inProgressTrips: number;
    pendingMaintenance: number;
    totalDistance: number;
    totalFuelCost: number;
    avgTripDistance: number;
    avgFuelLevel: number;
  };
  recentTrips: any[];
  topDrivers: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getDashboardStats();
        setStats(response.data.data);
        setError(null);
      } catch (err: any) {
        console.error("[v0] Dashboard stats error:", err);
        setError(err.response?.data?.error || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (error || !stats) {
    return (
      <AppLayout>
        <Card className="p-6 bg-red-50 border border-red-200">
          <p className="text-red-900 font-medium">{error || "Failed to load dashboard"}</p>
        </Card>
      </AppLayout>
    );
  }

  const kpis = [
    {
      title: "Active Vehicles",
      value: stats.kpis.activeVehicles.toString(),
      icon: Activity,
      color: "bg-green-500",
      change: `${stats.kpis.totalVehicles} total`,
    },
    {
      title: "In Progress Trips",
      value: stats.kpis.inProgressTrips.toString(),
      icon: Activity,
      color: "bg-blue-500",
      change: `${stats.kpis.completedTrips} completed`,
    },
    {
      title: "Avg Fuel Level",
      value: `${stats.kpis.avgFuelLevel}%`,
      icon: Fuel,
      color: "bg-yellow-500",
      change: `${stats.kpis.totalFuelCost.toFixed(0)} L/week`,
    },
    {
      title: "Maintenance Due",
      value: stats.kpis.pendingMaintenance.toString(),
      icon: Wrench,
      color: "bg-red-500",
      change: "Pending tasks",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your fleet.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.title} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{kpi.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
                    <p className="text-gray-500 text-xs mt-2">{kpi.change}</p>
                  </div>
                  <div className={`${kpi.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trips */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h2>
            <div className="space-y-4">
              {stats.recentTrips && stats.recentTrips.length > 0 ? (
                stats.recentTrips.slice(0, 5).map((trip) => (
                  <div key={trip.id} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{trip.tripNumber}</p>
                      <p className="text-sm text-gray-600">{trip.originAddress} → {trip.destAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${trip.status === 'COMPLETED' ? 'text-green-600' : trip.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-600'}`}>
                        {trip.status.replace(/_/g, ' ')}
                      </p>
                      <p className="text-xs text-gray-600">{trip.distance || '—'} km</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No recent trips</p>
              )}
            </div>
          </Card>

          {/* Top Drivers */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 text-blue-500 mr-2" />
              Top Drivers
            </h2>
            <div className="space-y-3">
              {stats.topDrivers && stats.topDrivers.length > 0 ? (
                stats.topDrivers.slice(0, 3).map((driver) => (
                  <div
                    key={driver.id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <p className="text-sm font-medium text-blue-900">{driver.user?.name || driver.id}</p>
                    <p className="text-xs text-blue-800">Rating: {driver.rating}/5 • {driver.totalTrips} trips</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No drivers yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Fleet Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active</span>
                <span className="text-sm font-medium">{stats.kpis.activeVehicles} vehicles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Maintenance</span>
                <span className="text-sm font-medium">{stats.kpis.vehiclesInMaintenance} vehicles</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total</span>
                <span className="text-sm font-medium">{stats.kpis.totalVehicles} vehicles</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Active Drivers</span>
                <span className="text-sm font-medium">{stats.kpis.activeDrivers}/{stats.kpis.totalDrivers}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Operations Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Distance</span>
                <span className="text-sm font-medium">{stats.kpis.totalDistance.toFixed(0)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Trip Distance</span>
                <span className="text-sm font-medium">{stats.kpis.avgTripDistance.toFixed(0)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fuel Cost</span>
                <span className="text-sm font-medium">${stats.kpis.totalFuelCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Completed Trips</span>
                <span className="text-sm font-medium">{stats.kpis.completedTrips}/{stats.kpis.totalTrips}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
