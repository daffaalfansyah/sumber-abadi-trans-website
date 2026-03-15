import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar as CalendarIcon, Truck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface CustomerData {
  id: string;
  truckType: string;
  estimatedCost: number;
  createdAt: string;
  bookingDate?: string;
}

interface AdminAnalyticsProps {
  customers: CustomerData[];
}

export function AdminAnalytics({ customers }: AdminAnalyticsProps) {
  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Get available years from customer data
  const availableYears = Array.from(
    new Set(customers.map(c => new Date(c.createdAt).getFullYear()))
  ).sort((a, b) => b - a);

  // Filter customers based on selected period
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      const date = new Date(customer.createdAt);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (filterType === 'year') {
        return year === selectedYear;
      } else {
        return year === selectedYear && month === selectedMonth;
      }
    });
  };

  // Generate chart data for line chart
  const getChartData = () => {
    const filteredCustomers = getFilteredCustomers();

    if (filterType === 'month') {
      // Group by day
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const data = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayCustomers = filteredCustomers.filter(c => {
          const date = new Date(c.createdAt);
          return date.getDate() === day;
        });

        data.push({
          name: `${day}`,
          transaksi: dayCustomers.length,
          pendapatan: dayCustomers.reduce((sum, c) => sum + c.estimatedCost, 0)
        });
      }

      return data;
    } else {
      // Group by month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const data = [];

      for (let month = 0; month < 12; month++) {
        const monthCustomers = filteredCustomers.filter(c => {
          const date = new Date(c.createdAt);
          return date.getMonth() === month;
        });

        data.push({
          name: months[month],
          transaksi: monthCustomers.length,
          pendapatan: monthCustomers.reduce((sum, c) => sum + c.estimatedCost, 0)
        });
      }

      return data;
    }
  };

  // Get truck type statistics
  const getTruckTypeStats = () => {
    const filteredCustomers = getFilteredCustomers();
    const truckCounts: { [key: string]: number } = {};

    filteredCustomers.forEach(customer => {
      const truckType = customer.truckType || 'Unknown';
      truckCounts[truckType] = (truckCounts[truckType] || 0) + 1;
    });

    return Object.entries(truckCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const chartData = getChartData();
  const truckTypeStats = getTruckTypeStats();
  const filteredCustomers = getFilteredCustomers();
  const totalRevenue = filteredCustomers.reduce((sum, c) => sum + c.estimatedCost, 0);
  const mostUsedTruck = truckTypeStats[0]?.name || 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <h3 className="text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Statistik & Analitik
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'month' | 'year')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">Per Bulan</option>
              <option value="year">Per Tahun</option>
            </select>

            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {availableYears.length > 0 ? (
                availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              )}
            </select>

            {/* Month Selector */}
            {filterType === 'month' && (
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Transaksi</p>
              <p className="text-gray-900 text-2xl">{filteredCustomers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Pendapatan</p>
              <p className="text-gray-900 text-lg">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Truck Terpopuler</p>
              <p className="text-gray-900">{mostUsedTruck}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart - Transaksi */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h4 className="text-gray-900 mb-6 text-sm sm:text-base">Grafik Transaksi</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              label={{ value: filterType === 'month' ? 'Tanggal' : 'Bulan', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Jumlah Transaksi', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="transaksi" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Transaksi"
              dot={{ fill: '#3b82f6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Pendapatan */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h4 className="text-gray-900 mb-6 text-sm sm:text-base">Grafik Pendapatan</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              label={{ value: filterType === 'month' ? 'Tanggal' : 'Bulan', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Pendapatan (IDR)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Line 
              type="monotone" 
              dataKey="pendapatan" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Pendapatan"
              dot={{ fill: '#10b981', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart - Truck Types */}
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <h4 className="text-gray-900 mb-6 text-sm sm:text-base">Penggunaan Jenis Truck</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={truckTypeStats} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="value" fill="#8b5cf6" name="Jumlah Penggunaan" />
          </BarChart>
        </ResponsiveContainer>

        {/* Truck Type List */}
        <div className="mt-6 space-y-2">
          {truckTypeStats.map((truck, index) => {
            const percentage = ((truck.value / filteredCustomers.length) * 100).toFixed(1);
            return (
              <div key={truck.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-gray-900 font-medium">#{index + 1}</span>
                  <span className="text-gray-900">{truck.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{truck.value} transaksi</span>
                  <span className="text-purple-600 font-medium">{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}