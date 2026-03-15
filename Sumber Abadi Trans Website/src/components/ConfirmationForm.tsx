import { useState } from 'react';
import { Send, MessageCircle, Phone, MapPin, User, Calendar } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface AddressDetails {
  senderName: string;
  street: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
  postalCode: string;
}

interface ConfirmationFormProps {
  estimatedCost: number;
  distance: number;
  weight: number;
  truckType: string;
  origin: Location;
  destination: Location;
}

export function ConfirmationForm({ 
  estimatedCost, 
  distance, 
  weight, 
  truckType,
  origin,
  destination
}: ConfirmationFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  
  // Origin address details
  const [originDetails, setOriginDetails] = useState<AddressDetails>({
    senderName: '',
    street: '',
    kelurahan: '',
    kecamatan: '',
    city: '',
    province: '',
    postalCode: ''
  });
  
  // Destination address details
  const [destDetails, setDestDetails] = useState<AddressDetails>({
    senderName: '',
    street: '',
    kelurahan: '',
    kecamatan: '',
    city: '',
    province: '',
    postalCode: ''
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Get minimum booking date (2 weeks from now)
  const getMinBookingDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 14); // 2 weeks from now
    return today.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      alert('Nama dan nomor telepon wajib diisi');
      return;
    }
    
    if (!bookingDate) {
      alert('Tanggal booking wajib diisi');
      return;
    }
    
    // Validate booking date
    const selectedDate = new Date(bookingDate);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 14);
    
    if (selectedDate < minDate) {
      alert('Tanggal booking minimal 2 minggu dari hari ini');
      return;
    }
    
    if (!originDetails.senderName || !originDetails.street || !originDetails.city) {
      alert('Mohon lengkapi detail alamat asal (Nama Pengirim, Nama Jalan, dan Kota wajib diisi)');
      return;
    }
    
    if (!destDetails.senderName || !destDetails.street || !destDetails.city) {
      alert('Mohon lengkapi detail alamat tujuan (Nama Penerima, Nama Jalan, dan Kota wajib diisi)');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/customers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            senderName: originDetails.senderName,
            senderPhone: phone,
            senderEmail: email,
            senderAddress: originDetails.street,
            senderKelurahan: originDetails.kelurahan,
            senderKecamatan: originDetails.kecamatan,
            senderCity: originDetails.city,
            senderProvince: originDetails.province,
            senderPostalCode: originDetails.postalCode,
            senderLat: origin.lat,
            senderLng: origin.lng,
            receiverName: destDetails.senderName,
            receiverPhone: destDetails.senderName,
            receiverAddress: destDetails.street,
            receiverKelurahan: destDetails.kelurahan,
            receiverKecamatan: destDetails.kecamatan,
            receiverCity: destDetails.city,
            receiverProvince: destDetails.province,
            receiverPostalCode: destDetails.postalCode,
            receiverLat: destination.lat,
            receiverLng: destination.lng,
            estimatedCost,
            distance,
            weight,
            truckType,
            bookingDate,
            notes
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to submit: ${errorText}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Terjadi kesalahan saat mengirim data. Silakan coba lagi atau hubungi kami langsung.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddressForWhatsApp = (details: AddressDetails) => {
    return `${details.senderName}\\n${details.street}\\nKel. ${details.kelurahan}, Kec. ${details.kecamatan}\\n${details.city}, ${details.province} ${details.postalCode}`;
  };

  const whatsappMessage = encodeURIComponent(
    `Halo, saya tertarik dengan layanan pengiriman:\\\\n\\\\n` +
    `Nama: ${name}\\\\n` +
    `Telepon: ${phone}\\\\n` +
    `Email: ${email}\\\\n` +
    `Tanggal Booking: ${bookingDate ? new Date(bookingDate).toLocaleDateString('id-ID') : 'Belum ditentukan'}\\\\n\\\\n` +
    `Detail Pengiriman:\\\\n` +
    `━━━━━━━━━━━━━━━━━━━━\\\\n` +
    `ALAMAT ASAL:\\\\n` +
    `${formatAddressForWhatsApp(originDetails)}\\\\n` +
    `Koordinat: ${origin.lat.toFixed(6)}, ${origin.lng.toFixed(6)}\\\\n\\\\n` +
    `ALAMAT TUJUAN:\\\\n` +
    `${formatAddressForWhatsApp(destDetails)}\\\\n` +
    `Koordinat: ${destination.lat.toFixed(6)}, ${destination.lng.toFixed(6)}\\\\n` +
    `━━━━━━━━━━━━━━━━━━━━\\\\n\\\\n` +
    `- Jarak: ${distance.toFixed(1)} km\\\\n` +
    `- Berat: ${weight} ton\\\\n` +
    `- Jenis Truck: ${truckType}\\\\n` +
    `- Estimasi Biaya: Rp ${estimatedCost.toLocaleString('id-ID')}\\\\n\\\\n` +
    `${notes ? `Catatan: ${notes}\\\\n\\\\n` : ''}` +
    `Mohon informasi lebih lanjut. Terima kasih!`
  );

  const whatsappLink = `https://wa.me/6281234567890?text=${whatsappMessage}`;

  if (submitted) {
    return (
      <div className="bg-green-50 rounded-xl p-8 border-2 border-green-200">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h3 className="text-gray-900 mb-3">Terima Kasih!</h3>
          <p className="text-gray-600 mb-6">
            Data Anda telah tersimpan. Silakan hubungi kami untuk konfirmasi lebih lanjut.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Hubungi via WhatsApp
            </a>
            <a
              href="tel:+6281234567890"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Telepon Langsung
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
      <h3 className="text-gray-900 mb-6">Konfirmasi Data Anda</h3>
      
      {/* Warning Disclaimer */}
      <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <h4 className="text-red-900 mb-3 flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          Perhatian: Barang yang Tidak Dapat Dikirim
        </h4>
        <ul className="text-red-800 text-sm space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span><strong>Barang Mudah Terbakar:</strong> BBM, gas, bahan kimia mudah terbakar, petasan, kembang api</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span><strong>Cairan Kimia Berbahaya:</strong> Asam, bahan korosif, zat beracun, bahan radioaktif</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span><strong>Hewan Hidup:</strong> Kami tidak melayani pengiriman hewan hidup dalam bentuk apapun</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-600">•</span>
            <span><strong>Barang Ilegal:</strong> Narkoba, senjata api, barang selundupan, dan barang ilegal lainnya</span>
          </li>
        </ul>
        <p className="text-red-700 text-sm mt-3 italic">
          ⚡ Dengan melanjutkan, Anda menyatakan bahwa barang yang dikirim bukan termasuk kategori di atas.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contact Information */}
        <div>
          <h4 className="text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informasi Kontak
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-gray-700 mb-2">
                Nomor Telepon <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="Contoh: 08123456789"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email (Opsional)
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Origin Address Details */}
        <div>
          <h4 className="text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Detail Alamat Asal
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg mb-3">
            <p className="text-gray-600">Koordinat Map: {origin.lat.toFixed(6)}, {origin.lng.toFixed(6)}</p>
            <p className="text-gray-600">Alamat: {origin.address}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="originSenderName" className="block text-gray-700 mb-2">
                Nama Pengirim <span className="text-red-500">*</span>
              </label>
              <input
                id="originSenderName"
                type="text"
                value={originDetails.senderName}
                onChange={(e) => setOriginDetails({...originDetails, senderName: e.target.value})}
                required
                placeholder="Nama pengirim"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="originStreet" className="block text-gray-700 mb-2">
                Nama Jalan / Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="originStreet"
                type="text"
                value={originDetails.street}
                onChange={(e) => setOriginDetails({...originDetails, street: e.target.value})}
                required
                placeholder="Contoh: Jl. Merdeka No. 123"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="originKelurahan" className="block text-gray-700 mb-2">
                Kelurahan
              </label>
              <input
                id="originKelurahan"
                type="text"
                value={originDetails.kelurahan}
                onChange={(e) => setOriginDetails({...originDetails, kelurahan: e.target.value})}
                placeholder="Kelurahan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="originKecamatan" className="block text-gray-700 mb-2">
                Kecamatan
              </label>
              <input
                id="originKecamatan"
                type="text"
                value={originDetails.kecamatan}
                onChange={(e) => setOriginDetails({...originDetails, kecamatan: e.target.value})}
                placeholder="Kecamatan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="originCity" className="block text-gray-700 mb-2">
                Kota / Kabupaten <span className="text-red-500">*</span>
              </label>
              <input
                id="originCity"
                type="text"
                value={originDetails.city}
                onChange={(e) => setOriginDetails({...originDetails, city: e.target.value})}
                required
                placeholder="Kota"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="originProvince" className="block text-gray-700 mb-2">
                Provinsi
              </label>
              <input
                id="originProvince"
                type="text"
                value={originDetails.province}
                onChange={(e) => setOriginDetails({...originDetails, province: e.target.value})}
                placeholder="Provinsi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="originPostalCode" className="block text-gray-700 mb-2">
                Kode Pos
              </label>
              <input
                id="originPostalCode"
                type="text"
                value={originDetails.postalCode}
                onChange={(e) => setOriginDetails({...originDetails, postalCode: e.target.value})}
                placeholder="Contoh: 12345"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Destination Address Details */}
        <div>
          <h4 className="text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            Detail Alamat Tujuan
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg mb-3">
            <p className="text-gray-600">Koordinat Map: {destination.lat.toFixed(6)}, {destination.lng.toFixed(6)}</p>
            <p className="text-gray-600">Alamat: {destination.address}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="destSenderName" className="block text-gray-700 mb-2">
                Nama Penerima <span className="text-red-500">*</span>
              </label>
              <input
                id="destSenderName"
                type="text"
                value={destDetails.senderName}
                onChange={(e) => setDestDetails({...destDetails, senderName: e.target.value})}
                required
                placeholder="Nama penerima"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="destStreet" className="block text-gray-700 mb-2">
                Nama Jalan / Alamat Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="destStreet"
                type="text"
                value={destDetails.street}
                onChange={(e) => setDestDetails({...destDetails, street: e.target.value})}
                required
                placeholder="Contoh: Jl. Sudirman No. 456"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="destKelurahan" className="block text-gray-700 mb-2">
                Kelurahan
              </label>
              <input
                id="destKelurahan"
                type="text"
                value={destDetails.kelurahan}
                onChange={(e) => setDestDetails({...destDetails, kelurahan: e.target.value})}
                placeholder="Kelurahan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="destKecamatan" className="block text-gray-700 mb-2">
                Kecamatan
              </label>
              <input
                id="destKecamatan"
                type="text"
                value={destDetails.kecamatan}
                onChange={(e) => setDestDetails({...destDetails, kecamatan: e.target.value})}
                placeholder="Kecamatan"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="destCity" className="block text-gray-700 mb-2">
                Kota / Kabupaten <span className="text-red-500">*</span>
              </label>
              <input
                id="destCity"
                type="text"
                value={destDetails.city}
                onChange={(e) => setDestDetails({...destDetails, city: e.target.value})}
                required
                placeholder="Kota"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="destProvince" className="block text-gray-700 mb-2">
                Provinsi
              </label>
              <input
                id="destProvince"
                type="text"
                value={destDetails.province}
                onChange={(e) => setDestDetails({...destDetails, province: e.target.value})}
                placeholder="Provinsi"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="destPostalCode" className="block text-gray-700 mb-2">
                Kode Pos
              </label>
              <input
                id="destPostalCode"
                type="text"
                value={destDetails.postalCode}
                onChange={(e) => setDestDetails({...destDetails, postalCode: e.target.value})}
                placeholder="Contoh: 67890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Booking Date */}
        <div>
          <label htmlFor="bookingDate" className="block text-gray-700 mb-2">
            Tanggal Booking <span className="text-red-500">*</span>
          </label>
          <input
            id="bookingDate"
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            required
            min={getMinBookingDate()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-gray-600 text-sm mt-2">
            📅 Tanggal booking minimal 2 minggu dari hari ini untuk memastikan ketersediaan armada
          </p>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-gray-700 mb-2">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Informasi tambahan tentang barang atau permintaan khusus..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Mengirim...' : 'Kirim & Hubungi Kami'}
          </button>
          <p className="text-gray-600 text-center mt-3">
            Data Anda akan tersimpan dan tim kami akan segera menghubungi Anda
          </p>
        </div>
      </form>
    </div>
  );
}