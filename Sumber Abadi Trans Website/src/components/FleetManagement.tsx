import { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";

interface Fleet {
  id: string;
  name: string;
  capacity: number;
  dimension?: string;
  basePrice: number;
  pricePerKm: number;
  pricePerTon: number;
  description: string;
  imageUrl?: string;
  imageData?: string | null;
}

export function FleetManagement() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(
    null,
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Fleet>>({
    name: "",
    capacity: 0,
    dimension: "",
    basePrice: 0,
    pricePerKm: 0,
    pricePerTon: 0,
    description: "",
    imageUrl: "",
    imageData: null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  useEffect(() => {
    fetchFleets();
  }, []);

  const fetchFleets = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check localStorage first
      const savedFleets = localStorage.getItem('sumberabaditrans_fleets');
      if (savedFleets) {
        setFleets(JSON.parse(savedFleets));
        setUseLocalStorage(true);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setFleets(data.fleets || []);
        setUseLocalStorage(false);
      } else if (response.status === 404) {
        // Edge function not deployed yet, use default fleets and enable localStorage
        console.warn('Edge function not found (404). Using localStorage for persistence.');
        const defaultFleets = getDefaultFleets();
        setFleets(defaultFleets);
        localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(defaultFleets));
        setUseLocalStorage(true);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch fleets:', response.status, errorText);
        const defaultFleets = getDefaultFleets();
        setFleets(defaultFleets);
        localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(defaultFleets));
        setUseLocalStorage(true);
      }
    } catch (error) {
      // Network error or Edge Function not available, use default fleets and enable localStorage
      console.warn('Failed to fetch fleets, using localStorage:', error);
      const defaultFleets = getDefaultFleets();
      setFleets(defaultFleets);
      localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(defaultFleets));
      setUseLocalStorage(true);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultFleets = (): Fleet[] => [
    {
      id: 'fleet_default_1',
      name: 'Truk Engkel CDD',
      capacity: 3.5,
      dimension: '4.3m x 1.8m x 1.8m',
      basePrice: 1500000,
      pricePerKm: 25000,
      pricePerTon: 100000,
      description: 'Cocok untuk pengiriman barang dalam kota dengan kapasitas sedang',
      imageUrl: 'https://images.unsplash.com/photo-1579120632007-f493373daed0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHRydWNrfGVufDF8fHx8MTczNzYyMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      imageData: null
    },
    {
      id: 'fleet_default_2',
      name: 'Truk Fuso',
      capacity: 8,
      dimension: '6.2m x 2.3m x 2.3m',
      basePrice: 2500000,
      pricePerKm: 35000,
      pricePerTon: 150000,
      description: 'Ideal untuk pengiriman antar kota dengan kapasitas besar',
      imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHx0cnVjayUyMGxvcnJ5fGVufDF8fHx8MTczNzYyMDAwMHww&ixlib=rb-4.1.0&q=80&w=1080',
      imageData: null
    },
    {
      id: 'fleet_default_3',
      name: 'Truk Tronton',
      capacity: 15,
      dimension: '9m x 2.5m x 2.5m',
      basePrice: 3500000,
      pricePerKm: 45000,
      pricePerTon: 200000,
      description: 'Untuk pengiriman barang berat dan volume besar',
      imageUrl: 'https://images.unsplash.com/photo-1591768575886-b9e2c5e9a9e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxiaWclMjB0cnVja3xlbnwxfHx8fDE3Mzc2MjAwMDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      imageData: null
    }
  ];

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }

      setImageFile(file);
      
      // Convert to base64 for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData({ 
          ...formData, 
          imageData: base64String,
          imageUrl: '' // Clear URL when using uploaded image
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.capacity) {
      alert("Nama dan kapasitas wajib diisi");
      return;
    }

    // Add to localStorage if using it
    if (useLocalStorage) {
      const newFleet: Fleet = {
        id: `fleet_${Date.now()}`,
        name: formData.name || '',
        capacity: formData.capacity || 0,
        dimension: formData.dimension,
        basePrice: formData.basePrice || 0,
        pricePerKm: formData.pricePerKm || 0,
        pricePerTon: formData.pricePerTon || 0,
        description: formData.description || '',
        imageUrl: formData.imageUrl,
        imageData: formData.imageData,
      };
      
      const updatedFleets = [...fleets, newFleet];
      setFleets(updatedFleets);
      localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(updatedFleets));
      setShowAddForm(false);
      resetForm();
      alert("Armada berhasil ditambahkan");
      return;
    }

    // Otherwise try Edge Function
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        await fetchFleets();
        setShowAddForm(false);
        resetForm();
        alert("Armada berhasil ditambahkan");
      } else {
        throw new Error('Failed to add fleet');
      }
    } catch (error) {
      console.error("Error adding fleet:", error);
      alert("Gagal menambahkan armada. Edge Function belum tersedia.");
    }
  };

  const handleUpdate = async (id: string) => {
    // Update in localStorage if using it
    if (useLocalStorage) {
      const updatedFleets = fleets.map(fleet => 
        fleet.id === id ? { ...fleet, ...formData } as Fleet : fleet
      );
      setFleets(updatedFleets);
      localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(updatedFleets));
      setEditingId(null);
      resetForm();
      alert("Armada berhasil diupdate");
      return;
    }

    // Otherwise try Edge Function
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (response.ok) {
        await fetchFleets();
        setEditingId(null);
        resetForm();
        alert("Armada berhasil diupdate");
      } else {
        throw new Error('Failed to update fleet');
      }
    } catch (error) {
      console.error("Error updating fleet:", error);
      alert("Gagal mengupdate armada. Edge Function belum tersedia.");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm("Apakah Anda yakin ingin menghapus armada ini?")
    ) {
      return;
    }

    // Delete from localStorage if using it
    if (useLocalStorage) {
      const updatedFleets = fleets.filter(fleet => fleet.id !== id);
      setFleets(updatedFleets);
      localStorage.setItem('sumberabaditrans_fleets', JSON.stringify(updatedFleets));
      alert("Armada berhasil dihapus");
      return;
    }

    // Otherwise try Edge Function
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        },
      );

      if (response.ok) {
        await fetchFleets();
        alert("Armada berhasil dihapus");
      } else {
        throw new Error('Failed to delete fleet');
      }
    } catch (error) {
      console.error("Error deleting fleet:", error);
      alert("Gagal menghapus armada. Edge Function belum tersedia.");
    }
  };

  const startEdit = (fleet: Fleet) => {
    setEditingId(fleet.id);
    setFormData(fleet);
    if (fleet.imageData) {
      setImagePreview(fleet.imageData);
    } else if (fleet.imageUrl) {
      setImagePreview(fleet.imageUrl);
    } else {
      setImagePreview('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      capacity: 0,
      dimension: "",
      basePrice: 0,
      pricePerKm: 0,
      pricePerTon: 0,
      description: "",
      imageUrl: "",
      imageData: null,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getFleetImage = (fleet: Fleet) => {
    if (fleet.imageData) {
      return fleet.imageData;
    }
    if (fleet.imageUrl) {
      return fleet.imageUrl;
    }
    return '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-gray-900 flex items-center gap-2 text-lg sm:text-xl">
            <Truck className="w-5 h-5 text-blue-600" />
            Manajemen Armada
          </h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Tambah Armada
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-gray-900 mb-4">
              Tambah Armada Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Nama Armada *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Contoh: Fuso Wing Box"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Kapasitas (ton) *
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: Number(e.target.value),
                    })
                  }
                  placeholder="Contoh: 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Dimensi
                </label>
                <input
                  type="text"
                  value={formData.dimension}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dimension: e.target.value,
                    })
                  }
                  placeholder="Contoh: 6.0m x 2.2m x 2.2m"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Harga Dasar (IDR)
                </label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      basePrice: Number(e.target.value),
                    })
                  }
                  placeholder="Contoh: 500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Harga per KM (IDR)
                </label>
                <input
                  type="number"
                  value={formData.pricePerKm}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerKm: Number(e.target.value),
                    })
                  }
                  placeholder="Contoh: 5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Harga per Ton (IDR)
                </label>
                <input
                  type="number"
                  value={formData.pricePerTon}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerTon: Number(e.target.value),
                    })
                  }
                  placeholder="Contoh: 50000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Upload Gambar
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Pilih Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData({ ...formData, imageData: null });
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Format: JPG, PNG. Maksimal 5MB
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  placeholder="Deskripsi armada..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Simpan
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>
        )}

        {/* Fleet List */}
        {loading ? (
          <div className="text-center py-12 text-gray-600">
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            {error}
          </div>
        ) : fleets.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>
              Belum ada armada. Klik "Tambah Armada" untuk
              menambahkan.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {fleets.map((fleet) => (
              <div
                key={fleet.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                {editingId === fleet.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Nama Armada
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Kapasitas (ton)
                        </label>
                        <input
                          type="number"
                          value={formData.capacity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              capacity: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Dimensi
                        </label>
                        <input
                          type="text"
                          value={formData.dimension}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dimension: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Harga Dasar (IDR)
                        </label>
                        <input
                          type="number"
                          value={formData.basePrice}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              basePrice: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Harga per KM (IDR)
                        </label>
                        <input
                          type="number"
                          value={formData.pricePerKm}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerKm: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 mb-2">
                          Harga per Ton (IDR)
                        </label>
                        <input
                          type="number"
                          value={formData.pricePerTon}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              pricePerTon: Number(e.target.value),
                            })
                          }
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2">
                          Upload Gambar Baru
                        </label>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <Upload className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">Pilih Gambar</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          {imagePreview && (
                            <div className="relative">
                              <img
                                src={imagePreview}
                                alt="Preview"
                                className="h-20 w-32 object-cover rounded-lg border border-gray-300"
                              />
                              <button
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview("");
                                  setFormData({ ...formData, imageData: null, imageUrl: '' });
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-gray-700 mb-2">
                          Deskripsi
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleUpdate(fleet.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="w-4 h-4" />
                        Simpan
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <X className="w-4 h-4" />
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode - Mobile Optimized
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-full sm:w-32 h-48 sm:h-24">
                      {getFleetImage(fleet) ? (
                        <img
                          src={getFleetImage(fleet)}
                          alt={fleet.name}
                          className="w-full h-full object-cover rounded-lg border border-gray-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 w-full">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <Truck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <h4 className="text-gray-900 text-base sm:text-lg">
                            {fleet.name}
                          </h4>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => startEdit(fleet)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(fleet.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 text-xs">
                            Kapasitas:
                          </span>
                          <p className="text-gray-900 font-medium">
                            {fleet.capacity} ton
                          </p>
                        </div>
                        {fleet.dimension && (
                          <div>
                            <span className="text-gray-600 text-xs">
                              Dimensi:
                            </span>
                            <p className="text-gray-900 font-medium text-xs sm:text-sm">
                              {fleet.dimension}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600 text-xs">
                            Harga Dasar:
                          </span>
                          <p className="text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(fleet.basePrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">
                            Per KM:
                          </span>
                          <p className="text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(fleet.pricePerKm)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 text-xs">
                            Per Ton:
                          </span>
                          <p className="text-gray-900 font-medium text-xs sm:text-sm">
                            {formatCurrency(fleet.pricePerTon)}
                          </p>
                        </div>
                      </div>
                      {fleet.description && (
                        <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                          {fleet.description}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}