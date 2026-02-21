"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Search, MapPin, Clock, Zap, DollarSign } from "lucide-react";
import { generateMockTrips } from "@/lib/constants";
import { TRIP_STATUS_COLORS } from "@/lib/constants";

export default function TripsPage() {
  const [trips] = useState(generateMockTrips());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.origin.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const selectedTripData = trips.find((t) => t.id === selectedTrip);
  const tripStats = {
    total: trips.length,
    inProgress: trips.filter((t) => t.status === "in_progress").length,
    completed: trips.filter((t) => t.status === "completed").length,
    scheduled: trips.filter((t) => t.status === "scheduled").length,
    totalDistance: trips.reduce((sum, t) => sum + t.distance, 0),
    totalCost: trips.reduce((sum, t) => sum + (t.totalCost || 0), 0),
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trip Dispatcher</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all trips across your fleet.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Total Trips</p>
            <p className="text-2xl font-bold text-gray-900">{tripStats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{tripStats.inProgress}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Completed</p>
            <p className="text-2xl font-bold text-green-600">{tripStats.completed}</p>
          </Card>
          <Card className="p-4">
            <p className="text-gray-600 text-xs font-medium mb-1">Scheduled</p>
            <p className="text-2xl font-bold text-yellow-600">{tripStats.scheduled}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trips Table */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Trip ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Route</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Distance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Driver</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.map((trip) => (
                      <tr
                        key={trip.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                          selectedTrip === trip.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() => setSelectedTrip(trip.id)}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{trip.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-gray-900">{trip.origin.address}</p>
                              <p className="text-xs text-gray-500">→ {trip.destination.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{trip.distance} km</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                              TRIP_STATUS_COLORS[trip.status]
                            }`}
                          >
                            {trip.status.replace(/_/g, " ").charAt(0).toUpperCase() + trip.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{trip.driverId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {filteredTrips.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No trips found matching your criteria.</p>
              </Card>
            )}
          </div>

          {/* Trip Detail Panel */}
          <div>
            {selectedTripData ? (
              <Card className="p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedTripData.id}
                </h3>

                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Origin</p>
                    <p className="text-sm font-medium text-gray-900 flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      {selectedTripData.origin.address}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 font-medium mb-1">Destination</p>
                    <p className="text-sm font-medium text-gray-900 flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0 mt-0.5" />
                      {selectedTripData.destination.address}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium flex items-center">
                      <Zap className="w-3 h-3 mr-1" />
                      Distance
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTripData.distance} km</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Start Time
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedTripData.startTime.toLocaleTimeString()}
                    </span>
                  </div>

                  {selectedTripData.fuelUsed && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 font-medium">Fuel Used</span>
                      <span className="text-sm font-semibold text-gray-900">{selectedTripData.fuelUsed} L</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Driver</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTripData.driverId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Vehicle</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedTripData.vehicleId}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600 font-medium">Status</span>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                        TRIP_STATUS_COLORS[selectedTripData.status]
                      }`}
                    >
                      {selectedTripData.status.replace(/_/g, " ").charAt(0).toUpperCase() +
                        selectedTripData.status.slice(1)}
                    </span>
                  </div>
                </div>

                {selectedTripData.totalCost && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-2 flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Cost
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${selectedTripData.totalCost.toFixed(2)}
                    </p>
                  </div>
                )}

                <Button variant="outline" className="w-full mb-2 border-gray-300">
                  Edit Trip
                </Button>
                <Button variant="outline" className="w-full border-gray-300">
                  View History
                </Button>
              </Card>
            ) : (
              <Card className="p-6 text-center text-gray-600">
                <p className="text-sm">Select a trip to view details</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
