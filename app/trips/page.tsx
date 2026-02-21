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
import { MapPin, Plus, Search, Package, Play, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

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
  const [capacityWarning, setCapacityWarning] = useState("");
  const [form, setForm] = useState({
    vehicleId: "", driverId: "", originAddress: "", destAddress: "",
    startTime: "", estimatedEndTime: "", cargoWeight: "",
    notes: "",
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

  // Live cargo weight validation against vehicle capacity
  const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
  const validateCargo = (weight: string, vId?: string) => {
    const vehicle = vehicles.find(v => v.id === (vId || form.vehicleId));
    if (vehicle && weight && Number(weight) > vehicle.capacity) {
      setCapacityWarning(`Cargo (${weight}kg) exceeds ${vehicle.plateNumber} max capacity (${vehicle.capacity}kg)!`);
    } else {
      setCapacityWarning("");
    }
  };

  const handleCreate = async () => {
    try {
      setError("");

      // Find the driver model to get the userId (Trip.driverId references User.id)
      const driverRecord = drivers.find(d => d.id === form.driverId);
      if (!driverRecord) {
        setError("Please select a driver");
        return;
      }

      if (!form.vehicleId || !form.originAddress || !form.destAddress || !form.startTime || !form.cargoWeight) {
        setError("Please fill all required fields (including cargo weight)");
        return;
      }

      const weight = Number(form.cargoWeight);
      if (selectedVehicle && weight > selectedVehicle.capacity) {
        setError(`Cargo weight (${weight}kg) exceeds vehicle capacity (${selectedVehicle.capacity}kg).`);
        return;
      }

      const payload: any = {
        vehicleId: form.vehicleId,
        driverId: driverRecord.userId, // Trip expects User.id, not Driver.id
        originAddress: form.originAddress,
        destAddress: form.destAddress,
        cargoWeight: weight,
        startTime: new Date(form.startTime).toISOString(),
      };
      if (form.estimatedEndTime) payload.estimatedEndTime = new Date(form.estimatedEndTime).toISOString();
      if (form.notes) payload.notes = form.notes;

      await apiClient.createTrip(payload);
      setShowCreate(false);
      setForm({ vehicleId: "", driverId: "", originAddress: "", destAddress: "", startTime: "", estimatedEndTime: "", cargoWeight: "", notes: "" });
      setCapacityWarning("");
      fetchTrips();
      fetchFormData(); // refresh vehicle availability
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create trip");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setError("");
      const additionalData: any = {};
      if (status === "COMPLETED") {
        const fuel = prompt("Enter fuel consumed (liters):");
        if (!fuel) return;
        additionalData.fuelUsed = Number(fuel);
      }
      // Use the correct status update endpoint with lifecycle enforcement
      await apiClient.updateTripStatus(id, status, Object.keys(additionalData).length > 0 ? additionalData : undefined);
      fetchTrips();
      fetchFormData(); // refresh vehicle availability
      setSelected(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update trip");
    }
  };

  const filtered = trips.filter((t) => {
    const matchSearch =
      (t.tripNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.originAddress || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.destAddress || "").toLowerCase().includes(search.toLowerCase());
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
            <Dialog open={showCreate} onOpenChange={(open) => { setShowCreate(open); if (!open) { setCapacityWarning(""); setError(""); } }}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Schedule Trip</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Schedule New Trip</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Vehicle * (Active only)</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.vehicleId} onChange={(e) => { setForm({ ...form, vehicleId: e.target.value }); validateCargo(form.cargoWeight, e.target.value); }}>
                      <option value="">Select vehicle...</option>
                      {activeVehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model} (Max: {v.capacity}kg)</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Driver * (Active, valid license only)</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.driverId} onChange={(e) => setForm({ ...form, driverId: e.target.value })}>
                      <option value="">Select driver...</option>
                      {activeDrivers.map(d => {
                        const expired = new Date(d.licenseExpiry) < new Date();
                        return <option key={d.id} value={d.id} disabled={expired}>
                          {d.user?.name} - {d.licenseNumber} {expired ? "(LICENSE EXPIRED)" : ""}
                        </option>;
                      })}
                    </select>
                  </div>
                  <Input placeholder="Origin Address *" value={form.originAddress} onChange={(e) => setForm({ ...form, originAddress: e.target.value })} />
                  <Input placeholder="Destination Address *" value={form.destAddress} onChange={(e) => setForm({ ...form, destAddress: e.target.value })} />
                  <div>
                    <label className="text-xs text-muted-foreground">Start Time *</label>
                    <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Estimated End</label>
                    <Input type="datetime-local" value={form.estimatedEndTime} onChange={(e) => setForm({ ...form, estimatedEndTime: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Cargo Weight (kg) *</label>
                    <Input type="number" placeholder="e.g. 450" value={form.cargoWeight}
                      onChange={(e) => { setForm({ ...form, cargoWeight: e.target.value }); validateCargo(e.target.value); }} />
                    {capacityWarning && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />{capacityWarning}
                      </div>
                    )}
                    {selectedVehicle && form.cargoWeight && !capacityWarning && (
                      <p className="text-xs text-green-600 mt-1">
                        {form.cargoWeight}kg / {selectedVehicle.capacity}kg capacity — OK
                      </p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
                {error && showCreate && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} className="w-full" disabled={!!capacityWarning}>Schedule Trip</Button>
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
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-green-500" />{t.originAddress}</div>
                          <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500" />{t.destAddress}</div>
                        </td>
                        <td className="p-3">{t.vehicle?.plateNumber}</td>
                        <td className="p-3">{t.driver?.name}</td>
                        <td className="p-3"><span className="flex items-center gap-1"><Package className="w-3 h-3" />{t.cargoWeight} kg</span></td>
                        <td className="p-3 text-xs">{new Date(t.startTime).toLocaleDateString()}</td>
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
                <div><span className="text-muted-foreground">From:</span> {selected.originAddress}</div>
                <div><span className="text-muted-foreground">To:</span> {selected.destAddress}</div>
                <div><span className="text-muted-foreground">Vehicle:</span> {selected.vehicle?.plateNumber} ({selected.vehicle?.capacity}kg max)</div>
                <div><span className="text-muted-foreground">Driver:</span> {selected.driver?.name}</div>
                <div><span className="text-muted-foreground">Start:</span> {new Date(selected.startTime).toLocaleString()}</div>
                {selected.estimatedEndTime && <div><span className="text-muted-foreground">Est. End:</span> {new Date(selected.estimatedEndTime).toLocaleString()}</div>}
                {selected.actualEndTime && <div><span className="text-muted-foreground">Completed:</span> {new Date(selected.actualEndTime).toLocaleString()}</div>}
                <div><span className="text-muted-foreground">Cargo:</span> {selected.cargoWeight} kg</div>
                {selected.distance != null && <div><span className="text-muted-foreground">Distance:</span> {selected.distance} km</div>}
                {selected.fuelUsed != null && <div><span className="text-muted-foreground">Fuel Used:</span> {selected.fuelUsed} L</div>}
                {selected.fuelCost != null && <div><span className="text-muted-foreground">Fuel Cost:</span> ${selected.fuelCost}</div>}
                {selected.totalCost != null && <div><span className="text-muted-foreground">Total Cost:</span> ${selected.totalCost}</div>}
                <Badge className={TRIP_STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                {canEdit && (
                  <div className="pt-3 space-y-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Lifecycle:</p>
                    <div className="flex flex-col gap-1">
                      {selected.status === "SCHEDULED" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(selected.id, "IN_PROGRESS")}>
                            <Play className="w-3 h-3 mr-1" />Dispatch (Start Trip)
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
