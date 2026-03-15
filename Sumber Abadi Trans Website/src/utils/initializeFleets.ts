import { projectId, publicAnonKey } from './supabase/info';

// Initialize default fleets if they don't exist
export async function initializeDefaultFleets() {
  try {
    // Add a small delay to ensure server is ready
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if fleets already exist
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );

    if (!response.ok) {
      // Edge function not available yet, skip initialization
      return;
    }

    const data = await response.json();
    
    // If fleets already exist, don't initialize
    if (data.fleets && data.fleets.length > 0) {
      console.log('Fleets already initialized:', data.fleets.length);
      return;
    }

    console.log('Initializing default fleets...');
    
    // Default fleets
    const defaultFleets = [
      {
        name: 'Colt Diesel',
        capacity: 3,
        dimension: '3.2m x 1.6m x 1.7m',
        basePrice: 100000,
        pricePerKm: 8000,
        pricePerTon: 50000,
        description: 'Ideal untuk pengiriman barang dengan volume sedang dalam kota',
        imageUrl: 'https://images.unsplash.com/photo-1579120632007-f493373daed0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpdmVyeSUyMHRydWNrJTIwY29sdHxlbnwxfHx8fDE3NjM3ODk5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        imageData: null
      },
      {
        name: 'Colt Diesel Double',
        capacity: 5,
        dimension: '4.3m x 1.8m x 1.8m',
        basePrice: 150000,
        pricePerKm: 12000,
        pricePerTon: 75000,
        description: 'Cocok untuk pengiriman barang bervolume besar dengan jarak menengah',
        imageUrl: 'https://images.unsplash.com/photo-1716512060259-d114cfba13e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdW0lMjBjYXJnbyUyMHRydWNrfGVufDF8fHx8MTc2Mzc4OTk3NHww&ixlib=rb-4.1.0&q=80&w=1080',
        imageData: null
      },
      {
        name: 'Fuso',
        capacity: 8,
        dimension: '6.0m x 2.2m x 2.2m',
        basePrice: 200000,
        pricePerKm: 15000,
        pricePerTon: 100000,
        description: 'Pilihan terbaik untuk pengiriman barang berat dan jarak jauh',
        imageUrl: 'https://images.unsplash.com/photo-1698321170838-27f96d9463af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXJnZSUyMGZ1c28lMjB0cnVja3xlbnwxfHx8fDE3NjM3ODk5NzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
        imageData: null
      }
    ];

    // Create each fleet
    for (const fleet of defaultFleets) {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-556a53e9/fleets`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(fleet)
        }
      );
    }

    console.log('Default fleets initialized successfully');
  } catch (error) {
    console.error('Error initializing fleets:', error);
  }
}