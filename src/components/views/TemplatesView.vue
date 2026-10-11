<template>
  <div class="templates-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h1 class="page-title">Template Alur Kerja Agensi</h1>
        <p class="page-subtitle">
          Otomatisasi pembuatan paket tugas berulang dengan tenggat waktu relatif (F11).
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-primary" @click="showNewTemplateModal = true">
          <Plus :size="16" />
          <span>Buat Template Baru</span>
        </button>
      </div>
    </div>

    <!-- Template Cards Grid -->
    <div class="templates-grid">
      <div 
        v-for="tpl in state.templates" 
        :key="tpl.id" 
        class="template-card card"
      >
        <div class="template-card-header">
          <div class="template-title-wrap">
            <Layers :size="18" class="icon-brand" />
            <h3 class="template-title">{{ tpl.nama }}</h3>
          </div>
          <span class="template-task-count">{{ tpl.items.length }} Tugas</span>
        </div>

        <p class="template-desc">{{ tpl.deskripsi }}</p>

        <!-- Preview Daftar Tugas -->
        <div class="template-items-box">
          <div class="items-header">Alur & Tenggat Relatif:</div>
          <ul class="items-list">
            <li v-for="(it, idx) in tpl.items" :key="idx" class="item-entry">
              <span class="item-offset">+{{ it.offsetHari }} Hari</span>
              <span class="item-text">{{ it.judul }}</span>
              <span class="badge badge-sm" :class="'badge-priority-' + it.prioritas.toLowerCase()">
                {{ it.prioritas }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Tombol Aksi Terapkan -->
        <div class="template-card-footer">
          <button 
            type="button" 
            class="btn btn-primary btn-apply"
            @click="$emit('applyTemplate', tpl.id)"
          >
            <Play :size="14" />
            Terapkan ke Proyek Klien
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Template Baru -->
    <div v-if="showNewTemplateModal" class="modal-overlay" @click.self="showNewTemplateModal = false">
      <div class="modal-content modal-new-template">
        <div class="modal-header">
          <h3 class="modal-title">Buat Template Alur Kerja Baru</h3>
          <button type="button" class="btn-icon" @click="showNewTemplateModal = false">
            <X :size="18" />
          </button>
        </div>
        <form @submit.prevent="handleCreateTemplate" class="modal-body">
          <div class="form-group">
            <label class="form-label">Nama Template *</label>
            <input 
              v-model="newTplName" 
              type="text" 
              class="input-text" 
              placeholder="Contoh: Paket Video TikTok 4 Episode" 
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Deskripsi Template</label>
            <textarea 
              v-model="newTplDesc" 
              rows="2" 
              class="input-textarea" 
              placeholder="Keterangan alur kerja..."
            ></textarea>
          </div>

          <!-- Daftar Tugas dalam Template -->
          <div class="form-group">
            <div class="items-control-header">
              <label class="form-label">Daftar Tugas Alur Kerja</label>
              <button type="button" class="btn-add-step" @click="addStepRow">
                <Plus :size="12" />
                Tambah Langkah
              </button>
            </div>

            <div class="steps-builder-list">
              <div v-for="(step, sIdx) in newTplSteps" :key="sIdx" class="step-builder-row">
                <input 
                  v-model="step.judul" 
                  type="text" 
                  class="input-text step-title-input" 
                  placeholder="Nama tugas..." 
                  required 
                />
                <input 
                  v-model.number="step.offsetHari" 
                  type="number" 
                  min="0" 
                  class="input-text step-offset-input" 
                  title="Offset hari dari tanggal mulai" 
                  placeholder="+Hari" 
                />
                <select v-model="step.prioritas" class="input-select step-pri-select">
                  <option value="Rendah">Rendah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Mendesak">Mendesak</option>
                </select>
                <button 
                  v-if="newTplSteps.length > 1" 
                  type="button" 
                  class="btn-icon btn-sm btn-delete-hover" 
                  @click="removeStepRow(sIdx)"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showNewTemplateModal = false">Batal</button>
            <button type="submit" class="btn btn-primary">Simpan Template</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Layers, Plus, Play, X, Trash2 } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

defineEmits(['applyTemplate']);
const { state, addTemplate } = useAgency();

const showNewTemplateModal = ref(false);
const newTplName = ref('');
const newTplDesc = ref('');
const newTplSteps = ref([
  { judul: 'Riset Konsep & Moodboard', prioritas: 'Sedang', offsetHari: 0, status: 'Brief' },
  { judul: 'Draf Pertama Visual / Desain', prioritas: 'Tinggi', offsetHari: 2, status: 'Brief' },
  { judul: 'Kirim Review ke Klien', prioritas: 'Sedang', offsetHari: 4, status: 'Menunggu Klien' }
]);

function addStepRow() {
  const lastOffset = newTplSteps.value[newTplSteps.value.length - 1]?.offsetHari || 0;
  newTplSteps.value.push({
    judul: '',
    prioritas: 'Sedang',
    offsetHari: lastOffset + 2,
    status: 'Brief'
  });
}

function removeStepRow(idx) {
  newTplSteps.value.splice(idx, 1);
}

function handleCreateTemplate() {
  if (!newTplName.value.trim() || !newTplSteps.value.length) return;

  addTemplate({
    nama: newTplName.value,
    deskripsi: newTplDesc.value,
    items: newTplSteps.value
  });

  showNewTemplateModal.value = false;
  newTplName.value = '';
  newTplDesc.value = '';
}
</script>

<style scoped>
.templates-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
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

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 18px;
}

.template-card {
  padding: 20px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.template-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.template-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-brand {
  color: var(--color-primary);
}

.template-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.template-task-count {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-soft);
  color: var(--color-soft-text);
}

.template-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.template-items-box {
  background-color: var(--color-surface-subtle);
  border-radius: var(--radius-md);
  padding: 12px;
  border: 1px solid var(--color-border-subtle);
}

.items-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

.items-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.item-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.item-offset {
  font-weight: 600;
  color: var(--color-primary);
  background-color: var(--color-soft);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  flex-shrink: 0;
}

.item-text {
  flex: 1;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-sm {
  font-size: 10px;
  padding: 1px 6px;
}

.template-card-footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid var(--color-border-subtle);
}

.btn-apply {
  width: 100%;
}

.modal-new-template {
  max-width: 600px;
}

.items-control-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.btn-add-step {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
}

.steps-builder-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
}

.step-builder-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-title-input {
  flex: 1;
  padding: 6px 10px;
  font-size: 13px;
}

.step-offset-input {
  width: 70px;
  padding: 6px 8px;
  font-size: 13px;
}

.step-pri-select {
  width: 110px;
  padding: 6px 8px;
  font-size: 12px;
}
</style>
