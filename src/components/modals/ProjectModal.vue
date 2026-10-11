<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Edit Proyek' : 'Tambah Proyek Baru' }}</h3>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">Klien Pemilik *</label>
          <select v-model="klienId" class="input-select" required>
            <option disabled value="">-- Pilih Klien --</option>
            <option v-for="c in state.klien" :key="c.id" :value="c.id">
              {{ c.nama }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Nama Proyek *</label>
          <input 
            v-model="nama" 
            type="text" 
            class="input-text" 
            placeholder="Contoh: Kampanye Peluncuran Menu Baru" 
            required 
            autofocus 
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Tanggal Mulai</label>
            <input v-model="tanggalMulai" type="date" class="input-text" />
          </div>

          <div class="form-group">
            <label class="form-label">Tenggat Akhir Proyek</label>
            <input v-model="tenggatAkhir" type="date" class="input-text" />
          </div>
        </div>

        <div v-if="isEditing" class="form-group">
          <label class="form-label">Status Proyek</label>
          <select v-model="status" class="input-select">
            <option value="aktif">Aktif</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Simpan Proyek' : 'Tambah Proyek' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const props = defineProps({
  projectToEdit: {
    type: Object,
    default: null
  },
  defaultClientId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const { state, addProject, updateProject } = useAgency();

const isEditing = computed(() => Boolean(props.projectToEdit));
const klienId = ref(props.projectToEdit?.klienId || props.defaultClientId || (state.klien[0]?.id || ''));
const nama = ref(props.projectToEdit?.nama || '');
const tanggalMulai = ref(props.projectToEdit?.tanggalMulai || new Date().toISOString().split('T')[0]);
const tenggatAkhir = ref(props.projectToEdit?.tenggatAkhir || '');
const status = ref(props.projectToEdit?.status || 'aktif');

function handleSubmit() {
  if (!nama.value.trim() || !klienId.value) return;

  if (isEditing.value) {
    updateProject(props.projectToEdit.id, {
      klienId: klienId.value,
      nama: nama.value,
      tanggalMulai: tanggalMulai.value,
      tenggatAkhir: tenggatAkhir.value || null,
      status: status.value
    });
  } else {
    addProject({
      klienId: klienId.value,
      nama: nama.value,
      tanggalMulai: tanggalMulai.value,
      tenggatAkhir: tenggatAkhir.value || null
    });
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-border);
  margin-top: 8px;
}
</style>
