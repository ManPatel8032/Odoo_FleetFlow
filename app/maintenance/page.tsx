"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/services/api";
import { useAuth } from "@/lib/auth/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MAINTENANCE_STATUS_COLORS } from "@/lib/constants";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Wrench, Plus, Search, DollarSign, Calendar } from "lucide-react";

export default function MaintenancePage() {
  const { currentUser } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vehicleId: "", issueType: "ROUTINE", description: "", cost: "",
    dueDate: "",
  });

  const canEdit = currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER";

  const fetchLogs = async () => {
    try {
      const res = await apiClient.getMaintenanceLogs();
      setLogs(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await apiClient.getVehicles();
      setVehicles(res.data.data);
    } catch {}
  };

  useEffect(() => {
    fetchLogs();
    fetchVehicles();
  }, []);

  const handleCreate = async () => {
    try {
      setError("");
      if (!form.vehicleId || !form.description || !form.cost || !form.dueDate) {
        setError("Please fill all required fields (Vehicle, Description, Cost, Due Date)");
        return;
      }
      await apiClient.createMaintenance({
        vehicleId: form.vehicleId,
        issueType: form.issueType,
        description: form.description,
        cost: Number(form.cost),
        dueDate: new Date(form.dueDate).toISOString(),
      });
      setShowCreate(false);
      setForm({ vehicleId: "", issueType: "ROUTINE", description: "", cost: "", dueDate: "" });
      fetchLogs();
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create maintenance");
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setError("");
      const payload: any = { status };
      if (status === "COMPLETED") {
        const costStr = prompt("Enter final cost (optional):");
        if (costStr) payload.cost = Number(costStr);
      }
      await apiClient.updateMaintenanceStatus(id, payload);
      fetchLogs();
      fetchVehicles();
      setSelected(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this maintenance log?")) return;
    try {
      await apiClient.deleteMaintenance(id);
      setSelected(null);
      fetchLogs();
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete");
    }
  };

  const filtered = logs.filter((m) => {
    const matchSearch =
      m.description?.toLowerCase().includes(search.toLowerCase()) ||
      m.vehicle?.plateNumber?.toLowerCase().includes(search.toLowerCase()) ||
      m.issueType?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: logs.length,
    pending: logs.filter(m => m.status === "PENDING").length,
    inProgress: logs.filter(m => m.status === "IN_PROGRESS").length,
    totalCost: logs.filter(m => m.status === "COMPLETED").reduce((s, m) => s + (m.cost || 0), 0),
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Maintenance Workshop</h1>
            <p className="text-muted-foreground">Track and manage vehicle maintenance</p>
          </div>
          {canEdit && (
            <Dialog open={showCreate} onOpenChange={setShowCreate}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" />Log Maintenance</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>New Maintenance Log</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Vehicle *</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}>
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber} - {v.make} {v.model} ({v.status})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Issue Type *</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })}>
                      <option value="ROUTINE">Routine</option>
                      <option value="REPAIR">Repair</option>
                      <option value="INSPECTION">Inspection</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                  <Input placeholder="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div>
                    <label className="text-xs text-muted-foreground">Cost ($) *</label>
                    <Input type="number" step="0.01" placeholder="e.g. 250.00" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Due Date *</label>
                    <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                  </div>
                </div>
                {error && showCreate && <p className="text-sm text-red-500">{error}</p>}
                <Button onClick={handleCreate} className="w-full">Create Maintenance Log</Button>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold">{stats.total}</div><p className="text-sm text-muted-foreground">Total Logs</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div><p className="text-sm text-muted-foreground">Pending</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div><p className="text-sm text-muted-foreground">In Progress</p></CardContent></Card>
          <Card><CardContent className="pt-4 text-center"><div className="text-2xl font-bold text-green-600 flex items-center justify-center gap-1"><DollarSign className="w-5 h-5" />{stats.totalCost.toLocaleString()}</div><p className="text-sm text-muted-foreground">Total Cost</p></CardContent></Card>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by description, vehicle, type..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {error && !showCreate && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-6">
          <div className="flex-1">
            {loading ? <div className="text-center py-10 text-muted-foreground">Loading...</div> :
            filtered.length === 0 ? <div className="text-center py-10 text-muted-foreground">No maintenance logs found</div> : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-3">Vehicle</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-left p-3">Cost</th>
                    <th className="text-left p-3">Scheduled</th>
                    <th className="text-left p-3">Status</th>
                  </tr></thead>
                  <tbody>
                    {filtered.map((m) => (
                      <tr key={m.id} className={`border-t cursor-pointer hover:bg-muted/30 ${selected?.id === m.id ? "bg-muted/50" : ""}`} onClick={() => setSelected(m)}>
                        <td className="p-3 font-medium">{m.vehicle?.plateNumber}</td>
                        <td className="p-3"><Badge variant="outline">{m.issueType}</Badge></td>
                        <td className="p-3 max-w-48 truncate">{m.description}</td>
                        <td className="p-3">{m.cost ? `$${m.cost.toLocaleString()}` : "—"}</td>
                        <td className="p-3 text-xs flex items-center gap-1"><Calendar className="w-3 h-3" />{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : "—"}</td>
                        <td className="p-3"><Badge className={MAINTENANCE_STATUS_COLORS[m.status] || ""}>{m.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {selected && (
            <Card className="w-80 shrink-0">
              <CardHeader><CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5" />{selected.vehicle?.plateNumber}</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div><span className="text-muted-foreground">Type:</span> {selected.issueType}</div>
                <div><span className="text-muted-foreground">Description:</span> {selected.description}</div>
                <div><span className="text-muted-foreground">Cost:</span> {selected.cost ? `$${selected.cost}` : "—"}</div>
                <div><span className="text-muted-foreground">Due Date:</span> {selected.dueDate ? new Date(selected.dueDate).toLocaleDateString() : "—"}</div>
                {selected.completedDate && <div><span className="text-muted-foreground">Completed:</span> {new Date(selected.completedDate).toLocaleDateString()}</div>}
                <Badge className={MAINTENANCE_STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                {canEdit && (
                  <div className="pt-3 space-y-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground">Actions:</p>
                    <div className="flex flex-col gap-1">
                      {selected.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(selected.id, "IN_PROGRESS")}>Start Work</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(selected.id, "CANCELLED")}>Cancel</Button>
                        </>
                      )}
                      {selected.status === "IN_PROGRESS" && (
                        <>
                          <Button size="sm" onClick={() => handleStatusChange(selected.id, "COMPLETED")}>Mark Complete</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusChange(selected.id, "CANCELLED")}>Cancel</Button>
                        </>
                      )}
                    </div>
                    {currentUser?.role === "ADMIN" && (
                      <Button size="sm" variant="destructive" className="w-full" onClick={() => handleDelete(selected.id)}>Delete Log</Button>
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
