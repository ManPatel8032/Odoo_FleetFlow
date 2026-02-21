"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TRIP_STATUS_COLORS } from "@/lib/constants";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Plus, Search, Package, Play, CheckCircle, XCircle } from "lucide-react";

export default function TripsPage() {
  const { currentUser } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vehicleId: "", driverId: "", startLocation: "", endLocation: "",
    scheduledStart: "", scheduledEnd: "", cargoWeight: "",
    cargoDescription: "", notes: "",
  });

  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const fetchTrips = async () => {
    try {
      const res = await apiClient.getTrips();
      setTrips(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const [v, d] = await Promise.all([apiClient.getVehicles(), apiClient.getDrivers()]);
      setVehicles(v.data.data);
      setDrivers(d.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchTrips();
    fetchFormData();
  }, []);

  const handleCreate = async () => {
    try {
      setError("");
      const payload: any = {
        vehicleId: form.vehicleId,
        driverId: form.driverId,
        startLocation: form.startLocation,
        endLocation: form.endLocation,
        scheduledStart: new Date(form.scheduledStart).toISOString(),
        scheduledEnd: new Date(form.scheduledEnd).toISOString(),
      };
      if (form.cargoWeight) payload.cargoWeight = Number(form.cargoWeight);
      if (form.cargoDescription) payload.cargoDescription = form.cargoDescription;
      if (form.notes) payload.notes = form.notes;

      await apiClient.createTrip(payload);
      setShowCreate(false);
      setForm({ vehicleId: "", driverId: "", startLocation: "", endLocation: "", scheduledStart: "", scheduledEnd: "", cargoWeight: "", cargoDescription: "", notes: "" });
      fetchTrips();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create trip");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setError("");
      const payload: any = { status };
      if (status === "COMPLETED") {
        const distance = prompt("Enter actual distance (km):");
        const fuel = prompt("Enter fuel consumed (liters):");
        if (!distance || !fuel) return;
        payload.actualDistance = Number(distance);
        payload.fuelConsumed = Number(fuel);
      }
      await apiClient.updateTrip(id, payload);
      fetchTrips();
      setSelected(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update trip");
    }
  };

  const filtered = trips.filter((t) => {
    const matchSearch =
      (t.tripNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.endLocation.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: trips.length,
    scheduled: trips.filter(t => t.status === "SCHEDULED").length,
    inProgress: trips.filter(t => t.status === "IN_PROGRESS").length,
    completed: trips.filter(t => t.status === "COMPLETED").length,
  };

  const activeVehicles = vehicles.filter(v => v.status === "ACTIVE");
  const activeDrivers = drivers.filter(d => d.status === "ACTIVE");

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trip Dispatcher</h1>
            <p className="text-muted-foreground">Schedule and manage fleet trips</p>
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Schedule Trip</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Schedule New Trip</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Vehicle *</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                      <option value="">Select vehicle...</option>
                      {activeVehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Driver *</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                      <option value="">Select driver...</option>
                      {activeDrivers.map(d => <option key={d.id} value={d.id}>{d.user?.name} - {d.licenseNumber}</option>)}
                    </select>
                  </div>
                  <Input placeholder="Start Location *" value={form.startLocation} onChange={(e) => setForm({ ...form, startLocation: e.target.value })} />
                  <Input placeholder="End Location *" value={form.endLocation} onChange={(e) => setForm({ ...form, endLocation: e.target.value })} />
                  <div>
                    <label className="text-xs text-muted-foreground">Scheduled Start *</label>
                    <Input type="datetime-local" value={form.scheduledStart} onChange={(e) => setForm({ ...form, scheduledStart: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Scheduled End *</label>
                    <Input type="datetime-local" value={form.scheduledEnd} onChange={(e) => setForm({ ...form, scheduledEnd: e.target.value })} />
                  </div>
                  <Input type="number" placeholder="Cargo Weight (kg)" value={form.cargoWeight} onChange={(e) => setForm({ ...form, cargoWeight: e.target.value })} />
                  <Input placeholder="Cargo Description" value={form.cargoDescription} onChange={(e) => setForm({ ...form, cargoDescription: e.target.value })} />
                  <div className="col-span-2">
                    <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                {error && showCreate && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} className="w-full">Schedule Trip</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total Trips</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div><p className="text-sm text-muted-foreground">Scheduled</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.completed}</div><p className="text-sm text-muted-foreground">Completed</p></CardContent></Card>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by trip number, location..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && !showCreate && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-6">
          <div className="flex-1">
            {loading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> :
            filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No trips found</div> : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-3">Trip #</th>
                    <th className="text-left p-3">Route</th>
                    <th className="text-left p-3">Vehicle</th>
                    <th className="text-left p-3">Driver</th>
                    <th className="text-left p-3">Cargo</th>
                    <th className="text-left p-3">Schedule</th>
                    <th className="text-left p-3">Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className={`border-t cursor-pointer hover:bg-muted/30 ${selected?.id === t.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(t)}>
                        <td className="p-3 font-mono font-medium">{t.tripNumber}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-500" />{t.startLocation}</div>
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" />{t.endLocation}</div>
                        </td>
                        <td className="p-3">{t.vehicle?.plateNumber}</td>
                        <td className="p-3">{t.driver?.user?.name}</td>
                        <td className="p-3">{t.cargoWeight ? <span className="flex items-center gap-1"><Package className="w-3 h-3" />{t.cargoWeight} kg</span> : "—"}</td>
                        <td className="p-3 text-xs">{new Date(t.scheduledStart).toLocaleDateString()}</td>
                        <td className="p-3"><Badge className={TRIP_STATUS_COLORS[t.status] || ""}>{t.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <Card className="w-80 shrink-0">
              <CardHeader><CardTitle className="font-mono">{selected.tripNumber}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">From:</span> {selected.startLocation}</div>
                <div><span className="text-muted-foreground">To:</span> {selected.endLocation}</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {selected.vehicle?.plateNumber}</div>
                <div><span className="text-muted-foreground">Driver:</span> {selected.driver?.user?.name}</div>
                <div><span className="text-muted-foreground">Scheduled:</span> {new Date(selected.scheduledStart).toLocaleString()} → {new Date(selected.scheduledEnd).toLocaleString()}</div>
                {selected.cargoWeight && <div><span className="text-muted-foreground">Cargo:</span> {selected.cargoWeight} kg — {selected.cargoDescription || ""}</div>}
                {selected.actualDistance && <div><span className="text-muted-foreground">Distance:</span> {selected.actualDistance} km</div>}
                {selected.fuelConsumed && <div><span className="text-muted-foreground">Fuel:</span> {selected.fuelConsumed} L</div>}
                {selected.fuelCost && <div><span className="text-muted-foreground">Fuel Cost:</span> ${selected.fuelCost}</div>}
                <Badge className={TRIP_STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                {canEdit && (
                  <div className="pt-3 space-y-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Actions:</p>
                    <div className="flex flex-col gap-1">
                      {selected.status === "SCHEDULED" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(selected.id, "IN_PROGRESS")}>
                            <Play className="w-3 h-3 mr-1" />Start Trip
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(selected.id, "CANCELLED")}>
                            <XCircle className="w-3 h-3 mr-1" />Cancel
                          </Button>
                        </>
                      )}
                      {selected.status === "IN_PROGRESS" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(selected.id, "COMPLETED")}>
                            <CheckCircle className="w-3 h-3 mr-1" />Complete
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(selected.id, "CANCELLED")}>
                            <XCircle className="w-3 h-3 mr-1" />Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
