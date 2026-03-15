import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, CheckCircle, Info, Loader, Edit3 } from 'lucide-react';
import { InteractiveMap } from './InteractiveMap';
import { RouteMap } from './RouteMap';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface DetailedLocation {
  lat: number;
  lng: number;
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

interface MapSelectorProps {
  origin: Location | null;
  destination: Location | null;
  onOriginChange: (location: Location) => void;
  onDestinationChange: (location: Location) => void;
}

export function MapSelector({ origin, destination, onOriginChange, onDestinationChange }: MapSelectorProps) {
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [originResults, setOriginResults] = useState<DetailedLocation[]>([]);
  const [destinationResults, setDestinationResults] = useState<DetailedLocation[]>([]);
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestinationResults, setShowDestinationResults] = useState(false);
  const [originDetails, setOriginDetails] = useState<DetailedLocation | null>(null);
  const [destinationDetails, setDestinationDetails] = useState<DetailedLocation | null>(null);
  const [showOriginMap, setShowOriginMap] = useState(false);
  const [showDestinationMap, setShowDestinationMap] = useState(false);

  // Auto-search with debounce
  useEffect(() => {
    if (originSearch.length > 2) {
      const timer = setTimeout(() => {
        searchLocations(originSearch, true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setOriginResults([]);
      setShowOriginResults(false);
    }
  }, [originSearch]);

  useEffect(() => {
    if (destinationSearch.length > 2) {
      const timer = setTimeout(() => {
        searchLocations(destinationSearch, false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDestinationResults([]);
      setShowDestinationResults(false);
    }
  }, [destinationSearch]);

  const searchLocations = async (query: string, isOrigin: boolean) => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=5&` +
        `countrycodes=id&` +
        `addressdetails=1`
      );
      const data: DetailedLocation[] = await response.json();
      
      if (isOrigin) {
        setOriginResults(data);
        setShowOriginResults(data.length > 0);
      } else {
        setDestinationResults(data);
        setShowDestinationResults(data.length > 0);
      }
    } catch (error) {
      console.error('Location search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (location: DetailedLocation, isOrigin: boolean) => {
    const simpleLocation: Location = {
      lat: parseFloat(location.lat.toString()),
      lng: parseFloat(location.lon.toString()),
      address: location.display_name
    };
    
    if (isOrigin) {
      onOriginChange(simpleLocation);
      setOriginDetails(location);
      setOriginSearch('');
      setShowOriginResults(false);
      setShowOriginMap(true);
    } else {
      onDestinationChange(simpleLocation);
      setDestinationDetails(location);
      setDestinationSearch('');
      setShowDestinationResults(false);
      setShowDestinationMap(true);
    }
  };

  const handleMapLocationSelect = async (lat: number, lng: number, isOrigin: boolean) => {
    // Reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `lat=${lat}&` +
        `lon=${lng}&` +
        `format=json&` +
        `addressdetails=1`
      );
      const data: DetailedLocation = await response.json();
      
      const simpleLocation: Location = {
        lat,
        lng,
        address: data.display_name
      };
      
      if (isOrigin) {
        onOriginChange(simpleLocation);
        setOriginDetails(data);
      } else {
        onDestinationChange(simpleLocation);
        setDestinationDetails(data);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback: use coordinates only
      const simpleLocation: Location = {
        lat,
        lng,
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      
      if (isOrigin) {
        onOriginChange(simpleLocation);
      } else {
        onDestinationChange(simpleLocation);
      }
    }
  };

  const getCurrentLocation = (isOrigin: boolean) => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setSearching(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${latitude}&` +
            `lon=${longitude}&` +
            `format=json&` +
            `addressdetails=1`
          );
          const data: DetailedLocation = await response.json();
          
          selectLocation(data, isOrigin);
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          alert('Gagal mendapatkan detail alamat dari lokasi Anda');
        } finally {
          setSearching(false);
        }
      },
      (error) => {
        setSearching(false);
        let errorMessage = 'Gagal mendapatkan lokasi Anda. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Anda menolak akses lokasi. Silakan aktifkan izin lokasi di pengaturan browser Anda.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Informasi lokasi tidak tersedia. Coba lagi nanti.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Permintaan lokasi timeout. Coba lagi.';
            break;
          default:
            errorMessage += 'Terjadi kesalahan. Silakan coba lagi atau gunakan pencarian manual.';
        }
        
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message
        });
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const formatAddressDetails = (details: DetailedLocation) => {
    const addr = details.address;
    return {
      road: addr.road || '-',
      suburb: addr.suburb || '-',
      city: addr.city || addr.county || '-',
      state: addr.state || '-',
      postcode: addr.postcode || '-',
      country: addr.country || 'Indonesia'
    };
  };

  const renderLocationCard = (details: DetailedLocation | null, label: string, color: string, isOrigin: boolean) => {
    if (!details) return null;
    
    const addr = formatAddressDetails(details);
    const showMap = isOrigin ? showOriginMap : showDestinationMap;
    
    return (
      <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-lg p-5`}>
        <div className="flex items-start gap-3 mb-4">
          <CheckCircle className={`w-6 h-6 text-${color}-600 flex-shrink-0 mt-1`} />
          <div className="flex-1">
            <h4 className={`text-${color}-900 mb-2 flex items-center gap-2`}>
              {label}
            </h4>
            <p className="text-gray-700 mb-3">{details.display_name}</p>
          </div>
          <button
            onClick={() => isOrigin ? setShowOriginMap(!showOriginMap) : setShowDestinationMap(!showDestinationMap)}
            className={`px-3 py-1.5 bg-${color}-600 text-white rounded-lg hover:bg-${color}-700 text-sm flex items-center gap-2`}
          >
            <Edit3 className="w-4 h-4" />
            {showMap ? 'Sembunyikan' : 'Pilih di Peta'}
          </button>
        </div>
        
        {showMap && (
          <div className="mb-4">
            <InteractiveMap
              lat={parseFloat(details.lat.toString())}
              lng={parseFloat(details.lon.toString())}
              onLocationSelect={(lat, lng) => handleMapLocationSelect(lat, lng, isOrigin)}
              markerColor={color === 'green' ? '#10b981' : '#ef4444'}
              label={`Pilih Titik Koordinat ${label}`}
            />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white rounded-lg p-4">
          <div>
            <p className="text-gray-600">Jalan</p>
            <p className="text-gray-900">{addr.road}</p>
          </div>
          <div>
            <p className="text-gray-600">Kelurahan/Desa</p>
            <p className="text-gray-900">{addr.suburb}</p>
          </div>
          <div>
            <p className="text-gray-600">Kota/Kabupaten</p>
            <p className="text-gray-900">{addr.city}</p>
          </div>
          <div>
            <p className="text-gray-600">Provinsi</p>
            <p className="text-gray-900">{addr.state}</p>
          </div>
          <div>
            <p className="text-gray-600">Kode Pos</p>
            <p className="text-gray-900">{addr.postcode}</p>
          </div>
          <div>
            <p className="text-gray-600">Koordinat GPS</p>
            <p className="text-gray-900 font-mono">{parseFloat(details.lat.toString()).toFixed(6)}, {parseFloat(details.lon.toString()).toFixed(6)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Address Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Origin Search */}
        <div className="space-y-3">
          <label className="block text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Lokasi Asal
          </label>
          
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={originSearch}
                  onChange={(e) => setOriginSearch(e.target.value)}
                  placeholder="Ketik nama kota, jalan, atau landmark..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                {searching && (
                  <Loader className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 animate-spin" />
                )}
              </div>
              <button
                onClick={() => getCurrentLocation(true)}
                disabled={searching}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Gunakan Lokasi Saya"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {showOriginResults && originResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                {originResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectLocation(result, true)}
                    className="w-full text-left px-4 py-3 hover:bg-green-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">{result.display_name}</p>
                        <p className="text-gray-500 mt-1">
                          {result.address.city || result.address.county}, {result.address.state}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {origin && originDetails && renderLocationCard(originDetails, 'Lokasi Asal Terpilih', 'green', true)}
        </div>

        {/* Destination Search */}
        <div className="space-y-3">
          <label className="block text-gray-900 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            Lokasi Tujuan
          </label>
          
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  placeholder="Ketik nama kota, jalan, atau landmark..."
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                {searching && (
                  <Loader className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 animate-spin" />
                )}
              </div>
              <button
                onClick={() => getCurrentLocation(false)}
                disabled={searching}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                title="Gunakan Lokasi Saya"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {showDestinationResults && destinationResults.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-y-auto">
                {destinationResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectLocation(result, false)}
                    className="w-full text-left px-4 py-3 hover:bg-red-50 border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 truncate">{result.display_name}</p>
                        <p className="text-gray-500 mt-1">
                          {result.address.city || result.address.county}, {result.address.state}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {destination && destinationDetails && renderLocationCard(destinationDetails, 'Lokasi Tujuan Terpilih', 'red', false)}
        </div>
      </div>

      {/* Route Summary */}
      {origin && destination && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-6 h-6 text-blue-600" />
            <h4 className="text-gray-900">Ringkasan Rute Pengiriman</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <p className="text-gray-700">Titik Asal</p>
              </div>
              <p className="text-gray-900 mb-2">{origin.address.split(',').slice(0, 2).join(',')}</p>
              <p className="text-gray-500 font-mono">
                GPS: {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <p className="text-gray-700">Titik Tujuan</p>
              </div>
              <p className="text-gray-900 mb-2">{destination.address.split(',').slice(0, 2).join(',')}</p>
              <p className="text-gray-500 font-mono">
                GPS: {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-900 mb-2">💡 Tips Pencarian Lokasi:</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>Ketik minimal 3 karakter untuk memulai pencarian otomatis</li>
              <li>Gunakan nama kota atau landmark terkenal untuk hasil lebih akurat</li>
              <li>Contoh: "Monas Jakarta", "Gedung Sate Bandung", "Malioboro Yogyakarta"</li>
              <li>Klik tombol <Navigation className="w-4 h-4 inline" /> untuk menggunakan lokasi GPS Anda saat ini</li>
              <li>Klik "Pilih di Peta" untuk memilih titik koordinat yang lebih presisi</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}