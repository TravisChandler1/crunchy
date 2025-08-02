"use client";
import { useState, useEffect } from "react";
import { FaChartLine, FaUsers, FaShoppingCart, FaStar, FaTruck, FaCalendarAlt, FaDownload } from "react-icons/fa";

type AnalyticsData = {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  customerSatisfaction: number;
  deliveryPerformance: number;
  topProducts: { name: string; sales: number; revenue: number }[];
  revenueByMonth: { month: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  customerRetention: number;
  peakHours: { hour: number; orders: number }[];
};

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?days=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch(`/api/analytics/export?days=${dateRange}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${dateRange}days.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7ed957]"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-gray-500 py-8">
        Failed to load analytics data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#7ed957]">Analytics Dashboard</h2>
        <div className="flex gap-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-[#7ed957] rounded-lg bg-black/10 text-[#7ed957]"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-[#7ed957] text-white rounded-lg hover:bg-[#45523e] transition flex items-center gap-2"
          >
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7ed957] text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₦{analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <FaChartLine className="text-[#7ed957] text-2xl" />
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7ed957] text-sm font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-white">{analytics.totalOrders}</p>
            </div>
            <FaShoppingCart className="text-[#7ed957] text-2xl" />
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7ed957] text-sm font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">₦{analytics.averageOrderValue.toLocaleString()}</p>
            </div>
            <FaUsers className="text-[#7ed957] text-2xl" />
          </div>
        </div>

        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#7ed957] text-sm font-medium">Customer Satisfaction</p>
              <p className="text-2xl font-bold text-white">{analytics.customerSatisfaction.toFixed(1)}/5</p>
            </div>
            <FaStar className="text-[#7ed957] text-2xl" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue/Orders Chart */}
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-[#7ed957]">Revenue & Orders Trend</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('revenue')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedMetric === 'revenue' 
                    ? 'bg-[#7ed957] text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setSelectedMetric('orders')}
                className={`px-3 py-1 rounded text-sm ${
                  selectedMetric === 'orders' 
                    ? 'bg-[#7ed957] text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                Orders
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.revenueByMonth.map((data, index) => {
              const value = selectedMetric === 'revenue' ? data.revenue : data.orders;
              const maxValue = Math.max(
                ...analytics.revenueByMonth.map(d => 
                  selectedMetric === 'revenue' ? d.revenue : d.orders
                )
              );
              const height = (value / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-[#7ed957] rounded-t w-full min-h-[4px] transition-all duration-500"
                    style={{ height: `${height}%` }}
                    title={`${data.month}: ${selectedMetric === 'revenue' ? '₦' + value.toLocaleString() : value}`}
                  />
                  <span className="text-xs text-[#7ed957] mt-2 transform -rotate-45 origin-left">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <h3 className="text-lg font-bold text-[#7ed957] mb-4">Top Products</h3>
          <div className="space-y-3">
            {analytics.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">{product.name}</p>
                  <p className="text-[#7ed957] text-sm">{product.sales} sales</p>
                </div>
                <p className="text-white font-bold">₦{product.revenue.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <h3 className="text-lg font-bold text-[#7ed957] mb-4">Order Status</h3>
          <div className="space-y-3">
            {analytics.ordersByStatus.map((status, index) => {
              const total = analytics.ordersByStatus.reduce((sum, s) => sum + s.count, 0);
              const percentage = (status.count / total) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#7ed957] capitalize">{status.status}</span>
                    <span className="text-white">{status.count}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-[#7ed957] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <h3 className="text-lg font-bold text-[#7ed957] mb-4">Peak Order Hours</h3>
          <div className="h-32 flex items-end justify-between gap-1">
            {analytics.peakHours.map((hour, index) => {
              const maxOrders = Math.max(...analytics.peakHours.map(h => h.orders));
              const height = (hour.orders / maxOrders) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-[#7ed957] rounded-t w-full min-h-[2px]"
                    style={{ height: `${height}%` }}
                    title={`${hour.hour}:00 - ${hour.orders} orders`}
                  />
                  <span className="text-xs text-[#7ed957] mt-1">
                    {hour.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-black/40 rounded-xl p-6 border border-[#7ed957]">
          <h3 className="text-lg font-bold text-[#7ed957] mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#7ed957]">Delivery Performance</span>
                <span className="text-white">{analytics.deliveryPerformance}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${analytics.deliveryPerformance}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#7ed957]">Customer Retention</span>
                <span className="text-white">{analytics.customerRetention}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${analytics.customerRetention}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}