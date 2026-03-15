import { Truck } from 'lucide-react';
import logoImage from 'figma:asset/eb1bd1e163b2c0edcf2bc9e05fae5d6d51d8a290.png';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-2xl">
              <img 
                src={logoImage} 
                alt="Sumber Abadi Trans" 
                className="h-20 w-auto object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>
          
          <h1 className="text-white mb-6">
            Sumber Abadi Trans - Handal, Aman, Terpercaya
          </h1>
          
          <p className="text-blue-100 max-w-2xl mx-auto mb-8">
            Layanan pengiriman truck profesional dengan armada lengkap dan harga kompetitif. 
            Dapatkan estimasi biaya pengiriman Anda sekarang juga!
          </p>
          
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg shadow-lg hover:bg-blue-50 transition-all transform hover:scale-105"
          >
            HITUNG ESTIMASI
          </button>
        </div>
      </div>
      
      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#f9fafb"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </div>
  );
}