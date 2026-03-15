import { useState, useEffect } from 'react';
import { MapSelector } from './MapSelector';
import { ConfirmationForm } from './ConfirmationForm';
import { Calculator, MapPin, Package, Truck } from 'lucide-react';
import logoImage from 'figma:asset/eb1bd1e163b2c0edcf2bc9e05fae5d6d51d8a290.png';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Fleet {
  id: string;
  name: string;
  capacity: number;
  pricePerKm: number;
  basePrice: number;
}

export function CostEstimator() {
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [truckType, setTruckType] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loadingFleets, setLoadingFleets] = useState(true);
  const [errorFleets, setErrorFleets] = useState<string | null>(null);

  useEffect(() => {
    fetchFleets();
  }, []);

  const fetchFleets = async () => {
    setLoadingFleets(true);
    setErrorFleets(null);
    try {
      // Check localStorage first
      const savedFleets = localStorage.getItem('sumberabaditrans_fleets');
      if (savedFleets) {
        setFleets(JSON.parse(savedFleets));
        setLoadingFleets(false);
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
      } else if (response.status === 404) {
        // Edge function not deployed yet, use default fleets silently
        setFleets(getDefaultFleets());
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch fleets:', response.status, errorText);
        setFleets(getDefaultFleets());
      }
    } catch (error) {
      // Network error or Edge Function not available, use default fleets silently
      setFleets(getDefaultFleets());
    } finally {
      setLoadingFleets(false);
    }
  };

  const getDefaultFleets = (): Fleet[] => [
    {
      id: 'fleet_default_1',
      name: 'Truk Engkel CDD',
      capacity: 3.5,
      pricePerKm: 25000,
      basePrice: 1500000,
    },
    {
      id: 'fleet_default_2',
      name: 'Truk Fuso',
      capacity: 8,
      pricePerKm: 35000,
      basePrice: 2500000,
    },
    {
      id: 'fleet_default_3',
      name: 'Truk Tronton',
      capacity: 15,
      pricePerKm: 45000,
      basePrice: 3500000,
    }
  ];

  const formatCapacity = (capacity: number) => {
    if (capacity <= 3) {
      return `2-${capacity} Ton`;
    } else if (capacity <= 5) {
      return `${capacity - 1}-${capacity} Ton`;
    } else {
      return `${capacity - 2}-${capacity} Ton`;
    }
  };

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    // Haversine formula to calculate distance in km
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleCalculate = () => {
    if (!origin || !destination || !weight || !truckType) {
      alert('Mohon lengkapi semua field');
      return;
    }

    const selectedTruck = fleets.find(f => f.id === truckType);
    if (!selectedTruck) return;

    const weightNum = parseFloat(weight);
    if (weightNum > selectedTruck.capacity) {
      alert(`Berat barang melebihi kapasitas maksimal truck (${selectedTruck.capacity} ton)`);
      return;
    }

    const dist = calculateDistance(origin, destination);
    setDistance(dist);

    // Calculate cost: price per km * distance + weight factor
    const weightFactor = 1 + (weightNum / selectedTruck.capacity) * 0.3; // 30% increase for max weight
    const baseCost = selectedTruck.pricePerKm * dist;
    const totalCost = Math.round(baseCost * weightFactor) + selectedTruck.basePrice;

    setEstimatedCost(totalCost);
  };

  const handleReset = () => {
    setOrigin(null);
    setDestination(null);
    setWeight('');
    setTruckType('');
    setEstimatedCost(null);
    setDistance(null);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
              <img 
                src={logoImage} 
                alt="Sumber Abadi Trans" 
                className="h-16 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
          <h2 className="text-gray-900 mb-4">Kalkulator Estimasi Biaya</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hitung estimasi biaya pengiriman dengan memasukkan detail pengiriman Anda
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Map Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Pilih Lokasi Pengiriman
            </h3>
            <MapSelector
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
            />
          </div>

          {/* Input Form */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Detail Pengiriman
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="weight" className="block text-gray-700 mb-2">
                  Berat Barang (Ton)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Contoh: 2.5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="truckType" className="block text-gray-700 mb-2">
                  Jenis Truck
                </label>
                <select
                  id="truckType"
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loadingFleets}
                >
                  <option value="">
                    {loadingFleets ? 'Memuat...' : 'Pilih Jenis Truck'}
                  </option>
                  {fleets.map((fleet) => (
                    <option key={fleet.id} value={fleet.id}>
                      {fleet.name} ({formatCapacity(fleet.capacity)})
                    </option>
                  ))}
                </select>
                {errorFleets && (
                  <p className="text-red-500 text-sm mt-1">{errorFleets}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Calculator className="w-5 h-5" />
                Hitung Estimasi
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Estimation Result */}
          {estimatedCost !== null && distance !== null && (
            <>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 mb-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-8 h-8 text-blue-600" />
                  <h3 className="text-gray-900">Hasil Estimasi</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Jarak Tempuh</p>
                    <p className="text-gray-900">{distance.toFixed(1)} km</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Berat Barang</p>
                    <p className="text-gray-900">{weight} ton</p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-gray-600 mb-1">Jenis Truck</p>
                    <p className="text-gray-900">
                      {fleets.find(f => f.id === truckType)?.name}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 text-center border-2 border-blue-300">
                  <p className="text-gray-600 mb-2">Estimasi Biaya Pengiriman</p>
                  <p className="text-blue-600">
                    Rp {estimatedCost.toLocaleString('id-ID')}
                  </p>
                  <p className="text-gray-500 mt-2">
                    * Harga dapat berubah sesuai kondisi lapangan
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Confirmation Form */}
          {estimatedCost !== null && (
            <ConfirmationForm
              estimatedCost={estimatedCost}
              distance={distance!}
              weight={parseFloat(weight)}
              truckType={fleets.find(f => f.id === truckType)!.name}
              origin={origin!}
              destination={destination!}
            />
          )}
        </div>
      </div>
    </section>
  );
}