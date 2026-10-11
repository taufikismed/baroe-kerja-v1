# PRD: BaroeKerja, Aplikasi Catatan & Daftar Pekerjaan untuk Agensi Kreatif

Oct 11, 2026 · @Taufik Ismed Baroedigma

## Ringkasan & Latar Belakang

BaroeKerja adalah aplikasi web pribadi untuk mencatat dan mengelola pekerjaan agensi kreatif digital, dikelompokkan per klien dan proyek, dengan satu layar yang menjawab "apa yang harus dikerjakan hari ini".

Aplikasi catatan dan to-do generik (Google Keep, Todoist, Notion) sudah matang, tetapi tidak mengenal alur kerja agensi: brief, revisi, dan menunggu persetujuan klien. Aplikasi ini dibangun sendiri hanya untuk menutup celah itu, bukan untuk bersaing dengan produk tersebut. Penggunanya satu orang dan tidak ada rencana untuk dijual.

## Tujuan & Non-Tujuan

Versi pertama dianggap berhasil jika dipakai setiap hari kerja untuk mengelola pekerjaan klien, tanpa perlu membuka aplikasi lain.

**Tujuan**

1. Semua catatan dan tugas klien tersimpan di satu tempat dan bisa ditemukan dalam hitungan detik.
2. Layar "Hari Ini" menampilkan tugas yang jatuh tempo dan yang terlambat tanpa perlu filter manual.
3. Status pekerjaan mengikuti siklus kerja kreatif (Brief sampai Selesai), bukan sekadar centang.
4. Data aman dari kehilangan lewat ekspor dan impor cadangan.
5. Tampilan konsisten dengan brand hijau dan nyaman dipakai di laptop maupun ponsel.

**Non-tujuan (sengaja tidak dikerjakan)**

- Kolaborasi multi-pengguna dan portal klien.
- Penagihan, invoice, dan pelacakan waktu kerja.
- Notifikasi push dan integrasi kalender.
- Editor dokumen penuh setara Notion; cukup format dasar.
- Dipasarkan ke pengguna lain.

## Pengguna & Skenario Pemakaian

Satu pengguna: pemilik agensi kreatif digital yang menangani beberapa klien sekaligus dan berpindah antara laptop dan ponsel.

| Skenario | Yang dilakukan pengguna | Hasil yang diharapkan |
| --- | --- | --- |
| Mulai hari kerja | Membuka layar Hari Ini | Melihat tugas jatuh tempo dan terlambat, diurutkan prioritas |
| Brief baru masuk | Membuat proyek di bawah klien, menempel catatan brief dan tautan referensi | Semua konteks klien ada di satu halaman |
| Memulai paket rutin | Memilih template "Konten Bulanan" | Daftar tugas standar terbentuk otomatis dengan tenggat |
| Klien minta revisi | Mengubah status tugas ke Revisi dan menambah catatan | Riwayat revisi tercatat di proyek |
| Mencari info lama | Mengetik kata kunci di pencarian | Catatan dan tugas yang cocok muncul lintas klien |
| Ganti perangkat atau browser | Mengekspor lalu mengimpor cadangan | Data pulih utuh |

## Ruang Lingkup Fitur

MVP hanya memuat fitur yang dipakai setiap hari; sisanya menunggu sampai MVP terbukti terpakai.

| Fase | Fitur | Catatan |
| --- | --- | --- |
| MVP | Klien, proyek, catatan, tugas, status kerja, tenggat, label, pencarian, pin, layar Hari Ini, catatan ide, template tugas berulang, mode gelap, ekspor/impor cadangan, PWA untuk Android, login, sinkronisasi laptop dan Android | Memakai layanan backend siap pakai untuk login dan sinkronisasi |
| Fase 2 | Tampilan papan (kanban) per proyek, arsip proyek selesai | Setelah MVP dipakai rutin |
| Fase 3 | Penyuntingan offline penuh dengan antrean sinkronisasi | Hanya jika pemakaian tanpa internet sering dibutuhkan |
| Ditunda | Notifikasi, integrasi kalender, kolaborasi, penagihan | Lihat Non-tujuan |

## Persyaratan Fungsional

Prioritas: P0 wajib ada di MVP, P1 menyusul di Fase 2.

| ID | Persyaratan | Prioritas | Kriteria penerimaan |
| --- | --- | --- | --- |
| F1 | Kelola klien: tambah, ubah, hapus, arsipkan | P0 | Klien baru muncul di daftar; menghapus klien meminta konfirmasi dan menyebutkan jumlah proyek yang ikut terhapus |
| F2 | Kelola proyek di bawah klien | P0 | Setiap proyek punya tepat satu klien, nama, dan status aktif atau selesai |
| F3 | Catatan dengan judul dan isi (tebal, daftar, heading, tautan) | P0 | Perubahan tersimpan otomatis dalam 1 detik setelah berhenti mengetik |
| F4 | Tugas dengan judul, tenggat, prioritas, dan status (Brief, Dikerjakan, Revisi, Menunggu Klien, Selesai) | P0 | Status bisa diganti dalam satu klik; tugas Selesai tampil tercoret dan turun ke bawah |
| F5 | Layar Hari Ini | P0 | Memuat tugas jatuh tempo hari ini dan yang terlambat, terurut prioritas lalu tenggat |
| F6 | Label pada catatan dan tugas | P0 | Satu item bisa punya lebih dari satu label; filter label bisa digabung dengan filter klien |
| F7 | Pencarian global | P0 | Mengetik kata kunci menampilkan catatan dan tugas yang cocok dari semua klien tanpa menunggu lebih dari 300 ms |
| F8 | Pin catatan atau tugas | P0 | Item yang dipin selalu di bagian atas daftarnya |
| F9 | Ekspor dan impor cadangan (JSON) | P0 | Impor mengembalikan seluruh data persis seperti saat diekspor; impor meminta konfirmasi sebelum menimpa data yang ada |
| F10 | Mode terang dan gelap | P0 | Mengikuti pengaturan perangkat dan bisa diubah manual |
| F11 | Template tugas berulang | P0 | Memilih template membuat sekumpulan tugas dengan tenggat relatif terhadap tanggal mulai |
| F12 | Tampilan papan per proyek | P1 | Tugas bisa dipindah antar kolom status dengan seret dan lepas |
| F13 | Arsip proyek selesai | P1 | Proyek terarsip tidak muncul di daftar aktif tetapi tetap bisa dicari |
| F14 | Catatan ide: catatan cepat tanpa klien atau proyek untuk menyimpan ide yang terlintas | P0 | Tombol tambah ide tersedia di semua layar dan menyimpan dalam dua ketukan; ide bisa dicari, diberi label, dan diubah menjadi tugas atau dipindah ke proyek |
| F15 | Dapat dipasang dan dipakai di Android (PWA) | P0 | Bisa ditambahkan ke layar utama dari Chrome Android, terbuka layar penuh, dan halamannya tetap terbuka saat sinyal lemah (menyimpan data membutuhkan internet) |
| F16 | Sinkronisasi data antara laptop dan Android dengan satu akun | P0 | Perubahan di satu perangkat muncul di perangkat lain setelah aplikasi dibuka atau disegarkan; masuk dengan akun yang sama; memakai layanan backend siap pakai dan membutuhkan internet untuk menyimpan |

## Persyaratan Non-Fungsional

Risiko terbesar versi tanpa backend adalah kehilangan data, jadi cadangan diperlakukan sebagai persyaratan, bukan fitur tambahan.

| Aspek | Persyaratan |
| --- | --- |
| Penyimpanan data | Data utama disimpan di database layanan backend; browser hanya menyimpan sesi login dan cache sementara |
| Cadangan | Pengingat ekspor cadangan jika sudah lebih dari 7 hari sejak ekspor terakhir |
| Performa | Halaman termuat di bawah 2 detik dan tetap lancar dengan 1.000 catatan dan tugas |
| Responsif | Dapat dipakai nyaman di lebar layar 360 px ke atas; target sentuh minimal 44 px |
| Aksesibilitas | Kontras teks minimal 4,5:1 dan seluruh fungsi inti bisa dioperasikan dengan keyboard |
| Privasi | Data tersimpan di layanan pihak ketiga: login dengan kata sandi kuat, akses data dibatasi hanya untuk akun pemilik, dan kata sandi atau data sensitif klien tidak disimpan di catatan |
| Kompatibilitas | Versi terbaru Chrome (termasuk Android), Edge, Safari, dan Firefox |
| Bahasa | Antarmuka berbahasa Indonesia |

## Model Data

Klien memiliki proyek, dan proyek memiliki catatan dan tugas; label dan template menjadi pendukungnya.

| Entitas | Field utama | Relasi |
| --- | --- | --- |
| Klien | id, nama, warna penanda, catatan singkat, diarsipkan | Memiliki banyak proyek |
| Proyek | id, nama, status (aktif/selesai), tanggal mulai, tenggat akhir | Milik satu klien; memiliki banyak catatan dan tugas |
| Catatan | id, judul, isi, dipin, dibuat, diubah | Milik satu proyek (atau tanpa proyek untuk catatan umum); banyak label |
| Tugas | id, judul, status, prioritas, tenggat, dipin, dibuat, diubah | Milik satu proyek (atau tanpa proyek); banyak label |
| Label | id, nama | Dipakai oleh catatan dan tugas |
| Template (Fase 2) | id, nama, daftar tugas dengan tenggat relatif | Menghasilkan tugas di sebuah proyek |

Semua entitas memakai id unik yang dibuat di sisi klien dan disertakan dalam berkas cadangan, sehingga data yang sama dapat dipindah antar layanan backend tanpa mengubah struktur.

## UI/UX & Panduan Brand Hijau

Hijau dipakai hemat: sebagai warna aksi dan penanda status selesai, sementara latar dan teks tetap netral supaya daftar kerja mudah dibaca berjam-jam.

**Palet warna**

| Peran | Mode terang | Mode gelap | Pemakaian |
| --- | --- | --- | --- |
| Hijau utama | #15803D | #4ADE80 | Tombol utama, tautan, item menu aktif |
| Hijau tua | #14532D | #166534 | Judul, header, tombol saat ditekan |
| Hijau aksen | #22C55E | #22C55E | Ikon, indikator, badge Selesai (bukan untuk teks kecil di latar putih) |
| Hijau muda | #DCFCE7 | #14301F | Latar item terpilih dan hover |
| Latar halaman | #F0FDF4 | #0F1A14 | Latar belakang aplikasi |
| Permukaan | #FFFFFF | #16241C | Kartu, panel, editor |
| Teks utama | #1F2937 | #E5E7EB | Isi dan judul |
| Teks sekunder | #6B7280 | #9CA3AF | Keterangan, tanggal |
| Garis pemisah | #E5E7EB | #243629 | Border kartu dan tabel |

**Warna status tugas** (dibuat berbeda dari hijau agar tidak tertukar dengan Selesai)

| Status | Warna |
| --- | --- |
| Brief | Abu-abu #6B7280 |
| Dikerjakan | Biru #2563EB |
| Revisi | Oranye #D97706 |
| Menunggu Klien | Ungu #7C3AED |
| Selesai | Hijau aksen #22C55E |
| Terlambat | Merah #DC2626 |

**Tipografi:** Inter dengan cadangan sistem (system-ui, sans-serif); teks isi 16 px, judul halaman 24 px dengan bobot 600, keterangan 13 px.

**Tata letak**

- Laptop: bilah samping berisi Hari Ini, daftar klien, dan label; area utama memuat daftar tugas dan catatan.
- Ponsel: navigasi bawah dengan empat tab (Hari Ini, Klien, Catatan, Cari) dan tombol tambah mengambang berwarna hijau utama.
- Kartu tugas: judul, badge status, tenggat, dan penanda klien dengan warna kecil di sisi kiri.
- Status kosong (belum ada tugas atau catatan) menampilkan satu kalimat petunjuk dan satu tombol aksi.

**Aturan penggunaan hijau:** teks dan ikon hijau di latar putih memakai #15803D atau lebih gelap agar kontrasnya minimal 4,5:1; #22C55E hanya untuk elemen grafis dan badge dengan teks gelap di dalamnya.

## Arsitektur & Teknologi

Laptop dan Android memakai satu aplikasi web (PWA) dan satu database di layanan backend siap pakai; keduanya menyimpan dan memuat data lewat internet (online-first).

&#91;embedded content: arsitektur · laptop dan Android memakai satu layanan backend\]

Aplikasi menyimpan dan memuat data lewat internet; penyuntingan offline penuh ditunda ke Fase 3.

- **Antarmuka:** Vue (framework JavaScript) dengan HTML dan CSS; warna brand dan mode terang/gelap diatur lewat variabel CSS.
- **Penyimpanan MVP:** database di layanan backend siap pakai (Supabase), dengan cadangan berupa berkas JSON.
- **Hosting MVP:** situs statis dengan HTTPS agar bisa dipasang sebagai PWA di Android.
- **Fase 3:** penyuntingan offline penuh dengan antrean sinkronisasi, atau pindah ke backend buatan sendiri bila perlu; cadangan JSON memudahkan perpindahan itu.

## Metrik, Roadmap, Risiko & Pertanyaan Terbuka

Keberhasilan diukur dari satu hal: apakah aplikasi ini benar-benar menggantikan catatan dan daftar kerja yang tersebar di tempat lain.

**Metrik keberhasilan (target usulan)**

- Dipakai minimal 5 hari kerja per minggu selama 4 minggu berturut-turut setelah MVP selesai.
- Menemukan catatan lama dalam kurang dari 10 detik sejak aplikasi dibuka.
- Satu cadangan JSON per minggu, dan uji impor ke browser lain berhasil memulihkan seluruh data.
- Tidak ada pekerjaan klien baru yang dicatat di aplikasi lain.

**Roadmap**

1. **Fase 1, MVP:** kerangka, klien dan proyek, catatan, tugas, layar Hari Ini, pencarian, catatan ide, template tugas berulang, cadangan, PWA Android, sinkronisasi, tema hijau. Gerbang ke fase berikutnya: dipakai untuk satu klien nyata selama 2 minggu.
2. **Fase 2:** tampilan papan, arsip proyek. Gerbang: MVP terpakai rutin dan fitur ini memang terasa dibutuhkan.
3. **Fase 3:** fitur lanjutan sinkronisasi seperti pemakaian offline penuh. Gerbang: pemakaian tanpa internet memang sering dibutuhkan.

**Risiko**

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Data hilang atau tidak bisa diakses karena akun atau layanan bermasalah | Tinggi | Ekspor cadangan JSON dengan pengingat 7 hari |
| Fitur melebar sebelum MVP selesai | Sedang | Daftar Non-tujuan ditegakkan; ide baru dicatat untuk Fase 2 |
| Terlalu banyak waktu untuk mengutak-atik tampilan | Sedang | Pakai palet di dokumen ini apa adanya sampai MVP dipakai nyata |
| Ketergantungan pada layanan pihak ketiga (batas gratis, perubahan harga) | Sedang | Data bisa diekspor kapan saja sehingga bisa pindah layanan atau membangun backend sendiri |
| Hijau kurang terbaca di latar terang | Rendah | Ikuti aturan kontras pada bagian UI |

**Pertanyaan terbuka**

- [x] Nama aplikasi: BaroeKerja
- [x] Template tugas berulang: masuk MVP
- [x] Antarmuka memakai Vue (framework JavaScript, cocok untuk belajar JavaScript)
- [x] Sinkronisasi laptop dan Android memakai layanan backend siap pakai
- [x] Layanan backend: Supabase (dipilih karena data klien, proyek, dan tugas berelasi)
- [x] Catatan di luar urusan klien: ya, berupa catatan ide (F14)
