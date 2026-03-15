import { Shield, Clock, Award, Phone } from 'lucide-react';

export function CompanyOverview() {
  const features = [
    {
      icon: Shield,
      title: 'Terpercaya',
      description: 'Pengalaman lebih dari 10 tahun dalam layanan pengiriman barang'
    },
    {
      icon: Clock,
      title: 'Tepat Waktu',
      description: 'Komitmen tinggi untuk pengiriman tepat waktu sesuai jadwal'
    },
    {
      icon: Award,
      title: 'Profesional',
      description: 'Tim driver berpengalaman dan armada terawat dengan baik'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-gray-900 mb-4">Tentang Layanan Kami</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Kami adalah perusahaan logistik terkemuka yang menyediakan layanan pengiriman barang 
            dengan berbagai pilihan armada truck. Dengan komitmen pada kualitas dan kepuasan pelanggan, 
            kami siap membantu kebutuhan pengiriman bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <a
            href="https://wa.me/628128251646"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Phone className="w-5 h-5" />
            Hubungi Kami via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}