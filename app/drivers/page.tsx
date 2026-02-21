"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, Star, MapPin, Calendar, Clock } from "lucide-react";
import { generateMockDrivers } from "@/lib/constants";
import { DRIVER_STATUS_COLORS } from "@/lib/constants";

export default function DriversPage() {
  const [drivers] = useState(generateMockDrivers());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

  const filteredDrivers = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedDriverData = drivers.find((d) => d.id === selectedDriver);
  const driverStats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "active").length,
    onLeave: drivers.filter((d) => d.status === "on_leave").length,
    withActiveTrips: drivers.filter((d) => d.activeTrips > 0).length,
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
            <p className="text-gray-600 mt-2">View and manage all drivers in your fleet.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Total Drivers</p>
            <p className="text-2xl font-bold text-gray-900">{driverStats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">{driverStats.active}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">On Leave</p>
            <p className="text-2xl font-bold text-yellow-600">{driverStats.onLeave}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Active Trips</p>
            <p className="text-2xl font-bold text-blue-600">{driverStats.withActiveTrips}</p>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers..."
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
            <option value="on_leave">On Leave</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drivers Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDrivers.map((driver) => (
                <Card
                  key={driver.id}
                  className={`p-6 hover:shadow-lg transition-shadow cursor-pointer ${
                    selectedDriver === driver.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedDriver(driver.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{driver.name}</h3>
                      <p className="text-sm text-gray-600">{driver.email}</p>
                    </div>
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.email}`}
                      alt={driver.name}
                      className="w-10 h-10 rounded-full"
                    />
                  </div>

                  <div className="space-y-2 mb-4 text-sm pb-4 border-b border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">License #</span>
                      <span className="font-medium">{driver.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Trips</span>
                      <span className="font-medium">{driver.totalTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance</span>
                      <span className="font-medium">{(driver.totalDistance / 1000).toFixed(0)}k km</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{driver.rating}</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                        DRIVER_STATUS_COLORS[driver.status]
                      }`}
                    >
                      {driver.status.replace(/_/g, " ").charAt(0).toUpperCase() + driver.status.slice(1)}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    View Details
                  </Button>
                </Card>
              ))}
            </div>

            {filteredDrivers.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No drivers found matching your criteria.</p>
              </Card>
            )}
          </div>

          {/* Driver Detail Panel */}
          <div>
            {selectedDriverData ? (
              <Card className="p-6 sticky top-6">
                <div className="flex justify-center mb-4">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDriverData.email}`}
                    alt={selectedDriverData.name}
                    className="w-16 h-16 rounded-full"
                  />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  {selectedDriverData.name}
                </h3>

                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <p className="text-xs text-gray-600 font-medium">{selectedDriverData.email}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full border ${
                      DRIVER_STATUS_COLORS[selectedDriverData.status]
                    }`}
                  >
                    {selectedDriverData.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                      selectedDriverData.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">License Number</p>
                    <p className="text-sm font-mono text-gray-900">{selectedDriverData.licenseNumber}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      License Expiry
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedDriverData.licenseExpiry.toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Join Date
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedDriverData.joinDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Rating</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-semibold">{selectedDriverData.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Total Trips</p>
                      <p className="text-lg font-bold text-gray-900">{selectedDriverData.totalTrips}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 font-medium">Active Trips</p>
                      <p className="text-lg font-bold text-blue-600">{selectedDriverData.activeTrips}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-medium">Total Distance</p>
                    <p className="text-lg font-bold text-gray-900">
                      {(selectedDriverData.totalDistance / 1000).toFixed(0)}k km
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mb-2 border-gray-300">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full border-gray-300">
                  Assign Vehicle
                </Button>
              </Card>
            ) : (
              <Card className="p-6 text-center text-gray-600">
                <p className="text-sm">Select a driver to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
