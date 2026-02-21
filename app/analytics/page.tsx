"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, Fuel, Gauge, DollarSign, TrendingUp } from "lucide-react";

export default function AnalyticsPage() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "vehicles" | "drivers" | "trends">("overview");

  const fetchAnalytics = async () => {
    try {
      const res = await apiClient.getAnalytics();
      setAnalytics(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleExport = async (type: string) => {
    try {
      const res = await apiClient.exportReport(type);
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-report-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to export report");
    }
  };

  if (loading) return <AppLayout><div className="p-6 text-center text-muted-foreground">Loading analytics...</div></AppLayout>;
  if (error) return <AppLayout><div className="p-6 text-center text-red-500">{error}</div></AppLayout>;

  const data = analytics;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Fleet Analytics</h1>
            <p className="text-muted-foreground">Operational insights and reports</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("vehicles")}>
              <Download className="w-4 h-4 mr-2" />Vehicles CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("drivers")}>
              <Download className="w-4 h-4 mr-2" />Drivers CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("trips")}>
              <Download className="w-4 h-4 mr-2" />Trips CSV
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b pb-2">
          {(["overview", "vehicles", "drivers", "trends"] as const).map((t) => (
            <Button key={t} variant={tab === t ? "default" : "ghost"} size="sm" onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>

        {tab === "overview" && data && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <Gauge className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{data.overview?.totalDistance?.toLocaleString() || 0} km</div>
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <Fuel className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{data.overview?.totalFuel?.toLocaleString() || 0} L</div>
                  <p className="text-sm text-muted-foreground">Total Fuel</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{data.overview?.fuelEfficiency?.toFixed(1) || 0} km/L</div>
                  <p className="text-sm text-muted-foreground">Fuel Efficiency</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">${data.overview?.costPerKm?.toFixed(2) || 0}</div>
                  <p className="text-sm text-muted-foreground">Cost per km</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold">{data.overview?.totalTrips || 0}</div>
                  <p className="text-sm text-muted-foreground">Total Trips</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold">{data.overview?.completedTrips || 0}</div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 text-center">
                  <div className="text-3xl font-bold">${data.overview?.totalMaintenanceCost?.toLocaleString() || 0}</div>
                  <p className="text-sm text-muted-foreground">Maintenance Costs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {tab === "vehicles" && data?.vehicleMetrics && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left p-3">Vehicle</th>
                <th className="text-left p-3">Trips</th>
                <th className="text-right p-3">Distance (km)</th>
                <th className="text-right p-3">Fuel (L)</th>
                <th className="text-right p-3">Efficiency (km/L)</th>
                <th className="text-right p-3">Maint. Cost</th>
                <th className="text-right p-3">Operational Cost</th>
              </tr></thead>
              <tbody>
                {data.vehicleMetrics.map((v: any) => (
                  <tr key={v.vehicleId} className="border-t">
                    <td className="p-3 font-medium">{v.plateNumber}</td>
                    <td className="p-3">{v.totalTrips}</td>
                    <td className="p-3 text-right">{v.totalDistance?.toLocaleString()}</td>
                    <td className="p-3 text-right">{v.totalFuel?.toLocaleString()}</td>
                    <td className="p-3 text-right">{v.fuelEfficiency?.toFixed(1)}</td>
                    <td className="p-3 text-right">${v.maintenanceCost?.toLocaleString()}</td>
                    <td className="p-3 text-right font-medium">${v.operationalCost?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.vehicleMetrics.length === 0 && <div className="text-center py-8 text-muted-foreground">No vehicle data available</div>}
          </div>
        )}

        {tab === "drivers" && data?.driverMetrics && (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left p-3">Driver</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Completed</th>
                <th className="text-right p-3">Distance (km)</th>
                <th className="text-right p-3">Fuel (L)</th>
                <th className="text-right p-3">Efficiency (km/L)</th>
                <th className="text-right p-3">Rating</th>
              </tr></thead>
              <tbody>
                {data.driverMetrics.map((d: any) => (
                  <tr key={d.driverId} className="border-t">
                    <td className="p-3 font-medium">{d.name}</td>
                    <td className="p-3"><Badge variant="outline">{d.status}</Badge></td>
                    <td className="p-3 text-right">{d.completedTrips}</td>
                    <td className="p-3 text-right">{d.totalDistance?.toLocaleString()}</td>
                    <td className="p-3 text-right">{d.totalFuel?.toLocaleString()}</td>
                    <td className="p-3 text-right">{d.fuelEfficiency?.toFixed(1)}</td>
                    <td className="p-3 text-right">{d.rating}/5.0</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.driverMetrics.length === 0 && <div className="text-center py-8 text-muted-foreground">No driver data available</div>}
          </div>
        )}

        {tab === "trends" && data?.monthlyTrends && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Monthly Trends (Last 6 Months)</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-3">Month</th>
                  <th className="text-right p-3">Trips</th>
                  <th className="text-right p-3">Distance (km)</th>
                  <th className="text-right p-3">Fuel (L)</th>
                  <th className="text-right p-3">Fuel Cost</th>
                </tr></thead>
                <tbody>
                  {data.monthlyTrends.map((m: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="p-3 font-medium">{m.month}</td>
                      <td className="p-3 text-right">{m.trips}</td>
                      <td className="p-3 text-right">{m.distance?.toLocaleString()}</td>
                      <td className="p-3 text-right">{m.fuel?.toLocaleString()}</td>
                      <td className="p-3 text-right">${m.fuelCost?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.monthlyTrends.length === 0 && <div className="text-center py-8 text-muted-foreground">No trend data available</div>}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
