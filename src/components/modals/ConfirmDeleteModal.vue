<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content confirm-modal">
      <div class="modal-header">
        <div class="header-icon-wrap">
          <AlertTriangle :size="22" class="warning-icon" />
          <h3 class="modal-title">{{ title }}</h3>
        </div>
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <p class="confirm-message">{{ message }}</p>

        <!-- Peringatan Kaskade Khusus Klien (Kriteria Penerimaan F1) -->
        <div v-if="cascadeInfo" class="cascade-warning-box">
          <p class="cascade-title">Dampak penghapusan permanen:</p>
          <ul class="cascade-list">
            <li><strong>{{ cascadeInfo.projectCount }}</strong> proyek terkait akan terhapus</li>
            <li><strong>{{ cascadeInfo.taskCount }}</strong> tugas terkait akan terhapus</li>
            <li><strong>{{ cascadeInfo.noteCount }}</strong> catatan terkait akan terhapus</li>
          </ul>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
        <button type="button" class="btn btn-danger" @click="$emit('confirm')">
          {{ confirmText || 'Hapus Permanen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AlertTriangle, X } from 'lucide-vue-next';

defineProps({
  title: {
    type: String,
    default: 'Konfirmasi Hapus'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Hapus'
  },
  cascadeInfo: {
    type: Object,
    default: null
  }
});

defineEmits(['close', 'confirm']);
</script>

<style scoped>
.confirm-modal {
  max-width: 440px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.header-icon-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.warning-icon {
  color: #DC2626;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.confirm-message {
  font-size: 14px;
  color: var(--color-text);
  line-height: 1.5;
}

.cascade-warning-box {
  background-color: var(--status-terlambat-bg);
  border: 1px solid rgba(220, 38, 38, 0.2);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.cascade-title {
  font-size: 13px;
  font-weight: 600;
  color: #DC2626;
  margin-bottom: 6px;
}

.cascade-list {
  font-size: 13px;
  color: var(--color-text);
  padding-left: 20px;
  line-height: 1.5;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--color-border);
}
</style>
