import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CompanyOverview } from './components/CompanyOverview';
import { FleetTypes } from './components/FleetTypes';
import { CostEstimator } from './components/CostEstimator';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { initializeDefaultFleets } from './utils/initializeFleets';

export default function App() {
  const [showEstimator, setShowEstimator] = useState(false);
  const [isAdminPage, setIsAdminPage] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Initialize default fleets on app load (non-blocking)
    initializeDefaultFleets().catch(err => {
      console.error('Failed to initialize fleets:', err);
    });
    
    // Check if on admin page
    const path = window.location.hash;
    if (path === '#admin') {
      setIsAdminPage(true);
      // Check if already logged in
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      setIsAdminLoggedIn(loggedIn);
    }
  }, []);

  useEffect(() => {
    // Listen for hash changes
    const handleHashChange = () => {
      const path = window.location.hash;
      if (path === '#admin') {
        setIsAdminPage(true);
        const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        setIsAdminLoggedIn(loggedIn);
      } else {
        setIsAdminPage(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleGetStarted = () => {
    setShowEstimator(true);
    setTimeout(() => {
      const element = document.getElementById('estimator');
      if (element) {
        const navbarHeight = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    window.location.hash = '';
  };

  // Admin page routing
  if (isAdminPage) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={handleAdminLogin} />;
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  // Regular landing page
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div id="hero" className="scroll-mt-20">
        <HeroSection onGetStarted={handleGetStarted} />
      </div>
      <div id="about" className="scroll-mt-20">
        <CompanyOverview />
      </div>
      <div id="fleet" className="scroll-mt-20">
        <FleetTypes />
      </div>
      {showEstimator && (
        <div id="estimator" className="scroll-mt-20">
          <CostEstimator />
        </div>
      )}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 Sumber Abadi Trans. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}