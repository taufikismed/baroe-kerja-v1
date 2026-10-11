<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content apply-template-modal">
      <div class="modal-header">
        <div class="header-title-wrap">
          <Layers :size="18" class="icon-brand" />
          <h3 class="modal-title">Terapkan Template Alur Kerja</h3>
        </div>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleApply" class="modal-body">
        <div class="form-group">
          <label class="form-label">Pilih Template *</label>
          <select v-model="selectedTemplateId" class="input-select" required>
            <option v-for="t in state.templates" :key="t.id" :value="t.id">
              {{ t.nama }} ({{ t.items.length }} tugas)
            </option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Klien Tujuan *</label>
            <select v-model="klienId" class="input-select" required @change="handleClientChange">
              <option disabled value="">-- Pilih Klien --</option>
              <option v-for="c in state.klien" :key="c.id" :value="c.id">
                {{ c.nama }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Proyek Tujuan *</label>
            <select v-model="proyekId" class="input-select" required :disabled="!availableProjects.length">
              <option disabled value="">-- Pilih Proyek --</option>
              <option v-for="p in availableProjects" :key="p.id" :value="p.id">
                {{ p.nama }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tanggal Mulai (Basis Tenggat Relatif) *</label>
          <input v-model="tanggalMulai" type="date" class="input-text" required />
        </div>

        <!-- Preview Daftar Tugas Yang Akan Dibuat -->
        <div v-if="currentTemplate" class="template-preview-box">
          <div class="preview-header">
            <span class="preview-label">Pratinjau Tugas Yang Akan Terbuat:</span>
            <span class="preview-count">{{ currentTemplate.items.length }} Tugas</span>
          </div>
          <ul class="preview-list">
            <li v-for="(item, idx) in currentTemplate.items" :key="idx" class="preview-item">
              <span class="item-num">{{ idx + 1 }}.</span>
              <span class="item-title">{{ item.judul }}</span>
              <span class="item-due">
                {{ calculateRelativeDate(item.offsetHari) }}
              </span>
            </li>
          </ul>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary" :disabled="!proyekId">
            Buat {{ currentTemplate ? currentTemplate.items.length : '' }} Tugas Otomatis
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Layers, X } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const props = defineProps({
  initialTemplateId: {
    type: String,
    default: null
  },
  defaultClientId: {
    type: String,
    default: null
  },
  defaultProjectId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'applied']);
const { state, applyTemplate } = useAgency();

const selectedTemplateId = ref(props.initialTemplateId || state.templates[0]?.id || '');
const klienId = ref(props.defaultClientId || state.klien[0]?.id || '');
const proyekId = ref(props.defaultProjectId || '');
const tanggalMulai = ref(new Date().toISOString().split('T')[0]);

const currentTemplate = computed(() => {
  return state.templates.find(t => t.id === selectedTemplateId.value);
});

const availableProjects = computed(() => {
  if (!klienId.value) return [];
  return state.proyek.filter(p => p.klienId === klienId.value);
});

// Set auto first project if available
if (!proyekId.value && availableProjects.value.length > 0) {
  proyekId.value = availableProjects.value[0].id;
}

function handleClientChange() {
  if (availableProjects.value.length > 0) {
    proyekId.value = availableProjects.value[0].id;
  } else {
    proyekId.value = '';
  }
}

function calculateRelativeDate(offsetDays) {
  const d = new Date(tanggalMulai.value + 'T00:00:00');
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function handleApply() {
  if (!selectedTemplateId.value || !proyekId.value) return;

  applyTemplate(selectedTemplateId.value, {
    klienId: klienId.value,
    proyekId: proyekId.value,
    tanggalMulai: tanggalMulai.value
  });

  emit('applied');
  emit('close');
}
</script>

<style scoped>
.apply-template-modal {
  max-width: 580px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-brand {
  color: var(--color-primary);
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-body {
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.template-preview-box {
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 14px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.preview-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 180px;
  overflow-y: auto;
}

.preview-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  gap: 8px;
}

.item-num {
  color: var(--color-text-muted);
  font-size: 11px;
  width: 18px;
}

.item-title {
  flex: 1;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-due {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-primary);
  background-color: var(--color-soft);
  padding: 2px 7px;
  border-radius: var(--radius-sm);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  margin-top: 8px;
}
</style>
