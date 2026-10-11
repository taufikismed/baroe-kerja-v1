<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">{{ isEditing ? 'Edit Klien' : 'Tambah Klien Baru' }}</h3>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label class="form-label">Nama Klien / Brand *</label>
          <input 
            v-model="nama" 
            type="text" 
            class="input-text" 
            placeholder="Contoh: Kopi Kenangan Senja" 
            required 
            autofocus 
          />
        </div>

        <!-- Pilihan Warna Penanda Klien -->
        <div class="form-group">
          <label class="form-label">Warna Penanda Klien</label>
          <div class="color-palette">
            <button 
              v-for="color in presetColors" 
              :key="color"
              type="button" 
              class="color-circle" 
              :style="{ backgroundColor: color }"
              :class="{ active: warna === color }"
              @click="warna = color"
            >
              <Check v-if="warna === color" :size="14" class="color-check" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Catatan Singkat / PIC & Preferensi</label>
          <textarea 
            v-model="catatan" 
            rows="3" 
            class="input-textarea" 
            placeholder="Nomor kontak PIC, pantangan warna/desain, jadwal meeting..."
          ></textarea>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
          <button type="submit" class="btn btn-primary">
            {{ isEditing ? 'Simpan Klien' : 'Tambah Klien' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { X, Check } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const props = defineProps({
  clientToEdit: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);
const { addClient, updateClient } = useAgency();

const isEditing = computed(() => Boolean(props.clientToEdit));
const nama = ref(props.clientToEdit?.nama || '');
const warna = ref(props.clientToEdit?.warna || '#15803D');
const catatan = ref(props.clientToEdit?.catatan || '');

const presetColors = [
  '#15803D', // Hijau Baroe
  '#2563EB', // Biru Royal
  '#D97706', // Oranye Amber
  '#EC4899', // Pink Magenta
  '#7C3AED', // Ungu Violet
  '#059669', // Emerald
  '#DC2626', // Merah Crimson
  '#0891B2'  // Cyan Laut
];

function handleSubmit() {
  if (!nama.value.trim()) return;

  if (isEditing.value) {
    updateClient(props.clientToEdit.id, {
      nama: nama.value,
      warna: warna.value,
      catatan: catatan.value
    });
  } else {
    addClient({
      nama: nama.value,
      warna: warna.value,
      catatan: catatan.value
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

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.color-palette {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 4px;
}

.color-circle {
  width: 32px;
  height: 32px;
  min-height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.color-circle:hover {
  transform: scale(1.1);
}

.color-circle.active {
  border-color: #FFFFFF;
  box-shadow: 0 0 0 2px var(--color-text);
}

.color-check {
  color: #FFFFFF;
  stroke-width: 3px;
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
