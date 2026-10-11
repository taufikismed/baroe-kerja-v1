<template>
  <div class="app-layout">
    <!-- Overlay Mobile saat Sidebar Buka -->
    <div 
      v-if="isSidebarOpen" 
      class="sidebar-mobile-backdrop" 
      @click="isSidebarOpen = false"
    ></div>

    <!-- SIDEBAR LAPTOP (Navigasi Samping) -->
    <aside class="app-sidebar" :class="{ 'sidebar-open': isSidebarOpen }">
      <!-- Brand Logo Header -->
      <div class="sidebar-brand-box">
        <div class="brand-identity">
          <div class="brand-logo-squircle">
            <CheckSquare :size="20" class="brand-logo-icon" />
          </div>
          <div class="brand-text">
            <span class="brand-name">BaroeKerja</span>
            <span class="brand-agency">Agensi Kreatif</span>
          </div>
        </div>
        <button 
          type="button" 
          class="btn-icon sidebar-close-btn" 
          @click="isSidebarOpen = false"
        >
          <X :size="18" />
        </button>
      </div>

      <!-- Navigasi Menu Utama -->
      <nav class="sidebar-nav-section">
        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'today' }"
          @click="navTo('today')"
        >
          <Calendar :size="17" />
          <span class="nav-label">Hari Ini</span>
          <span 
            v-if="todayPendingCount > 0" 
            class="nav-badge"
            :class="{ 'badge-alert': todayStats.overdueCount > 0 }"
          >
            {{ todayPendingCount }}
          </span>
        </button>

        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'tasks' }"
          @click="navTo('tasks')"
        >
          <CheckSquare :size="17" />
          <span class="nav-label">Semua Tugas</span>
          <span class="nav-badge-muted">{{ state.tugas.length }}</span>
        </button>

        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'clients' || currentView === 'projects' }"
          @click="navTo('clients')"
        >
          <Building2 :size="17" />
          <span class="nav-label">Klien & Proyek</span>
          <span class="nav-badge-muted">{{ state.klien.length }}</span>
        </button>

        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'notes' }"
          @click="navTo('notes')"
        >
          <FileText :size="17" />
          <span class="nav-label">Catatan & Brief</span>
          <span class="nav-badge-muted">{{ clientNotesCount }}</span>
        </button>

        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'ideas' }"
          @click="navTo('ideas')"
        >
          <Lightbulb :size="17" />
          <span class="nav-label">Catatan Ide (F14)</span>
          <span v-if="ideaNotes.length" class="nav-badge-amber">{{ ideaNotes.length }}</span>
        </button>

        <button 
          type="button" 
          class="nav-item" 
          :class="{ active: currentView === 'templates' }"
          @click="navTo('templates')"
        >
          <Layers :size="17" />
          <span class="nav-label">Template Alur Kerja</span>
        </button>
      </nav>

      <!-- Sub-seksi: Klien Cepat -->
      <div class="sidebar-sub-section">
        <div class="sub-header">
          <span class="sub-title">Daftar Klien</span>
          <button type="button" class="btn-sub-add" title="Tambah Klien" @click="openClientModal()">
            <Plus :size="13" />
          </button>
        </div>

        <div class="sidebar-clients-list">
          <div 
            v-for="c in activeClients" 
            :key="c.id" 
            class="sidebar-client-item"
            :class="{ active: selectedClientId === c.id }"
            @click="selectClientFilter(c.id)"
          >
            <span class="client-dot" :style="{ backgroundColor: c.warna }"></span>
            <span class="client-name-label">{{ c.nama }}</span>
            <span class="client-proj-count">{{ getClientProjectsCount(c.id) }}</span>
          </div>
        </div>
      </div>

      <!-- Sub-seksi: Label / Tags -->
      <div v-if="state.labels.length" class="sidebar-sub-section">
        <div class="sub-header">
          <span class="sub-title">Label</span>
          <button 
            v-if="selectedLabel" 
            type="button" 
            class="btn-clear-label" 
            @click="selectedLabel = null"
          >
            Bersihkan
          </button>
        </div>
        <div class="sidebar-tags-cloud">
          <button 
            v-for="lbl in state.labels" 
            :key="lbl.id"
            type="button" 
            class="tag-pill" 
            :class="{ active: selectedLabel === lbl.nama }"
            @click="toggleLabelFilter(lbl.nama)"
          >
            #{{ lbl.nama }}
          </button>
        </div>
      </div>

      <!-- Sidebar Footer: Cadangan Warning & Settings -->
      <div class="sidebar-footer">
        <!-- Banner Peringatan Cadangan > 7 hari jika jatuh tempo -->
        <div 
          v-if="isBackupDue" 
          class="backup-warning-chip" 
          @click="navTo('settings')"
        >
          <AlertTriangle :size="14" class="text-danger" />
          <span>Cadangkan Data (>7 hari)</span>
        </div>

        <div class="sidebar-footer-row">
          <button 
            type="button" 
            class="footer-icon-btn" 
            :title="'Ganti Tema (' + state.pengaturan.theme + ')'"
            @click="cycleTheme"
          >
            <Sun v-if="state.pengaturan.theme === 'light'" :size="16" />
            <Moon v-else-if="state.pengaturan.theme === 'dark'" :size="16" />
            <Laptop v-else :size="16" />
          </button>

          <button 
            type="button" 
            class="footer-text-btn" 
            :class="{ active: currentView === 'settings' }"
            @click="navTo('settings')"
          >
            <Settings :size="16" />
            <span>Pengaturan</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- AREA KONTEN UTAMA -->
    <main class="app-main">
      <!-- HEADER ATAS -->
      <header class="app-header">
        <div class="header-left-bar">
          <button 
            type="button" 
            class="btn-icon mobile-menu-btn" 
            @click="isSidebarOpen = true"
          >
            <Menu :size="20" />
          </button>

          <!-- Search Bar Spotlight Button (Cmd+K) -->
          <button type="button" class="header-search-trigger" @click="showSearchModal = true">
            <Search :size="16" class="search-trigger-icon" />
            <span class="search-trigger-text">Cari tugas, catatan, klien...</span>
            <kbd class="search-kbd">⌘K</kbd>
          </button>
        </div>

        <div class="header-right-bar">
          <button 
            type="button" 
            class="btn btn-primary btn-header-task" 
            @click="openTaskModal()"
          >
            <Plus :size="16" />
            <span>+ Tugas Baru</span>
          </button>

          <button 
            type="button" 
            class="btn-icon btn-theme-toggle" 
            :title="'Ubah Tema'"
            @click="cycleTheme"
          >
            <Sun v-if="state.pengaturan.theme === 'light'" :size="18" />
            <Moon v-else-if="state.pengaturan.theme === 'dark'" :size="18" />
            <Laptop v-else :size="18" />
          </button>
        </div>
      </header>

      <!-- KONTEN VIEW AKTIF -->
      <div class="app-content">
        <!-- View: Hari Ini (F5) -->
        <TodayView 
          v-if="currentView === 'today'" 
          @openNewTaskModal="openTaskModal()"
          @editTask="openEditTaskModal"
          @deleteTask="confirmDeleteTask"
        />

        <!-- View: Klien & Proyek (F1, F2) -->
        <ClientsView 
          v-else-if="currentView === 'clients'"
          @openNewClientModal="openClientModal()"
          @editClient="openEditClientModal"
          @confirmDeleteClient="handleConfirmDeleteClient"
          @openNewProjectModal="openProjectModal"
          @editProject="openEditProjectModal"
          @deleteProject="confirmDeleteProject"
        />

        <!-- View: Detail Proyek & Kanban (F2, F12) -->
        <ProjectDetailView 
          v-else-if="currentView === 'projects'"
          @openNewTaskModal="openTaskModal"
          @editTask="openEditTaskModal"
          @deleteTask="confirmDeleteTask"
          @openApplyTemplate="openApplyTemplateModal"
          @openNewNoteModal="openNewNoteModal"
          @editNote="openEditNoteModal"
        />

        <!-- View: Semua Tugas -->
        <TasksView 
          v-else-if="currentView === 'tasks'"
          @openNewTaskModal="openTaskModal()"
          @editTask="openEditTaskModal"
          @deleteTask="confirmDeleteTask"
        />

        <!-- View: Catatan & Brief (F3) -->
        <NotesView v-else-if="currentView === 'notes'" />

        <!-- View: Catatan Ide (F14) -->
        <IdeasView 
          v-else-if="currentView === 'ideas'"
          @openNewIdeaModal="openIdeaModal"
        />

        <!-- View: Template Alur Kerja (F11) -->
        <TemplatesView 
          v-else-if="currentView === 'templates'"
          @applyTemplate="handleApplyTemplateFromView"
        />

        <!-- View: Pengaturan & Cadangan (F9, F10, F16) -->
        <SettingsView v-else-if="currentView === 'settings'" />
      </div>
    </main>

    <!-- MOBILE BOTTOM NAVIGATION (PWA F15) -->
    <nav class="mobile-bottom-nav">
      <button 
        type="button" 
        class="nav-bottom-item" 
        :class="{ active: currentView === 'today' }"
        @click="navTo('today')"
      >
        <Calendar :size="18" />
        <span>Hari Ini</span>
      </button>

      <button 
        type="button" 
        class="nav-bottom-item" 
        :class="{ active: currentView === 'clients' || currentView === 'projects' }"
        @click="navTo('clients')"
      >
        <Building2 :size="18" />
        <span>Klien</span>
      </button>

      <button 
        type="button" 
        class="nav-bottom-item" 
        :class="{ active: currentView === 'notes' || currentView === 'ideas' }"
        @click="navTo('notes')"
      >
        <FileText :size="18" />
        <span>Catatan</span>
      </button>

      <button 
        type="button" 
        class="nav-bottom-item" 
        @click="showSearchModal = true"
      >
        <Search :size="18" />
        <span>Cari</span>
      </button>
    </nav>

    <!-- FLOATING ACTION BUTTON (FAB) (+) -->
    <div class="fab-wrapper">
      <button 
        type="button" 
        class="fab-button" 
        title="Tambah Cepat" 
        @click="showFabMenu = !showFabMenu"
      >
        <Plus :size="24" :class="{ 'fab-rotate': showFabMenu }" />
      </button>

      <!-- Menu Melayang FAB -->
      <div v-if="showFabMenu" class="fab-menu-popover" @click="showFabMenu = false">
        <button type="button" class="fab-action-btn" @click="openTaskModal()">
          <CheckSquare :size="16" class="text-primary" />
          <span>Tugas Baru</span>
        </button>
        <button type="button" class="fab-action-btn" @click="openClientModal()">
          <Building2 :size="16" />
          <span>Klien Baru</span>
        </button>
      </div>
    </div>

    <!-- MODAL-MODAL GLOBAL -->
    <!-- Modal Tugas (F4) -->
    <TaskModal 
      v-if="showTaskModal"
      :task-to-edit="taskToEdit"
      :default-client-id="modalDefaultClientId"
      :default-project-id="modalDefaultProjectId"
      @close="closeTaskModal"
    />

    <!-- Modal Catatan Ide Cepat (F14) -->
    <IdeaModal 
      v-if="showIdeaModal" 
      @close="showIdeaModal = false" 
    />

    <!-- Modal Klien (F1) -->
    <ClientModal 
      v-if="showClientModal"
      :client-to-edit="clientToEdit"
      @close="closeClientModal"
    />

    <!-- Modal Proyek (F2) -->
    <ProjectModal 
      v-if="showProjectModal"
      :project-to-edit="projectToEdit"
      :default-client-id="modalDefaultClientId"
      @close="closeProjectModal"
    />

    <!-- Modal Terapkan Template (F11) -->
    <ApplyTemplateModal 
      v-if="showApplyTemplateModal"
      :initial-template-id="templateToApplyId"
      :default-client-id="modalDefaultClientId"
      :default-project-id="modalDefaultProjectId"
      @close="showApplyTemplateModal = false"
    />

    <!-- Modal Spotlight Pencarian Global (F7) -->
    <GlobalSearchModal 
      v-if="showSearchModal"
      @close="showSearchModal = false"
      @openTask="openEditTaskModal"
      @openNote="handleOpenSearchedNote"
    />

    <!-- Modal Konfirmasi Hapus (F1 Cascading confirmation) -->
    <ConfirmDeleteModal 
      v-if="showConfirmModal"
      :title="confirmModalData.title"
      :message="confirmModalData.message"
      :cascade-info="confirmModalData.cascadeInfo"
      :confirm-text="confirmModalData.confirmText"
      @close="showConfirmModal = false"
      @confirm="executeConfirmedAction"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
  CheckSquare, 
  Calendar, 
  Building2, 
  FileText, 
  Lightbulb, 
  Layers, 
  Settings, 
  Plus, 
  Search, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Laptop, 
  AlertTriangle 
} from 'lucide-vue-next';

import { 
  useAgency, 
  todayTasks, 
  todayStats, 
  activeClients, 
  ideaNotes, 
  isBackupDue, 
  applyTheme 
} from './store/useAgencyStore';

// Views
import TodayView from './components/views/TodayView.vue';
import ClientsView from './components/views/ClientsView.vue';
import ProjectDetailView from './components/views/ProjectDetailView.vue';
import TasksView from './components/views/TasksView.vue';
import NotesView from './components/views/NotesView.vue';
import IdeasView from './components/views/IdeasView.vue';
import TemplatesView from './components/views/TemplatesView.vue';
import SettingsView from './components/views/SettingsView.vue';

// Modals
import TaskModal from './components/modals/TaskModal.vue';
import IdeaModal from './components/modals/IdeaModal.vue';
import ClientModal from './components/modals/ClientModal.vue';
import ProjectModal from './components/modals/ProjectModal.vue';
import ApplyTemplateModal from './components/modals/ApplyTemplateModal.vue';
import GlobalSearchModal from './components/modals/GlobalSearchModal.vue';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal.vue';

const { 
  state, 
  currentView, 
  selectedClientId, 
  selectedProjectId, 
  selectedLabel, 
  deleteClient, 
  deleteProject, 
  deleteTask 
} = useAgency();

// State Sidebar & UI
const isSidebarOpen = ref(false);
const showFabMenu = ref(false);

// State Modals
const showTaskModal = ref(false);
const taskToEdit = ref(null);
const modalDefaultClientId = ref(null);
const modalDefaultProjectId = ref(null);

const showIdeaModal = ref(false);

const showClientModal = ref(false);
const clientToEdit = ref(null);

const showProjectModal = ref(false);
const projectToEdit = ref(null);

const showApplyTemplateModal = ref(false);
const templateToApplyId = ref(null);

const showSearchModal = ref(false);

// State Konfirmasi Hapus
const showConfirmModal = ref(false);
const confirmModalData = ref({
  title: '',
  message: '',
  cascadeInfo: null,
  confirmText: '',
  action: null
});

// Hitungan badge navigasi
const todayPendingCount = computed(() => {
  return todayTasks.value.filter(t => t.status !== 'Selesai').length;
});

const clientNotesCount = computed(() => {
  return state.catatan.filter(n => !n.isIde).length;
});

function getClientProjectsCount(clientId) {
  return state.proyek.filter(p => p.klienId === clientId && !p.diarsipkan).length;
}

function navTo(view) {
  currentView.value = view;
  if (view !== 'projects') {
    selectedProjectId.value = null;
  }
  isSidebarOpen.value = false;
}

function selectClientFilter(clientId) {
  selectedClientId.value = clientId;
  selectedProjectId.value = null;
  currentView.value = 'projects';
  isSidebarOpen.value = false;
}

function toggleLabelFilter(labelName) {
  if (selectedLabel.value === labelName) {
    selectedLabel.value = null;
  } else {
    selectedLabel.value = labelName;
  }
}

// Modal Openers
function openTaskModal(context = {}) {
  taskToEdit.value = null;
  modalDefaultClientId.value = context.clientId || selectedClientId.value || null;
  modalDefaultProjectId.value = context.projectId || selectedProjectId.value || null;
  showTaskModal.value = true;
  showFabMenu.value = false;
}

function openEditTaskModal(task) {
  taskToEdit.value = task;
  modalDefaultClientId.value = task.klienId;
  modalDefaultProjectId.value = task.proyekId;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
  taskToEdit.value = null;
}

function openIdeaModal() {
  showIdeaModal.value = true;
  showFabMenu.value = false;
  isSidebarOpen.value = false;
}

function openClientModal() {
  clientToEdit.value = null;
  showClientModal.value = true;
  showFabMenu.value = false;
}

function openEditClientModal(client) {
  clientToEdit.value = client;
  showClientModal.value = true;
}

function closeClientModal() {
  showClientModal.value = false;
  clientToEdit.value = null;
}

function openProjectModal(clientId = null) {
  projectToEdit.value = null;
  modalDefaultClientId.value = clientId || selectedClientId.value;
  showProjectModal.value = true;
}

function openEditProjectModal(project) {
  projectToEdit.value = project;
  modalDefaultClientId.value = project.klienId;
  showProjectModal.value = true;
}

function closeProjectModal() {
  showProjectModal.value = false;
  projectToEdit.value = null;
}

function openApplyTemplateModal(context = {}) {
  templateToApplyId.value = context.templateId || null;
  modalDefaultClientId.value = context.clientId || selectedClientId.value || null;
  modalDefaultProjectId.value = context.projectId || selectedProjectId.value || null;
  showApplyTemplateModal.value = true;
}

function handleApplyTemplateFromView(templateId) {
  templateToApplyId.value = templateId;
  modalDefaultClientId.value = selectedClientId.value || null;
  modalDefaultProjectId.value = selectedProjectId.value || null;
  showApplyTemplateModal.value = true;
}

function openNewNoteModal(context = {}) {
  modalDefaultClientId.value = context.clientId || null;
  modalDefaultProjectId.value = context.projectId || null;
  currentView.value = 'notes';
}

function openEditNoteModal() {
  currentView.value = 'notes';
}

function handleOpenSearchedNote(note) {
  if (note.isIde) {
    currentView.value = 'ideas';
  } else {
    currentView.value = 'notes';
  }
}

// Konfirmasi Hapus Kaskade Klien (Kriteria F1)
function handleConfirmDeleteClient({ client, cascadeInfo }) {
  confirmModalData.value = {
    title: `Hapus Klien "${client.nama}"?`,
    message: `Menghapus klien ini akan menghapus seluruh data yang terkait secara permanen.`,
    cascadeInfo,
    confirmText: 'Ya, Hapus Klien',
    action: () => {
      deleteClient(client.id);
    }
  };
  showConfirmModal.value = true;
}

function confirmDeleteProject(projectId) {
  confirmModalData.value = {
    title: 'Hapus Proyek?',
    message: 'Tugas dan catatan dalam proyek ini akan ikut terhapus.',
    cascadeInfo: null,
    confirmText: 'Hapus Proyek',
    action: () => {
      deleteProject(projectId);
    }
  };
  showConfirmModal.value = true;
}

function confirmDeleteTask(taskId) {
  deleteTask(taskId);
}

function executeConfirmedAction() {
  if (confirmModalData.value.action) {
    confirmModalData.value.action();
  }
  showConfirmModal.value = false;
}

// Siklus Tema Tampilan (F10)
function cycleTheme() {
  const current = state.pengaturan.theme;
  const next = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
  applyTheme(next);
}

// Shortcut Keyboard: Cmd+K (Cari), Cmd+I (Ide), Esc
function handleKeyDown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    showSearchModal.value = !showSearchModal.value;
  } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault();
    openIdeaModal();
  } else if (e.key === 'Escape') {
    showSearchModal.value = false;
    showFabMenu.value = false;
    showTaskModal.value = false;
    showIdeaModal.value = false;
    showClientModal.value = false;
    showProjectModal.value = false;
    showApplyTemplateModal.value = false;
    showConfirmModal.value = false;
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
/* Sidebar Elements */
.sidebar-brand-box {
  padding: 20px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
}

.brand-identity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo-squircle {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  box-shadow: 0 4px 10px rgba(21, 128, 61, 0.25);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.2px;
}

.brand-agency {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-close-btn {
  display: none;
}

@media (max-width: 768px) {
  .sidebar-close-btn {
    display: inline-flex;
  }
}

.sidebar-quick-action {
  padding: 12px 16px 8px;
}

.btn-quick-idea {
  width: 100%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 13px;
  justify-content: flex-start;
  gap: 8px;
}

.idea-icon-pulse {
  color: #D97706;
}

.sidebar-nav-section {
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.12s ease;
  min-height: auto;
  text-align: left;
}

.nav-item:hover {
  color: var(--color-text);
  background-color: var(--color-surface-hover);
}

.nav-item.active {
  color: var(--color-primary);
  background-color: var(--color-soft);
  font-weight: 600;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: var(--radius-full);
  background-color: var(--color-soft);
  color: var(--color-primary);
}

.nav-badge.badge-alert {
  background-color: var(--status-terlambat-bg);
  color: var(--status-terlambat);
}

.nav-badge-muted {
  font-size: 11px;
  color: var(--color-text-light);
}

.nav-badge-amber {
  font-size: 11px;
  font-weight: 600;
  background-color: #FEF3C7;
  color: #D97706;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

/* Sub-sections */
.sidebar-sub-section {
  padding: 14px 16px;
  border-top: 1px solid var(--color-border-subtle);
}

.sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.sub-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.4px;
}

.btn-sub-add {
  color: var(--color-text-muted);
  padding: 0;
  min-height: auto;
}

.btn-sub-add:hover {
  color: var(--color-primary);
}

.sidebar-clients-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar-client-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-muted);
  transition: all 0.12s ease;
}

.sidebar-client-item:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.sidebar-client-item.active {
  background-color: var(--color-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.client-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.client-name-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.client-proj-count {
  font-size: 11px;
  color: var(--color-text-light);
}

.btn-clear-label {
  font-size: 11px;
  color: var(--color-primary);
  padding: 0;
  min-height: auto;
}

.sidebar-tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag-pill {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
  color: var(--color-text-muted);
  min-height: auto;
}

.tag-pill:hover {
  color: var(--color-text);
}

.tag-pill.active {
  background-color: var(--color-primary);
  color: #FFFFFF;
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: auto;
  padding: 14px 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.backup-warning-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #DC2626;
  background-color: var(--status-terlambat-bg);
  padding: 6px 10px;
  border-radius: var(--radius-md);
  cursor: pointer;
  animation: pulse 1.5s infinite alternate;
}

.sidebar-footer-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-icon-btn {
  width: 36px;
  height: 36px;
  min-height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.footer-icon-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.footer-text-btn {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  min-height: 36px;
}

.footer-text-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.footer-text-btn.active {
  background-color: var(--color-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Header Styles */
.header-left-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mobile-menu-btn {
  display: none;
}

@media (max-width: 768px) {
  .mobile-menu-btn {
    display: inline-flex;
  }
}

.header-search-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
  font-size: 13px;
  min-height: 38px;
  min-width: 240px;
  transition: all 0.15s ease;
}

.header-search-trigger:hover {
  background-color: var(--color-surface);
  border-color: var(--color-primary);
}

.search-kbd {
  margin-left: auto;
  font-size: 11px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.header-right-bar {
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 640px) {
  .header-search-trigger {
    min-width: auto;
  }
  .search-trigger-text, .search-kbd {
    display: none;
  }
  .btn-header-idea span, .btn-header-task span {
    display: none;
  }
}

/* Mobile Nav Styles */
.nav-bottom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  min-height: auto;
}

.nav-bottom-item.active {
  color: var(--color-primary);
}

.sidebar-mobile-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 25;
}

/* FAB Popover */
.fab-wrapper {
  position: relative;
}

.fab-rotate {
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.fab-menu-popover {
  position: fixed;
  bottom: calc(var(--bottom-bar-height) + 80px);
  right: 20px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 46;
  min-width: 190px;
  animation: slideUp 0.15s ease-out;
}

@media (min-width: 769px) {
  .fab-menu-popover {
    bottom: 92px;
    right: 28px;
  }
}

.fab-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  min-height: auto;
  text-align: left;
}

.fab-action-btn:hover {
  background-color: var(--color-surface-hover);
}
</style>
