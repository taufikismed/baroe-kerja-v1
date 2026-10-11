<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content search-modal">
      <!-- Search Input Bar -->
      <div class="search-input-header">
        <Search :size="20" class="search-icon" />
        <input 
          ref="searchInputRef"
          v-model="searchQuery" 
          type="text" 
          class="search-input" 
          placeholder="Cari tugas, catatan, brief, proyek, klien... (Ketik minimal 1 karakter)"
          @keydown.esc="$emit('close')"
          autofocus
        />
        <button type="button" class="btn-icon" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Search Results Area -->
      <div class="search-results-container">
        <div v-if="!searchQuery.trim()" class="search-placeholder">
          <p class="placeholder-tip">Pencarian global kilat di seluruh klien, proyek, brief, dan catatan.</p>
          <div class="shortcut-pills">
            <span class="kbd-pill"><kbd>ESC</kbd> untuk menutup</span>
          </div>
        </div>

        <div v-else-if="isEmptyResults" class="search-empty">
          <p>Tidak ada hasil yang cocok dengan "<strong>{{ searchQuery }}</strong>"</p>
          <span class="empty-sub">Coba kata kunci lain atau periksa ejaan.</span>
        </div>

        <div v-else class="results-sections">
          <!-- Kategori Tugas -->
          <div v-if="searchResults.tasks.length" class="result-group">
            <div class="group-title">
              <CheckSquare :size="14" />
              Tugas ({{ searchResults.tasks.length }})
            </div>
            <div 
              v-for="task in searchResults.tasks" 
              :key="task.id" 
              class="result-row"
              @click="handleSelectTask(task)"
            >
              <div class="result-main">
                <span class="result-title">{{ task.judul }}</span>
                <div class="result-meta">
                  <span v-if="clientMap[task.klienId]" class="result-tag client">
                    {{ clientMap[task.klienId].nama }}
                  </span>
                  <span class="badge" :class="'badge-status-' + task.status.toLowerCase().replace(/\s+/g, '-')">
                    {{ task.status }}
                  </span>
                  <span v-if="task.tenggat" class="result-due">
                    Tenggat: {{ task.tenggat }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategori Catatan & Brief -->
          <div v-if="searchResults.notes.length" class="result-group">
            <div class="group-title">
              <FileText :size="14" />
              Catatan & Brief ({{ searchResults.notes.length }})
            </div>
            <div 
              v-for="note in searchResults.notes" 
              :key="note.id" 
              class="result-row"
              @click="handleSelectNote(note)"
            >
              <div class="result-main">
                <div class="title-with-badge">
                  <span class="result-title">{{ note.judul }}</span>
                  <span v-if="note.isIde" class="badge-ide">Ide Cepat</span>
                </div>
                <p v-if="note.isi" class="result-snippet">{{ note.isi.substring(0, 100) }}...</p>
              </div>
            </div>
          </div>

          <!-- Kategori Proyek -->
          <div v-if="searchResults.projects.length" class="result-group">
            <div class="group-title">
              <Folder :size="14" />
              Proyek ({{ searchResults.projects.length }})
            </div>
            <div 
              v-for="p in searchResults.projects" 
              :key="p.id" 
              class="result-row"
              @click="handleSelectProject(p)"
            >
              <div class="result-main">
                <span class="result-title">{{ p.nama }}</span>
                <span v-if="clientMap[p.klienId]" class="result-meta">
                  Klien: {{ clientMap[p.klienId].nama }}
                </span>
              </div>
            </div>
          </div>

          <!-- Kategori Klien -->
          <div v-if="searchResults.clients.length" class="result-group">
            <div class="group-title">
              <Building2 :size="14" />
              Klien ({{ searchResults.clients.length }})
            </div>
            <div 
              v-for="c in searchResults.clients" 
              :key="c.id" 
              class="result-row"
              @click="handleSelectClient(c)"
            >
              <div class="result-main">
                <div class="client-title-row">
                  <span class="client-dot" :style="{ backgroundColor: c.warna }"></span>
                  <span class="result-title">{{ c.nama }}</span>
                </div>
                <span v-if="c.catatan" class="result-snippet">{{ c.catatan }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { 
  Search, 
  X, 
  CheckSquare, 
  FileText, 
  Folder, 
  Building2 
} from 'lucide-vue-next';
import { 
  useAgency, 
  searchResults, 
  searchQuery, 
  clientMap 
} from '../../store/useAgencyStore';

const emit = defineEmits(['close', 'openTask', 'openNote']);
const { currentView, selectedClientId, selectedProjectId } = useAgency();

const searchInputRef = ref(null);

const isEmptyResults = computed(() => {
  const r = searchResults.value;
  return searchQuery.value.trim() && 
    !r.tasks.length && 
    !r.notes.length && 
    !r.projects.length && 
    !r.clients.length;
});

function handleSelectTask(task) {
  emit('openTask', task);
  emit('close');
}

function handleSelectNote(note) {
  if (note.isIde) {
    currentView.value = 'ideas';
  } else {
    currentView.value = 'notes';
  }
  emit('openNote', note);
  emit('close');
}

function handleSelectProject(proj) {
  selectedClientId.value = proj.klienId;
  selectedProjectId.value = proj.id;
  currentView.value = 'projects';
  emit('close');
}

function handleSelectClient(client) {
  selectedClientId.value = client.id;
  selectedProjectId.value = null;
  currentView.value = 'projects';
  emit('close');
}

onMounted(() => {
  setTimeout(() => {
    searchInputRef.value?.focus();
  }, 50);
});
</script>

<style scoped>
.search-modal {
  max-width: 620px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.search-input-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  color: var(--color-primary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  color: var(--color-text);
}

.search-results-container {
  padding: 16px;
  overflow-y: auto;
  max-height: 500px;
}

.search-placeholder {
  text-align: center;
  padding: 30px 16px;
  color: var(--color-text-muted);
}

.placeholder-tip {
  font-size: 14px;
  margin-bottom: 12px;
}

.kbd-pill {
  font-size: 12px;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.search-empty {
  text-align: center;
  padding: 40px 16px;
  color: var(--color-text-muted);
}

.empty-sub {
  font-size: 13px;
  display: block;
  margin-top: 4px;
}

.results-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  padding: 0 8px 4px;
}

.result-row {
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.result-row:hover {
  background-color: var(--color-surface-hover);
}

.result-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.result-tag.client {
  color: var(--color-primary);
  font-weight: 500;
}

.result-snippet {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-ide {
  font-size: 10px;
  background-color: #FEF3C7;
  color: #D97706;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.client-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.client-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
