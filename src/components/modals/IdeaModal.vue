<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content idea-modal">
      <div class="modal-header">
        <div class="header-title-wrap">
          <Lightbulb :size="20" class="idea-icon" />
          <h3 class="modal-title">Tangkap Ide Cepat</h3>
        </div>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <form @submit.prevent="handleSave" class="modal-body">
        <p class="idea-hint">
          Simpan ide konten, konsep desain, atau strategi agensi yang terlintas seketika tanpa perlu memilih klien.
        </p>

        <div class="form-group">
          <input 
            v-model="judul" 
            type="text" 
            class="input-text input-large" 
            placeholder="Inti ide yang terlintas... (Tekan Enter)" 
            required 
            autofocus
          />
        </div>

        <div class="form-group">
          <textarea 
            v-model="isi" 
            rows="3" 
            class="input-textarea" 
            placeholder="Keterangan tambahan atau catatan cepat (opsional)..."
          ></textarea>
        </div>

        <div class="form-group">
          <input 
            v-model="labelInput" 
            type="text" 
            class="input-text input-sm" 
            placeholder="Label (opsional, contoh: Reels, Branding)"
          />
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Tutup</button>
          <button type="submit" class="btn btn-primary btn-save-idea">
            <Check :size="16" />
            Simpan Ide (2 Ketukan)
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Lightbulb, X, Check } from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const emit = defineEmits(['close', 'saved']);
const { addNote } = useAgency();

const judul = ref('');
const isi = ref('');
const labelInput = ref('');

function handleSave() {
  if (!judul.value.trim()) return;

  const labels = labelInput.value
    ? labelInput.value.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean)
    : [];

  addNote({
    judul: judul.value,
    isi: isi.value,
    labels,
    isIde: true
  });

  emit('saved');
  emit('close');
}
</script>

<style scoped>
.idea-modal {
  max-width: 460px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.idea-icon {
  color: #F59E0B;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.idea-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
  margin-bottom: 4px;
}

.input-large {
  font-size: 16px;
  font-weight: 500;
  padding: 12px 14px;
}

.input-sm {
  font-size: 13px;
  padding: 7px 11px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border);
  margin-top: 6px;
}

.btn-save-idea {
  font-weight: 600;
}
</style>
