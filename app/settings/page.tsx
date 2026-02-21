"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { Save, CheckCircle, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";

const DEFAULT_SETTINGS = {
  companyName: "FleetFlow Inc.",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  timezone: "UTC",
  currency: "USD",
  distanceUnit: "km",
  maintenanceInterval: "10000",
  fuelAlertThreshold: "20",
  speedLimitAlert: true,
  emailNotifications: true,
  maintenanceReminders: true,
  tripAlerts: true,
  licenseExpiryAlerts: true,
};

export default function SettingsPage() {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [formData, setFormData] = useState(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("fleetflow_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSave = () => {
    localStorage.setItem("fleetflow_settings", JSON.stringify(formData));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
    localStorage.removeItem("fleetflow_settings");
    setSaved(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your system configuration and preferences.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" /> Reset
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        {/* Save confirmation */}
        {saved && (
          <div className="p-4 rounded-lg flex items-center gap-2 bg-green-50 text-green-800 border border-green-200">
            <CheckCircle className="w-5 h-5" />
            Settings saved successfully!
          </div>
        )}

        {/* Company Settings (Admin only) */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h2>
          {!isAdmin && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
              Only administrators can modify company settings.
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                disabled={!isAdmin}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
              <input
                type="email"
                name="companyEmail"
                value={formData.companyEmail}
                onChange={handleInputChange}
                disabled={!isAdmin}
                placeholder="company@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleInputChange}
                disabled={!isAdmin}
                placeholder="Enter company phone"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="companyAddress"
                value={formData.companyAddress}
                onChange={handleInputChange}
                disabled={!isAdmin}
                placeholder="Enter company address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </Card>

        {/* System Preferences */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">System Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC-8">UTC-8 (Pacific)</option>
                <option value="UTC-5">UTC-5 (Eastern)</option>
                <option value="UTC">UTC</option>
                <option value="UTC+1">UTC+1 (CET)</option>
                <option value="UTC+5:30">UTC+5:30 (IST)</option>
                <option value="UTC+8">UTC+8 (CST)</option>
                <option value="UTC+9">UTC+9 (JST)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance Unit</label>
              <select
                name="distanceUnit"
                value={formData.distanceUnit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="km">Kilometers (km)</option>
                <option value="mi">Miles (mi)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Fleet Configuration */}
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
              <p className="text-xs text-gray-500 mt-1">
                Vehicles will show maintenance alerts when mileage exceeds this interval
              </p>
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
                min="5"
                max="50"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Alert when vehicle fuel level drops below this percentage
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
          <div className="space-y-4">
            {[
              { name: "emailNotifications", label: "Email Notifications", desc: "Receive email alerts for important events" },
              { name: "maintenanceReminders", label: "Maintenance Reminders", desc: "Get notified when vehicles are due for maintenance" },
              { name: "tripAlerts", label: "Trip Alerts", desc: "Notifications for trip status changes and delays" },
              { name: "licenseExpiryAlerts", label: "License Expiry Alerts", desc: "Warn when driver licenses are about to expire" },
              { name: "speedLimitAlert", label: "Speed Limit Alerts", desc: "Alert when vehicles exceed speed limits" },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={(formData as any)[item.name]}
                    onChange={handleCheckboxChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Current User Info */}
        <Card className="p-6 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Logged in as:</span>
              <p className="font-medium text-gray-900">{currentUser?.name}</p>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>
              <p className="font-medium text-gray-900">{currentUser?.email}</p>
            </div>
            <div>
              <span className="text-gray-500">Role:</span>
              <p className="font-medium text-gray-900">{currentUser?.role}</p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
