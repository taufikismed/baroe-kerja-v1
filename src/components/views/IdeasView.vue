<template>
  <div class="ideas-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <div class="header-tag">
          <Lightbulb :size="14" class="text-amber" />
          <span>F14: Catatan Cepat Tanpa Klien</span>
        </div>
        <h1 class="page-title">Catatan Ide</h1>
        <p class="page-subtitle">
          Tangkap inspirasi, konsep konten viral, atau ide strategi seketika. Konversi kapan saja menjadi tugas atau proyek.
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-primary" @click="$emit('openNewIdeaModal')">
          <Plus :size="16" />
          <span>Tangkap Ide (2 Ketukan)</span>
        </button>
      </div>
    </div>

    <!-- Inline Rapid 2-Click Capture Box -->
    <div class="rapid-capture-box card">
      <Lightbulb :size="20" class="text-amber icon-lamp" />
      <input 
        v-model="quickIdeaTitle" 
        type="text" 
        class="rapid-input" 
        placeholder="Ada ide baru yang terlintas? Ketik dan tekan Enter..."
        @keydown.enter="handleRapidCapture"
      />
      <button 
        type="button" 
        class="btn btn-soft btn-sm" 
        :disabled="!quickIdeaTitle.trim()"
        @click="handleRapidCapture"
      >
        Simpan
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!ideaNotes.length" class="empty-state-box card">
      <Sparkles :size="36" class="text-amber" />
      <h3 class="empty-title">Belum ada catatan ide</h3>
      <p class="empty-desc">Ide yang terlintas dapat disimpan cepat di sini tanpa perlu memilih klien terlebih dahulu.</p>
      <button type="button" class="btn btn-primary" @click="$emit('openNewIdeaModal')">
        <Plus :size="16" />
        Tambah Ide Pertama
      </button>
    </div>

    <!-- Daftar Kartu Ide -->
    <div v-else class="ideas-grid">
      <div 
        v-for="idea in ideaNotes" 
        :key="idea.id" 
        class="idea-card card"
      >
        <div class="idea-card-header">
          <div class="idea-card-title-row">
            <Lightbulb :size="16" class="text-amber" />
            <h3 class="idea-card-title">{{ idea.judul }}</h3>
          </div>
          <div class="idea-card-top-actions">
            <button 
              type="button" 
              class="btn-icon" 
              :class="{ 'pinned-active': idea.dipin }"
              :title="idea.dipin ? 'Lepas Pin' : 'Pin Ide'"
              @click="togglePinNote(idea.id)"
            >
              <Pin :size="14" />
            </button>
            <button 
              type="button" 
              class="btn-icon btn-delete-hover" 
              title="Hapus Ide"
              @click="deleteNote(idea.id)"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>

        <p v-if="idea.isi" class="idea-content">{{ idea.isi }}</p>

        <!-- Labels -->
        <div v-if="idea.labels && idea.labels.length" class="idea-labels-row">
          <span v-for="lbl in idea.labels" :key="lbl" class="idea-lbl">#{{ lbl }}</span>
        </div>

        <!-- Tombol Aksi Konversi (F14: Ubah jadi tugas atau pindah ke proyek) -->
        <div class="idea-conversion-footer">
          <span class="idea-date">{{ formatDate(idea.dibuat) }}</span>
          <div class="conversion-buttons">
            <button 
              type="button" 
              class="btn-convert btn-convert-task" 
              title="Jadikan tugas eksekusi di sebuah proyek"
              @click="promptConvertToTask(idea)"
            >
              <ArrowRightCircle :size="14" />
              Ubah Jadi Tugas
            </button>
            <button 
              type="button" 
              class="btn-convert btn-convert-project" 
              title="Pindahkan menjadi catatan proyek resmi"
              @click="promptMoveToProject(idea)"
            >
              <FolderPlus :size="14" />
              Pindah ke Proyek
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konversi Ide Jadi Tugas -->
    <div v-if="convertingToTaskIdea" class="modal-overlay" @click.self="convertingToTaskIdea = null">
      <div class="modal-content modal-convert">
        <div class="modal-header">
          <h3 class="modal-title">Ubah Ide Menjadi Tugas</h3>
          <button type="button" class="btn-icon" @click="convertingToTaskIdea = null">
            <X :size="18" />
          </button>
        </div>
        <form @submit.prevent="executeConvertToTask" class="modal-body">
          <div class="form-group">
            <label class="form-label">Klien Tujuan</label>
            <select v-model="convertClientId" class="input-select" required>
              <option disabled value="">-- Pilih Klien --</option>
              <option v-for="c in state.klien" :key="c.id" :value="c.id">{{ c.nama }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Proyek Tujuan</label>
            <select v-model="convertProjectId" class="input-select" required>
              <option disabled value="">-- Pilih Proyek --</option>
              <option v-for="p in convertAvailableProjects" :key="p.id" :value="p.id">{{ p.nama }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tenggat Waktu</label>
            <input v-model="convertDueDate" type="date" class="input-text" />
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="convertingToTaskIdea = null">Batal</button>
            <button type="submit" class="btn btn-primary">Konfirmasi Jadi Tugas</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Pindahkan Ide Ke Catatan Proyek -->
    <div v-if="movingToProjectIdea" class="modal-overlay" @click.self="movingToProjectIdea = null">
      <div class="modal-content modal-convert">
        <div class="modal-header">
          <h3 class="modal-title">Pindahkan ke Catatan Proyek</h3>
          <button type="button" class="btn-icon" @click="movingToProjectIdea = null">
            <X :size="18" />
          </button>
        </div>
        <form @submit.prevent="executeMoveToProject" class="modal-body">
          <div class="form-group">
            <label class="form-label">Klien Tujuan</label>
            <select v-model="moveClientId" class="input-select" required>
              <option disabled value="">-- Pilih Klien --</option>
              <option v-for="c in state.klien" :key="c.id" :value="c.id">{{ c.nama }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Proyek Tujuan</label>
            <select v-model="moveProjectId" class="input-select" required>
              <option disabled value="">-- Pilih Proyek --</option>
              <option v-for="p in moveAvailableProjects" :key="p.id" :value="p.id">{{ p.nama }}</option>
            </select>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="movingToProjectIdea = null">Batal</button>
            <button type="submit" class="btn btn-primary">Pindahkan</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  Lightbulb, 
  Plus, 
  Sparkles, 
  Pin, 
  Trash2, 
  ArrowRightCircle, 
  FolderPlus, 
  X 
} from 'lucide-vue-next';
import { 
  useAgency, 
  ideaNotes 
} from '../../store/useAgencyStore';

defineEmits(['openNewIdeaModal']);
const { 
  state, 
  addNote, 
  deleteNote, 
  togglePinNote, 
  convertIdeaToTask, 
  convertIdeaToProjectNote 
} = useAgency();

const quickIdeaTitle = ref('');

// State modal convert to task
const convertingToTaskIdea = ref(null);
const convertClientId = ref('');
const convertProjectId = ref('');
const convertDueDate = ref(new Date().toISOString().split('T')[0]);

// State modal move to project
const movingToProjectIdea = ref(null);
const moveClientId = ref('');
const moveProjectId = ref('');

const convertAvailableProjects = computed(() => {
  if (!convertClientId.value) return [];
  return state.proyek.filter(p => p.klienId === convertClientId.value);
});

const moveAvailableProjects = computed(() => {
  if (!moveClientId.value) return [];
  return state.proyek.filter(p => p.klienId === moveClientId.value);
});

function handleRapidCapture() {
  if (!quickIdeaTitle.value.trim()) return;

  addNote({
    judul: quickIdeaTitle.value,
    isi: '',
    isIde: true
  });

  quickIdeaTitle.value = '';
}

function promptConvertToTask(idea) {
  convertingToTaskIdea.value = idea;
  convertClientId.value = state.klien[0]?.id || '';
  const firstProjs = state.proyek.filter(p => p.klienId === convertClientId.value);
  convertProjectId.value = firstProjs[0]?.id || '';
}

function executeConvertToTask() {
  if (!convertingToTaskIdea.value || !convertProjectId.value) return;

  convertIdeaToTask(convertingToTaskIdea.value.id, {
    klienId: convertClientId.value,
    proyekId: convertProjectId.value,
    tenggat: convertDueDate.value
  });

  convertingToTaskIdea.value = null;
}

function promptMoveToProject(idea) {
  movingToProjectIdea.value = idea;
  moveClientId.value = state.klien[0]?.id || '';
  const firstProjs = state.proyek.filter(p => p.klienId === moveClientId.value);
  moveProjectId.value = firstProjs[0]?.id || '';
}

function executeMoveToProject() {
  if (!movingToProjectIdea.value || !moveProjectId.value) return;

  convertIdeaToProjectNote(movingToProjectIdea.value.id, {
    klienId: moveClientId.value,
    proyekId: moveProjectId.value
  });

  movingToProjectIdea.value = null;
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
</script>

<style scoped>
.ideas-view-wrapper {
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

.header-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #D97706;
  background-color: #FEF3C7;
  padding: 3px 9px;
  border-radius: var(--radius-full);
  margin-bottom: 8px;
}

html.dark .header-tag {
  background-color: #382811;
  color: #FBBF24;
}

.text-amber {
  color: #D97706;
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

/* Rapid Capture Box */
.rapid-capture-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background-color: var(--color-surface);
}

.icon-lamp {
  flex-shrink: 0;
}

.rapid-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  color: var(--color-text);
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

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
}

.empty-desc {
  font-size: 14px;
  color: var(--color-text-muted);
  max-width: 420px;
}

/* Grid Kartu Ide */
.ideas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.idea-card {
  padding: 18px;
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.idea-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.idea-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.idea-card-title-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.idea-card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.35;
}

.idea-card-top-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.pinned-active {
  color: var(--color-primary);
}

.btn-delete-hover:hover {
  color: var(--status-terlambat);
}

.idea-content {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.45;
  white-space: pre-wrap;
}

.idea-labels-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.idea-lbl {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-subtle);
  color: var(--color-text-muted);
}

.idea-conversion-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-subtle);
  flex-wrap: wrap;
  gap: 8px;
}

.idea-date {
  font-size: 11px;
  color: var(--color-text-light);
}

.conversion-buttons {
  display: flex;
  gap: 6px;
}

.btn-convert {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  min-height: 28px;
  border: 1px solid var(--color-border);
  background-color: var(--color-surface-subtle);
  color: var(--color-text);
  transition: all 0.12s ease;
}

.btn-convert:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-soft);
}

.modal-convert {
  max-width: 460px;
}
</style>
