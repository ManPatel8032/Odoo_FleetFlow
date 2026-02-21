"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DRIVER_STATUS_COLORS } from "@/lib/constants";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, Search, AlertTriangle, Shield } from "lucide-react";

export default function DriversPage() {
  const { currentUser } = useAuth();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [licenseAlerts, setLicenseAlerts] = useState<any>({ expired: [], expiringSoon: [] });
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    licenseNumber: "", licenseExpiry: "", phone: "",
  });

  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const fetchDrivers = async () => {
    try {
      const res = await apiClient.getDrivers();
      setDrivers(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load drivers");
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenseAlerts = async () => {
    try {
      const res = await apiClient.checkLicenseExpiry();
      setLicenseAlerts(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchDrivers();
    fetchLicenseAlerts();
  }, []);

  const handleCreate = async () => {
    try {
      setError("");
      await apiClient.createDriver({
        name: form.name,
        email: form.email, password: form.password,
        licenseNumber: form.licenseNumber,
        licenseExpiry: new Date(form.licenseExpiry).toISOString(),
        phone: form.phone || undefined,
      });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", licenseNumber: "", licenseExpiry: "", phone: "" });
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create driver");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiClient.updateDriverStatus(id, status);
      fetchDrivers();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this driver profile?")) return;
    try {
      await apiClient.deleteDriver(id);
      setSelected(null);
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete");
    }
  };

  const filtered = drivers.filter((d) => {
    const name = (d.user?.name || "").toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) ||
      d.licenseNumber?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === "ACTIVE").length,
    onLeave: drivers.filter(d => d.status === "ON_LEAVE").length,
    suspended: drivers.filter(d => d.status === "SUSPENDED").length,
  };

  const alertCount = (licenseAlerts.expired?.length || 0) + (licenseAlerts.expiringSoon?.length || 0);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Driver Management</h1>
            <p className="text-muted-foreground">Manage driver profiles, licenses and safety scores</p>
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><UserPlus className="w-4 h-4 mr-2" />Add Driver</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2" />
                  <Input type="email" placeholder="Email *" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  <Input type="password" placeholder="Password *" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <Input placeholder="License Number *" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                  <div>
                    <label className="text-xs text-muted-foreground">License Expiry *</label>
                    <Input type="date" value={form.licenseExpiry} onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })} />
                  </div>
                  <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="col-span-2" />
                </div>
                {error && showCreate && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} className="w-full">Create Driver</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {alertCount > 0 && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
            <CardContent className="pt-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-700 dark:text-yellow-400">License Alerts</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500">
                  {licenseAlerts.expired?.length > 0 && <span className="text-red-600">{licenseAlerts.expired.length} expired</span>}
                  {licenseAlerts.expired?.length > 0 && licenseAlerts.expiringSoon?.length > 0 && " · "}
                  {licenseAlerts.expiringSoon?.length > 0 && <span>{licenseAlerts.expiringSoon.length} expiring within 30 days</span>}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total Drivers</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.active}</div><p className="text-sm text-muted-foreground">Active</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.onLeave}</div><p className="text-sm text-muted-foreground">On Leave</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-red-600">{stats.suspended}</div><p className="text-sm text-muted-foreground">Suspended</p></CardContent></Card>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, license..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {error && !showCreate && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-6">
          <div className="flex-1">
            {loading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> :
            filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No drivers found</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((d) => (
                  <Card key={d.id} className={`cursor-pointer hover:shadow-md transition-shadow ${selected?.id === d.id ? "ring-2 ring-primary" : ""}`} onClick={() => setSelected(d)}>
                    <CardContent className="pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{d.user?.name}</h3>
                        <Badge className={DRIVER_STATUS_COLORS[d.status] || ""}>{d.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{d.user?.email}</p>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between"><span className="text-muted-foreground">License:</span> <span>{d.licenseNumber}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Expires:</span> <span>{new Date(d.licenseExpiry).toLocaleDateString()}</span></div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="flex items-center gap-1"><Shield className="w-3 h-3" />{d.rating}/5.0</span>
                        </div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Completed Trips:</span> <span>{d.totalTrips}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selected && (
            <Card className="w-80 shrink-0">
              <CardHeader><CardTitle>{selected.user?.name}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selected.user?.email}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selected.user?.phone || "—"}</div>
                <div><span className="text-muted-foreground">License:</span> {selected.licenseNumber}</div>
                <div><span className="text-muted-foreground">Expiry:</span> {new Date(selected.licenseExpiry).toLocaleDateString()}</div>
                <div className="flex items-center gap-1"><Shield className="w-4 h-4" />Rating: {selected.rating}/5.0</div>
                <div><span className="text-muted-foreground">Active Trips:</span> {selected.activeTrips}</div>
                <div><span className="text-muted-foreground">Total Trips:</span> {selected.totalTrips}</div>
                <Badge className={DRIVER_STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                {canEdit && (
                  <div className="pt-3 space-y-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Change Status:</p>
                    <div className="flex flex-wrap gap-1">
                      {["ACTIVE", "ON_LEAVE", "SUSPENDED", "INACTIVE"].filter(s => s !== selected.status).map((s) => (
                        <Button key={s} size="sm" variant="outline" onClick={() => handleStatusChange(selected.id, s)}>{s}</Button>
                      ))}
                    </div>
                    {currentUser?.role === "ADMIN" && (
                      <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDelete(selected.id)}>Delete Driver</Button>
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
