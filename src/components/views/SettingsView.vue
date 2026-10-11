<template>
  <div class="settings-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h1 class="page-title">Pengaturan & Cadangan Data</h1>
        <p class="page-subtitle">
          Kelola preferensi tema tampilan, ekspor cadangan JSON, dan konfigurasi sinkronisasi cloud.
        </p>
      </div>
    </div>

    <!-- Peringatan Cadangan > 7 Hari (F9 & Non-Fungsional) -->
    <div v-if="isBackupDue" class="alert-banner-box">
      <AlertTriangle :size="20" class="alert-icon" />
      <div class="alert-content">
        <h4 class="alert-title">Waktunya Cadangkan Data!</h4>
        <p class="alert-desc">
          Sudah lebih dari 7 hari sejak ekspor cadangan terakhir. Cadangkan data Anda secara berkala agar aman dari kehilangan riwayat browser.
        </p>
      </div>
      <button type="button" class="btn btn-primary btn-sm" @click="handleExport">
        <Download :size="14" />
        Ekspor Sekarang
      </button>
    </div>

    <div class="settings-sections-grid">
      <!-- SEKSI 1: CADANGAN DATA JSON (F9) -->
      <div class="settings-card card">
        <div class="section-title-row">
          <Database :size="18" class="icon-brand" />
          <h2 class="section-title">Cadangan & Pemulihan (JSON)</h2>
        </div>
        <p class="section-desc">
          Seluruh data klien, proyek, tugas, catatan, dan template tersimpan dalam format berkas JSON portabel.
        </p>

        <div class="backup-status-row">
          <span class="status-label">Terakhir dicadangkan:</span>
          <span class="status-val">{{ lastBackupFormatted }}</span>
        </div>

        <div class="backup-actions-row">
          <button type="button" class="btn btn-primary" @click="handleExport">
            <Download :size="16" />
            <span>Ekspor Cadangan (.JSON)</span>
          </button>

          <label class="btn btn-secondary btn-upload-label">
            <Upload :size="16" />
            <span>Impor Cadangan (.JSON)</span>
            <input 
              ref="fileInputRef"
              type="file" 
              accept=".json" 
              class="hidden-file-input" 
              @change="handleFileSelected" 
            />
          </label>
        </div>

        <div class="reset-data-box">
          <div class="reset-info">
            <span class="reset-title">Reset ke Data Contoh Agensi</span>
            <span class="reset-desc">Muat ulang data contoh (Kopi Kenangan Senja, Aura Skincare, dsb) untuk eksplorasi.</span>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" @click="handleResetDefault">
            <RotateCcw :size="14" />
            Reset Data
          </button>
        </div>
      </div>

      <!-- SEKSI 2: TEMA TAMPILAN (F10) -->
      <div class="settings-card card">
        <div class="section-title-row">
          <Palette :size="18" class="icon-brand" />
          <h2 class="section-title">Tema Tampilan (Brand Hijau)</h2>
        </div>
        <p class="section-desc">
          Pilih tema visual aplikasi yang nyaman di mata untuk bekerja berjam-jam.
        </p>

        <div class="theme-options-grid">
          <button 
            type="button" 
            class="theme-option-box" 
            :class="{ active: state.pengaturan.theme === 'light' }"
            @click="selectTheme('light')"
          >
            <Sun :size="24" class="theme-icon light" />
            <span class="theme-label">Mode Terang</span>
            <span class="theme-sub">Latar #F0FDF4</span>
          </button>

          <button 
            type="button" 
            class="theme-option-box" 
            :class="{ active: state.pengaturan.theme === 'dark' }"
            @click="selectTheme('dark')"
          >
            <Moon :size="24" class="theme-icon dark" />
            <span class="theme-label">Mode Gelap</span>
            <span class="theme-sub">Latar #0F1A14</span>
          </button>

          <button 
            type="button" 
            class="theme-option-box" 
            :class="{ active: state.pengaturan.theme === 'system' }"
            @click="selectTheme('system')"
          >
            <Laptop :size="24" class="theme-icon system" />
            <span class="theme-label">Otomatis (Sistem)</span>
            <span class="theme-sub">Ikuti preferensi OS</span>
          </button>
        </div>
      </div>

      <!-- SEKSI 3: SINKRONISASI CLOUD SUPABASE (F16) -->
      <div class="settings-card card">
        <div class="section-title-row">
          <Cloud :size="18" class="icon-brand" />
          <h2 class="section-title">Sinkronisasi Cloud (Supabase)</h2>
        </div>
        <p class="section-desc">
          Sesuai PRD F16, aplikasi siap dihubungkan ke database Supabase untuk sinkronisasi instan antara laptop dan smartphone Android.
        </p>

        <div class="supabase-form">
          <div class="form-group">
            <label class="form-label">Supabase Project URL</label>
            <input 
              v-model="state.pengaturan.supabaseConfig.url" 
              type="text" 
              class="input-text" 
              placeholder="https://xyzcompany.supabase.co" 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Supabase Anon Key</label>
            <input 
              v-model="state.pengaturan.supabaseConfig.anonKey" 
              type="password" 
              class="input-text" 
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." 
            />
          </div>

          <div class="cloud-status-badge">
            <span class="badge-dot" :class="state.pengaturan.supabaseConfig.url ? 'dot-active' : ''"></span>
            <span>
              {{ state.pengaturan.supabaseConfig.url ? 'Konfigurasi cloud tersimpan' : 'Mode Penyimpanan Lokal Aktif (Offline-ready)' }}
            </span>
          </div>
        </div>
      </div>

      <!-- SEKSI 4: INFORMASI APLIKASI & BRAND -->
      <div class="settings-card card">
        <div class="section-title-row">
          <Smartphone :size="18" class="icon-brand" />
          <h2 class="section-title">PWA & Informasi Agensi</h2>
        </div>
        <p class="section-desc">
          BaroeKerja v1.0.0 — Dibuat untuk agensi kreatif digital oleh @Taufik Ismed Baroedigma.
        </p>
        <ul class="pwa-features-list">
          <li>✓ Mendukung Progressive Web App (PWA) di Google Chrome & Android</li>
          <li>✓ Target sentuh responsif minimal 44 px untuk kenyamanan ponsel</li>
          <li>✓ Navigasi keyboard penuh dan kontras teks minimal 4,5:1</li>
          <li>✓ Standar siklus kerja kreatif: Brief → Dikerjakan → Revisi → Menunggu Klien → Selesai</li>
        </ul>
      </div>
    </div>

    <!-- Modal Konfirmasi Timpa Data Saat Impor (F9 kriteria penerimaan) -->
    <div v-if="pendingImportData" class="modal-overlay" @click.self="pendingImportData = null">
      <div class="modal-content modal-import-confirm">
        <div class="modal-header">
          <div class="header-danger-wrap">
            <AlertTriangle :size="20" class="text-danger" />
            <h3 class="modal-title">Konfirmasi Impor Cadangan</h3>
          </div>
          <button type="button" class="btn-icon" @click="pendingImportData = null">
            <X :size="18" />
          </button>
        </div>

        <div class="modal-body">
          <p class="import-warning-text">
            Mengimpor cadangan akan <strong>mengganti seluruh data yang saat ini ada</strong> dengan data dari berkas yang Anda pilih.
          </p>
          <div class="import-preview-box">
            <div>Data yang akan dimuat:</div>
            <ul>
              <li>Klien: <strong>{{ pendingImportStats.klien }}</strong></li>
              <li>Proyek: <strong>{{ pendingImportStats.proyek }}</strong></li>
              <li>Tugas: <strong>{{ pendingImportStats.tugas }}</strong></li>
              <li>Catatan: <strong>{{ pendingImportStats.catatan }}</strong></li>
            </ul>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="pendingImportData = null">Batal</button>
          <button type="button" class="btn btn-primary" @click="executeImport">
            Ya, Pulihkan & Timpa Data
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Palette, 
  Sun, 
  Moon, 
  Laptop, 
  Cloud, 
  Smartphone, 
  AlertTriangle, 
  X 
} from 'lucide-vue-next';
import { 
  useAgency, 
  isBackupDue, 
  applyTheme 
} from '../../store/useAgencyStore';

const { 
  state, 
  exportBackup, 
  importBackup, 
  resetToDefault 
} = useAgency();

const fileInputRef = ref(null);
const pendingImportData = ref(null);
const pendingImportStats = ref({ klien: 0, proyek: 0, tugas: 0, catatan: 0 });

const lastBackupFormatted = computed(() => {
  if (!state.pengaturan.lastBackupDate) return 'Belum pernah dicadangkan';
  const d = new Date(state.pengaturan.lastBackupDate);
  return d.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
});

function handleExport() {
  exportBackup();
}

function handleFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      const parsed = JSON.parse(content);
      const data = parsed.data || parsed;

      if (!data.klien || !data.proyek || !data.tugas || !data.catatan) {
        alert('Format berkas cadangan JSON tidak valid.');
        return;
      }

      pendingImportData.value = content;
      pendingImportStats.value = {
        klien: data.klien.length || 0,
        proyek: data.proyek.length || 0,
        tugas: data.tugas.length || 0,
        catatan: data.catatan.length || 0
      };
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset input
}

function executeImport() {
  if (!pendingImportData.value) return;
  const res = importBackup(pendingImportData.value);
  if (res.success) {
    alert('Data berhasil dipulihkan dari cadangan!');
    pendingImportData.value = null;
  } else {
    alert('Gagal memulihkan: ' + res.error);
  }
}

function handleResetDefault() {
  if (confirm('Kembalikan ke data contoh agensi bawaan? Perubahan data saat ini akan ditimpa.')) {
    resetToDefault();
    alert('Data contoh agensi berhasil dimuat!');
  }
}

function selectTheme(theme) {
  applyTheme(theme);
}
</script>

<style scoped>
.settings-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* Alert Banner */
.alert-banner-box {
  background-color: var(--status-terlambat-bg);
  border: 1px solid rgba(220, 38, 38, 0.25);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.alert-icon {
  color: #DC2626;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-size: 15px;
  font-weight: 600;
  color: #DC2626;
}

.alert-desc {
  font-size: 13px;
  color: var(--color-text);
  margin-top: 2px;
}

/* Grid Sections */
.settings-sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 18px;
}

.settings-card {
  padding: 22px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-brand {
  color: var(--color-primary);
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.backup-status-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 10px 12px;
  background-color: var(--color-surface-subtle);
  border-radius: var(--radius-md);
}

.status-label {
  color: var(--color-text-muted);
}

.status-val {
  font-weight: 600;
  color: var(--color-text);
}

.backup-actions-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-upload-label {
  cursor: pointer;
}

.hidden-file-input {
  display: none;
}

.reset-data-box {
  margin-top: 8px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.reset-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reset-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.reset-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* Theme Options */
.theme-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.theme-option-box {
  padding: 16px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.theme-option-box:hover {
  border-color: var(--color-primary);
  background-color: var(--color-surface);
}

.theme-option-box.active {
  border-color: var(--color-primary);
  background-color: var(--color-soft);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.theme-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.theme-sub {
  font-size: 11px;
  color: var(--color-text-muted);
}

.theme-icon.light { color: #F59E0B; }
.theme-icon.dark { color: #818CF8; }
.theme-icon.system { color: var(--color-primary); }

/* Supabase & Cloud */
.supabase-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.cloud-status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
}

.dot-active {
  background-color: var(--color-accent) !important;
}

.pwa-features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
  padding-left: 4px;
}

.modal-import-confirm {
  max-width: 480px;
}

.header-danger-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.import-warning-text {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.import-preview-box {
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 12px;
  margin-top: 10px;
  font-size: 13px;
}

.import-preview-box ul {
  padding-left: 20px;
  margin-top: 6px;
  line-height: 1.5;
}
</style>
