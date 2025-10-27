# Sistem Entri Data Inventaris (Inventory Data Entry System)

*`<p align="center">`Contoh tampilan Dashboard aplikasi dalam mode terang.`</p>`*

## Deskripsi Proyek

Aplikasi web komprehensif yang dirancang untuk mengelola data inventaris secara efisien. Proyek ini menyediakan antarmuka yang bersih, modern, dan intuitif untuk memasukkan, mengelola, menyimpan, dan melihat data produk. Dibangun dengan fokus pada pengalaman pengguna, aplikasi ini responsif, kaya fitur, dan siap untuk dikembangkan lebih lanjut.

Ini adalah aplikasi frontend-only yang menggunakan data tiruan (`mockData.ts`) dan memanfaatkan Local Storage untuk fitur seperti auto-save draf dan preferensi tema (mode gelap/terang).

---

## ✨ Fitur Utama

Aplikasi ini dilengkapi dengan serangkaian fitur canggih untuk manajemen inventaris yang lengkap:

### 1. **Dashboard Interaktif**

- **Widget Statistik:** Ringkasan data utama seperti Total Produk, Nilai Stok Total, Item Stok Menipis, dan Item Aktif.
- **Visualisasi Data:** Grafik batang yang menampilkan jumlah produk per kategori untuk wawasan cepat.

### 2. **Manajemen Produk (CRUD)**

- **Tabel Data Canggih:**
  - **Pencarian & Filter:** Cari berdasarkan nama/SKU, filter berdasarkan status dan kategori.
  - **Sorting:** Urutkan data pada kolom yang dapat diurutkan (SKU, Kategori, Harga, Stok).
  - **Paginasi:** Navigasi yang mudah untuk kumpulan data yang besar.
- **Aksi Massal (Bulk Actions):**
  - Pilih beberapa produk untuk dihapus atau diekspor secara bersamaan.
  - Checkbox "Pilih Semua" untuk seleksi cepat per halaman.
- **Formulir Produk Canggih:**
  - **Dukungan Berbagai Input:** Termasuk input teks, angka, tanggal-waktu, email, URL, unggah file gambar dengan pratinjau, dan sakelar (toggle).
  - **Validasi Real-time:** Memastikan integritas data sebelum pengiriman.
  - **Fitur Tambahan:**
    - **Auto-Save Draft:** Otomatis menyimpan formulir produk baru ke Local Storage untuk mencegah kehilangan data.
    - **Duplikasi Entri:** Duplikat produk yang ada dengan satu klik untuk mempercepat entri data.
    - **Simpan & Tambah Baru:** Simpan produk saat ini dan langsung reset formulir untuk entri berikutnya.
    - **Reset Formulir:** Tombol untuk membersihkan semua input formulir.
    - **Field Dependencies:** Field tertentu (misalnya, Email Kontak) hanya muncul berdasarkan pilihan kategori.

### 3. **Impor & Ekspor Data**

- **Impor Massal:** Unggah produk dari file CSV, dengan template yang disediakan dan laporan hasil yang detail (berhasil & gagal).
- **Ekspor Fleksibel:** Ekspor data ke format **CSV**, **JSON**, atau **PDF** dengan opsi untuk mengekspor semua data, data yang difilter, atau hanya item yang dipilih.

### 4. **Audit Trail & Riwayat**

- **Log Aktivitas Global:** Halaman khusus ("Riwayat") yang mencatat semua aktivitas penting (Create, Update, Delete) dengan opsi filter berdasarkan produk, aksi, dan rentang tanggal.
- **Riwayat per Produk:** Lihat riwayat perubahan lengkap untuk setiap produk secara individual dalam modal khusus.

### 5. **Pengaturan & Konfigurasi**

- **Manajemen Kategori:** Halaman pengaturan untuk menambah, mengedit (inline), dan menghapus kategori produk. Sistem mencegah penghapusan kategori yang sedang digunakan.

### 6. **UI/UX Modern**

- **Mode Gelap (Dark Mode):** Beralih antara tema terang dan gelap yang nyaman di mata. Preferensi disimpan di Local Storage.
- **Notifikasi & Peringatan:**
  - **Notifikasi Toast:** Umpan balik instan untuk tindakan seperti menyimpan, memperbarui, atau menghapus data.
  - **Peringatan Stok Menipis:** Banner yang jelas muncul saat ada produk dengan stok rendah.
- **Desain Responsif:** Tampilan optimal di berbagai perangkat, dari desktop hingga seluler.
- **Dialog Konfirmasi:** Mencegah tindakan destruktif yang tidak disengaja (misalnya, penghapusan).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:**
  - **React 19:** Library JavaScript modern untuk membangun antarmuka pengguna.
  - **TypeScript:** Menambahkan tipe statis ke JavaScript untuk meningkatkan kualitas dan pemeliharaan kode.
- **Styling:**
  - **Tailwind CSS:** Framework CSS utility-first untuk desain yang cepat dan responsif. Konfigurasi mencakup mode gelap (`dark:class`).
- **Library Tambahan:**
  - **Recharts:** Untuk grafik dan visualisasi data di dashboard.
  - **jsPDF & jspdf-autotable:** Untuk menghasilkan ekspor data dalam format PDF di sisi klien.
- **Lingkungan:**
  - Aplikasi ini dirancang untuk berjalan dalam lingkungan yang menyediakan dependensi melalui `importmap`, seperti yang terlihat di `index.html`.

---

## 📂 Struktur Proyek

Struktur file diatur agar modular dan mudah dipahami:

```
/
├── index.html              # Titik masuk utama aplikasi (HTML)
├── index.tsx               # Root aplikasi React
├── App.tsx                 # Komponen utama yang mengelola state dan logika
├── types.ts                # Definisi tipe dan interface TypeScript
├── README.md               # Dokumentasi proyek
│
├── data/
│   └── mockData.ts         # Data awal untuk aplikasi
│
└── components/
    ├── App.tsx             # Komponen utama, state manager.
    ├── Header.tsx          # Header aplikasi (navigasi, tombol aksi).
    ├── Dashboard.tsx       # Tampilan dashboard dengan statistik & chart.
    ├── ProductTable.tsx    # Tabel interaktif untuk data produk.
    ├── ProductFormModal.tsx# Modal form untuk menambah/mengedit produk.
    ├── SettingsPage.tsx    # Halaman untuk mengelola kategori.
    ├── HistoryPage.tsx     # Halaman untuk menampilkan log audit global.
    ├── ImportModal.tsx     # Modal untuk impor data CSV.
    ├── ExportModal.tsx     # Modal untuk opsi ekspor data.
    ├── ConfirmationDialog.tsx# Dialog konfirmasi untuk aksi hapus.
    ├── NotificationToast.tsx # Komponen notifikasi toast.
    ├── ProductHistoryModal.tsx # Modal untuk riwayat per produk.
    └── Icons.tsx           # Kumpulan komponen ikon SVG.
```

---

## 🚀 Cara Menjalankan

Aplikasi ini dirancang untuk berjalan langsung di browser yang mendukung ES Modules dan `importmap`.**Pastikan semua file** berada dalam direktori yang sama.

1. **Sajikan file** menggunakan server web lokal. Anda dapat menggunakan ekstensi seperti "Live Server" di Visual Studio Code, atau server sederhana seperti:
   ```bash
   # Jika Anda memiliki Python 3
   python -m http.server

   # Jika Anda memiliki Node.js dan 'serve'
   npx serve .
   ```
3. Buka browser Anda dan navigasikan ke alamat server lokal (misalnya, `http://localhost:8000` atau `http://localhost:3000`). Aplikasi akan dimuat dan siap digunakan.
