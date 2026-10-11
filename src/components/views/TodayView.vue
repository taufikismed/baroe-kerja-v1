<template>
  <div class="today-view-wrapper">
    <!-- Header Halaman Hari Ini -->
    <div class="view-header">
      <div class="header-left">
        <div class="date-badge">
          <Calendar :size="14" />
          <span>{{ todayFormatted }}</span>
        </div>
        <h1 class="page-title">Fokus Hari Ini</h1>
        <p class="page-subtitle">
          Semua pekerjaan penting yang jatuh tempo dan membutuhkan tindakan Anda hari ini.
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-primary" @click="$emit('openNewTaskModal')">
          <Plus :size="16" />
          <span>Tambah Tugas</span>
        </button>
      </div>
    </div>

    <!-- Banner Ringkasan Progres & Peringatan Terlambat -->
    <div class="summary-card card">
      <div class="summary-top">
        <div class="summary-status">
          <span class="status-headline">
            {{ todayStats.completedCount }} dari {{ todayStats.totalCount }} tugas terselesaikan
          </span>
          <span class="status-sub">
            {{ todayStats.progressPercent }}% selesai
          </span>
        </div>

        <div class="summary-chips">
          <span 
            v-if="todayStats.overdueCount > 0" 
            class="stat-chip chip-overdue"
            @click="activeFilter = 'overdue'"
          >
            <AlertCircle :size="14" />
            {{ todayStats.overdueCount }} Terlambat
          </span>
          <span 
            v-if="todayStats.dueTodayCount > 0" 
            class="stat-chip chip-today"
            @click="activeFilter = 'today'"
          >
            <Clock :size="14" />
            {{ todayStats.dueTodayCount }} Hari Ini
          </span>
          <span 
            v-if="todayStats.completedCount > 0" 
            class="stat-chip chip-completed"
            @click="activeFilter = 'all'"
          >
            <CheckCircle2 :size="14" />
            {{ todayStats.completedCount }} Selesai
          </span>
        </div>
      </div>

      <!-- Progress Bar Visual -->
      <div class="progress-track">
        <div 
          class="progress-fill" 
          :style="{ width: `${todayStats.progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Quick Add Input Bar -->
    <div class="quick-add-bar card">
      <Plus :size="18" class="quick-add-icon" />
      <input 
        v-model="quickTaskTitle" 
        type="text" 
        class="quick-add-input" 
        placeholder="Ketik tugas cepat untuk Hari Ini lalu tekan Enter..."
        @keydown.enter="handleQuickAdd"
      />
      <button 
        v-if="quickTaskTitle.trim()" 
        type="button" 
        class="btn btn-soft btn-sm"
        @click="handleQuickAdd"
      >
        Tambah
      </button>
    </div>

    <!-- Filter Tab Bar -->
    <div class="filter-tab-bar">
      <button 
        type="button" 
        class="filter-tab-btn" 
        :class="{ active: activeFilter === 'all' }"
        @click="activeFilter = 'all'"
      >
        Semua ({{ todayTasks.length }})
      </button>
      <button 
        v-if="overdueTasks.length" 
        type="button" 
        class="filter-tab-btn tab-warning" 
        :class="{ active: activeFilter === 'overdue' }"
        @click="activeFilter = 'overdue'"
      >
        Terlambat ({{ overdueTasks.length }})
      </button>
      <button 
        type="button" 
        class="filter-tab-btn" 
        :class="{ active: activeFilter === 'pending' }"
        @click="activeFilter = 'pending'"
      >
        Belum Selesai ({{ pendingTasks.length }})
      </button>
      <button 
        v-if="completedTasks.length" 
        type="button" 
        class="filter-tab-btn" 
        :class="{ active: activeFilter === 'completed' }"
        @click="activeFilter = 'completed'"
      >
        Selesai ({{ completedTasks.length }})
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!displayedTasks.length" class="empty-state-box card">
      <div class="empty-icon-wrap">
        <Sparkles :size="32" class="sparkles-icon" />
      </div>
      <h3 class="empty-title">Tidak ada tugas dalam daftar ini!</h3>
      <p class="empty-desc">
        Semua pekerjaan sudah beres atau Anda belum menjadwalkan tugas untuk hari ini.
      </p>
      <button type="button" class="btn btn-primary" @click="$emit('openNewTaskModal')">
        <Plus :size="16" />
        Tambah Tugas Baru
      </button>
    </div>

    <!-- Daftar Tugas Terkelompok -->
    <div v-else class="task-sections-list">
      <!-- Grup 1: Tugas Terlambat -->
      <div v-if="groupedOverdue.length" class="task-group group-overdue">
        <div class="group-header">
          <AlertCircle :size="16" class="text-danger" />
          <h2 class="group-title text-danger">Tugas Terlambat</h2>
          <span class="group-badge badge-overdue">{{ groupedOverdue.length }}</span>
        </div>
        <div class="group-items">
          <TaskItem 
            v-for="task in groupedOverdue" 
            :key="task.id" 
            :task="task"
            @edit="$emit('editTask', $event)"
            @delete="$emit('deleteTask', $event)"
          />
        </div>
      </div>

      <!-- Grup 2: Jatuh Tempo Hari Ini -->
      <div v-if="groupedDueToday.length" class="task-group">
        <div class="group-header">
          <Clock :size="16" class="text-primary" />
          <h2 class="group-title">Jatuh Tempo Hari Ini</h2>
          <span class="group-badge">{{ groupedDueToday.length }}</span>
        </div>
        <div class="group-items">
          <TaskItem 
            v-for="task in groupedDueToday" 
            :key="task.id" 
            :task="task"
            @edit="$emit('editTask', $event)"
            @delete="$emit('deleteTask', $event)"
          />
        </div>
      </div>

      <!-- Grup 3: Selesai Hari Ini -->
      <div v-if="groupedCompleted.length" class="task-group group-completed">
        <div class="group-header" @click="showCompleted = !showCompleted">
          <CheckCircle2 :size="16" class="text-accent" />
          <h2 class="group-title">Selesai Hari Ini</h2>
          <span class="group-badge badge-done">{{ groupedCompleted.length }}</span>
          <ChevronDown :size="16" class="toggle-icon" :class="{ rotated: !showCompleted }" />
        </div>
        <div v-if="showCompleted" class="group-items">
          <TaskItem 
            v-for="task in groupedCompleted" 
            :key="task.id" 
            :task="task"
            @edit="$emit('editTask', $event)"
            @delete="$emit('deleteTask', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronDown 
} from 'lucide-vue-next';
import { 
  useAgency, 
  todayTasks, 
  todayStats, 
  getTaskDateStatus 
} from '../../store/useAgencyStore';
import TaskItem from '../common/TaskItem.vue';

const emit = defineEmits(['openNewTaskModal', 'editTask', 'deleteTask']);
const { addTask } = useAgency();

const activeFilter = ref('all'); // 'all' | 'overdue' | 'pending' | 'completed'
const showCompleted = ref(true);
const quickTaskTitle = ref('');

const todayStr = new Date().toISOString().split('T')[0];

const todayFormatted = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
});

const overdueTasks = computed(() => {
  return todayTasks.value.filter(t => t.status !== 'Selesai' && getTaskDateStatus(t.tenggat) === 'overdue');
});

const pendingTasks = computed(() => {
  return todayTasks.value.filter(t => t.status !== 'Selesai');
});

const completedTasks = computed(() => {
  return todayTasks.value.filter(t => t.status === 'Selesai');
});

const displayedTasks = computed(() => {
  if (activeFilter.value === 'overdue') return overdueTasks.value;
  if (activeFilter.value === 'pending') return pendingTasks.value;
  if (activeFilter.value === 'completed') return completedTasks.value;
  return todayTasks.value;
});

const groupedOverdue = computed(() => {
  if (activeFilter.value === 'completed') return [];
  return displayedTasks.value.filter(t => t.status !== 'Selesai' && getTaskDateStatus(t.tenggat) === 'overdue');
});

const groupedDueToday = computed(() => {
  if (activeFilter.value === 'completed' || activeFilter.value === 'overdue') return [];
  return displayedTasks.value.filter(t => t.status !== 'Selesai' && getTaskDateStatus(t.tenggat) !== 'overdue');
});

const groupedCompleted = computed(() => {
  if (activeFilter.value === 'overdue' || activeFilter.value === 'pending') return [];
  return displayedTasks.value.filter(t => t.status === 'Selesai');
});

function handleQuickAdd() {
  if (!quickTaskTitle.value.trim()) return;

  addTask({
    judul: quickTaskTitle.value,
    tenggat: todayStr,
    status: 'Brief',
    prioritas: 'Sedang'
  });

  quickTaskTitle.value = '';
}
</script>

<style scoped>
.today-view-wrapper {
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

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background-color: var(--color-soft);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  margin-bottom: 8px;
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

/* Summary Card */
.summary-card {
  padding: 18px 22px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
  background-color: var(--color-surface);
}

.summary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.summary-status {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.status-headline {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

.status-sub {
  font-size: 14px;
  color: var(--color-primary);
  font-weight: 600;
}

.summary-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.stat-chip:hover {
  opacity: 0.85;
}

.chip-overdue {
  background-color: var(--status-terlambat-bg);
  color: var(--status-terlambat);
}

.chip-today {
  background-color: var(--color-soft);
  color: var(--color-soft-text);
}

.chip-completed {
  background-color: var(--status-dikerjakan-bg);
  color: var(--status-dikerjakan);
}

.progress-track {
  width: 100%;
  height: 8px;
  background-color: var(--color-surface-subtle);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: var(--radius-full);
  transition: width 0.4s ease;
}

/* Quick Add Bar */
.quick-add-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background-color: var(--color-surface);
}

.quick-add-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.quick-add-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  color: var(--color-text);
}

/* Filter Tab Bar */
.filter-tab-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.filter-tab-btn {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  transition: all 0.15s ease;
  white-space: nowrap;
}

.filter-tab-btn:hover {
  color: var(--color-text);
  border-color: var(--color-border-focus);
}

.filter-tab-btn.active {
  background-color: var(--color-primary);
  color: #FFFFFF;
  border-color: var(--color-primary);
}

html.dark .filter-tab-btn.active {
  color: #0F1A14;
}

.filter-tab-btn.tab-warning {
  color: var(--status-terlambat);
}

/* Empty State */
.empty-state-box {
  text-align: center;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: var(--color-surface);
}

.empty-icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--color-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sparkles-icon {
  color: var(--color-primary);
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 400px;
  line-height: 1.5;
  margin-bottom: 8px;
}

/* Task Sections */
.task-sections-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  cursor: pointer;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.text-danger {
  color: var(--status-terlambat);
}

.text-primary {
  color: var(--color-primary);
}

.text-accent {
  color: var(--color-accent);
}

.group-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 7px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface-subtle);
  color: var(--color-text-muted);
}

.badge-overdue {
  background-color: var(--status-terlambat-bg);
  color: var(--status-terlambat);
}

.badge-done {
  background-color: var(--color-soft);
  color: var(--color-soft-text);
}

.toggle-icon {
  margin-left: auto;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.toggle-icon.rotated {
  transform: rotate(-90deg);
}

.group-items {
  display: flex;
  flex-direction: column;
}
</style>
