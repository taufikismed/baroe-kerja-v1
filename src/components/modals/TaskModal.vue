<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Edit Tugas' : 'Tambah Tugas Baru' }}</h3>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Judul Tugas -->
        <div class="form-group">
          <label class="form-label">Judul Tugas *</label>
          <input 
            v-model="form.judul" 
            type="text" 
            class="input-text" 
            placeholder="Contoh: Desain 5 carousel Instagram Klien A" 
            required 
            autofocus
          />
        </div>

        <!-- Pilihan Klien & Proyek -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Klien</label>
            <select v-model="form.klienId" class="input-select" @change="handleClientChange">
              <option :value="null">-- Tanpa Klien --</option>
              <option v-for="c in state.klien" :key="c.id" :value="c.id">
                {{ c.nama }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Proyek</label>
            <select v-model="form.proyekId" class="input-select" :disabled="!availableProjects.length">
              <option :value="null">-- Tanpa Proyek --</option>
              <option v-for="p in availableProjects" :key="p.id" :value="p.id">
                {{ p.nama }}
              </option>
            </select>
          </div>
        </div>

        <!-- Status & Prioritas -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Status Agensi</label>
            <select v-model="form.status" class="input-select">
              <option value="Brief">Brief</option>
              <option value="Dikerjakan">Dikerjakan</option>
              <option value="Revisi">Revisi</option>
              <option value="Menunggu Klien">Menunggu Klien</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Prioritas</label>
            <select v-model="form.prioritas" class="input-select">
              <option value="Rendah">Rendah</option>
              <option value="Sedang">Sedang</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Mendesak">Mendesak 🔥</option>
            </select>
          </div>
        </div>

        <!-- Tenggat Waktu & Tombol Cepat -->
        <div class="form-group">
          <div class="label-with-shortcuts">
            <label class="form-label">Tenggat Waktu</label>
            <div class="quick-date-buttons">
              <button type="button" class="btn-date-shortcut" @click="setDate(0)">Hari Ini</button>
              <button type="button" class="btn-date-shortcut" @click="setDate(1)">Besok</button>
              <button type="button" class="btn-date-shortcut" @click="setDate(7)">+1 Minggu</button>
            </div>
          </div>
          <input v-model="form.tenggat" type="date" class="input-text" />
        </div>

        <!-- Label / Tags -->
        <div class="form-group">
          <label class="form-label">Label (Pisahkan dengan koma atau pilih)</label>
          <input 
            v-model="labelInput" 
            type="text" 
            class="input-text" 
            placeholder="Ketik lalu Enter, contoh: Revisi, Carousel, Urgent"
            @keydown.enter.prevent="addLabelFromInput"
          />
          <div v-if="form.labels.length" class="selected-labels-wrap">
            <span v-for="lbl in form.labels" :key="lbl" class="chip-label">
              #{{ lbl }}
              <button type="button" @click="removeLabel(lbl)" class="btn-remove-chip">×</button>
            </span>
          </div>
        </div>

        <!-- Catatan Tambahan -->
        <div class="form-group">
          <label class="form-label">Catatan Brief / Riwayat Revisi</label>
          <textarea 
            v-model="form.catatan" 
            rows="3" 
            class="input-textarea" 
            placeholder="Konteks brief, catatan klien, link drive referensi..."
          ></textarea>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Simpan Perubahan' : 'Tambah Tugas' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { X } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const props = defineProps({
  taskToEdit: {
    type: Object,
    default: null
  },
  defaultClientId: {
    type: String,
    default: null
  },
  defaultProjectId: {
    type: String,
    default: null
  },
  defaultDate: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const { state, addTask, updateTask } = useAgency();

const isEditing = computed(() => Boolean(props.taskToEdit));

const form = reactive({
  judul: props.taskToEdit?.judul || '',
  klienId: props.taskToEdit?.klienId || props.defaultClientId || null,
  proyekId: props.taskToEdit?.proyekId || props.defaultProjectId || null,
  status: props.taskToEdit?.status || 'Brief',
  prioritas: props.taskToEdit?.prioritas || 'Sedang',
  tenggat: props.taskToEdit?.tenggat || props.defaultDate || new Date().toISOString().split('T')[0],
  labels: props.taskToEdit?.labels ? [...props.taskToEdit.labels] : [],
  catatan: props.taskToEdit?.catatan || ''
});

const labelInput = ref('');

const availableProjects = computed(() => {
  if (!form.klienId) return state.proyek;
  return state.proyek.filter(p => p.klienId === form.klienId);
});

function handleClientChange() {
  if (form.proyekId) {
    const proj = state.proyek.find(p => p.id === form.proyekId);
    if (proj && proj.klienId !== form.klienId) {
      form.proyekId = null;
    }
  }
}

function setDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  form.tenggat = d.toISOString().split('T')[0];
}

function addLabelFromInput() {
  const val = labelInput.value.trim();
  if (val) {
    const parts = val.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
    parts.forEach(p => {
      if (!form.labels.includes(p)) {
        form.labels.push(p);
      }
    });
    labelInput.value = '';
  }
}

function removeLabel(lbl) {
  form.labels = form.labels.filter(l => l !== lbl);
}

function handleSubmit() {
  if (!form.judul.trim()) return;

  if (labelInput.value.trim()) {
    addLabelFromInput();
  }

  if (isEditing.value) {
    updateTask(props.taskToEdit.id, { ...form });
  } else {
    addTask({ ...form });
  }

  emit('saved');
  emit('close');
}
</script>

<style scoped>
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid var(--color-border);
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

.label-with-shortcuts {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quick-date-buttons {
  display: flex;
  gap: 4px;
}

.btn-date-shortcut {
  font-size: 11px;
  padding: 2px 8px;
  min-height: 24px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

.btn-date-shortcut:hover {
  background-color: var(--color-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.selected-labels-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.chip-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-soft);
  color: var(--color-soft-text);
  font-weight: 500;
}

.btn-remove-chip {
  font-size: 14px;
  cursor: pointer;
  line-height: 1;
  min-height: auto;
  color: var(--color-soft-text);
  opacity: 0.7;
}

.btn-remove-chip:hover {
  opacity: 1;
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
