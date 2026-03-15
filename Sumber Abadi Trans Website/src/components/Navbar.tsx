import { Truck, Phone, Mail, Menu } from 'lucide-react';
import { useState } from 'react';
import logoImage from 'figma:asset/eb1bd1e163b2c0edcf2bc9e05fae5d6d51d8a290.png';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const navbarHeight = 80; // Height of navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-48 h-16 overflow-hidden rounded-lg bg-white">
              <img 
                src={logoImage} 
                alt="Sumber Abadi Trans" 
                className="w-full h-full object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => scrollToSection('fleet')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Armada
            </button>
            <button
              onClick={() => scrollToSection('estimator')}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Kalkulator Biaya
            </button>
            <a
              href="https://wa.me/628128251646"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection('hero')}
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 text-left"
              >
                Beranda
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 text-left"
              >
                Tentang Kami
              </button>
              <button
                onClick={() => scrollToSection('fleet')}
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 text-left"
              >
                Armada
              </button>
              <button
                onClick={() => scrollToSection('estimator')}
                className="text-gray-700 hover:text-blue-600 transition-colors px-4 py-2 text-left"
              >
                Kalkulator Biaya
              </button>
              <a
                href="https://wa.me/628128251646"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-4"
              >
                <Phone className="w-4 h-4" />
                Hubungi Kami
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}