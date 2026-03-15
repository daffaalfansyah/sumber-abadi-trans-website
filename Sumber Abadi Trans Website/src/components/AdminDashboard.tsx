import { useState, useEffect } from 'react';
import { LogOut, Users, Truck, MapPin, Package, Calendar, Phone, Mail, Loader, RefreshCw, BarChart3, Settings, Edit2, Save, X, Check, XCircle, Clock } from 'lucide-react';
import logoImage from 'figma:asset/eb1bd1e163b2c0edcf2bc9e05fae5d6d51d8a290.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AdminAnalytics } from './AdminAnalytics';
import { FleetManagement } from './FleetManagement';
import { LogoManagement } from './LogoManagement';

interface CustomerData {
  id: string;
  sender_name: string;
  sender_phone: string;
  sender_email: string;
  sender_address: string;
  sender_kelurahan: string;
  sender_kecamatan: string;
  sender_city: string;
  sender_province: string;
  sender_postal_code: string;
  sender_lat: number;
  sender_lng: number;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  receiver_kelurahan: string;
  receiver_kecamatan: string;
  receiver_city: string;
  receiver_province: string;
  receiver_postal_code: string;
  receiver_lat: number;
  receiver_lng: number;
  estimated_cost: number;
  distance: number;
  weight: number;
  truck_type: string;
  booking_date?: string;
  notes?: string;
  status?: 'pending' | 'approved' | 'declined';
  created_at: string;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'fleet' | 'settings'>('dashboard');
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerData | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/customers`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const customersList: CustomerData[] = data.customers || [];
      
      // Sort by creation date (newest first)
      customersList.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setCustomers(customersList);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Gagal memuat data pelanggan');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (id: string, status: 'pending' | 'approved' | 'declined') => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/customers/${id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ status })
        }
      );

      if (response.ok) {
        await fetchCustomers();
        alert(`Status berhasil diubah menjadi ${status === 'approved' ? 'Disetujui' : status === 'declined' ? 'Ditolak' : 'Menunggu'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Gagal mengupdate status');
    }
  };

  const updateCustomer = async (customer: CustomerData) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/customers/${customer.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(customer)
        }
      );

      if (response.ok) {
        await fetchCustomers();
        setEditingCustomer(null);
        setSelectedCustomer(null);
        alert('Data berhasil diupdate');
      }
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Gagal mengupdate data');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data pelanggan ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/customers/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      if (response.ok) {
        await fetchCustomers();
        setSelectedCustomer(null);
        alert('Data pelanggan berhasil dihapus');
      } else {
        throw new Error('Failed to delete customer');
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Gagal menghapus data pelanggan');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    onLogout();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"><Check className="w-3 h-3" /> Disetujui</span>;
      case 'declined':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"><XCircle className="w-3 h-3" /> Ditolak</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3" /> Menunggu</span>;
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (statusFilter === 'all') return true;
    return (c.status || 'pending') === statusFilter;
  });

  // Only count approved transactions for stats
  const approvedCustomers = customers.filter(c => c.status === 'approved');
  const stats = {
    totalCustomers: customers.length,
    pendingCount: customers.filter(c => (c.status || 'pending') === 'pending').length,
    approvedCount: approvedCustomers.length,
    declinedCount: customers.filter(c => c.status === 'declined').length,
    totalRevenue: approvedCustomers.reduce((sum, c) => sum + c.estimated_cost, 0),
    totalDistance: approvedCustomers.reduce((sum, c) => sum + c.distance, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <img 
                src={logoImage} 
                alt="Sumber Abadi Trans" 
                className="h-10 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <div>
                <h1 className="text-gray-900 text-lg sm:text-xl">Admin Dashboard</h1>
                <p className="text-gray-500 text-xs sm:text-sm">Sumber Abadi Trans</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Navigation Tabs - Mobile Optimized */}
        <div className="mb-6 sm:mb-8 overflow-x-auto">
          <div className="flex items-center gap-2 sm:gap-4 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('fleet')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${activeTab === 'fleet' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <Truck className="w-4 h-4" />
              <span className="hidden sm:inline">Fleet</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Statistics Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg w-fit">
                    <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Total Order</p>
                    <p className="text-gray-900 text-lg sm:text-2xl">{stats.totalCustomers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg w-fit">
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Pending</p>
                    <p className="text-gray-900 text-lg sm:text-2xl">{stats.pendingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg w-fit">
                    <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Disetujui</p>
                    <p className="text-gray-900 text-lg sm:text-2xl">{stats.approvedCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-lg w-fit">
                    <XCircle className="w-4 h-4 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Ditolak</p>
                    <p className="text-gray-900 text-lg sm:text-2xl">{stats.declinedCount}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                    <Package className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Total Pendapatan (Approved)</p>
                    <p className="text-gray-900 text-base sm:text-xl">{formatCurrency(stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                    <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm">Total Jarak (Approved)</p>
                    <p className="text-gray-900 text-lg sm:text-2xl">{stats.totalDistance.toFixed(0)} km</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-gray-900 text-lg sm:text-xl">Data Pelanggan</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola dan review pesanan pelanggan</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Menunggu</option>
                      <option value="approved">Disetujui</option>
                      <option value="declined">Ditolak</option>
                    </select>
                    <button
                      onClick={fetchCustomers}
                      disabled={loading}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat data pelanggan...</p>
                </div>
              ) : error ? (
                <div className="p-12 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchCustomers}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Belum ada data pelanggan{statusFilter !== 'all' ? ` dengan status ${statusFilter}` : ''}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Tanggal
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Pengirim
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Rute
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Truck
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Biaya
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Status
                        </th>
                        <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{new Date(customer.created_at).toLocaleDateString('id-ID')}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{customer.sender_name}</div>
                            <div className="text-xs text-gray-500">{customer.sender_phone}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{customer.sender_city}</div>
                            <div className="text-xs text-gray-500">→ {customer.receiver_city}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{customer.truck_type}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900">{formatCurrency(customer.estimated_cost)}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(customer.status)}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Analytics Content - Only show approved transactions */}
        {activeTab === 'analytics' && (
          <AdminAnalytics customers={approvedCustomers.map(c => ({
            id: c.id,
            truckType: c.truck_type,
            estimatedCost: c.estimated_cost,
            createdAt: c.created_at,
            bookingDate: c.booking_date
          }))} />
        )}

        {/* Fleet Management Content */}
        {activeTab === 'fleet' && (
          <FleetManagement />
        )}

        {/* Settings Content */}
        {activeTab === 'settings' && (
          <LogoManagement />
        )}
      </main>

      {/* Detail/Edit Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto" onClick={() => {
          setSelectedCustomer(null);
          setEditingCustomer(null);
        }}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-900 text-lg sm:text-xl">Detail Pesanan</h3>
                  <p className="text-gray-500 text-sm mt-1">{formatDate(selectedCustomer.created_at)}</p>
                </div>
                {!editingCustomer && (
                  <button
                    onClick={() => setEditingCustomer({...selectedCustomer})}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Status Management */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-gray-900 mb-3 text-sm sm:text-base">Status Pesanan</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'pending')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm ${(selectedCustomer.status || 'pending') === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                  >
                    <Clock className="w-4 h-4" />
                    Menunggu
                  </button>
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'approved')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedCustomer.status === 'approved' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                  >
                    <Check className="w-4 h-4" />
                    Setujui
                  </button>
                  <button
                    onClick={() => updateCustomerStatus(selectedCustomer.id, 'declined')}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm ${selectedCustomer.status === 'declined' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </button>
                </div>
              </div>

              {editingCustomer ? (
                // Edit Mode
                <>
                  {/* Sender Info - Edit */}
                  <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                    <h4 className="text-gray-900 mb-4 text-sm sm:text-base">Informasi Pengirim</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Nama</label>
                        <input
                          type="text"
                          value={editingCustomer.sender_name}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Telepon</label>
                        <input
                          type="text"
                          value={editingCustomer.sender_phone}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 text-sm mb-2">Email</label>
                        <input
                          type="email"
                          value={editingCustomer.sender_email}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 text-sm mb-2">Alamat</label>
                        <input
                          type="text"
                          value={editingCustomer.sender_address}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Kota</label>
                        <input
                          type="text"
                          value={editingCustomer.sender_city}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Provinsi</label>
                        <input
                          type="text"
                          value={editingCustomer.sender_province}
                          onChange={(e) => setEditingCustomer({...editingCustomer, sender_province: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Receiver Info - Edit */}
                  <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200">
                    <h4 className="text-gray-900 mb-4 text-sm sm:text-base">Informasi Penerima</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Nama</label>
                        <input
                          type="text"
                          value={editingCustomer.receiver_name}
                          onChange={(e) => setEditingCustomer({...editingCustomer, receiver_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Telepon</label>
                        <input
                          type="text"
                          value={editingCustomer.receiver_phone}
                          onChange={(e) => setEditingCustomer({...editingCustomer, receiver_phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 text-sm mb-2">Alamat</label>
                        <input
                          type="text"
                          value={editingCustomer.receiver_address}
                          onChange={(e) => setEditingCustomer({...editingCustomer, receiver_address: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Kota</label>
                        <input
                          type="text"
                          value={editingCustomer.receiver_city}
                          onChange={(e) => setEditingCustomer({...editingCustomer, receiver_city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Provinsi</label>
                        <input
                          type="text"
                          value={editingCustomer.receiver_province}
                          onChange={(e) => setEditingCustomer({...editingCustomer, receiver_province: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details - Edit */}
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <h4 className="text-gray-900 mb-4 text-sm sm:text-base">Detail Pengiriman</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Berat (ton)</label>
                        <input
                          type="number"
                          value={editingCustomer.weight}
                          onChange={(e) => setEditingCustomer({...editingCustomer, weight: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Jenis Truck</label>
                        <input
                          type="text"
                          value={editingCustomer.truck_type}
                          onChange={(e) => setEditingCustomer({...editingCustomer, truck_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Estimasi Biaya</label>
                        <input
                          type="number"
                          value={editingCustomer.estimated_cost}
                          onChange={(e) => setEditingCustomer({...editingCustomer, estimated_cost: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm mb-2">Tanggal Booking</label>
                        <input
                          type="date"
                          value={editingCustomer.booking_date || ''}
                          onChange={(e) => setEditingCustomer({...editingCustomer, booking_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-700 text-sm mb-2">Catatan</label>
                        <textarea
                          value={editingCustomer.notes || ''}
                          onChange={(e) => setEditingCustomer({...editingCustomer, notes: e.target.value})}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => {
                        updateCustomer(editingCustomer);
                      }}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Simpan Perubahan
                    </button>
                    <button
                      onClick={() => setEditingCustomer(null)}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Batal
                    </button>
                  </div>
                </>
              ) : (
                // View Mode
                <>
                  {/* Sender Info - View */}
                  <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200">
                    <h4 className="text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Informasi Pengirim
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Nama</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.sender_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Telepon</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.sender_phone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-gray-600 text-xs sm:text-sm">Email</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.sender_email}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-gray-600 text-xs sm:text-sm">Alamat Lengkap</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.sender_address}, {selectedCustomer.sender_city}, {selectedCustomer.sender_province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Info - View */}
                  <div className="bg-red-50 rounded-lg p-4 sm:p-6 border border-red-200">
                    <h4 className="text-gray-900 mb-4 flex items-center gap-2 text-sm sm:text-base">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      Informasi Penerima
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Nama</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.receiver_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Telepon</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.receiver_phone}</p>
                      </div>
                      <div className="sm:col-span-2">
                        <p className="text-gray-600 text-xs sm:text-sm">Alamat Lengkap</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.receiver_address}, {selectedCustomer.receiver_city}, {selectedCustomer.receiver_province}</p>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info - View */}
                  <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <h4 className="text-gray-900 mb-4 text-sm sm:text-base">Detail Pengiriman</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Jarak</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.distance.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Berat</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.weight} ton</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Truck</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.truck_type}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Biaya</p>
                        <p className="text-gray-900 text-sm sm:text-base">{formatCurrency(selectedCustomer.estimated_cost)}</p>
                      </div>
                    </div>
                    {selectedCustomer.booking_date && (
                      <div className="mt-4">
                        <p className="text-gray-600 text-xs sm:text-sm">Tanggal Booking</p>
                        <p className="text-gray-900 text-sm sm:text-base">{new Date(selectedCustomer.booking_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    )}
                    {selectedCustomer.notes && (
                      <div className="mt-4">
                        <p className="text-gray-600 text-xs sm:text-sm">Catatan</p>
                        <p className="text-gray-900 text-sm sm:text-base">{selectedCustomer.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <button
                      onClick={() => {
                        deleteCustomer(selectedCustomer.id);
                      }}
                      className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setEditingCustomer(null);
                }}
                className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Tutup
              </button>
              <a
                href={`https://wa.me/${selectedCustomer.sender_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}