"use client";

import { useEffect, useState } from "react";
import { useNavigationStore } from "@/lib/store";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

export default function CustomerDashboardPage() {
  const { setRoute } = useNavigationStore();
  const [isLoading, setIsLoading] = useState(false);

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/customer-dashboard");
  }, [setRoute]);

  // Mock data for charts
  const spendingData = [
    { name: "Jan", revenue: 0 },
    { name: "Feb", revenue: 20 },
    { name: "Mar", revenue: 50 },
    { name: "Apr", revenue: 80 },
    { name: "May", revenue: 120 },
    { name: "Jun", revenue: 150 },
    { name: "Jul", revenue: 180 },
    { name: "Aug", revenue: 210 },
    { name: "Sep", revenue: 250 },
    { name: "Oct", revenue: 280 },
    { name: "Nov", revenue: 310 },
    { name: "Dec", revenue: 350 },
  ];

  const ordersData = [
    { name: "Jan", orders: 3 },
    { name: "Feb", orders: 5 },
    { name: "Mar", orders: 4 },
    { name: "Apr", orders: 7 },
    { name: "May", orders: 2 },
    { name: "Jun", orders: 6 },
    { name: "Jul", orders: 8 },
    { name: "Aug", orders: 5 },
    { name: "Sep", orders: 9 },
    { name: "Oct", orders: 7 },
    { name: "Nov", orders: 4 },
    { name: "Dec", orders: 6 },
  ];

  const ticketsData = [
    { time: "9 AM", tickets: 1 },
    { time: "10 AM", tickets: 2 },
    { time: "11 AM", tickets: 1 },
    { time: "12 PM", tickets: 3 },
    { time: "1 PM", tickets: 2 },
    { time: "2 PM", tickets: 4 },
    { time: "3 PM", tickets: 2 },
    { time: "4 PM", tickets: 1 },
    { time: "5 PM", tickets: 3 },
  ];

  // Summary data
  const summaryData = {
    totalSpending: "$492.8",
    availableRewards: "3",
    totalOrders: "56",
    walletBalance: "$2.3K",
  };

  return (
    <div className="w-full  p-0">
      <div className="w-full max-w-none">
        <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
          {/* Total Spending */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <span className="text-gray-400 text-xs">Total Spending</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summaryData.totalSpending}
            </div>
          </div>

          {/* Available Rewards */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  <path d="M12 2v2" />
                  <path d="M12 6v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 4.93-1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 19.07-1.41-1.41" />
                  <path d="M12 18v2" />
                  <path d="M12 12v2" />
                </svg>
              </div>
              <span className="text-gray-400 text-xs">Available Rewards</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summaryData.availableRewards}
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <span className="text-gray-400 text-xs">Total Orders</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summaryData.totalOrders}
            </div>
          </div>

          {/* Wallet Balance */}
          <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <span className="text-gray-400 text-xs">Wallet Balance</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {summaryData.walletBalance}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Spending Chart - Takes 3 columns */}
          <div className="lg:col-span-3 bg-[#111111] border border-gray-800 rounded-lg p-6">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Total spending</h3>
                  <div className="text-2xl font-bold text-white mb-2">
                    {summaryData.totalSpending}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-gray-400 text-xs">Revenue</span>
                  </div>
                  <div className="bg-gray-800 rounded-md px-2 py-1">
                    <span className="text-gray-300 text-xs">
                      Jan 2024 - Dec 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 relative">
              {/* Highlight point on chart */}
              <div className="absolute top-1/3 left-1/4 z-10">
                <div className="bg-purple-500 rounded-full w-3 h-3 relative">
                  <div className="absolute -top-16 -left-10 bg-purple-600 text-white px-3 py-1 rounded-md text-xs">
                    <div className="font-bold">$125</div>
                    <div className="text-[10px] text-purple-200">
                      Jan 21, 2023
                    </div>
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spendingData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#8b5cf6"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      borderColor: "#374151",
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                    itemStyle={{ color: "#8b5cf6" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column - Two smaller charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Total Orders Chart */}
            <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    <span className="text-gray-400 text-sm">Total Orders</span>
                  </div>
                  <div className="text-xl font-bold text-white">
                    {summaryData.totalOrders}
                  </div>
                </div>
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersData}>
                    <XAxis dataKey="name" stroke="#4b5563" />
                    <YAxis stroke="#4b5563" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#374151",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                      itemStyle={{ color: "#8b5cf6" }}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#8b5cf6"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-gray-400">Last 12 months</div>
                <button className="text-xs text-purple-400 hover:text-purple-300">
                  View report
                </button>
              </div>
            </div>

            {/* Open Tickets Chart */}
            <div className="bg-[#111111] border border-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-gray-400"
                    >
                      <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
                      <path d="M15 3v6h6" />
                    </svg>
                    <span className="text-gray-400 text-sm">Open Tickets</span>
                  </div>
                  <div className="text-xl font-bold text-white">4</div>
                </div>
              </div>

              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ticketsData}>
                    <XAxis dataKey="time" stroke="#4b5563" />
                    <YAxis stroke="#4b5563" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderColor: "#374151",
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                      itemStyle={{ color: "#8b5cf6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tickets"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-between items-center mt-2">
                <div className="text-xs text-green-400">+15%</div>
                <button className="text-xs text-purple-400 hover:text-purple-300">
                  View report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
