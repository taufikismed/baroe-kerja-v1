<template>
  <div class="tasks-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h1 class="page-title">Semua Daftar Tugas</h1>
        <p class="page-subtitle">
          Pantau seluruh beban kerja agensi lintas klien dan status siklus kreatif.
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-primary" @click="$emit('openNewTaskModal')">
          <Plus :size="16" />
          <span>Tambah Tugas</span>
        </button>
      </div>
    </div>

    <!-- Filter & Kontrol Bar -->
    <div class="filter-controls-card card">
      <div class="filter-controls-row">
        <!-- Filter Klien -->
        <div class="filter-item">
          <label class="filter-label">Klien</label>
          <select v-model="selectedClientId" class="input-select input-filter">
            <option :value="null">Semua Klien</option>
            <option v-for="c in state.klien" :key="c.id" :value="c.id">{{ c.nama }}</option>
          </select>
        </div>

        <!-- Filter Status -->
        <div class="filter-item">
          <label class="filter-label">Status Agensi</label>
          <select v-model="statusFilter" class="input-select input-filter">
            <option value="">Semua Status</option>
            <option value="Brief">Brief</option>
            <option value="Dikerjakan">Dikerjakan</option>
            <option value="Revisi">Revisi</option>
            <option value="Menunggu Klien">Menunggu Klien</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>

        <!-- Filter Prioritas -->
        <div class="filter-item">
          <label class="filter-label">Prioritas</label>
          <select v-model="priorityFilter" class="input-select input-filter">
            <option value="">Semua Prioritas</option>
            <option value="Mendesak">Mendesak</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>
        </div>

        <!-- Reset Filter -->
        <button 
          v-if="selectedClientId || statusFilter || priorityFilter" 
          type="button" 
          class="btn btn-ghost btn-sm reset-btn"
          @click="resetFilters"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!allFilteredTasks.length" class="empty-state-box card">
      <CheckSquare :size="32" class="text-primary" />
      <h3 class="empty-title">Tidak ada tugas yang sesuai filter</h3>
      <p class="empty-desc">Coba sesuaikan filter atau tambahkan tugas baru.</p>
      <button type="button" class="btn btn-primary" @click="$emit('openNewTaskModal')">
        <Plus :size="16" />
        Tambah Tugas Baru
      </button>
    </div>

    <!-- Daftar Tugas -->
    <div v-else class="tasks-flow-list">
      <TaskItem 
        v-for="task in allFilteredTasks" 
        :key="task.id" 
        :task="task"
        @edit="$emit('editTask', $event)"
        @delete="$emit('deleteTask', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Plus, CheckSquare } from 'lucide-vue-next';
import { useAgency, filteredTasks, selectedClientId } from '../../store/useAgencyStore';
import TaskItem from '../common/TaskItem.vue';

defineEmits(['openNewTaskModal', 'editTask', 'deleteTask']);
const { state } = useAgency();

const statusFilter = ref('');
const priorityFilter = ref('');

const allFilteredTasks = computed(() => {
  return filteredTasks.value.filter(t => {
    if (statusFilter.value && t.status !== statusFilter.value) return false;
    if (priorityFilter.value && t.prioritas !== priorityFilter.value) return false;
    return true;
  });
});

function resetFilters() {
  selectedClientId.value = null;
  statusFilter.value = '';
  priorityFilter.value = '';
}
</script>

<style scoped>
.tasks-view-wrapper {
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

.filter-controls-card {
  padding: 14px 18px;
  background-color: var(--color-surface);
}

.filter-controls-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.3px;
}

.input-filter {
  padding: 6px 10px;
  font-size: 13px;
  min-height: 36px;
}

.reset-btn {
  margin-top: auto;
  align-self: flex-end;
  font-size: 13px;
}

.empty-state-box {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: var(--color-surface);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
}

.tasks-flow-list {
  display: flex;
  flex-direction: column;
}
</style>
