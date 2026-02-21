"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MapPin, AlertCircle } from "lucide-react";
import { generateMockVehicles } from "@/lib/constants";
import { VEHICLE_STATUS_COLORS } from "@/lib/constants";

export default function VehiclesPage() {
  const [vehicles] = useState(generateMockVehicles());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
  const vehicleStats = {
    total: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    maintenance: vehicles.filter((v) => v.status === "maintenance").length,
    lowFuel: vehicles.filter((v) => v.fuelLevel < 25).length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Registry</h1>
            <p className="text-gray-600 mt-2">Manage and monitor all vehicles in your fleet.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Total Vehicles</p>
            <p className="text-2xl font-bold text-gray-900">{vehicleStats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{vehicleStats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{vehicleStats.maintenance}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Low Fuel</p>
            <p className="text-2xl font-bold text-red-600">{vehicleStats.lowFuel}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicles Table */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Plate Number</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Make / Model</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Fuel</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((vehicle) => (
                      <tr
                        key={vehicle.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                          selectedVehicle === vehicle.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedVehicle(vehicle.id)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{vehicle.plateNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {vehicle.make} {vehicle.model}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{vehicle.year}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                              VEHICLE_STATUS_COLORS[vehicle.status]
                            }`}
                          >
                            {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 h-2 bg-gray-200 rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  vehicle.fuelLevel > 50
                                    ? "bg-green-500"
                                    : vehicle.fuelLevel > 25
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${vehicle.fuelLevel}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600">{vehicle.fuelLevel}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => setSelectedVehicle(vehicle.id)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Vehicle Detail Panel */}
          <div>
            {selectedVehicleData ? (
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedVehicleData.plateNumber}
                </h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium">Model</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedVehicleData.make} {selectedVehicleData.model}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium">VIN</p>
                    <p className="text-sm font-mono text-gray-900">{selectedVehicleData.vin}</p>
                  </div>

                  <div className="flex gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Color</p>
                      <p className="text-sm font-medium text-gray-900">{selectedVehicleData.color}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Year</p>
                      <p className="text-sm font-medium text-gray-900">{selectedVehicleData.year}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-600 font-medium">Fuel Level</p>
                    <span className="text-sm font-semibold text-gray-900">{selectedVehicleData.fuelLevel}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        selectedVehicleData.fuelLevel > 50
                          ? "bg-green-500"
                          : selectedVehicleData.fuelLevel > 25
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${selectedVehicleData.fuelLevel}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-600 font-medium">Mileage</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedVehicleData.mileage.toLocaleString()} km
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-xs text-gray-600 font-medium">Next Service</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedVehicleData.nextServiceDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mb-2 border-gray-300">
                  Edit Details
                </Button>
                <Button variant="outline" className="w-full border-gray-300">
                  View History
                </Button>
              </Card>
            ) : (
              <Card className="p-6 text-center text-gray-600">
                <p className="text-sm">Select a vehicle to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
