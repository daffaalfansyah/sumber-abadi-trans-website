import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Health check
app.get('/make-server-556a53e9/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create new inquiry
app.post('/make-server-556a53e9/inquiries', async (c) => {
  try {
    const data = await c.req.json();
    
    // Validate required fields
    if (!data.name || !data.phone) {
      return c.json({ error: 'Name and phone are required' }, 400);
    }

    // Generate unique ID
    const inquiryId = `inquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store inquiry data
    const inquiryData = {
      id: inquiryId,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      notes: data.notes || '',
      estimatedCost: data.estimatedCost,
      distance: data.distance,
      weight: data.weight,
      truckType: data.truckType,
      origin: data.origin,
      destination: data.destination,
      createdAt: data.createdAt || new Date().toISOString(),
      status: 'pending'
    };

    await kv.set(inquiryId, inquiryData);
    
    console.log(`New inquiry created: ${inquiryId}`, inquiryData);
    
    return c.json({ 
      success: true, 
      inquiryId,
      message: 'Inquiry submitted successfully' 
    }, 201);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return c.json({ 
      error: 'Failed to create inquiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get all inquiries (for admin)
app.get('/make-server-556a53e9/inquiries', async (c) => {
  try {
    const inquiries = await kv.getByPrefix('inquiry_');
    
    // Sort by creation date (newest first)
    inquiries.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
    
    return c.json({ 
      success: true, 
      count: inquiries.length,
      inquiries 
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return c.json({ 
      error: 'Failed to fetch inquiries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get single inquiry by ID
app.get('/make-server-556a53e9/inquiries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const inquiry = await kv.get(id);
    
    if (!inquiry) {
      return c.json({ error: 'Inquiry not found' }, 404);
    }
    
    return c.json({ 
      success: true, 
      inquiry 
    });
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    return c.json({ 
      error: 'Failed to fetch inquiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update inquiry status
app.patch('/make-server-556a53e9/inquiries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const inquiry = await kv.get(id);
    
    if (!inquiry) {
      return c.json({ error: 'Inquiry not found' }, 404);
    }
    
    const updatedInquiry = {
      ...inquiry,
      status,
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(id, updatedInquiry);
    
    return c.json({ 
      success: true, 
      inquiry: updatedInquiry 
    });
  } catch (error) {
    console.error('Error updating inquiry:', error);
    return c.json({ 
      error: 'Failed to update inquiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete inquiry
app.delete('/make-server-556a53e9/inquiries/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const inquiry = await kv.get(id);
    
    if (!inquiry) {
      return c.json({ error: 'Inquiry not found' }, 404);
    }
    
    await kv.del(id);
    
    return c.json({ 
      success: true, 
      message: 'Inquiry deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return c.json({ 
      error: 'Failed to delete inquiry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create new customer
app.post('/make-server-556a53e9/customers', async (c) => {
  try {
    const data = await c.req.json();
    
    // Generate unique ID
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store customer data
    const customerData = {
      id: customerId,
      sender_name: data.senderName,
      sender_phone: data.senderPhone,
      sender_email: data.senderEmail,
      sender_address: data.senderAddress,
      sender_kelurahan: data.senderKelurahan,
      sender_kecamatan: data.senderKecamatan,
      sender_city: data.senderCity,
      sender_province: data.senderProvince,
      sender_postal_code: data.senderPostalCode,
      sender_lat: data.senderLat,
      sender_lng: data.senderLng,
      receiver_name: data.receiverName,
      receiver_phone: data.receiverPhone,
      receiver_address: data.receiverAddress,
      receiver_kelurahan: data.receiverKelurahan,
      receiver_kecamatan: data.receiverKecamatan,
      receiver_city: data.receiverCity,
      receiver_province: data.receiverProvince,
      receiver_postal_code: data.receiverPostalCode,
      receiver_lat: data.receiverLat,
      receiver_lng: data.receiverLng,
      estimated_cost: data.estimatedCost,
      distance: data.distance,
      weight: data.weight,
      truck_type: data.truckType,
      booking_date: data.bookingDate || null,
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    await kv.set(customerId, customerData);
    
    console.log(`New customer created: ${customerId}`, customerData);
    
    return c.json({ 
      success: true, 
      customerId,
      message: 'Customer data saved successfully' 
    }, 201);
  } catch (error) {
    console.error('Error creating customer:', error);
    return c.json({ 
      error: 'Failed to create customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get all customers (for admin)
app.get('/make-server-556a53e9/customers', async (c) => {
  try {
    const customers = await kv.getByPrefix('customer_');
    
    // Sort by creation date (newest first)
    customers.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
    
    return c.json({ 
      success: true, 
      count: customers.length,
      customers 
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return c.json({ 
      error: 'Failed to fetch customers',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update customer
app.put('/make-server-556a53e9/customers/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const existing = await kv.get(id);
    
    if (!existing) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    
    const updatedCustomer = {
      ...existing,
      ...data,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(id, updatedCustomer);
    
    return c.json({ 
      success: true, 
      customer: updatedCustomer 
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return c.json({ 
      error: 'Failed to update customer',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update customer status
app.put('/make-server-556a53e9/customers/:id/status', async (c) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    
    const existing = await kv.get(id);
    
    if (!existing) {
      return c.json({ error: 'Customer not found' }, 404);
    }
    
    const updatedCustomer = {
      ...existing,
      status,
      status_updated_at: new Date().toISOString()
    };
    
    await kv.set(id, updatedCustomer);
    
    return c.json({ 
      success: true, 
      customer: updatedCustomer 
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return c.json({ 
      error: 'Failed to update status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Fleet Management Endpoints
// Get all fleets
app.get('/make-server-556a53e9/fleets', async (c) => {
  try {
    console.log('Fetching fleets from KV store...');
    const fleets = await kv.getByPrefix('fleet_');
    console.log(`Found ${fleets.length} fleets`);
    
    return c.json({ 
      success: true, 
      count: fleets.length,
      fleets 
    });
  } catch (error) {
    console.error('Error fetching fleets:', error);
    return c.json({ 
      error: 'Failed to fetch fleets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create new fleet
app.post('/make-server-556a53e9/fleets', async (c) => {
  try {
    const data = await c.req.json();
    
    const fleetId = `fleet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fleetData = {
      id: fleetId,
      name: data.name,
      capacity: data.capacity,
      dimension: data.dimension || '',
      basePrice: data.basePrice || 0,
      pricePerKm: data.pricePerKm || 0,
      pricePerTon: data.pricePerTon || 0,
      description: data.description || '',
      imageUrl: data.imageUrl || '',
      imageData: data.imageData || null,
      created_at: new Date().toISOString()
    };

    await kv.set(fleetId, fleetData);
    
    return c.json({ 
      success: true, 
      fleetId,
      message: 'Fleet created successfully' 
    }, 201);
  } catch (error) {
    console.error('Error creating fleet:', error);
    return c.json({ 
      error: 'Failed to create fleet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update fleet
app.put('/make-server-556a53e9/fleets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    
    const existing = await kv.get(id);
    
    if (!existing) {
      return c.json({ error: 'Fleet not found' }, 404);
    }
    
    const updatedFleet = {
      ...existing,
      name: data.name,
      capacity: data.capacity,
      dimension: data.dimension || existing.dimension || '',
      basePrice: data.basePrice || 0,
      pricePerKm: data.pricePerKm || 0,
      pricePerTon: data.pricePerTon || 0,
      description: data.description || '',
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
      imageData: data.imageData !== undefined ? data.imageData : existing.imageData,
      updated_at: new Date().toISOString()
    };
    
    await kv.set(id, updatedFleet);
    
    return c.json({ 
      success: true, 
      fleet: updatedFleet 
    });
  } catch (error) {
    console.error('Error updating fleet:', error);
    return c.json({ 
      error: 'Failed to update fleet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete fleet
app.delete('/make-server-556a53e9/fleets/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const existing = await kv.get(id);
    
    if (!existing) {
      return c.json({ error: 'Fleet not found' }, 404);
    }
    
    await kv.del(id);
    
    return c.json({ 
      success: true, 
      message: 'Fleet deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting fleet:', error);
    return c.json({ 
      error: 'Failed to delete fleet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Logo Settings Endpoints
// Get logo
app.get('/make-server-556a53e9/settings/logo', async (c) => {
  try {
    const logo = await kv.get('settings_logo');
    
    if (!logo) {
      return c.json({ 
        success: true, 
        logoUrl: null 
      });
    }
    
    return c.json({ 
      success: true, 
      logoUrl: logo.logoUrl 
    });
  } catch (error) {
    console.error('Error fetching logo:', error);
    return c.json({ 
      error: 'Failed to fetch logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update logo
app.put('/make-server-556a53e9/settings/logo', async (c) => {
  try {
    const data = await c.req.json();
    
    const logoData = {
      logoUrl: data.logoUrl,
      updated_at: new Date().toISOString()
    };
    
    await kv.set('settings_logo', logoData);
    
    return c.json({ 
      success: true, 
      message: 'Logo updated successfully',
      logoUrl: data.logoUrl
    });
  } catch (error) {
    console.error('Error updating logo:', error);
    return c.json({ 
      error: 'Failed to update logo',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Start server
Deno.serve(app.fetch);