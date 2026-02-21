"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function AnalyticsPage() {
  const metrics = [
    {
      title: "Total Distance",
      value: "45,230 km",
      change: "+12.5%",
      trend: "up",
      description: "This month",
    },
    {
      title: "Fuel Consumption",
      value: "8,450 L",
      change: "-3.2%",
      trend: "down",
      description: "This month",
    },
    {
      title: "Operational Cost",
      value: "$23,450",
      change: "+2.1%",
      trend: "up",
      description: "This month",
    },
    {
      title: "Average Efficiency",
      value: "5.35 km/L",
      change: "+1.8%",
      trend: "up",
      description: "This month",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Track and analyze your fleet performance metrics.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.title} className="p-6">
              <p className="text-gray-600 text-sm font-medium mb-2">{metric.title}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{metric.description}</p>
                </div>
                <div className={`flex items-center ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 mr-1" />
                  ) : (
                    <TrendingDown className="w-5 h-5 mr-1" />
                  )}
                  <span className="text-sm font-semibold">{metric.change}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel Usage */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Usage Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Chart visualization here</p>
            </div>
          </Card>

          {/* Distance Trend */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distance Trend</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-600">Chart visualization here</p>
            </div>
          </Card>
        </div>

        {/* Performance Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Drivers */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Drivers</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Driver {i}</p>
                    <p className="text-xs text-gray-600">145 trips this month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">4.8★</p>
                    <p className="text-xs text-gray-600">3,450 km</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Vehicles */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Vehicles</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-200 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">VEH-{String(i).padStart(3, "0")}</p>
                    <p className="text-xs text-gray-600">24 trips this month</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">98%</p>
                    <p className="text-xs text-gray-600">Uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Daily Report", "Weekly Report", "Monthly Report", "Custom Range"].map((report) => (
              <button
                key={report}
                className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
              >
                <p className="text-sm font-medium text-gray-700">{report}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
