<template>
  <div class="project-detail-wrapper">
    <!-- Header Proyek -->
    <div class="view-header">
      <div class="header-left">
        <div class="breadcrumbs">
          <button type="button" class="btn-crumb" @click="backToClients">
            {{ client ? client.nama : 'Semua Klien' }}
          </button>
          <span class="crumb-separator">/</span>
          <span class="current-crumb">{{ project ? project.nama : 'Pilih Proyek' }}</span>
        </div>

        <div class="title-with-actions">
          <div class="client-dot-large" :style="{ backgroundColor: client?.warna || '#15803D' }"></div>
          <h1 class="page-title">{{ project ? project.nama : 'Pilih Proyek' }}</h1>
          <span 
            v-if="project" 
            class="badge" 
            :class="project.status === 'selesai' ? 'badge-status-selesai' : 'badge-status-dikerjakan'"
          >
            {{ project.status === 'selesai' ? 'Selesai' : 'Aktif' }}
          </span>
        </div>

        <p v-if="project?.tenggatAkhir" class="project-meta-desc">
          Tenggat Proyek: <strong>{{ project.tenggatAkhir }}</strong>
          <span v-if="project.tanggalMulai"> · Mulai: {{ project.tanggalMulai }}</span>
        </p>
      </div>

      <div class="header-actions">
        <!-- Toggle Tampilan: Daftar vs Kanban (F12) -->
        <div class="view-mode-toggle">
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: !kanbanMode }"
            @click="kanbanMode = false"
            title="Tampilan Daftar"
          >
            <List :size="15" />
            <span>Daftar</span>
          </button>
          <button 
            type="button" 
            class="toggle-btn" 
            :class="{ active: kanbanMode }"
            @click="kanbanMode = true"
            title="Tampilan Papan Kanban (F12)"
          >
            <Kanban :size="15" />
            <span>Papan (Kanban)</span>
          </button>
        </div>

        <!-- Tombol Terapkan Template -->
        <button 
          type="button" 
          class="btn btn-secondary" 
          @click="$emit('openApplyTemplate', { clientId: client?.id, projectId: project?.id })"
        >
          <Layers :size="15" />
          <span>Gunakan Template</span>
        </button>

        <button type="button" class="btn btn-primary" @click="$emit('openNewTaskModal', { clientId: client?.id, projectId: project?.id })">
          <Plus :size="16" />
          <span>Tugas Baru</span>
        </button>
      </div>
    </div>

    <!-- Tab Section: Tugas Proyek vs Catatan Proyek -->
    <div class="subnav-tabs">
      <button 
        type="button" 
        class="subnav-tab" 
        :class="{ active: activeSubTab === 'tasks' }"
        @click="activeSubTab = 'tasks'"
      >
        <CheckSquare :size="15" />
        Tugas ({{ projectTasks.length }})
      </button>
      <button 
        type="button" 
        class="subnav-tab" 
        :class="{ active: activeSubTab === 'notes' }"
        @click="activeSubTab = 'notes'"
      >
        <FileText :size="15" />
        Catatan & Brief ({{ projectNotes.length }})
      </button>
    </div>

    <!-- KONTEN TAB: TUGAS -->
    <div v-if="activeSubTab === 'tasks'">
      <!-- TAMPILAN 1: PAPAN KANBAN (F12) -->
      <div v-if="kanbanMode" class="kanban-board-container">
        <div 
          v-for="col in kanbanColumns" 
          :key="col.status" 
          class="kanban-column"
          @dragover.prevent
          @drop="handleDrop(col.status)"
        >
          <div class="column-header" :class="'col-header-' + col.status.toLowerCase().replace(/\s+/g, '-')">
            <div class="col-title-wrap">
              <span class="badge-dot" :class="'dot-' + col.status.toLowerCase().replace(/\s+/g, '-')"></span>
              <span class="col-title">{{ col.status }}</span>
            </div>
            <span class="col-count">{{ getTasksByStatus(col.status).length }}</span>
          </div>

          <div class="kanban-items-list">
            <div 
              v-for="task in getTasksByStatus(col.status)" 
              :key="task.id"
              class="kanban-task-card card"
              draggable="true"
              @dragstart="handleDragStart(task)"
              @click="$emit('editTask', task)"
            >
              <div class="kanban-task-top">
                <span class="badge" :class="'badge-priority-' + task.prioritas.toLowerCase()">
                  {{ task.prioritas }}
                </span>
                <span v-if="task.tenggat" class="kanban-due">
                  {{ task.tenggat }}
                </span>
              </div>
              <h4 class="kanban-task-title">{{ task.judul }}</h4>
              <div v-if="task.labels && task.labels.length" class="kanban-labels">
                <span v-for="lbl in task.labels" :key="lbl" class="kanban-lbl">#{{ lbl }}</span>
              </div>
            </div>

            <!-- Empty Column Placeholder -->
            <div v-if="!getTasksByStatus(col.status).length" class="empty-column-box">
              Tarik atau tambah tugas di sini
            </div>
          </div>
        </div>
      </div>

      <!-- TAMPILAN 2: DAFTAR STANDAR -->
      <div v-else class="tasks-list-container">
        <div v-if="!projectTasks.length" class="empty-state-box card">
          <CheckSquare :size="32" class="text-primary" />
          <h3 class="empty-title">Belum ada tugas di proyek ini</h3>
          <p class="empty-desc">Tambahkan tugas secara manual atau gunakan template alur kerja instan.</p>
          <div class="empty-actions">
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="$emit('openApplyTemplate', { clientId: client?.id, projectId: project?.id })"
            >
              <Layers :size="15" />
              Gunakan Template
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="$emit('openNewTaskModal', { clientId: client?.id, projectId: project?.id })"
            >
              <Plus :size="15" />
              Tambah Tugas
            </button>
          </div>
        </div>

        <div v-else class="task-items-flow">
          <TaskItem 
            v-for="task in projectTasks" 
            :key="task.id" 
            :task="task"
            @edit="$emit('editTask', $event)"
            @delete="$emit('deleteTask', $event)"
          />
        </div>
      </div>
    </div>

    <!-- KONTEN TAB: CATATAN & BRIEF -->
    <div v-else-if="activeSubTab === 'notes'" class="project-notes-view">
      <div class="notes-header-bar">
        <span class="notes-count-info">{{ projectNotes.length }} Catatan tersimpan di proyek ini</span>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="$emit('openNewNoteModal', { clientId: client?.id, projectId: project?.id })"
        >
          <Plus :size="15" />
          Tambah Catatan Brief
        </button>
      </div>

      <div v-if="!projectNotes.length" class="empty-state-box card">
        <FileText :size="32" class="text-primary" />
        <h3 class="empty-title">Belum ada catatan di proyek ini</h3>
        <p class="empty-desc">Catat arahan brief klien, panduan visual, atau rangkuman meeting.</p>
        <button 
          type="button" 
          class="btn btn-primary" 
          @click="$emit('openNewNoteModal', { clientId: client?.id, projectId: project?.id })"
        >
          <Plus :size="15" />
          Buat Catatan Sekarang
        </button>
      </div>

      <div v-else class="project-notes-grid">
        <div 
          v-for="note in projectNotes" 
          :key="note.id" 
          class="note-card card"
          @click="$emit('editNote', note)"
        >
          <div class="note-card-top">
            <h3 class="note-card-title">{{ note.judul }}</h3>
            <Pin v-if="note.dipin" :size="14" class="pinned-icon" />
          </div>
          <p class="note-snippet">{{ note.isi ? note.isi.substring(0, 160) : 'Tanpa isi...' }}</p>
          <div class="note-footer">
            <span class="note-date">{{ formatDate(note.diubah || note.dibuat) }}</span>
            <div class="note-labels">
              <span v-for="lbl in (note.labels || []).slice(0, 2)" :key="lbl" class="chip-sm">#{{ lbl }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  List, 
  Kanban, 
  Layers, 
  Plus, 
  CheckSquare, 
  FileText, 
  Pin 
} from 'lucide-vue-next';
import { 
  useAgency, 
  clientMap, 
  projectMap, 
  selectedClientId, 
  selectedProjectId, 
  kanbanMode 
} from '../../store/useAgencyStore';
import TaskItem from '../common/TaskItem.vue';

const emit = defineEmits([
  'openNewTaskModal', 
  'editTask', 
  'deleteTask', 
  'openApplyTemplate', 
  'openNewNoteModal', 
  'editNote'
]);

const { state, updateTask, currentView } = useAgency();

const activeSubTab = ref('tasks'); // 'tasks' | 'notes'
const draggedTask = ref(null);

const client = computed(() => {
  return selectedClientId.value ? clientMap.value[selectedClientId.value] : null;
});

const project = computed(() => {
  return selectedProjectId.value ? projectMap.value[selectedProjectId.value] : null;
});

const projectTasks = computed(() => {
  return state.tugas.filter(t => {
    if (selectedProjectId.value) return t.proyekId === selectedProjectId.value;
    if (selectedClientId.value) return t.klienId === selectedClientId.value;
    return true;
  }).sort((a, b) => {
    if (a.dipin !== b.dipin) return b.dipin ? 1 : -1;
    return (a.tenggat || '9999').localeCompare(b.tenggat || '9999');
  });
});

const projectNotes = computed(() => {
  return state.catatan.filter(n => {
    if (n.isIde) return false;
    if (selectedProjectId.value) return n.proyekId === selectedProjectId.value;
    if (selectedClientId.value) return n.klienId === selectedClientId.value;
    return true;
  });
});

const kanbanColumns = [
  { status: 'Brief' },
  { status: 'Dikerjakan' },
  { status: 'Revisi' },
  { status: 'Menunggu Klien' },
  { status: 'Selesai' }
];

function getTasksByStatus(status) {
  return projectTasks.value.filter(t => t.status === status);
}

function handleDragStart(task) {
  draggedTask.value = task;
}

function handleDrop(targetStatus) {
  if (draggedTask.value && draggedTask.value.status !== targetStatus) {
    updateTask(draggedTask.value.id, { status: targetStatus });
  }
  draggedTask.value = null;
}

function backToClients() {
  currentView.value = 'clients';
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
</script>

<style scoped>
.project-detail-wrapper {
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

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 6px;
}

.btn-crumb {
  color: var(--color-primary);
  font-weight: 500;
  padding: 0;
  min-height: auto;
}

.btn-crumb:hover {
  text-decoration: underline;
}

.title-with-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.client-dot-large {
  width: 14px;
  height: 14px;
  border-radius: 50%;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

.project-meta-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.view-mode-toggle {
  display: flex;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 2px;
}

.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  min-height: auto;
  transition: all 0.12s ease;
}

.toggle-btn.active {
  background-color: var(--color-soft);
  color: var(--color-soft-text);
  font-weight: 600;
}

/* Subnav Tabs */
.subnav-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.subnav-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  transition: all 0.15s ease;
  min-height: auto;
}

.subnav-tab:hover {
  background-color: var(--color-surface);
  color: var(--color-text);
}

.subnav-tab.active {
  background-color: var(--color-soft);
  color: var(--color-soft-text);
  font-weight: 600;
}

/* KANBAN BOARD (F12) */
.kanban-board-container {
  display: grid;
  grid-template-columns: repeat(5, minmax(240px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 20px;
}

.kanban-column {
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  min-height: 480px;
}

.column-header {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border-subtle);
}

.col-title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.col-count {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  color: var(--color-text-muted);
}

.kanban-items-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.kanban-task-card {
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: grab;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface);
  transition: all 0.15s ease;
}

.kanban-task-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kanban-task-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kanban-due {
  font-size: 11px;
  color: var(--color-text-muted);
}

.kanban-task-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.35;
}

.kanban-labels {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.kanban-lbl {
  font-size: 10px;
  color: var(--color-text-muted);
}

.empty-column-box {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: auto;
  margin-bottom: auto;
}

/* Empty States & Lists */
.empty-state-box {
  text-align: center;
  padding: 44px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: var(--color-surface);
}

.empty-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 400px;
  margin-bottom: 6px;
}

.empty-actions {
  display: flex;
  gap: 10px;
}

.notes-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.notes-count-info {
  font-size: 13px;
  color: var(--color-text-muted);
}

.project-notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.note-card {
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.note-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.pinned-icon {
  color: var(--color-primary);
}

.note-snippet {
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
  white-space: pre-wrap;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-subtle);
}

.note-date {
  font-size: 11px;
  color: var(--color-text-light);
}

.note-labels {
  display: flex;
  gap: 4px;
}

.chip-sm {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
