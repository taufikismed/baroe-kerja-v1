<template>
  <div class="notes-view-wrapper">
    <!-- Header -->
    <div class="view-header">
      <div class="header-left">
        <h1 class="page-title">Catatan & Brief Klien</h1>
        <p class="page-subtitle">
          Dokumentasikan brief kreatif, tautan referensi, dan arahan brand dengan auto-save.
        </p>
      </div>

      <div class="header-actions">
        <button type="button" class="btn btn-primary" @click="createNewNote">
          <Plus :size="16" />
          <span>Buat Catatan Baru</span>
        </button>
      </div>
    </div>

    <!-- Layout Dua Kolom: Daftar Catatan & Editor Catatan Aktif -->
    <div class="notes-split-layout">
      <!-- Kolom Kiri: Daftar Catatan -->
      <div class="notes-sidebar-pane card">
        <div class="sidebar-search-box">
          <Search :size="15" class="search-icon" />
          <input 
            v-model="localSearch" 
            type="text" 
            class="sidebar-search-input" 
            placeholder="Cari catatan..."
          />
        </div>

        <div v-if="!filteredNotesList.length" class="empty-notes-hint">
          Tidak ada catatan yang cocok.
        </div>

        <div v-else class="notes-mini-list">
          <div 
            v-for="note in filteredNotesList" 
            :key="note.id" 
            class="note-mini-item"
            :class="{ active: activeNote?.id === note.id, pinned: note.dipin }"
            @click="selectNote(note)"
          >
            <div class="note-mini-top">
              <span class="note-mini-title">{{ note.judul || 'Tanpa Judul' }}</span>
              <Pin v-if="note.dipin" :size="12" class="icon-pinned" />
            </div>

            <p class="note-mini-snippet">
              {{ note.isi ? note.isi.substring(0, 70).replace(/[#*`]/g, '') : 'Belum ada konten...' }}
            </p>

            <div class="note-mini-meta">
              <span v-if="clientMap[note.klienId]" class="mini-client-name">
                <span class="client-dot" :style="{ backgroundColor: clientMap[note.klienId].warna }"></span>
                {{ clientMap[note.klienId].nama }}
              </span>
              <span class="mini-date">{{ formatRelativeTime(note.diubah || note.dibuat) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Kolom Kanan: Editor Catatan Aktif (F3) -->
      <div class="notes-editor-pane card">
        <div v-if="!activeNote" class="no-active-note-box">
          <FileText :size="40" class="text-primary" />
          <h3>Pilih atau Buat Catatan</h3>
          <p>Pilih catatan dari daftar sebelah kiri atau buat catatan brief baru.</p>
          <button type="button" class="btn btn-primary" @click="createNewNote">
            <Plus :size="16" />
            Catatan Baru
          </button>
        </div>

        <div v-else class="active-editor-content">
          <!-- Editor Top Bar: Auto-save status, Klien & Proyek selector, Pin, Delete -->
          <div class="editor-top-bar">
            <!-- Indikator Auto-save (F3 kriteria penerimaan) -->
            <div class="autosave-status">
              <span v-if="isSaving" class="status-saving">
                <span class="spinner-dot"></span>
                Menyimpan...
              </span>
              <span v-else class="status-saved">
                <Check :size="13" />
                Tersimpan otomatis
              </span>
            </div>

            <!-- Aksi Top Bar -->
            <div class="editor-actions">
              <button 
                type="button" 
                class="btn-icon" 
                :class="{ 'pinned-active': activeNote.dipin }"
                :title="activeNote.dipin ? 'Lepas Pin' : 'Pin Catatan'"
                @click="togglePin"
              >
                <Pin :size="15" />
              </button>
              <button 
                type="button" 
                class="btn-icon btn-delete-hover" 
                title="Hapus Catatan"
                @click="handleDeleteNote"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </div>

          <!-- Relasi Klien & Proyek -->
          <div class="editor-relations-bar">
            <div class="relation-item">
              <label class="relation-lbl">Klien:</label>
              <select v-model="activeNote.klienId" class="input-select select-mini" @change="onRelationChange">
                <option :value="null">-- Tanpa Klien --</option>
                <option v-for="c in state.klien" :key="c.id" :value="c.id">{{ c.nama }}</option>
              </select>
            </div>

            <div class="relation-item">
              <label class="relation-lbl">Proyek:</label>
              <select v-model="activeNote.proyekId" class="input-select select-mini" @change="onRelationChange">
                <option :value="null">-- Tanpa Proyek --</option>
                <option v-for="p in availableProjects" :key="p.id" :value="p.id">{{ p.nama }}</option>
              </select>
            </div>
          </div>

          <!-- Input Judul Catatan -->
          <input 
            v-model="activeNote.judul" 
            type="text" 
            class="note-title-input" 
            placeholder="Judul Catatan atau Brief..."
            @input="handleInput"
          />

          <!-- Toolbar Format Cepat (F3: tebal, daftar, heading, tautan) -->
          <div class="formatting-toolbar">
            <button type="button" class="tool-btn" title="Heading 1" @click="insertFormat('# ')">H1</button>
            <button type="button" class="tool-btn" title="Heading 2" @click="insertFormat('## ')">H2</button>
            <button type="button" class="tool-btn" title="Heading 3" @click="insertFormat('### ')">H3</button>
            <span class="tool-separator"></span>
            <button type="button" class="tool-btn" title="Tebal (Bold)" @click="insertWrap('**', '**')">
              <Bold :size="14" />
            </button>
            <button type="button" class="tool-btn" title="Miring (Italic)" @click="insertWrap('*', '*')">
              <Italic :size="14" />
            </button>
            <span class="tool-separator"></span>
            <button type="button" class="tool-btn" title="Daftar Butir" @click="insertFormat('- ')">
              <List :size="14" />
            </button>
            <button type="button" class="tool-btn" title="Daftar Nomor" @click="insertFormat('1. ')">
              <ListOrdered :size="14" />
            </button>
            <button type="button" class="tool-btn" title="Checklist" @click="insertFormat('- [ ] ')">
              <CheckSquare :size="14" />
            </button>
            <span class="tool-separator"></span>
            <button type="button" class="tool-btn" title="Kutipan" @click="insertFormat('> ')">
              <Quote :size="14" />
            </button>
            <button type="button" class="tool-btn" title="Tautan" @click="insertWrap('[Teks Tautan](', ')')">
              <Link2 :size="14" />
            </button>
          </div>

          <!-- Textarea Isi Catatan (Auto-save) -->
          <textarea 
            ref="contentAreaRef"
            v-model="activeNote.isi" 
            class="note-content-textarea" 
            placeholder="Ketik isi brief, referensi, atau arahan di sini. Perubahan tersimpan otomatis..."
            @input="handleInput"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { 
  Plus, 
  Search, 
  FileText, 
  Check, 
  Pin, 
  Trash2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Link2 
} from 'lucide-vue-next';
import { 
  useAgency, 
  filteredNotes, 
  clientMap 
} from '../../store/useAgencyStore';

const { state, addNote, updateNote, deleteNote, togglePinNote } = useAgency();

const localSearch = ref('');
const activeNoteId = ref(filteredNotes.value[0]?.id || null);
const isSaving = ref(false);
const contentAreaRef = ref(null);
let debounceTimer = null;

const filteredNotesList = computed(() => {
  const q = localSearch.value.trim().toLowerCase();
  return filteredNotes.value.filter(n => {
    if (!q) return true;
    return (n.judul && n.judul.toLowerCase().includes(q)) || (n.isi && n.isi.toLowerCase().includes(q));
  });
});

const activeNote = computed(() => {
  return state.catatan.find(n => n.id === activeNoteId.value) || null;
});

const availableProjects = computed(() => {
  if (!activeNote.value?.klienId) return state.proyek;
  return state.proyek.filter(p => p.klienId === activeNote.value.klienId);
});

function selectNote(note) {
  activeNoteId.value = note.id;
}

function createNewNote() {
  const newN = addNote({
    judul: 'Catatan Brief Baru',
    isi: ''
  });
  activeNoteId.value = newN.id;
}

// Auto-save debounced 1 second (F3: "Perubahan tersimpan otomatis dalam 1 detik setelah berhenti mengetik")
function handleInput() {
  isSaving.value = true;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (activeNote.value) {
      updateNote(activeNote.value.id, {
        judul: activeNote.value.judul,
        isi: activeNote.value.isi
      });
      isSaving.value = false;
    }
  }, 1000);
}

function onRelationChange() {
  if (activeNote.value) {
    updateNote(activeNote.value.id, {
      klienId: activeNote.value.klienId,
      proyekId: activeNote.value.proyekId
    });
  }
}

function togglePin() {
  if (activeNote.value) {
    togglePinNote(activeNote.value.id);
  }
}

function handleDeleteNote() {
  if (!activeNote.value) return;
  if (confirm(`Hapus catatan "${activeNote.value.judul}"?`)) {
    deleteNote(activeNote.value.id);
    activeNoteId.value = filteredNotes.value[0]?.id || null;
  }
}

// Formatting helpers
function insertFormat(prefix) {
  const ta = contentAreaRef.value;
  if (!ta || !activeNote.value) return;
  const start = ta.selectionStart;
  const val = activeNote.value.isi;
  activeNote.value.isi = val.substring(0, start) + prefix + val.substring(start);
  handleInput();
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(start + prefix.length, start + prefix.length);
  }, 10);
}

function insertWrap(prefix, suffix) {
  const ta = contentAreaRef.value;
  if (!ta || !activeNote.value) return;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const val = activeNote.value.isi;
  const selectedText = val.substring(start, end) || 'teks';
  activeNote.value.isi = val.substring(0, start) + prefix + selectedText + suffix + val.substring(end);
  handleInput();
  setTimeout(() => {
    ta.focus();
    ta.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
  }, 10);
}

function formatRelativeTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}
</script>

<style scoped>
.notes-view-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - var(--header-height) - 48px);
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

/* Split Layout */
.notes-split-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 860px) {
  .notes-split-layout {
    grid-template-columns: 1fr;
  }
}

/* Sidebar List */
.notes-sidebar-pane {
  display: flex;
  flex-direction: column;
  padding: 14px;
  overflow: hidden;
  background-color: var(--color-surface);
}

.sidebar-search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 12px;
}

.search-icon {
  color: var(--color-text-muted);
}

.sidebar-search-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 13px;
  color: var(--color-text);
  width: 100%;
}

.notes-mini-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
}

.note-mini-item {
  padding: 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
  cursor: pointer;
  transition: all 0.15s ease;
  background-color: var(--color-surface);
}

.note-mini-item:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border);
}

.note-mini-item.active {
  background-color: var(--color-soft);
  border-color: var(--color-primary);
}

.note-mini-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.note-mini-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-pinned {
  color: var(--color-primary);
  flex-shrink: 0;
}

.note-mini-snippet {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-mini-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  color: var(--color-text-light);
}

.mini-client-name {
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.client-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.empty-notes-hint {
  text-align: center;
  padding: 30px 10px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Editor Pane */
.notes-editor-pane {
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: var(--color-surface);
  overflow: hidden;
}

.no-active-note-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  gap: 12px;
  color: var(--color-text-muted);
}

.active-editor-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.autosave-status {
  font-size: 12px;
  font-weight: 500;
}

.status-saving {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #D97706;
}

.spinner-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #D97706;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

.status-saved {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-primary);
}

.editor-actions {
  display: flex;
  gap: 4px;
}

.pinned-active {
  color: var(--color-primary);
}

.editor-relations-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  flex-wrap: wrap;
}

.relation-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.relation-lbl {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.select-mini {
  padding: 4px 8px;
  font-size: 12px;
  min-height: 30px;
  width: auto;
}

.note-title-input {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  padding: 8px 0;
  width: 100%;
}

/* Toolbar */
.formatting-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 0;
  border-top: 1px solid var(--color-border-subtle);
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.tool-btn {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  min-height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background-color: var(--color-soft);
  color: var(--color-primary);
}

.tool-separator {
  width: 1px;
  height: 16px;
  background-color: var(--color-border);
  margin: 0 4px;
}

.note-content-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 15px;
  line-height: 1.6;
  color: var(--color-text);
  resize: none;
  font-family: inherit;
  padding-top: 8px;
}
</style>
