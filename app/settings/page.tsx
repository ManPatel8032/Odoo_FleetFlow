"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    companyName: "FleetFlow Inc.",
    email: "admin@fleetflow.com",
    phone: "+1-800-FLEET-01",
    address: "123 Fleet Street, Transport City, TC 12345",
    timezone: "UTC-5",
    currency: "USD",
    maintenanceInterval: "10000",
    fuelAlertThreshold: "20",
    speedLimitAlert: "enabled",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your system configuration and preferences.</p>
        </div>

        {/* Company Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* System Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">System Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>UTC-8</option>
                <option>UTC-5</option>
                <option>UTC</option>
                <option>UTC+1</option>
                <option>UTC+8</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Fleet Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Fleet Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Interval (km)
              </label>
              <input
                type="number"
                name="maintenanceInterval"
                value={formData.maintenanceInterval}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuel Alert Threshold (%)
              </label>
              <input
                type="number"
                name="fuelAlertThreshold"
                value={formData.fuelAlertThreshold}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-4">
            <input
              type="checkbox"
              id="speedAlert"
              defaultChecked
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="speedAlert" className="text-sm font-medium text-gray-700">
              Enable Speed Limit Alerts
            </label>
          </div>
        </Card>

        {/* User Management */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Management</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Invite Team Members</p>
                <p className="text-sm text-gray-600">Add new administrators, managers, or drivers</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Invite User
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
