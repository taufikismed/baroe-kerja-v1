<template>
  <div 
    class="task-item-card card" 
    :class="{ 
      'task-item-done': task.status === 'Selesai',
      'is-pinned': task.dipin,
      'is-overdue': isOverdue && task.status !== 'Selesai'
    }"
    :style="{ borderLeftColor: clientColor, borderLeftWidth: '5px' }"
  >
    <div class="task-main-row">
      <!-- Checkbox Lingkaran Cepat Selesai -->
      <button 
        type="button"
        class="task-checkbox" 
        :class="{ checked: task.status === 'Selesai' }"
        :title="task.status === 'Selesai' ? 'Tandai belum selesai' : 'Tandai selesai'"
        @click="toggleComplete"
      >
        <Check v-if="task.status === 'Selesai'" :size="14" class="check-icon" />
      </button>

      <!-- Judul & Keterangan -->
      <div class="task-info" @click="$emit('edit', task)">
        <div class="task-title-wrap">
          <Pin v-if="task.dipin" :size="13" class="pin-icon" />
          <span class="task-title">{{ task.judul }}</span>
        </div>

        <!-- Meta info: Klien, Proyek, Label -->
        <div class="task-meta">
          <span v-if="clientName" class="meta-tag client-tag">
            <span class="client-dot" :style="{ backgroundColor: clientColor }"></span>
            {{ clientName }}
            <span v-if="projectName" class="project-slash">/ {{ projectName }}</span>
          </span>

          <!-- Tenggat Waktu -->
          <span 
            v-if="task.tenggat" 
            class="meta-tag due-tag"
            :class="{
              'due-overdue': isOverdue && task.status !== 'Selesai',
              'due-today': isToday && task.status !== 'Selesai'
            }"
          >
            <Clock :size="12" />
            {{ formatDueDate(task.tenggat) }}
          </span>

          <!-- Prioritas -->
          <span 
            v-if="task.prioritas" 
            class="badge" 
            :class="'badge-priority-' + task.prioritas.toLowerCase()"
          >
            {{ task.prioritas }}
          </span>

          <!-- Labels -->
          <span 
            v-for="label in (task.labels || []).slice(0, 2)" 
            :key="label" 
            class="meta-label"
          >
            #{{ label }}
          </span>
        </div>
      </div>

      <!-- Aksi Status 1-Klik Agensi (Brief, Dikerjakan, Revisi, Menunggu Klien, Selesai) -->
      <div class="task-actions-wrap">
        <div class="status-dropdown-wrapper">
          <button 
            type="button"
            class="badge badge-interactive"
            :class="statusBadgeClass"
            @click.stop="toggleStatusMenu"
            :title="'Status: ' + task.status + ' (Klik untuk ubah)'"
          >
            <span class="badge-dot"></span>
            <span class="status-name">{{ task.status }}</span>
            <ChevronDown :size="12" />
          </button>

          <!-- Dropdown Status Cepat -->
          <div v-if="showStatusMenu" class="status-popover" @click.stop>
            <button 
              v-for="st in availableStatuses" 
              :key="st" 
              type="button"
              class="status-option"
              :class="{ active: task.status === st }"
              @click="changeStatus(st)"
            >
              <span class="badge-dot" :class="'dot-' + st.toLowerCase().replace(/\s+/g, '-')"></span>
              {{ st }}
            </button>
          </div>
        </div>

        <!-- Tombol Aksi Tambahan -->
        <div class="task-more-menu">
          <button 
            type="button" 
            class="btn-icon btn-more" 
            :title="task.dipin ? 'Lepas Pin' : 'Pin ke Atas'"
            @click.stop="togglePin"
          >
            <Pin :size="15" :class="{ 'pinned-active': task.dipin }" />
          </button>
          <button 
            type="button" 
            class="btn-icon btn-more" 
            title="Edit Tugas"
            @click.stop="$emit('edit', task)"
          >
            <Edit2 :size="15" />
          </button>
          <button 
            type="button" 
            class="btn-icon btn-more btn-delete-hover" 
            title="Hapus Tugas"
            @click.stop="$emit('delete', task.id)"
          >
            <Trash2 :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  Check, 
  Clock, 
  ChevronDown, 
  Pin, 
  Edit2, 
  Trash2 
} from 'lucide-vue-next';
import { useAgency, clientMap, projectMap } from '../../store/useAgencyStore';

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete']);
const { updateTask, toggleTaskComplete, togglePinTask } = useAgency();

const showStatusMenu = ref(false);
const availableStatuses = ['Brief', 'Dikerjakan', 'Revisi', 'Menunggu Klien', 'Selesai'];

const client = computed(() => props.task.klienId ? clientMap.value[props.task.klienId] : null);
const project = computed(() => props.task.proyekId ? projectMap.value[props.task.proyekId] : null);

const clientName = computed(() => client.value ? client.value.nama : '');
const clientColor = computed(() => client.value ? client.value.warna : '#6B7280');
const projectName = computed(() => project.value ? project.value.nama : '');

const todayStr = new Date().toISOString().split('T')[0];
const isToday = computed(() => props.task.tenggat === todayStr);
const isOverdue = computed(() => props.task.tenggat && props.task.tenggat < todayStr);

const statusBadgeClass = computed(() => {
  const s = props.task.status.toLowerCase().replace(/\s+/g, '-');
  return `badge-status-${s}`;
});

function toggleComplete() {
  toggleTaskComplete(props.task.id);
}

function togglePin() {
  togglePinTask(props.task.id);
}

function toggleStatusMenu() {
  showStatusMenu.value = !showStatusMenu.value;
}

function changeStatus(newStatus) {
  updateTask(props.task.id, { status: newStatus });
  showStatusMenu.value = false;
}

function formatDueDate(dateStr) {
  if (!dateStr) return '';
  if (dateStr === todayStr) return 'Hari ini';
  
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date(todayStr + 'T00:00:00');
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Kemarin (Terlambat)';
  if (diffDays < -1) return `${Math.abs(diffDays)} hari lalu (Terlambat)`;
  if (diffDays === 1) return 'Besok';
  
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function handleGlobalClick() {
  showStatusMenu.value = false;
}

onMounted(() => {
  window.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
});
</script>

<style scoped>
.task-item-card {
  padding: 14px 18px;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  position: relative;
  transition: all 0.18s ease;
}

.task-item-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.task-main-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-checkbox {
  width: 22px;
  height: 22px;
  min-height: 22px;
  border-radius: 6px;
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
  background-color: transparent;
}

.task-checkbox:hover {
  border-color: var(--color-primary);
  background-color: var(--color-soft);
}

.task-checkbox.checked {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: #FFFFFF;
}

.check-icon {
  stroke-width: 3px;
}

.task-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.task-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pin-icon {
  color: var(--color-primary);
  transform: rotate(45deg);
  flex-shrink: 0;
}

.task-title {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.4;
  word-break: break-word;
}

.task-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-size: 12px;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
}

.client-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.client-tag {
  font-weight: 500;
  color: var(--color-text);
}

.project-slash {
  color: var(--color-text-muted);
  font-weight: 400;
}

.due-tag {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
}

.due-today {
  color: var(--color-primary);
  font-weight: 600;
  background-color: var(--color-soft);
}

.due-overdue {
  color: var(--status-terlambat);
  font-weight: 600;
  background-color: var(--status-terlambat-bg);
}

.meta-label {
  color: var(--color-text-muted);
  font-size: 11px;
}

.task-actions-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.status-dropdown-wrapper {
  position: relative;
}

.badge-interactive {
  cursor: pointer;
  padding: 6px 12px;
  font-size: 13px;
  user-select: none;
  transition: transform 0.12s ease;
}

.badge-interactive:hover {
  transform: scale(1.03);
}

.status-popover {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  min-width: 150px;
  padding: 4px;
  animation: fadeIn 0.12s ease-out;
}

.status-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 7px 10px;
  font-size: 13px;
  text-align: left;
  border-radius: var(--radius-sm);
  transition: background-color 0.12s ease;
  color: var(--color-text);
}

.status-option:hover {
  background-color: var(--color-surface-hover);
}

.status-option.active {
  font-weight: 600;
  background-color: var(--color-soft);
}

.task-more-menu {
  display: flex;
  align-items: center;
  gap: 2px;
  opacity: 0.85;
}

.task-item-card:hover .task-more-menu {
  opacity: 1;
}

.btn-more {
  width: 32px;
  height: 32px;
  min-height: 32px;
}

.btn-delete-hover:hover {
  color: var(--status-terlambat);
  background-color: var(--status-terlambat-bg);
}

.pinned-active {
  color: var(--color-primary);
  fill: currentColor;
}

@media (max-width: 640px) {
  .task-main-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .task-actions-wrap {
    width: 100%;
    justify-content: space-between;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed var(--color-border);
  }
}
</style>
