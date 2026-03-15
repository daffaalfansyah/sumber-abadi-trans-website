# Setup Firebase Realtime Database untuk Sumber Abadi Trans

## Langkah-langkah Setup Firebase

### 1. Buat Proyek Firebase
1. Kunjungi [Firebase Console](https://console.firebase.google.com/)
2. Klik "Add project" atau "Tambahkan proyek"
3. Beri nama proyek, misalnya "sumber-abadi-trans"
4. Ikuti langkah-langkah setup hingga selesai

### 2. Aktifkan Realtime Database
1. Di Firebase Console, pilih proyek Anda
2. Klik "Realtime Database" di menu sebelah kiri (bukan Firestore!)
3. Klik "Create Database"
4. Pilih lokasi server (pilih yang paling dekat dengan Indonesia, misalnya `asia-southeast1`)
5. Pilih mode **"Start in test mode"** untuk kemudahan (rules akan otomatis diatur)
6. Klik "Enable"

### 3. Konfigurasi Database Rules
Di tab "Rules" pada Realtime Database, **copy-paste rules berikut**:

```json
{
  "rules": {
    "customers": {
      ".read": true,
      ".write": true
    }
  }
}
```

**PENTING**: 
- Rules ini mengizinkan akses publik untuk collection `customers`
- Cocok untuk demo/development
- Jangan lupa publish rules dengan klik tombol **"Publish"**

**Untuk production yang lebih aman:**
```json
{
  "rules": {
    "customers": {
      ".read": "auth != null",
      ".write": true
    }
  }
}
```

### 4. Dapatkan Firebase Config
1. Di Firebase Console, klik ikon gear ⚙️ di sebelah "Project Overview"
2. Pilih "Project settings"
3. Scroll ke bawah ke bagian "Your apps"
4. Klik ikon web `</>`  untuk membuat web app
5. Beri nama app Anda (misalnya "sumber-abadi-trans-web")
6. Klik "Register app"
7. Salin konfigurasi Firebase (firebaseConfig object)

**PENTING**: Pastikan ada field `databaseURL` di konfigurasi Anda. Jika tidak ada, copy dari tab Realtime Database.

### 5. Update Konfigurasi di Code
Buka file `/config/firebase.ts` dan ganti dengan konfigurasi Firebase Anda:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com", // PENTING!
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

**Cara mendapatkan `databaseURL`:**
1. Buka Realtime Database di Firebase Console
2. Lihat di bagian atas, ada URL seperti: `https://your-project-default-rtdb.firebaseio.com`
3. Copy URL tersebut ke field `databaseURL`

### 6. Testing
Setelah konfigurasi selesai:
1. Buka website Anda
2. Isi form estimasi biaya dan submit
3. Data akan tersimpan ke Firebase Realtime Database
4. Buka halaman admin dengan menambahkan `#admin` di URL
5. Login dengan:
   - Username: `sumberabaditrans`
   - Password: `123456789`
6. Anda akan melihat data customer yang baru saja disubmit

### 7. Monitoring Data
Untuk melihat data langsung di Firebase:
1. Buka Firebase Console
2. Klik "Realtime Database"
3. Anda akan melihat struktur data seperti tree:
   ```
   - customers
     - -NXXXxxxXXXxxx (auto-generated ID)
       - senderName: "John Doe"
       - senderPhone: "08123456789"
       - ...
   ```

## Struktur Data Realtime Database

### Path: `/customers`
Setiap entry memiliki auto-generated ID dengan data:

```json
{
  "customers": {
    "-NXXxxxXXXxxx": {
      "senderName": "string",
      "senderPhone": "string",
      "senderEmail": "string",
      "senderAddress": "string",
      "senderKelurahan": "string",
      "senderKecamatan": "string",
      "senderCity": "string",
      "senderProvince": "string",
      "senderPostalCode": "string",
      "senderLat": 0.0,
      "senderLng": 0.0,
      "receiverName": "string",
      "receiverPhone": "string",
      "receiverAddress": "string",
      "receiverKelurahan": "string",
      "receiverKecamatan": "string",
      "receiverCity": "string",
      "receiverProvince": "string",
      "receiverPostalCode": "string",
      "receiverLat": 0.0,
      "receiverLng": 0.0,
      "estimatedCost": 0,
      "distance": 0,
      "weight": 0,
      "truckType": "string",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "status": "pending"
    }
  }
}
```

## Perbedaan Firestore vs Realtime Database

| Fitur | Firestore | Realtime Database |
|-------|-----------|-------------------|
| Struktur | Documents & Collections | JSON Tree |
| Query | Lebih kompleks | Lebih sederhana |
| Offline | Otomatis | Manual |
| Rules Format | Rules Language | JSON |
| Pricing | Per document read | Per data downloaded |

**Proyek ini menggunakan Realtime Database** karena lebih sederhana untuk use case ini.

## Troubleshooting

### Error: "Permission denied"
- Pastikan Database Rules sudah diupdate dengan benar
- Klik tombol **"Publish"** setelah mengedit rules
- Tunggu beberapa detik setelah publish

### Error: "FIREBASE FATAL ERROR: Cannot parse Firebase url"
- Pastikan field `databaseURL` ada di konfigurasi
- Pastikan URL format benar: `https://PROJECT-ID-default-rtdb.firebaseio.com`
- Cek di Firebase Console > Realtime Database untuk mendapatkan URL yang benar

### Error: Firebase not initialized
- Pastikan file `/config/firebase.ts` sudah diupdate dengan konfigurasi yang benar
- Periksa console browser untuk error lebih detail
- Pastikan semua field (apiKey, authDomain, databaseURL, dll) terisi

### Data tidak muncul di Admin Dashboard
- Pastikan sudah ada data yang disubmit terlebih dahulu
- Coba refresh halaman admin
- Buka Firebase Console > Realtime Database untuk cek apakah data tersimpan
- Periksa console browser untuk error

### Error saat submit form
- Buka browser console (F12) untuk lihat error detail
- Periksa apakah rules sudah di-publish
- Pastikan databaseURL benar

## Security untuk Production

Untuk deployment production, sebaiknya:

1. **Update Database Rules untuk membatasi write:**
   ```json
   {
     "rules": {
       "customers": {
         ".read": "auth != null",
         ".write": true,
         ".indexOn": ["createdAt"]
       }
     }
   }
   ```

2. **Implementasi Firebase Authentication** untuk admin
3. **Rate limiting** untuk prevent spam submissions
4. **Validasi data** di client dan server side
5. **Backup otomatis** data secara berkala

## Backup dan Export Data

### Manual Export:
1. Di Firebase Console, buka Realtime Database
2. Klik icon "⋮" (three dots) di kanan atas
3. Pilih "Export JSON"
4. Data akan didownload dalam format JSON

### Automated Backup:
Firebase Realtime Database secara otomatis membuat backup harian untuk Firebase Blaze plan.

## Tips Optimasi

1. **Indexing**: Tambahkan `.indexOn` untuk field yang sering di-query
2. **Security**: Jangan expose API keys di public repository
3. **Monitoring**: Aktifkan Firebase Analytics untuk track usage
4. **Quota**: Monitor usage di Firebase Console untuk avoid overage charges

## Fitur Tambahan yang Bisa Ditambahkan

- Real-time updates (data otomatis refresh tanpa reload)
- Push notifications saat ada customer baru
- Export data ke Excel/CSV dari admin dashboard
- Filter dan search di admin dashboard
- Status tracking untuk setiap order (pending, processed, completed)

---

Jika ada pertanyaan atau error, silakan check Firebase Console > Realtime Database > Usage tab untuk melihat apakah ada request yang error.
