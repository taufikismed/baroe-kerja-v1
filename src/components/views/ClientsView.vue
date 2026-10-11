<template>
  <div class="clients-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h1 class="page-title">Klien & Proyek Agensi</h1>
        <p class="page-subtitle">
          Kelola portofolio klien dan seluruh alur kerja proyek kreatif digital.
        </p>
      </div>

      <div class="header-actions">
        <button 
          type="button" 
          class="btn btn-secondary btn-toggle-archived" 
          :class="{ active: showArchived }"
          @click="showArchived = !showArchived"
        >
          <Archive :size="15" />
          <span>{{ showArchived ? 'Sembunyikan Arsip' : 'Tampilkan Arsip' }}</span>
        </button>
        <button type="button" class="btn btn-primary" @click="$emit('openNewClientModal')">
          <Plus :size="16" />
          <span>Tambah Klien</span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!clientsList.length" class="empty-state-box card">
      <Building2 :size="36" class="text-primary" />
      <h3 class="empty-title">Belum ada klien terdaftar</h3>
      <p class="empty-desc">Tambahkan klien pertama Anda untuk mulai mengelola proyek dan tugas.</p>
      <button type="button" class="btn btn-primary" @click="$emit('openNewClientModal')">
        <Plus :size="16" />
        Tambah Klien Sekarang
      </button>
    </div>

    <!-- Daftar Klien Card Grid -->
    <div v-else class="clients-grid">
      <div 
        v-for="client in clientsList" 
        :key="client.id" 
        class="client-card card"
        :class="{ 'is-archived': client.diarsipkan }"
      >
        <!-- Client Top Bar with Color strip -->
        <div class="client-card-header">
          <div class="client-info-main">
            <div class="client-dot-large" :style="{ backgroundColor: client.warna }"></div>
            <div>
              <div class="client-name-row">
                <h3 class="client-name">{{ client.nama }}</h3>
                <span v-if="client.diarsipkan" class="badge badge-archived">Diarsipkan</span>
              </div>
              <p v-if="client.catatan" class="client-notes">{{ client.catatan }}</p>
            </div>
          </div>

          <!-- Aksi Klien -->
          <div class="client-card-actions">
            <button 
              type="button" 
              class="btn-icon" 
              title="Edit Klien"
              @click="$emit('editClient', client)"
            >
              <Edit2 :size="15" />
            </button>
            <button 
              type="button" 
              class="btn-icon" 
              :title="client.diarsipkan ? 'Pulihkan dari Arsip' : 'Arsipkan Klien'"
              @click="toggleArchive(client)"
            >
              <Archive :size="15" />
            </button>
            <button 
              type="button" 
              class="btn-icon btn-delete-hover" 
              title="Hapus Klien"
              @click="handleRequestDelete(client)"
            >
              <Trash2 :size="15" />
            </button>
          </div>
        </div>

        <!-- Proyek Di Bawah Klien -->
        <div class="client-projects-section">
          <div class="projects-section-header">
            <span class="projects-title">Proyek ({{ getClientProjects(client.id).length }})</span>
            <button 
              type="button" 
              class="btn-link-action" 
              @click="$emit('openNewProjectModal', client.id)"
            >
              <Plus :size="13" />
              Proyek Baru
            </button>
          </div>

          <!-- List Proyek -->
          <div v-if="!getClientProjects(client.id).length" class="empty-projects-hint">
            Belum ada proyek. Klik <strong>+ Proyek Baru</strong> untuk membuat.
          </div>

          <div v-else class="projects-list">
            <div 
              v-for="proj in getClientProjects(client.id)" 
              :key="proj.id" 
              class="project-item-row"
              @click="navigateToProject(client.id, proj.id)"
            >
              <div class="project-item-left">
                <Folder :size="16" class="project-folder-icon" />
                <span class="project-name">{{ proj.nama }}</span>
                <span 
                  class="badge badge-sm" 
                  :class="proj.status === 'selesai' ? 'badge-status-selesai' : 'badge-status-dikerjakan'"
                >
                  {{ proj.status === 'selesai' ? 'Selesai' : 'Aktif' }}
                </span>
              </div>

              <div class="project-item-right">
                <div class="project-progress-pill">
                  {{ getProjectProgress(proj.id).completed }}/{{ getProjectProgress(proj.id).total }} Tugas
                </div>
                <div class="project-item-actions" @click.stop>
                  <button 
                    type="button" 
                    class="btn-icon btn-sm" 
                    title="Edit Proyek"
                    @click="$emit('editProject', proj)"
                  >
                    <Edit2 :size="13" />
                  </button>
                  <button 
                    type="button" 
                    class="btn-icon btn-sm btn-delete-hover" 
                    title="Hapus Proyek"
                    @click="handleDeleteProject(proj.id)"
                  >
                    <Trash2 :size="13" />
                  </button>
                </div>
                <ChevronRight :size="15" class="chevron-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { 
  Building2, 
  Plus, 
  Archive, 
  Edit2, 
  Trash2, 
  Folder, 
  ChevronRight 
} from 'lucide-vue-next';
import { useAgency } from '../../store/useAgencyStore';

const emit = defineEmits([
  'openNewClientModal', 
  'editClient', 
  'confirmDeleteClient', 
  'openNewProjectModal', 
  'editProject', 
  'deleteProject'
]);

const { 
  state, 
  showArchived, 
  archiveClient, 
  deleteProject, 
  currentView, 
  selectedClientId, 
  selectedProjectId 
} = useAgency();

const clientsList = computed(() => {
  return state.klien.filter(k => showArchived.value ? true : !k.diarsipkan);
});

function getClientProjects(clientId) {
  return state.proyek.filter(p => {
    if (p.klienId !== clientId) return false;
    if (!showArchived.value && p.diarsipkan) return false;
    return true;
  });
}

function getProjectProgress(projectId) {
  const tasks = state.tugas.filter(t => t.proyekId === projectId);
  const completed = tasks.filter(t => t.status === 'Selesai').length;
  return { completed, total: tasks.length };
}

function toggleArchive(client) {
  archiveClient(client.id, !client.diarsipkan);
}

function handleRequestDelete(client) {
  // Hitung jumlah proyek, tugas, catatan terkait untuk konfirmasi kaskade F1
  const relatedProjects = state.proyek.filter(p => p.klienId === client.id);
  const projectIds = new Set(relatedProjects.map(p => p.id));
  const relatedTasks = state.tugas.filter(t => t.klienId === client.id || projectIds.has(t.proyekId));
  const relatedNotes = state.catatan.filter(n => n.klienId === client.id || projectIds.has(n.proyekId));

  emit('confirmDeleteClient', {
    client,
    cascadeInfo: {
      projectCount: relatedProjects.length,
      taskCount: relatedTasks.length,
      noteCount: relatedNotes.length
    }
  });
}

function handleDeleteProject(projectId) {
  deleteProject(projectId);
}

function navigateToProject(clientId, projectId) {
  selectedClientId.value = clientId;
  selectedProjectId.value = projectId;
  currentView.value = 'projects';
}
</script>

<style scoped>
.clients-view-wrapper {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn-toggle-archived.active {
  background-color: var(--color-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.clients-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-card {
  padding: 20px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.client-card.is-archived {
  opacity: 0.7;
}

.client-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.client-info-main {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.client-dot-large {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;
}

.client-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.badge-archived {
  font-size: 11px;
  background-color: var(--color-surface-subtle);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.client-notes {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 4px;
  line-height: 1.4;
  max-width: 600px;
}

.client-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-delete-hover:hover {
  color: var(--status-terlambat);
  background-color: var(--status-terlambat-bg);
}

/* Projects Section */
.client-projects-section {
  background-color: var(--color-surface-subtle);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  border: 1px solid var(--color-border-subtle);
}

.projects-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.projects-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.btn-link-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  min-height: auto;
}

.btn-link-action:hover {
  text-decoration: underline;
}

.empty-projects-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  padding: 8px 0;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.project-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.project-item-row:hover {
  border-color: var(--color-primary);
  transform: translateX(2px);
}

.project-item-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.project-folder-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.project-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge-sm {
  font-size: 11px;
  padding: 2px 7px;
}

.project-item-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.project-progress-pill {
  font-size: 12px;
  color: var(--color-text-muted);
  background-color: var(--color-surface-subtle);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.project-item-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.btn-sm {
  width: 28px;
  height: 28px;
  min-height: 28px;
}

.chevron-icon {
  color: var(--color-text-muted);
}
</style>
