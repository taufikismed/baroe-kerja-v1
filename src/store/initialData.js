// Helper untuk tanggal relatif YYYY-MM-DD
function getRelativeDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function getDefaultAgencyData() {
  const today = getRelativeDateStr(0);
  const yesterday = getRelativeDateStr(-1);
  const tomorrow = getRelativeDateStr(1);
  const nextWeek = getRelativeDateStr(5);

  return {
    klien: [
      {
        id: 'klien-1',
        nama: 'Kopi Kenangan Senja',
        warna: '#D97706', // Oranye Amber
        catatan: 'Chain coffee shop dengan 15 gerai di Jabodetabek. PIC: Mas Dimas (0812-9988-7766). Selalu butuh visual hangat dan font Poppins.',
        diarsipkan: false,
        dibuat: new Date(Date.now() - 30 * 86400000).toISOString()
      },
      {
        id: 'klien-2',
        nama: 'Aura Skincare Indonesia',
        warna: '#EC4899', // Pink
        catatan: 'Brand skincare vegan & organik D2C. Target market Gen Z & Millennial. PIC: Mbak Rania. Brand tone: ceria, edukatif, minimalis.',
        diarsipkan: false,
        dibuat: new Date(Date.now() - 20 * 86400000).toISOString()
      },
      {
        id: 'klien-3',
        nama: 'Nusantara FinTech',
        warna: '#2563EB', // Biru
        catatan: 'Aplikasi dompet digital & investasi mikro. PIC: Pak Hendra. Regulasi ketat OJK, copy harus akurat dan tanpa janji return pasti.',
        diarsipkan: false,
        dibuat: new Date(Date.now() - 14 * 86400000).toISOString()
      }
    ],

    proyek: [
      {
        id: 'proyek-1',
        klienId: 'klien-1',
        nama: 'Kampanye Menu Baru "Salted Caramel Cold Brew"',
        status: 'aktif',
        tanggalMulai: getRelativeDateStr(-7),
        tenggatAkhir: nextWeek,
        diarsipkan: false,
        dibuat: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'proyek-2',
        klienId: 'klien-2',
        nama: 'Konten Rutin Medsos & KOL Campaign Oktober',
        status: 'aktif',
        tanggalMulai: getRelativeDateStr(-10),
        tenggatAkhir: getRelativeDateStr(20),
        diarsipkan: false,
        dibuat: new Date(Date.now() - 10 * 86400000).toISOString()
      },
      {
        id: 'proyek-3',
        klienId: 'klien-3',
        nama: 'Revamp UI Landing Page & Iconography Brand',
        status: 'aktif',
        tanggalMulai: getRelativeDateStr(-5),
        tenggatAkhir: getRelativeDateStr(15),
        diarsipkan: false,
        dibuat: new Date(Date.now() - 5 * 86400000).toISOString()
      }
    ],

    tugas: [
      // Tugas Terlambat & Hari Ini untuk membuktikan Layar Hari Ini
      {
        id: 'tugas-1',
        klienId: 'klien-1',
        proyekId: 'proyek-1',
        judul: 'Revisi banner promo GrabFood (perbesar logo & sertakan badge Halal)',
        status: 'Revisi',
        prioritas: 'Mendesak',
        tenggat: today,
        dipin: true,
        labels: ['Revisi', 'Desain Banner'],
        catatan: 'Mas Dimas minta logo dinaikkan 20% dan warna tombol CTA dibuat hijau kontras.',
        dibuat: new Date(Date.now() - 2 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: null
      },
      {
        id: 'tugas-2',
        klienId: 'klien-1',
        proyekId: 'proyek-1',
        judul: 'Desain 5 slide Carousel Instagram teaser peluncuran rasa baru',
        status: 'Dikerjakan',
        prioritas: 'Tinggi',
        tenggat: today,
        dipin: true,
        labels: ['Sosial Media', 'Carousel'],
        catatan: 'Fokus pada tetesan karamel & tekstur cold brew creamy.',
        dibuat: new Date(Date.now() - 3 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: null
      },
      {
        id: 'tugas-3',
        klienId: 'klien-2',
        proyekId: 'proyek-2',
        judul: 'Kirim draf brief script endorsement KOL TikTok ke Mbak Rania',
        status: 'Menunggu Klien',
        prioritas: 'Sedang',
        tenggat: yesterday, // Terlambat / menunggu respon
        dipin: false,
        labels: ['KOL', 'Approval'],
        catatan: 'Sudah dikirim via email kemarin pukul 16:30, menunggu review legal tim Aura.',
        dibuat: new Date(Date.now() - 4 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: null
      },
      {
        id: 'tugas-4',
        klienId: 'klien-2',
        proyekId: 'proyek-2',
        judul: 'Edit video Reels estetik tutorial skincare 3 langkah malam',
        status: 'Dikerjakan',
        prioritas: 'Tinggi',
        tenggat: tomorrow,
        dipin: false,
        labels: ['Video', 'Reels'],
        catatan: 'Audio pakai sound trending ASMR kecantikan.',
        dibuat: new Date(Date.now() - 1 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: null
      },
      {
        id: 'tugas-5',
        klienId: 'klien-3',
        proyekId: 'proyek-3',
        judul: 'Moodboard & style guide ilustrasi 3D FinTech modern',
        status: 'Selesai',
        prioritas: 'Sedang',
        tenggat: yesterday,
        dipin: false,
        labels: ['UI/UX', 'Eksplorasi'],
        catatan: 'Klien setuju dengan arah gaya semi-glassmorphism.',
        dibuat: new Date(Date.now() - 5 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: yesterday
      },
      {
        id: 'tugas-6',
        klienId: 'klien-3',
        proyekId: 'proyek-3',
        judul: 'Wireframe low-fidelity Hero section & kalkulator simulasi bunga',
        status: 'Brief',
        prioritas: 'Sedang',
        tenggat: nextWeek,
        dipin: false,
        labels: ['UI/UX', 'Wireframe'],
        catatan: 'Menunggu dokumen API kalkulator dari tim backend Nusantara.',
        dibuat: new Date(Date.now() - 1 * 86400000).toISOString(),
        diubah: new Date().toISOString(),
        selesaiPada: null
      }
    ],

    catatan: [
      {
        id: 'catatan-1',
        klienId: 'klien-1',
        proyekId: 'proyek-1',
        judul: 'Brand Guidelines & Catatan Brief Kopi Kenangan Senja',
        isi: `### Arahan Visual Musim Ini:
- **Warna Utama**: Cokelat Kopi Espresso (#3E2723), Cream Caramel (#EED9C4), dan Putih.
- **Tipografi**: Poppins Bold untuk Headline, Inter Regular untuk Body copy.
- **Tone of Voice**: Bersahabat, hangat, kasual ala teman ngopi sore.
- **Larangan Keras**: Jangan memakai saturasi warna terlalu tinggi atau ornamen berlebihan.`,
        dipin: true,
        labels: ['Brand Guide', 'Brief'],
        isIde: false,
        dibuat: new Date(Date.now() - 7 * 86400000).toISOString(),
        diubah: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'catatan-2',
        klienId: 'klien-2',
        proyekId: 'proyek-2',
        judul: 'Daftar 8 Micro-Influencer Skincare Terpilih untuk Campaign',
        isi: `1. @sarahglowdiary (15k follower) — Engagement 4.8%, fokus jerawat
2. @nadia.cleanbeauty (22k follower) — Tone sangat edukatif
3. @dimas.skindude (18k follower) — Representasi segmen pria muda
4. @clarissa.organics (30k follower) — Rate card masuk anggaran

*Status: Tahap kontak awal via DM & email manajemen.*`,
        dipin: false,
        labels: ['KOL', 'Influencer'],
        isIde: false,
        dibuat: new Date(Date.now() - 4 * 86400000).toISOString(),
        diubah: new Date(Date.now() - 1 * 86400000).toISOString()
      },
      // Catatan Ide Cepat (F14)
      {
        id: 'ide-1',
        klienId: null,
        proyekId: null,
        judul: 'Ide Konten Reels Agensi: "POV Revisi Jam 22.00 Malam"',
        isi: 'Bikin video humor singkat: Ekspresi tenang desainer saat buka email dengan subjek "Revisi Kecil Dikit Aja Mas (Sent from iPhone)" tapi pas dibuka ada 14 slide PDF.',
        dipin: true,
        labels: ['Ide Konten', 'Agensi'],
        isIde: true,
        dibuat: new Date(Date.now() - 3 * 86400000).toISOString(),
        diubah: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'ide-2',
        klienId: null,
        proyekId: null,
        judul: 'Template Pitch Deck Onboarding Klien Baru',
        isi: 'Struktur: 1. Masalah Klien, 2. Solusi Kreatif Kami, 3. Timeline Siklus Kerja (Brief -> Revisi -> Approval), 4. Portofolio Relevan, 5. Biaya & Paket.',
        dipin: false,
        labels: ['Pitch Deck', 'Bisnis'],
        isIde: true,
        dibuat: new Date(Date.now() - 1 * 86400000).toISOString(),
        diubah: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ],

    labels: [
      { id: 'label-1', nama: 'Revisi', warna: '#D97706' },
      { id: 'label-2', nama: 'Desain Banner', warna: '#10B981' },
      { id: 'label-3', nama: 'Sosial Media', warna: '#EC4899' },
      { id: 'label-4', nama: 'KOL', warna: '#8B5CF6' },
      { id: 'label-5', nama: 'UI/UX', warna: '#3B82F6' },
      { id: 'label-6', nama: 'Ide Konten', warna: '#F59E0B' },
      { id: 'label-7', nama: 'Brand Guide', warna: '#6366F1' }
    ],

    templates: [
      {
        id: 'template-1',
        nama: 'Konten Bulanan Media Sosial',
        deskripsi: 'Paket alur kerja standar manajemen akun sosial media agensi per bulan',
        items: [
          { judul: 'Riset Tren, Kalender Konten & Pillar Topik', prioritas: 'Sedang', offsetHari: 0, status: 'Brief' },
          { judul: 'Penyusunan Copywriting & Hook Caption', prioritas: 'Tinggi', offsetHari: 2, status: 'Brief' },
          { judul: 'Desain Visual Feed, Carousel & Template Story', prioritas: 'Tinggi', offsetHari: 4, status: 'Brief' },
          { judul: 'Review Internal & QC Brand Consistency', prioritas: 'Sedang', offsetHari: 5, status: 'Brief' },
          { judul: 'Pengiriman Preview ke Klien untuk Persetujuan', prioritas: 'Sedang', offsetHari: 6, status: 'Menunggu Klien' },
          { judul: 'Revisi Akhir sesuai Feedback Klien', prioritas: 'Tinggi', offsetHari: 8, status: 'Revisi' },
          { judul: 'Jadwalkan Seluruh Postingan di Meta Business Suite', prioritas: 'Rendah', offsetHari: 10, status: 'Brief' }
        ]
      },
      {
        id: 'template-2',
        nama: 'Paket Identitas Visual & Branding',
        deskripsi: 'Alur pembuatan logo, warna, dan panduan identitas visual baru',
        items: [
          { judul: 'Sesi Wawancara Brief & Discovery Klien', prioritas: 'Tinggi', offsetHari: 0, status: 'Brief' },
          { judul: 'Eksplorasi Moodboard & Brand Personality', prioritas: 'Sedang', offsetHari: 3, status: 'Brief' },
          { judul: 'Pembuatan 3 Alternatif Konsep Logo Utama', prioritas: 'Mendesak', offsetHari: 7, status: 'Brief' },
          { judul: 'Presentasi Konsep Logo ke Klien', prioritas: 'Tinggi', offsetHari: 9, status: 'Menunggu Klien' },
          { judul: 'Eksekusi Revisi Terpilih (Maksimal 2 Putaran)', prioritas: 'Tinggi', offsetHari: 12, status: 'Revisi' },
          { judul: 'Penyusunan Berkas Brand Guideline PDF & Export Master', prioritas: 'Sedang', offsetHari: 15, status: 'Brief' }
        ]
      },
      {
        id: 'template-3',
        nama: 'Revisi Kilat Desain / Materi Promo',
        deskripsi: 'Penanganan cepat tiket revisi klien dengan tenggat ketat',
        items: [
          { judul: 'Inventarisasi Feedback & Catatan Revisi Klien', prioritas: 'Mendesak', offsetHari: 0, status: 'Brief' },
          { judul: 'Eksekusi Perubahan Desain sesuai Catatan', prioritas: 'Mendesak', offsetHari: 1, status: 'Dikerjakan' },
          { judul: 'Quality Check & Kirim Kembali ke Klien', prioritas: 'Tinggi', offsetHari: 1, status: 'Menunggu Klien' }
        ]
      }
    ],

    pengaturan: {
      theme: 'system',
      lastBackupDate: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 hari lalu
      backupReminderDays: 7,
      supabaseConfig: {
        url: '',
        anonKey: '',
        syncEnabled: false
      }
    }
  };
}
