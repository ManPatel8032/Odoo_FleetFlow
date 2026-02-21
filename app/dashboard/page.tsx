"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRIP_STATUS_COLORS, VEHICLE_STATUS_COLORS } from "@/lib/constants";
import {
  Truck, Users, MapPin, Wrench, Fuel, Gauge,
  Package, AlertTriangle, Activity, TrendingUp,
  Shield, DollarSign, Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.getDashboardStats();
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return <AppLayout><div className="p-6 text-center text-muted-foreground">Loading dashboard...</div></AppLayout>;
  if (error) return <AppLayout><div className="p-6 text-center text-red-500">{error}</div></AppLayout>;

  const k = data?.kpis;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser?.name}. Here&apos;s your fleet overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Fleet</p>
                  <div className="text-3xl font-bold">{k?.totalVehicles || 0}</div>
                  <p className="text-xs text-green-600">{k?.activeVehicles || 0} active</p>
                </div>
                <Truck className="w-10 h-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drivers</p>
                  <div className="text-3xl font-bold">{k?.totalDrivers || 0}</div>
                  <p className="text-xs text-green-600">{k?.activeDrivers || 0} available</p>
                </div>
                <Users className="w-10 h-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Trips</p>
                  <div className="text-3xl font-bold">{k?.inProgressTrips || 0}</div>
                  <p className="text-xs text-blue-600">{k?.scheduledTrips || 0} scheduled</p>
                </div>
                <MapPin className="w-10 h-10 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Maintenance</p>
                  <div className="text-3xl font-bold">{k?.vehiclesInMaintenance || 0}</div>
                  <p className="text-xs text-yellow-600">{k?.pendingMaintenance || 0} pending</p>
                </div>
                <Wrench className="w-10 h-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <Activity className="w-6 h-6 mx-auto mb-1 text-purple-500" />
              <div className="text-xl font-bold">{k?.utilizationRate || 0}%</div>
              <p className="text-xs text-muted-foreground">Utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Gauge className="w-6 h-6 mx-auto mb-1 text-blue-500" />
              <div className="text-xl font-bold">{Math.round(k?.totalDistance || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total km</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Fuel className="w-6 h-6 mx-auto mb-1 text-orange-500" />
              <div className="text-xl font-bold">{k?.avgFuelLevel || 0}%</div>
              <p className="text-xs text-muted-foreground">Avg Fuel</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <Package className="w-6 h-6 mx-auto mb-1 text-teal-500" />
              <div className="text-xl font-bold">{Math.round(k?.pendingCargo || 0).toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground">Pending Cargo</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
              <div className="text-xl font-bold">{k?.completedTrips || 0}/{k?.totalTrips || 0}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(k?.overdueMaintenance > 0 || k?.pendingMaintenance > 0) && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">Maintenance Alerts</p>
                <p className="text-sm text-yellow-600">
                  {k?.overdueMaintenance > 0 && <span className="text-red-600 font-semibold">{k.overdueMaintenance} vehicles overdue for service. </span>}
                  {k?.pendingMaintenance > 0 && <span>{k.pendingMaintenance} pending maintenance requests.</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Trips */}
          <Card>
            <CardHeader><CardTitle>Recent Trips</CardTitle></CardHeader>
            <CardContent>
              {data?.recentTrips?.length > 0 ? (
                <div className="space-y-3">
                  {data.recentTrips.slice(0, 6).map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div>
                        <span className="font-mono text-xs text-muted-foreground">{t.tripNumber} </span>
                        <span>{t.originAddress} → {t.destAddress}</span>
                      </div>
                      <Badge className={TRIP_STATUS_COLORS[t.status] || ""} >{t.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No trips yet</p>
              )}
            </CardContent>
          </Card>

          {/* Top Drivers */}
          <Card>
            <CardHeader><CardTitle>Top Drivers</CardTitle></CardHeader>
            <CardContent>
              {data?.topDrivers?.length > 0 ? (
                <div className="space-y-3">
                  {data.topDrivers.map((d: any, i: number) => (
                    <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-muted-foreground w-5">#{i + 1}</span>
                        <span>{d.user?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{d.totalTrips} trips</span>
                        <Badge variant="outline">{d.rating}/5.0</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No driver data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Safety Officer View - License Expiry Alerts */}
        {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && data?.expiringLicenses?.length > 0 && (
          <Card className="border-red-400 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Shield className="w-5 h-5" />Driver Compliance Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.expiringLicenses.map((d: any) => {
                  const isExpired = new Date(d.licenseExpiry) < new Date();
                  return (
                    <div key={d.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{d.user?.name}</span>
                        <span className="text-xs text-muted-foreground">({d.licenseNumber})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span className={isExpired ? "text-red-600 font-semibold" : "text-yellow-600"}>
                          {isExpired ? "EXPIRED" : "Expires"} {new Date(d.licenseExpiry).toLocaleDateString()}
                        </span>
                        {isExpired && <Badge variant="destructive">Blocked</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Drivers with expired licenses are automatically blocked from trip assignment.</p>
            </CardContent>
          </Card>
        )}

        {/* Financial Analyst View - Operational Costs */}
        {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><DollarSign className="w-5 h-5" />Financial Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Fuel className="w-6 h-6 mx-auto mb-1 text-orange-500" />
                  <div className="text-xl font-bold">${(k?.totalFuelSpend || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Fuel Spend</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Wrench className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                  <div className="text-xl font-bold">${(k?.totalMaintenanceCost || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Maintenance Cost</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-1 text-red-500" />
                  <div className="text-xl font-bold">${(k?.totalOperationalCost || 0).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Total Operational Cost</p>
                </CardContent>
              </Card>
            </div>

            {/* Per-Vehicle Operational Cost */}
            {data?.vehicleCosts?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Operational Cost per Vehicle (Fuel + Maintenance)</CardTitle></CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50"><tr>
                        <th className="text-left p-3">Vehicle</th>
                        <th className="text-right p-3">Fuel Cost</th>
                        <th className="text-right p-3">Maintenance Cost</th>
                        <th className="text-right p-3 font-semibold">Total</th>
                      </tr></thead>
                      <tbody>
                        {data.vehicleCosts.filter((v: any) => v.totalCost > 0).map((v: any) => (
                          <tr key={v.vehicleId} className="border-t">
                            <td className="p-3 font-medium">{v.plateNumber}</td>
                            <td className="p-3 text-right">${v.fuelCost.toLocaleString()}</td>
                            <td className="p-3 text-right">${v.maintenanceCost.toLocaleString()}</td>
                            <td className="p-3 text-right font-semibold">${v.totalCost.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
