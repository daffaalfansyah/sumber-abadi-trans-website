import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Package, Gauge, Truck } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface Fleet {
  id: string;
  name: string;
  capacity: number;
  dimension?: string;
  pricePerKm: number;
  description: string;
  imageUrl?: string;
  imageData?: string | null;
}

export function FleetTypes() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setLoading(false);
    }
  };

  const getDefaultFleets = (): Fleet[] => [
    {
      id: 'fleet_default_1',
      name: 'Truk Engkel CDD',
      capacity: 3.5,
      dimension: '4.3m x 1.8m x 1.8m',
      pricePerKm: 25000,
      description: 'Cocok untuk pengiriman barang dalam kota dengan kapasitas sedang',
      imageUrl: '',
      imageData: null
    },
    {
      id: 'fleet_default_2',
      name: 'Truk Fuso',
      capacity: 8,
      dimension: '6.2m x 2.3m x 2.3m',
      pricePerKm: 35000,
      description: 'Ideal untuk pengiriman antar kota dengan kapasitas besar',
      imageUrl: '',
      imageData: null
    },
    {
      id: 'fleet_default_3',
      name: 'Truk Tronton',
      capacity: 15,
      dimension: '9m x 2.5m x 2.5m',
      pricePerKm: 45000,
      description: 'Untuk pengiriman barang berat dan volume besar',
      imageUrl: '',
      imageData: null
    }
  ];

  const getFleetImage = (fleet: Fleet) => {
    if (fleet.imageData) {
      return fleet.imageData;
    }
    if (fleet.imageUrl) {
      return fleet.imageUrl;
    }
    // Default fallback image
    return "https://images.unsplash.com/photo-1579120632007-f493373daed0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHRydWNrJTIwY29sdHxlbnwxfHx8fDE3NjM3ODk5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080";
  };

  const formatCapacity = (capacity: number) => {
    if (capacity <= 3) {
      return "2-3 Ton";
    } else if (capacity <= 5) {
      return "4-5 Ton";
    } else {
      return `${capacity - 2}-${capacity} Ton`;
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">
            Jenis Armada Kami
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Pilih armada yang sesuai dengan kebutuhan pengiriman
            Anda
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Memuat data armada...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-gray-600">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>{error}</p>
          </div>
        ) : fleets.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>Belum ada armada tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fleets.map((fleet) => (
              <div
                key={fleet.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={getFleetImage(fleet)}
                    alt={fleet.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-gray-900 mb-2">
                    {fleet.name}
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-5 h-5 text-blue-600" />
                      <span>Kapasitas: {formatCapacity(fleet.capacity)}</span>
                    </div>
                    {fleet.dimension && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Gauge className="w-5 h-5 text-blue-600" />
                        <span>Dimensi: {fleet.dimension}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600">
                    {fleet.description}
                  </p>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-900">
                      Tarif: Rp{" "}
                      {fleet.pricePerKm.toLocaleString("id-ID")}
                      /km
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}