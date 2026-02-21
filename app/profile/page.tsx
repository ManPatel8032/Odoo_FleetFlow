"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/AuthContext";
import { ROLE_LABELS } from "@/lib/constants";
import { Mail, Phone, Calendar, Award } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "+1-555-0123",
    joinDate: "2022-01-15",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account information and preferences.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-6">
            {currentUser?.avatar && (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentUser?.name}</h2>
              <p className="text-gray-600">{currentUser?.email}</p>
              <div className="mt-3 flex items-center space-x-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {ROLE_LABELS[currentUser?.role || "driver"]}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.email}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-600" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900 font-medium">{formData.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-gray-600" />
                Join Date
              </label>
              <p className="text-gray-900 font-medium">{formData.joinDate}</p>
            </div>
          </div>

          {isEditing && (
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Change your password to keep your account secure.
              </p>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                Change Password
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-600 mb-4">
                Add an extra layer of security to your account.
              </p>
              <Button variant="outline" className="border-gray-300 text-gray-700">
                Enable 2FA
              </Button>
            </div>
          </div>
        </Card>

        {/* Activity Log */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between pb-4 border-b border-gray-200 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {i % 2 === 0 ? "Signed in from Chrome" : "Updated profile information"}
                  </p>
                  <p className="text-xs text-gray-600">
                    {i * 2} hours ago from {["New York", "Los Angeles", "Chicago"][i % 3]}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {i * 2}h ago
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
