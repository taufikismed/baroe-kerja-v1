# BaroeKerja — Aplikasi Catatan & Daftar Pekerjaan untuk Agensi Kreatif

BaroeKerja adalah aplikasi web pribadi (PWA) untuk mencatat dan mengelola alur kerja agensi kreatif digital, dikelompokkan per klien dan proyek, dengan layar **"Hari Ini"** yang menjawab *"apa yang harus dikerjakan hari ini"*.

---

## 🚀 Fitur Utama Berdasarkan PRD

### 1. Layar "Hari Ini" (F5)
* Menampilkan tugas yang **jatuh tempo hari ini** dan **tugas yang terlambat** tanpa filter manual.
* Pengelompokan cerdas: *Terlambat* (peringatan merah), *Hari Ini*, dan *Selesai* (tercoret).
* Bilah progres visual dan statistik penyelesaian harian.

### 2. Alur Kerja Kreatif Agensi (F4)
* Siklus status nyata agensi digital dalam 1-klik:
  * 🔘 **Brief** (Abu-abu `#6B7280`)
  * 🔵 **Dikerjakan** (Biru `#2563EB`)
  * 🟠 **Revisi** (Oranye `#D97706`)
  * 🟣 **Menunggu Klien** (Ungu `#7C3AED`)
  * 🟢 **Selesai** (Hijau `#22C55E` dengan efek perayaan & coretan)
* Penanda tanggal tenggat pintar: otomatis merah jika lewat tenggat.

### 3. Portofolio Klien & Proyek (F1, F2, F12)
* Kelola klien dengan **warna penanda unik** dan catatan PIC.
* Proyek berada tepat di bawah satu klien dengan status aktif / selesai.
* Konfirmasi hapus klien dengan **peringatan kaskade** (menghitung jumlah proyek, tugas, dan catatan yang ikut terhapus).
* **Papan Kanban (F12)** per proyek dengan 5 kolom status dan interaksi seret-lepas (*drag & drop*).

### 4. Catatan & Brief dengan Auto-Save (F3)
* Editor catatan dengan format: Heading (H1, H2, H3), Tebal, Miring, Daftar Butir, Checklist, Kutipan, dan Tautan.
* **Auto-save otomatis** dalam 1 detik setelah berhenti mengetik dengan indikator visual.
* Pin catatan ke bagian atas.

### 5. Catatan Ide Cepat (F14)
* Tombol **"+ Tangkap Ide"** tersedia di semua layar (Header & Floating Action Button).
* Simpan dalam 2 ketukan tanpa harus memilih klien atau proyek.
* Fitur konversi instan: **Ubah Menjadi Tugas** atau **Pindahkan ke Catatan Proyek**.

### 6. Template Tugas Berulang (F11)
* Pilihan template alur kerja bawaan:
  * *Konten Bulanan Media Sosial* (+0 hari s/d +10 hari)
  * *Paket Identitas Visual & Branding* (+0 hari s/d +15 hari)
  * *Revisi Kilat Desain / Materi Promo* (+0 hari s/d +1 hari)
* Pilih tanggal mulai -> tugas terbuat otomatis dengan tenggat relatif!

### 7. Pencarian Global Kilat <300ms (F7)
* Shortcut **`⌘K` / `Ctrl+K`** atau tombol cari.
* Pencarian instan lintas klien, proyek, tugas, dan catatan.
* Navigasi keyboard cepat.

### 8. Cadangan Data JSON & Pengingat 7 Hari (F9)
* Ekspor seluruh data ke format `.json`.
* Impor cadangan dengan modal konfirmasi peringatan sebelum menimpa data.
* **Pengingat otomatis** jika sudah lebih dari 7 hari sejak pencadangan terakhir.

### 9. Desain Brand Hijau & Mode Gelap (F10)
* Palet warna brand hijau agensi sesuai pedoman PRD.
* Mendukung mode **Terang**, **Gelap**, dan **Sistem (Otomatis)**.
* Kontras teks teruji $\ge 4.5:1$ dan target sentuh $\ge 44\text{ px}$.

### 10. Progressive Web App (PWA) & Mobile Ready (F15)
* Tata letak laptop: Sidebar navigasi lengkap.
* Tata letak ponsel: Navigasi bawah 4 tab (*Hari Ini*, *Klien*, *Catatan*, *Cari*) + Tombol Aksi Mengambang (FAB).
* Dapat dipasang (*Install PWA*) di Android / Desktop.

---

## 🛠️ Menjalankan Aplikasi

```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan dev server lokal
npm run dev

# 3. Buka di browser
# http://localhost:5173
```
