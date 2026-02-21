"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VEHICLE_STATUS_COLORS } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Truck, Plus, Search, Fuel, Gauge } from "lucide-react";

export default function VehiclesPage() {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    plateNumber: "", vin: "", make: "", model: "",
    year: new Date().getFullYear(), color: "", type: "Van",
    capacity: 1000, nextServiceDate: "",
  });

  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const fetchVehicles = async () => {
    try {
      const res = await apiClient.getVehicles();
      setVehicles(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleCreate = async () => {
    try {
      setError("");
      await apiClient.createVehicle({
        ...form, year: Number(form.year), capacity: Number(form.capacity),
        nextServiceDate: new Date(form.nextServiceDate).toISOString(),
      });
      setShowCreate(false);
      setForm({ plateNumber: "", vin: "", make: "", model: "", year: new Date().getFullYear(), color: "", type: "Van", capacity: 1000, nextServiceDate: "" });
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create vehicle");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.updateVehicleStatus(id, status);
      fetchVehicles();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await apiClient.deleteVehicle(id);
      setSelected(null);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete");
    }
  };

  const filtered = vehicles.filter((v) => {
    const matchSearch = v.plateNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "ACTIVE").length,
    maintenance: vehicles.filter((v) => v.status === "MAINTENANCE").length,
    retired: vehicles.filter((v) => v.status === "RETIRED").length,
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Vehicle Registry</h1>
            <p className="text-muted-foreground">Manage your fleet assets</p>
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Add Vehicle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Vehicle</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Plate Number *" value={form.plateNumber} onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} />
                  <Input placeholder="VIN *" value={form.vin} onChange={(e) => setForm({ ...form, vin: e.target.value })} />
                  <Input placeholder="Make *" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
                  <Input placeholder="Model *" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
                  <Input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
                  <Input placeholder="Color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} />
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="Van">Van</option><option value="Truck">Truck</option><option value="Bike">Bike</option><option value="Car">Car</option>
                  </select>
                  <Input type="number" placeholder="Capacity (kg) *" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                  <div className="col-span-2">
                    <label className="text-xs text-muted-foreground">Next Service Date</label>
                    <Input type="date" value={form.nextServiceDate} onChange={(e) => setForm({ ...form, nextServiceDate: e.target.value })} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} className="w-full">Create Vehicle</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.active}</div><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div><p className="text-sm text-muted-foreground">In Shop</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-red-600">{stats.retired}</div><p className="text-sm text-muted-foreground">Retired</p></CardContent></Card>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by plate, make, model..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option><option value="ACTIVE">Active</option><option value="MAINTENANCE">In Shop</option><option value="INACTIVE">Inactive</option><option value="RETIRED">Retired</option>
          </select>
        </div>

        {error && !showCreate && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-6">
          <div className="flex-1">
            {loading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> :
            filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No vehicles found</div> : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-3">Plate</th><th className="text-left p-3">Make/Model</th>
                    <th className="text-left p-3">Type</th><th className="text-left p-3">Capacity</th>
                    <th className="text-left p-3">Fuel</th><th className="text-left p-3">Mileage</th>
                    <th className="text-left p-3">Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((v) => (
                      <tr key={v.id} className={`border-t cursor-pointer hover:bg-muted/30 ${selected?.id === v.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(v)}>
                        <td className="p-3 font-medium">{v.plateNumber}</td>
                        <td className="p-3">{v.make} {v.model} ({v.year})</td>
                        <td className="p-3">{v.type}</td>
                        <td className="p-3">{v.capacity} kg</td>
                        <td className="p-3"><div className="flex items-center gap-1"><Fuel className="w-3 h-3" />{Math.round(v.fuelLevel)}%</div></td>
                        <td className="p-3">{Math.round(v.mileage).toLocaleString()} km</td>
                        <td className="p-3"><Badge className={VEHICLE_STATUS_COLORS[v.status] || ""}>{v.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <Card className="w-80 shrink-0">
              <CardHeader><CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5" />{selected.plateNumber}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Make/Model:</span> {selected.make} {selected.model}</div>
                <div><span className="text-muted-foreground">Year:</span> {selected.year}</div>
                <div><span className="text-muted-foreground">VIN:</span> {selected.vin}</div>
                <div><span className="text-muted-foreground">Type:</span> {selected.type}</div>
                <div><span className="text-muted-foreground">Capacity:</span> {selected.capacity} kg</div>
                <div className="flex items-center gap-1"><Fuel className="w-3 h-3" /> {Math.round(selected.fuelLevel)}%</div>
                <div className="flex items-center gap-1"><Gauge className="w-3 h-3" /> {Math.round(selected.mileage).toLocaleString()} km</div>
                <div><span className="text-muted-foreground">Next Service:</span> {new Date(selected.nextServiceDate).toLocaleDateString()}</div>
                <Badge className={VEHICLE_STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                {canEdit && (
                  <div className="pt-3 space-y-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Change Status:</p>
                    <div className="flex flex-wrap gap-1">
                      {["ACTIVE", "MAINTENANCE", "RETIRED"].filter(s => s !== selected.status).map((s) => (
                        <Button key={s} size="sm" variant="outline" onClick={() => handleStatusChange(selected.id, s)}>{s}</Button>
                      ))}
                    </div>
                    {currentUser?.role === "ADMIN" && (
                      <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDelete(selected.id)}>Delete Vehicle</Button>
                    )}
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
