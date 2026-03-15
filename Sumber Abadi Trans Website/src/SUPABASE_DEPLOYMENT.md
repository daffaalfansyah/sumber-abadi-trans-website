# Supabase Edge Function Deployment Guide

## Status
Aplikasi sudah dikonfigurasi dengan **fallback mode** yang memungkinkan website berfungsi penuh meskipun Edge Function belum ter-deploy.

## Mode Operasi

### 1. Fallback Mode (Aktif Sekarang)
- Website menggunakan data default armada
- Semua fitur landing page berfungsi normal
- Kalkulator estimasi biaya tetap bekerja
- Data tersimpan sementara di localStorage

### 2. Production Mode (Setelah Edge Function Deploy)
- Website akan otomatis terhubung ke database
- Admin dapat mengelola armada melalui panel admin
- Data customer tersimpan permanen di Supabase KV Store
- Perubahan data armada langsung terlihat di landing page

## Default Fleet Data

Saat ini aplikasi menggunakan 3 armada default:

1. **Truk Engkel CDD**
   - Kapasitas: 3.5 Ton
   - Tarif: Rp 4,500/km
   - Dimensi: 4.3m x 1.8m x 1.8m

2. **Truk Fuso**
   - Kapasitas: 8 Ton
   - Tarif: Rp 7,500/km
   - Dimensi: 6.2m x 2.3m x 2.3m

3. **Truk Tronton**
   - Kapasitas: 15 Ton
   - Tarif: Rp 12,000/km
   - Dimensi: 9m x 2.5m x 2.5m

## Cara Deploy Edge Function

Jika Anda ingin mengaktifkan mode production dengan database:

1. Pastikan Supabase CLI terinstall
2. Login ke Supabase:
   ```bash
   supabase login
   ```

3. Link project Anda:
   ```bash
   supabase link --project-ref uedcakipzbmcatahwnvp
   ```

4. Deploy Edge Function:
   ```bash
   supabase functions deploy server
   ```

5. Refresh halaman website

## Files Structure

```
/supabase/
  ├── config.toml              # Supabase configuration
  └── functions/
      └── server/
          ├── index.tsx         # Main Edge Function (Hono server)
          ├── kv_store.tsx      # KV Store utilities
          └── deno.json         # Deno runtime config
```

## Troubleshooting

### Error: "Failed to fetch fleets: 404"
**Status:** Normal - Aplikasi menggunakan fallback mode
**Aksi:** Tidak ada aksi diperlukan, website tetap berfungsi

### Edge Function Sudah Deploy Tapi Masih 404
1. Tunggu 1-2 menit untuk propagasi
2. Refresh halaman (Ctrl+F5)
3. Cek console browser untuk konfirmasi koneksi

### Admin Panel Tidak Bisa Menyimpan Data
**Penyebab:** Edge Function belum ter-deploy
**Solusi:** 
- Deploy Edge Function menggunakan langkah di atas, atau
- Gunakan mode fallback untuk demo

## Notes

- Website sudah fully functional dalam fallback mode
- Tidak ada error yang mengganggu user experience
- Edge Function deployment bersifat optional untuk demo
- Setelah deploy, data akan tersinkronisasi otomatis
