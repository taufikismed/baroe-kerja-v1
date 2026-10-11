import { ref, computed, watch, reactive } from 'vue';
import { getDefaultAgencyData } from './initialData';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'baroekerja_store_v1';

// Inisialisasi state reaktif dari LocalStorage atau data awal
function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validasi struktur data minimal
      if (parsed.klien && parsed.proyek && parsed.tugas && parsed.catatan) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca data dari localStorage, memakai data awal:', err);
  }
  return getDefaultAgencyData();
}

const state = reactive(loadInitialState());

// Simpan otomatis ke LocalStorage setiap ada perubahan
watch(
  () => state,
  (newVal) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal));
    } catch (e) {
      console.error('Gagal menyimpan ke localStorage:', e);
    }
  },
  { deep: true }
);

// State Navigasi & Filter UI
export const currentView = ref('today'); // 'today' | 'clients' | 'projects' | 'tasks' | 'notes' | 'ideas' | 'templates' | 'settings'
export const selectedClientId = ref(null);
export const selectedProjectId = ref(null);
export const selectedLabel = ref(null);
export const searchQuery = ref('');
export const showArchived = ref(false);
export const kanbanMode = ref(false); // Toggle Tampilan Papan vs Daftar di Proyek (F12)

// Helper ID Unik Klien
export function generateId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

// ==========================================================================
// PENGELOLAAN TEMA (F10)
// ==========================================================================
export function applyTheme(theme) {
  state.pengaturan.theme = theme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// Listener perubahan tema OS saat mode 'system'
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.pengaturan.theme === 'system') {
      applyTheme('system');
    }
  });
}

// Inisialisasi tema saat startup
applyTheme(state.pengaturan.theme || 'system');

// ==========================================================================
// COMPUTED DATA & RELASI
// ==========================================================================

// Peta Klien & Proyek untuk akses cepat
export const clientMap = computed(() => {
  const map = {};
  state.klien.forEach(k => { map[k.id] = k; });
  return map;
});

export const projectMap = computed(() => {
  const map = {};
  state.proyek.forEach(p => { map[p.id] = p; });
  return map;
});

// Daftar Klien Aktif
export const activeClients = computed(() => {
  return state.klien.filter(k => showArchived.value ? true : !k.diarsipkan);
});

// Daftar Proyek Aktif
export const activeProjects = computed(() => {
  return state.proyek.filter(p => {
    if (!showArchived.value && p.diarsipkan) return false;
    if (selectedClientId.value && p.klienId !== selectedClientId.value) return false;
    return true;
  });
});

// Helper status tanggal
export function getTaskDateStatus(dueDateStr) {
  if (!dueDateStr) return 'normal';
  const todayStr = new Date().toISOString().split('T')[0];
  if (dueDateStr < todayStr) return 'overdue';
  if (dueDateStr === todayStr) return 'today';
  return 'future';
}

// LAYAR HARI INI (F5): Tugas jatuh tempo hari ini dan yang terlambat
export const todayTasks = computed(() => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const tasks = state.tugas.filter(task => {
    // Abaikan jika proyek atau klien diarsipkan
    const client = task.klienId ? clientMap.value[task.klienId] : null;
    const project = task.proyekId ? projectMap.value[task.proyekId] : null;
    if (client && client.diarsipkan && !showArchived.value) return false;
    if (project && project.diarsipkan && !showArchived.value) return false;

    // Filter label jika aktif
    if (selectedLabel.value && (!task.labels || !task.labels.includes(selectedLabel.value))) return false;

    // Tugas relevan untuk Hari Ini:
    // 1. Belum selesai dan jatuh tempo <= hari ini (terlambat & hari ini)
    // 2. ATAU tugas yang diselesaikan hari ini (selesaiPada === today)
    const isDueOrOverdue = task.tenggat && task.tenggat <= todayStr;
    const isCompletedToday = task.status === 'Selesai' && task.selesaiPada && task.selesaiPada.startsWith(todayStr);

    return isDueOrOverdue || isCompletedToday;
  });

  // Urutkan:
  // 1. Pin di atas (F8)
  // 2. Tugas belum selesai vs sudah selesai
  // 3. Terlambat dulu, lalu hari ini
  // 4. Prioritas (Mendesak -> Tinggi -> Sedang -> Rendah)
  // 5. Tenggat
  const priorityOrder = { 'Mendesak': 1, 'Tinggi': 2, 'Sedang': 3, 'Rendah': 4 };

  return tasks.sort((a, b) => {
    if (a.dipin !== b.dipin) return b.dipin ? 1 : -1;
    if ((a.status === 'Selesai') !== (b.status === 'Selesai')) {
      return a.status === 'Selesai' ? 1 : -1;
    }
    const aDateStatus = getTaskDateStatus(a.tenggat);
    const bDateStatus = getTaskDateStatus(b.tenggat);
    if (aDateStatus === 'overdue' && bDateStatus !== 'overdue') return -1;
    if (bDateStatus === 'overdue' && aDateStatus !== 'overdue') return 1;

    const pA = priorityOrder[a.prioritas] || 5;
    const pB = priorityOrder[b.prioritas] || 5;
    if (pA !== pB) return pA - pB;

    return (a.tenggat || '').localeCompare(b.tenggat || '');
  });
});

// Statistik Hari Ini
export const todayStats = computed(() => {
  const tasks = todayTasks.value;
  const todayStr = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.status !== 'Selesai' && t.tenggat && t.tenggat < todayStr);
  const dueToday = tasks.filter(t => t.status !== 'Selesai' && t.tenggat === todayStr);
  const completed = tasks.filter(t => t.status === 'Selesai');
  const total = tasks.length;
  const progressPercent = total > 0 ? Math.round((completed.length / total) * 100) : 0;

  return {
    overdueCount: overdue.length,
    dueTodayCount: dueToday.length,
    completedCount: completed.length,
    totalCount: total,
    progressPercent
  };
});

// DAFTAR TUGAS KESELURUHAN (dengan filter klien, proyek, label)
export const filteredTasks = computed(() => {
  return state.tugas.filter(task => {
    if (selectedClientId.value && task.klienId !== selectedClientId.value) return false;
    if (selectedProjectId.value && task.proyekId !== selectedProjectId.value) return false;
    if (selectedLabel.value && (!task.labels || !task.labels.includes(selectedLabel.value))) return false;
    
    const client = task.klienId ? clientMap.value[task.klienId] : null;
    const project = task.proyekId ? projectMap.value[task.proyekId] : null;
    if (!showArchived.value) {
      if (client && client.diarsipkan) return false;
      if (project && project.diarsipkan) return false;
    }

    return true;
  }).sort((a, b) => {
    if (a.dipin !== b.dipin) return b.dipin ? 1 : -1;
    if ((a.status === 'Selesai') !== (b.status === 'Selesai')) {
      return a.status === 'Selesai' ? 1 : -1;
    }
    return (a.tenggat || '9999').localeCompare(b.tenggat || '9999');
  });
});

// DAFTAR CATATAN (bukan ide, dengan filter klien/proyek/label)
export const filteredNotes = computed(() => {
  return state.catatan.filter(note => {
    if (note.isIde) return false; // Catatan ide dipisah ke F14
    if (selectedClientId.value && note.klienId !== selectedClientId.value) return false;
    if (selectedProjectId.value && note.proyekId !== selectedProjectId.value) return false;
    if (selectedLabel.value && (!note.labels || !note.labels.includes(selectedLabel.value))) return false;
    
    return true;
  }).sort((a, b) => {
    if (a.dipin !== b.dipin) return b.dipin ? 1 : -1;
    return new Date(b.diubah || b.dibuat) - new Date(a.diubah || a.dibuat);
  });
});

// DAFTAR CATATAN IDE (F14)
export const ideaNotes = computed(() => {
  return state.catatan.filter(note => note.isIde).sort((a, b) => {
    if (a.dipin !== b.dipin) return b.dipin ? 1 : -1;
    return new Date(b.diubah || b.dibuat) - new Date(a.diubah || a.dibuat);
  });
});

// PENCARIAN GLOBAL (F7) < 300ms
export const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return { tasks: [], notes: [], projects: [], clients: [] };

  const matchedClients = state.klien.filter(k => 
    k.nama.toLowerCase().includes(q) || (k.catatan && k.catatan.toLowerCase().includes(q))
  );

  const matchedProjects = state.proyek.filter(p => {
    const client = clientMap.value[p.klienId];
    const clientName = client ? client.nama.toLowerCase() : '';
    return p.nama.toLowerCase().includes(q) || clientName.includes(q);
  });

  const matchedTasks = state.tugas.filter(t => {
    const titleMatch = t.judul.toLowerCase().includes(q);
    const noteMatch = t.catatan && t.catatan.toLowerCase().includes(q);
    const labelMatch = t.labels && t.labels.some(l => l.toLowerCase().includes(q));
    return titleMatch || noteMatch || labelMatch;
  });

  const matchedNotes = state.catatan.filter(n => {
    const titleMatch = n.judul.toLowerCase().includes(q);
    const contentMatch = n.isi && n.isi.toLowerCase().includes(q);
    const labelMatch = n.labels && n.labels.some(l => l.toLowerCase().includes(q));
    return titleMatch || contentMatch || labelMatch;
  });

  return {
    clients: matchedClients,
    projects: matchedProjects,
    tasks: matchedTasks,
    notes: matchedNotes
  };
});

// STATUS PENGINGAT CADANGAN (F9 & Persyaratan Non-fungsional: > 7 hari)
export const isBackupDue = computed(() => {
  if (!state.pengaturan.lastBackupDate) return true;
  const last = new Date(state.pengaturan.lastBackupDate).getTime();
  const daysDiff = (Date.now() - last) / (1000 * 60 * 60 * 24);
  return daysDiff >= (state.pengaturan.backupReminderDays || 7);
});

// ==========================================================================
// AKSI & OPERASI DATA
// ==========================================================================

export function useAgency() {
  // --- Klien ---
  function addClient({ nama, warna, catatan }) {
    const newClient = {
      id: generateId('klien'),
      nama: nama.trim(),
      warna: warna || '#15803D',
      catatan: catatan ? catatan.trim() : '',
      diarsipkan: false,
      dibuat: new Date().toISOString()
    };
    state.klien.push(newClient);
    return newClient;
  }

  function updateClient(id, updates) {
    const idx = state.klien.findIndex(k => k.id === id);
    if (idx !== -1) {
      state.klien[idx] = { ...state.klien[idx], ...updates };
    }
  }

  function deleteClient(id) {
    // Hitung proyek dan tugas yang ikut terhapus untuk konfirmasi
    const relatedProjects = state.proyek.filter(p => p.klienId === id);
    const relatedProjectIds = new Set(relatedProjects.map(p => p.id));
    const relatedTasks = state.tugas.filter(t => t.klienId === id || relatedProjectIds.has(t.proyekId));
    const relatedNotes = state.catatan.filter(n => n.klienId === id || relatedProjectIds.has(n.proyekId));

    // Eksekusi penghapusan kaskade
    state.klien = state.klien.filter(k => k.id !== id);
    state.proyek = state.proyek.filter(p => p.klienId !== id);
    state.tugas = state.tugas.filter(t => t.klienId !== id && !relatedProjectIds.has(t.proyekId));
    state.catatan = state.catatan.filter(n => n.klienId !== id && !relatedProjectIds.has(n.proyekId));

    if (selectedClientId.value === id) {
      selectedClientId.value = null;
      selectedProjectId.value = null;
    }

    return {
      deletedProjectCount: relatedProjects.length,
      deletedTaskCount: relatedTasks.length,
      deletedNoteCount: relatedNotes.length
    };
  }

  function archiveClient(id, diarsipkan = true) {
    updateClient(id, { diarsipkan });
  }

  // --- Proyek ---
  function addProject({ klienId, nama, tanggalMulai, tenggatAkhir }) {
    const newProject = {
      id: generateId('proyek'),
      klienId,
      nama: nama.trim(),
      status: 'aktif',
      tanggalMulai: tanggalMulai || new Date().toISOString().split('T')[0],
      tenggatAkhir: tenggatAkhir || null,
      diarsipkan: false,
      dibuat: new Date().toISOString()
    };
    state.proyek.push(newProject);
    return newProject;
  }

  function updateProject(id, updates) {
    const idx = state.proyek.findIndex(p => p.id === id);
    if (idx !== -1) {
      state.proyek[idx] = { ...state.proyek[idx], ...updates };
    }
  }

  function deleteProject(id) {
    state.proyek = state.proyek.filter(p => p.id !== id);
    state.tugas = state.tugas.filter(t => t.proyekId !== id);
    state.catatan = state.catatan.filter(n => n.proyekId !== id);
    if (selectedProjectId.value === id) {
      selectedProjectId.value = null;
    }
  }

  function archiveProject(id, diarsipkan = true) {
    updateProject(id, { diarsipkan });
  }

  // --- Tugas (F4) ---
  const validStatuses = ['Brief', 'Dikerjakan', 'Revisi', 'Menunggu Klien', 'Selesai'];

  function addTask({ judul, klienId, proyekId, status, prioritas, tenggat, labels, catatan }) {
    const newTask = {
      id: generateId('tugas'),
      judul: judul.trim(),
      klienId: klienId || null,
      proyekId: proyekId || null,
      status: status || 'Brief',
      prioritas: prioritas || 'Sedang',
      tenggat: tenggat || null,
      dipin: false,
      labels: Array.isArray(labels) ? labels : [],
      catatan: catatan || '',
      dibuat: new Date().toISOString(),
      diubah: new Date().toISOString(),
      selesaiPada: status === 'Selesai' ? new Date().toISOString() : null
    };
    state.tugas.push(newTask);
    return newTask;
  }

  function updateTask(id, updates) {
    const idx = state.tugas.findIndex(t => t.id === id);
    if (idx !== -1) {
      const current = state.tugas[idx];
      let selesaiPada = current.selesaiPada;
      
      // Jika status berubah ke Selesai
      if (updates.status === 'Selesai' && current.status !== 'Selesai') {
        selesaiPada = new Date().toISOString();
        triggerConfetti();
      } else if (updates.status && updates.status !== 'Selesai') {
        selesaiPada = null;
      }

      state.tugas[idx] = {
        ...current,
        ...updates,
        selesaiPada,
        diubah: new Date().toISOString()
      };
    }
  }

  function cycleTaskStatus(id) {
    const task = state.tugas.find(t => t.id === id);
    if (!task) return;
    const currentIdx = validStatuses.indexOf(task.status);
    const nextIdx = (currentIdx + 1) % validStatuses.length;
    updateTask(id, { status: validStatuses[nextIdx] });
  }

  function toggleTaskComplete(id) {
    const task = state.tugas.find(t => t.id === id);
    if (!task) return;
    if (task.status === 'Selesai') {
      updateTask(id, { status: 'Dikerjakan' });
    } else {
      updateTask(id, { status: 'Selesai' });
    }
  }

  function togglePinTask(id) {
    const task = state.tugas.find(t => t.id === id);
    if (task) {
      updateTask(id, { dipin: !task.dipin });
    }
  }

  function deleteTask(id) {
    state.tugas = state.tugas.filter(t => t.id !== id);
  }

  // --- Catatan (F3) & Ide Cepat (F14) ---
  function addNote({ judul, isi, klienId, proyekId, labels, isIde = false }) {
    const newNote = {
      id: generateId(isIde ? 'ide' : 'catatan'),
      judul: judul ? judul.trim() : (isIde ? 'Ide Baru' : 'Catatan Baru'),
      isi: isi || '',
      klienId: isIde ? null : (klienId || null),
      proyekId: isIde ? null : (proyekId || null),
      dipin: false,
      labels: Array.isArray(labels) ? labels : [],
      isIde: Boolean(isIde),
      dibuat: new Date().toISOString(),
      diubah: new Date().toISOString()
    };
    state.catatan.push(newNote);
    return newNote;
  }

  function updateNote(id, updates) {
    const idx = state.catatan.findIndex(n => n.id === id);
    if (idx !== -1) {
      state.catatan[idx] = {
        ...state.catatan[idx],
        ...updates,
        diubah: new Date().toISOString()
      };
    }
  }

  function togglePinNote(id) {
    const note = state.catatan.find(n => n.id === id);
    if (note) {
      updateNote(id, { dipin: !note.dipin });
    }
  }

  function deleteNote(id) {
    state.catatan = state.catatan.filter(n => n.id !== id);
  }

  // F14: Ubah Ide Cepat menjadi Tugas
  function convertIdeaToTask(ideaId, { klienId, proyekId, tenggat, prioritas }) {
    const idea = state.catatan.find(n => n.id === ideaId);
    if (!idea) return null;

    const newTask = addTask({
      judul: idea.judul,
      klienId: klienId || null,
      proyekId: proyekId || null,
      status: 'Brief',
      prioritas: prioritas || 'Sedang',
      tenggat: tenggat || null,
      labels: [...idea.labels],
      catatan: idea.isi
    });

    deleteNote(ideaId);
    return newTask;
  }

  // F14: Pindahkan Ide ke Proyek / Klien sebagai Catatan resmi
  function convertIdeaToProjectNote(ideaId, { klienId, proyekId }) {
    updateNote(ideaId, {
      klienId,
      proyekId,
      isIde: false
    });
  }

  // --- Template Tugas Berulang (F11) ---
  function applyTemplate(templateId, { proyekId, klienId, tanggalMulai }) {
    const template = state.templates.find(t => t.id === templateId);
    if (!template) return [];

    const baseDate = tanggalMulai ? new Date(tanggalMulai) : new Date();
    const createdTasks = [];

    template.items.forEach(item => {
      const dueDate = new Date(baseDate);
      dueDate.setDate(dueDate.getDate() + (item.offsetHari || 0));
      const tenggatStr = dueDate.toISOString().split('T')[0];

      const t = addTask({
        judul: item.judul,
        klienId: klienId || null,
        proyekId: proyekId || null,
        status: item.status || 'Brief',
        prioritas: item.prioritas || 'Sedang',
        tenggat: tenggatStr,
        labels: [template.nama],
        catatan: `Dibuat dari Template: ${template.nama}`
      });
      createdTasks.push(t);
    });

    return createdTasks;
  }

  function addTemplate({ nama, deskripsi, items }) {
    const newTpl = {
      id: generateId('template'),
      nama: nama.trim(),
      deskripsi: deskripsi || '',
      items: items || []
    };
    state.templates.push(newTpl);
    return newTpl;
  }

  function deleteTemplate(id) {
    state.templates = state.templates.filter(t => t.id !== id);
  }

  // --- Label Management (F6) ---
  function addLabel({ nama, warna }) {
    const existing = state.labels.find(l => l.nama.toLowerCase() === nama.trim().toLowerCase());
    if (existing) return existing;

    const newLabel = {
      id: generateId('label'),
      nama: nama.trim(),
      warna: warna || '#15803D'
    };
    state.labels.push(newLabel);
    return newLabel;
  }

  // --- Cadangan JSON (F9) ---
  function exportBackup() {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'BaroeKerja',
      data: {
        klien: state.klien,
        proyek: state.proyek,
        tugas: state.tugas,
        catatan: state.catatan,
        labels: state.labels,
        templates: state.templates,
        pengaturan: state.pengaturan
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchorElem = document.createElement('a');
    const todayStr = new Date().toISOString().split('T')[0];
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `baroekerja-cadangan-${todayStr}.json`);
    dlAnchorElem.click();

    state.pengaturan.lastBackupDate = new Date().toISOString();
  }

  function importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const data = parsed.data || parsed; // Dukung format cadangan langsung atau pembungkus
      
      if (!data.klien || !data.proyek || !data.tugas || !data.catatan) {
        throw new Error('Format berkas cadangan tidak valid (entitas utama tidak lengkap).');
      }

      // Timpa state
      state.klien = data.klien;
      state.proyek = data.proyek;
      state.tugas = data.tugas;
      state.catatan = data.catatan;
      if (data.labels) state.labels = data.labels;
      if (data.templates) state.templates = data.templates;
      if (data.pengaturan) state.pengaturan = { ...state.pengaturan, ...data.pengaturan };

      state.pengaturan.lastBackupDate = new Date().toISOString();
      return { success: true };
    } catch (err) {
      console.error('Gagal mengimpor cadangan:', err);
      return { success: false, error: err.message };
    }
  }

  function resetToDefault() {
    const fresh = getDefaultAgencyData();
    state.klien = fresh.klien;
    state.proyek = fresh.proyek;
    state.tugas = fresh.tugas;
    state.catatan = fresh.catatan;
    state.labels = fresh.labels;
    state.templates = fresh.templates;
    state.pengaturan = fresh.pengaturan;
  }

  // Efek Perayaan Confetti (Micro-animation saat tugas selesai)
  function triggerConfetti() {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#22C55E', '#15803D', '#4ADE80', '#FCD34D']
      });
    } catch (e) {
      // Abaikan jika env test
    }
  }

  return {
    state,
    currentView,
    selectedClientId,
    selectedProjectId,
    selectedLabel,
    searchQuery,
    showArchived,
    kanbanMode,

    // CRUD
    addClient,
    updateClient,
    deleteClient,
    archiveClient,

    addProject,
    updateProject,
    deleteProject,
    archiveProject,

    addTask,
    updateTask,
    cycleTaskStatus,
    toggleTaskComplete,
    togglePinTask,
    deleteTask,

    addNote,
    updateNote,
    togglePinNote,
    deleteNote,
    convertIdeaToTask,
    convertIdeaToProjectNote,

    applyTemplate,
    addTemplate,
    deleteTemplate,

    addLabel,
    exportBackup,
    importBackup,
    resetToDefault,
    applyTheme,
    triggerConfetti
  };
}
