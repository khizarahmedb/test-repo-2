"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { getDashboard } from "@/lib/api";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

export default function AdminDashboardPage() {
  const { setRoute } = useNavigationStore();
  const { user } = useUserStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/admin-dashboard");
  }, [setRoute]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        console.log("Fetching dashboard data with token:", user.token);

        const response = await getDashboard(user.token);
        console.log("Dashboard API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError === true) {
          const errorMessage =
            response.message || "Failed to load dashboard data";
          toast.error("Failed to load dashboard", {
            description: errorMessage,
          });
          setDashboardData(null); // Set to null to show empty state
          return;
        }

        // Set the dashboard data
        setDashboardData(response);
        toast.success("Dashboard loaded successfully");
      } catch (error) {
        console.error("Error fetching dashboard data:", error);

        // Handle different types of errors
        let errorMessage = "Failed to load dashboard data";

        if (error.response?.data?.hasError === true) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        toast.error("Failed to load dashboard", {
          description: errorMessage,
        });
        setDashboardData(null); // Set to null to show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.token]);

  // Mock chart data for demonstration (since API doesn't provide chart data)
  const revenueChartData = [
    { month: "Jan", revenue: 0, expenses: 0 },
    { month: "Feb", revenue: 0, expenses: 0 },
    { month: "Mar", revenue: 0, expenses: 0 },
    { month: "Apr", revenue: 0, expenses: 0 },
    { month: "May", revenue: 0, expenses: 0 },
    { month: "Jun", revenue: 0, expenses: 0 },
  ];

  const profitChartData = [
    { month: "Jan", profit: 0 },
    { month: "Feb", profit: 0 },
    { month: "Mar", profit: 0 },
    { month: "Apr", profit: 0 },
    { month: "May", profit: 0 },
    { month: "Jun", profit: 0 },
    { month: "Jul", profit: 0 },
    { month: "Aug", profit: 0 },
    { month: "Sep", profit: 0 },
    { month: "Oct", profit: 0 },
    { month: "Nov", profit: 0 },
    { month: "Dec", profit: 0 },
  ];

  const ordersChartData = [
    { day: "1", orders: 0 },
    { day: "2", orders: 0 },
    { day: "3", orders: 0 },
    { day: "4", orders: 0 },
    { day: "5", orders: 0 },
    { day: "6", orders: 0 },
    { day: "7", orders: 0 },
  ];

  // Extract data from API response
  const getMetricValue = (field, defaultValue = 0) => {
    if (!dashboardData?.body) return defaultValue;
    return dashboardData.body[field] || defaultValue;
  };

  const formatNumber = (num) => {
    const number = Number(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + "K";
    }
    return number.toString();
  };

  const formatCurrency = (num) => {
    const number = Number(num);
    if (number >= 1000000) {
      return "$" + (number / 1000000).toFixed(1) + "M";
    } else if (number >= 1000) {
      return "$" + (number / 1000).toFixed(1) + "K";
    }
    return "$" + number.toString();
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full    p-6">
        <div className="w-full max-w-none">
          <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="text-white">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full   ">
      <div className="w-full max-w-none">
        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>

        {/* Top Row Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Open Tickets */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Open Tickets</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(getMetricValue("total_tickets"))}
            </div>
          </div>

          {/* Total Products Sold */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Total Products Sold</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(getMetricValue("total_products_sold"))}
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Total Products</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(getMetricValue("total_products"))}
            </div>
          </div>

          {/* Total Customers */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Total Customers</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(getMetricValue("total_customers"))}
            </div>
          </div>
        </div>

        {/* Second Row Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* New Orders */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">New Orders</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(getMetricValue("new_orders"))}
            </div>
          </div>

          {/* Total Profit */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-purple-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Total Profit</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(getMetricValue("total_profit"))}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(getMetricValue("total_revenue"))}
            </div>
          </div>

          {/* Customer Spendings */}
          <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
              <span className="text-gray-400 text-sm">Customer Spendings</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(getMetricValue("total_customer_spendings"))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Revenue Chart - Takes 2 columns */}
          <div className="lg:col-span-2 bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
            <div className="mb-4">
              <h3 className="text-gray-400 text-sm mb-1">Total revenue</h3>
              <div className="text-2xl font-bold text-white mb-4">
                {formatCurrency(getMetricValue("total_revenue"))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm">Expenses</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-gray-400 text-sm">
                    Jan 2020 - Dec 2020
                  </span>
                </div>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Two smaller charts */}
          <div className="space-y-6">
            {/* Total Profit Chart */}
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
                    <span className="text-gray-400 text-sm">Total profit</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {formatCurrency(getMetricValue("total_profit"))}
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-400 mb-2">Last 12 months</div>
              <div className="h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={profitChartData}>
                    <Bar
                      dataKey="profit"
                      fill="#8B5CF6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="text-right">
                <button className="text-purple-400 text-xs hover:text-purple-300">
                  View report
                </button>
              </div>
            </div>

            {/* New Orders Chart */}
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 border border-gray-500 rounded-sm"></div>
                <span className="text-gray-400 text-sm">New Orders</span>
              </div>
              <div className="text-xl font-bold text-white mb-4">
                {formatNumber(getMetricValue("new_orders"))}
              </div>

              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ordersChartData}>
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
