// =====================================================
// OUR LOVE STORY - APPLICATION LOGIC
// =====================================================

let currentSettings = { ...DEFAULT_SETTINGS };
let currentMemories = [...DEFAULT_MEMORIES];
let currentFilter = 'all';
let audioContext = null;
let isPlayingMusic = false;
let synthTimeoutId = null;
let customAudioBlobUrl = null;
let musicVolume = 0.7;

// DOM Elements
const dom = {
  // Timer & Couple Display
  partnerOneDisplay: document.getElementById('partnerOneDisplay'),
  partnerTwoDisplay: document.getElementById('partnerTwoDisplay'),
  titlePartnerOne: document.getElementById('titlePartnerOne'),
  titlePartnerTwo: document.getElementById('titlePartnerTwo'),
  baselineDateDisplay: document.getElementById('baselineDateDisplay'),
  quoteDisplay: document.getElementById('quoteDisplay'),
  valYears: document.getElementById('valYears'),
  valMonths: document.getElementById('valMonths'),
  valDays: document.getElementById('valDays'),
  valHours: document.getElementById('valHours'),
  valMinutes: document.getElementById('valMinutes'),
  valSeconds: document.getElementById('valSeconds'),
  totalDaysCount: document.getElementById('totalDaysCount'),
  totalHoursCount: document.getElementById('totalHoursCount'),

  // Timeline
  timelineContainer: document.getElementById('timelineContainer'),
  countAll: document.getElementById('countAll'),
  filterBtns: document.querySelectorAll('.filter-btn'),
  openAddMemoryBtn: document.getElementById('openAddMemoryBtn'),

  // Header & Music Elements
  bgMusic: document.getElementById('bgMusic'),
  musicToggleBtn: document.getElementById('musicToggleBtn'),
  musicBanner: document.getElementById('musicBanner'),
  musicPillPlayBtn: document.getElementById('musicPillPlayBtn'),
  vinylDisc: document.getElementById('vinylDisc'),
  songLyrics: document.getElementById('songLyrics'),
  playIcon: document.getElementById('playIcon'),
  playText: document.getElementById('playText'),
  heartBurstBtn: document.getElementById('heartBurstBtn'),
  openAdminBtn: document.getElementById('openAdminBtn'),
  adminFooterBtn: document.getElementById('adminFooterBtn'),

  // Modals
  adminModal: document.getElementById('adminModal'),
  adminCloseBtn: document.getElementById('adminCloseBtn'),
  adminBackdrop: document.getElementById('adminBackdrop'),
  adminMemoriesList: document.getElementById('adminMemoriesList'),
  adminAddNewBtn: document.getElementById('adminAddNewBtn'),
  sheetTabBtns: document.querySelectorAll('.sheet-tab-btn'),
  sheetTabContents: document.querySelectorAll('.sheet-tab-content'),

  // Music Admin Controls
  musicModeStatus: document.getElementById('musicModeStatus'),
  audioFileInput: document.getElementById('audioFileInput'),
  triggerAudioUploadBtn: document.getElementById('triggerAudioUploadBtn'),
  removeCustomAudioBtn: document.getElementById('removeCustomAudioBtn'),
  customAudioUrlInput: document.getElementById('customAudioUrlInput'),
  saveAudioUrlBtn: document.getElementById('saveAudioUrlBtn'),
  musicVolumeSlider: document.getElementById('musicVolumeSlider'),

  // Settings Form
  settingsForm: document.getElementById('settingsForm'),
  partnerOneInput: document.getElementById('partnerOneInput'),
  partnerTwoInput: document.getElementById('partnerTwoInput'),
  togetherDateInput: document.getElementById('togetherDateInput'),
  quoteInput: document.getElementById('quoteInput'),

  // Memory Form Modal
  editMemoryModal: document.getElementById('editMemoryModal'),
  editModalCloseBtn: document.getElementById('editModalCloseBtn'),
  editMemoryBackdrop: document.getElementById('editMemoryBackdrop'),
  editModalHeading: document.getElementById('editModalHeading'),
  memoryForm: document.getElementById('memoryForm'),
  memoryId: document.getElementById('memoryId'),
  memoryTitle: document.getElementById('memoryTitle'),
  memoryCategory: document.getElementById('memoryCategory'),
  memoryDate: document.getElementById('memoryDate'),
  memoryLocation: document.getElementById('memoryLocation'),
  memoryDescription: document.getElementById('memoryDescription'),
  imageFileInput: document.getElementById('imageFileInput'),
  dropzone: document.getElementById('dropzone'),
  dropzonePlaceholder: document.getElementById('dropzonePlaceholder'),
  imagePreview: document.getElementById('imagePreview'),
  previewActions: document.getElementById('previewActions'),
  changePhotoBtn: document.getElementById('changePhotoBtn'),
  removePhotoBtn: document.getElementById('removePhotoBtn'),

  // Lightbox
  lightboxModal: document.getElementById('lightboxModal'),
  lightboxBackdrop: document.getElementById('lightboxBackdrop'),
  lightboxCloseBtn: document.getElementById('lightboxCloseBtn'),
  lightboxImg: document.getElementById('lightboxImg'),
  lightboxTitle: document.getElementById('lightboxTitle'),
  lightboxLocation: document.getElementById('lightboxLocation'),
  lightboxDesc: document.getElementById('lightboxDesc'),
  lightboxBadge: document.getElementById('lightboxBadge'),

  // Backup & Import
  exportJsonBtn: document.getElementById('exportJsonBtn'),
  copyJsonBtn: document.getElementById('copyJsonBtn'),
  importJsonFileInput: document.getElementById('importJsonFileInput'),
  triggerImportBtn: document.getElementById('triggerImportBtn'),
  resetDefaultsBtn: document.getElementById('resetDefaultsBtn'),

  // Toast
  toast: document.getElementById('toast'),
  heartCanvas: document.getElementById('heartCanvas')
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  await initSavedAudio();
  setupCountdown();
  renderTimeline();
  setupCanvasParticles();
  setupEventListeners();
  renderAdminMemoriesList();
  populateSettingsForm();
  setupAutoplay();
});

// Load settings and memories from IndexedDB
async function loadData() {
  try {
    const savedSettings = await db.getSetting('coupleSettings');
    if (savedSettings) {
      currentSettings = { ...DEFAULT_SETTINGS, ...savedSettings };
    }

    const savedMemories = await db.getAllMemories();
    if (savedMemories && savedMemories.length > 0) {
      currentMemories = savedMemories.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      // Seed default memories into IndexedDB
      for (const mem of DEFAULT_MEMORIES) {
        await db.saveMemory(mem);
      }
      currentMemories = [...DEFAULT_MEMORIES];
    }
  } catch (err) {
    console.error('Error loading data from DB:', err);
    currentSettings = { ...DEFAULT_SETTINGS };
    currentMemories = [...DEFAULT_MEMORIES];
  }

  updateCoupleDisplays();
}

// Update couple titles & names across the UI
function updateCoupleDisplays() {
  const p1 = currentSettings.partnerOne || 'David';
  const p2 = currentSettings.partnerTwo || 'My Love';

  dom.partnerOneDisplay.textContent = p1;
  dom.partnerTwoDisplay.textContent = p2;
  dom.titlePartnerOne.textContent = p1;
  dom.titlePartnerTwo.textContent = p2;

  if (dom.quoteDisplay) {
    dom.quoteDisplay.textContent = currentSettings.loveQuote || DEFAULT_SETTINGS.loveQuote;
  }

  // Format baseline date display nicely
  const dt = new Date(currentSettings.togetherDate);
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  dom.baselineDateDisplay.textContent = isNaN(dt.getTime())
    ? "April 27, 2024 at 11:34 PM"
    : dt.toLocaleDateString('en-US', options);
}

// =====================================================
// COUNTDOWN CALCULATION ENGINE
// =====================================================
function calculateAccurateDifference(startDateStr) {
  const start = new Date(startDateStr);
  const end = new Date();

  if (isNaN(start.getTime()) || end < start) {
    return {
      years: 0, months: 0, days: 0,
      hours: 0, minutes: 0, seconds: 0,
      totalDays: 0, totalHours: 0
    };
  }

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  let hours = end.getHours() - start.getHours();
  let minutes = end.getMinutes() - start.getMinutes();
  let seconds = end.getSeconds() - start.getSeconds();

  if (seconds < 0) {
    seconds += 60;
    minutes--;
  }
  if (minutes < 0) {
    minutes += 60;
    hours--;
  }
  if (hours < 0) {
    hours += 24;
    days--;
  }
  if (days < 0) {
    // Days in previous month
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
    months--;
  }
  if (months < 0) {
    months += 12;
    years--;
  }

  const diffMs = end.getTime() - start.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  return {
    years,
    months,
    days,
    hours: hours < 10 ? '0' + hours : hours,
    minutes: minutes < 10 ? '0' + minutes : minutes,
    seconds: seconds < 10 ? '0' + seconds : seconds,
    totalDays: totalDays.toLocaleString(),
    totalHours: totalHours.toLocaleString()
  };
}

function updateCountdownDOM() {
  const diff = calculateAccurateDifference(currentSettings.togetherDate || DEFAULT_SETTINGS.togetherDate);

  dom.valYears.textContent = diff.years;
  dom.valMonths.textContent = diff.months;
  dom.valDays.textContent = diff.days;
  dom.valHours.textContent = diff.hours;
  dom.valMinutes.textContent = diff.minutes;
  dom.valSeconds.textContent = diff.seconds;

  dom.totalDaysCount.textContent = diff.totalDays;
  dom.totalHoursCount.textContent = diff.totalHours;
}

function setupCountdown() {
  updateCountdownDOM();
  setInterval(updateCountdownDOM, 1000);
}

// =====================================================
// TIMELINE MEMORIES RENDERER
// =====================================================
function renderTimeline() {
  dom.timelineContainer.innerHTML = '';

  const filtered = currentMemories.filter(m => {
    if (currentFilter === 'all') return true;
    return (m.category || '').toLowerCase().includes(currentFilter.toLowerCase());
  });

  dom.countAll.textContent = currentMemories.length;

  if (filtered.length === 0) {
    dom.timelineContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #9c7a82;">
        <span style="font-size: 2rem;">🌸</span>
        <p style="margin-top: 10px; font-weight: 600;">No memories in this category yet.</p>
      </div>
    `;
    return;
  }

  filtered.forEach((memory, idx) => {
    const item = document.createElement('div');
    item.className = 'memory-item';

    const hasPhoto = memory.image && memory.image.trim() !== '';

    // Choose cute category emoji
    const catIcon = memory.categoryIcon || (memory.category === 'Trip' ? '✈️' : '🍽️');
    const orderNum = idx + 1;

    item.innerHTML = `
      <div class="timeline-node">❤️</div>
      <div class="memory-card" data-id="${memory.id}">
        <div class="card-top-row">
          <span class="category-badge">${catIcon} ${escapeHtml(memory.category || 'Memory')}</span>
          <span class="memory-order-badge">#${orderNum}</span>
        </div>

        <!-- Polaroid Photo / Placeholder Area -->
        <div class="polaroid-frame" data-action="${hasPhoto ? 'zoom' : 'upload'}" data-id="${memory.id}">
          <div class="polaroid-img-wrapper">
            ${
              hasPhoto
                ? `<img class="polaroid-img" src="${memory.image}" alt="${escapeHtml(memory.title)}" loading="lazy">`
                : `
                <div class="photo-placeholder">
                  <span class="placeholder-icon">📸</span>
                  <span class="placeholder-title">Add Our Photo</span>
                  <span class="placeholder-sub">Tap here to insert your sweet photo 💕</span>
                </div>
                `
            }
          </div>
        </div>

        <div class="card-body">
          <div class="memory-date-loc">
            <span>🗓️ ${escapeHtml(memory.displayDate || memory.date || '')}</span>
            ${
              memory.location
                ? `<span>•</span> <a class="loc-pill" href="${memory.locationUrl || `https://maps.google.com/?q=${encodeURIComponent(memory.location)}`}" target="_blank" rel="noopener">📍 ${escapeHtml(memory.location)}</a>`
                : ''
            }
          </div>

          <h3 class="memory-title">${escapeHtml(memory.title)}</h3>
          <p class="memory-description">${escapeHtml(memory.description || '')}</p>

          <div class="card-action-bar">
            <button class="heart-react-btn" data-id="${memory.id}" title="Send Heart">
              <span>💖</span> <span class="react-count">${memory.likes || 1}</span>
            </button>
            <button class="edit-single-btn" data-id="${memory.id}" title="Edit Memory or Photo">
              <span>✏️ Edit / Photo</span>
            </button>
          </div>
        </div>
      </div>
    `;

    dom.timelineContainer.appendChild(item);
  });

  attachCardEvents();
}

function attachCardEvents() {
  // Polaroid Click
  document.querySelectorAll('.polaroid-frame').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id');
      const action = el.getAttribute('data-action');
      const mem = currentMemories.find(m => m.id === id);
      if (!mem) return;

      if (action === 'zoom' && mem.image) {
        openLightbox(mem);
      } else {
        openEditModal(mem);
      }
    });
  });

  // Heart React Button
  document.querySelectorAll('.heart-react-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const mem = currentMemories.find(m => m.id === id);
      if (!mem) return;

      mem.likes = (mem.likes || 1) + 1;
      btn.querySelector('.react-count').textContent = mem.likes;
      await db.saveMemory(mem);

      // Create burst at button
      const rect = btn.getBoundingClientRect();
      createHeartBurst(rect.left + rect.width / 2, rect.top);
      showToast('Sent love to this memory! 💕');
    });
  });

  // Edit Single Button
  document.querySelectorAll('.edit-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const mem = currentMemories.find(m => m.id === id);
      if (mem) openEditModal(mem);
    });
  });
}

// =====================================================
// LIGHTBOX FULL VIEW
// =====================================================
function openLightbox(memory) {
  dom.lightboxImg.src = memory.image;
  dom.lightboxTitle.textContent = memory.title;
  dom.lightboxBadge.textContent = memory.category || 'Memory';
  dom.lightboxLocation.textContent = memory.location ? `📍 ${memory.location}` : '';
  dom.lightboxDesc.textContent = memory.description || '';
  dom.lightboxModal.classList.add('active');
  dom.lightboxModal.setAttribute('aria-hidden', 'false');
}

function closeLightbox() {
  dom.lightboxModal.classList.remove('active');
  dom.lightboxModal.setAttribute('aria-hidden', 'true');
}

// =====================================================
// ADMIN CONSOLE & MEMORY MANAGEMENT
// =====================================================
function openAdminModal() {
  renderAdminMemoriesList();
  populateSettingsForm();
  dom.adminModal.classList.add('active');
  dom.adminModal.setAttribute('aria-hidden', 'false');
}

function closeAdminModal() {
  dom.adminModal.classList.remove('active');
  dom.adminModal.setAttribute('aria-hidden', 'true');
}

function renderAdminMemoriesList() {
  dom.adminMemoriesList.innerHTML = '';

  currentMemories.forEach(mem => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';

    const thumb = mem.image
      ? `<img src="${mem.image}" alt="${escapeHtml(mem.title)}">`
      : `<span>📸</span>`;

    card.innerHTML = `
      <div class="admin-item-thumb">${thumb}</div>
      <div class="admin-item-info">
        <h4 class="admin-item-title">${escapeHtml(mem.title)}</h4>
        <span class="admin-item-date">${escapeHtml(mem.displayDate || mem.date || '')} • ${escapeHtml(mem.location || '')}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn secondary-btn small-btn admin-edit-btn" data-id="${mem.id}">Edit</button>
        <button class="btn danger-btn small-btn admin-delete-btn" data-id="${mem.id}">Delete</button>
      </div>
    `;

    dom.adminMemoriesList.appendChild(card);
  });

  // Attach actions
  dom.adminMemoriesList.querySelectorAll('.admin-edit-btn').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const mem = currentMemories.find(m => m.id === id);
      if (mem) {
        closeAdminModal();
        openEditModal(mem);
      }
    });
  });

  dom.adminMemoriesList.querySelectorAll('.admin-delete-btn').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this memory?')) {
        await deleteMemoryById(id);
      }
    });
  });
}

function populateSettingsForm() {
  dom.partnerOneInput.value = currentSettings.partnerOne || 'David';
  dom.partnerTwoInput.value = currentSettings.partnerTwo || 'My Love';

  // Format date for datetime-local (YYYY-MM-DDTHH:mm)
  let dateVal = currentSettings.togetherDate || DEFAULT_SETTINGS.togetherDate;
  if (dateVal.length > 16) {
    dateVal = dateVal.substring(0, 16);
  }
  dom.togetherDateInput.value = dateVal;
  dom.quoteInput.value = currentSettings.loveQuote || DEFAULT_SETTINGS.loveQuote;
}

// =====================================================
// ADD / EDIT MEMORY MODAL & IMAGE UPLOADER
// =====================================================
let currentUploadedImageBase64 = '';

function openEditModal(memory = null) {
  if (memory) {
    dom.editModalHeading.textContent = 'Edit Memory 💕';
    dom.memoryId.value = memory.id;
    dom.memoryTitle.value = memory.title;
    dom.memoryCategory.value = memory.category || 'Date';
    dom.memoryDate.value = memory.date || '';
    dom.memoryLocation.value = memory.location || '';
    dom.memoryDescription.value = memory.description || '';

    if (memory.image) {
      currentUploadedImageBase64 = memory.image;
      showImagePreview(memory.image);
    } else {
      currentUploadedImageBase64 = '';
      resetImagePreview();
    }
  } else {
    dom.editModalHeading.textContent = 'Add New Memory 💕';
    dom.memoryForm.reset();
    dom.memoryId.value = '';
    currentUploadedImageBase64 = '';
    resetImagePreview();
  }

  dom.editMemoryModal.classList.add('active');
  dom.editMemoryModal.setAttribute('aria-hidden', 'false');
}

function closeEditModal() {
  dom.editMemoryModal.classList.remove('active');
  dom.editMemoryModal.setAttribute('aria-hidden', 'true');
}

function showImagePreview(src) {
  dom.imagePreview.src = src;
  dom.imagePreview.classList.remove('hidden');
  dom.dropzonePlaceholder.classList.add('hidden');
  dom.previewActions.classList.remove('hidden');
}

function resetImagePreview() {
  dom.imagePreview.src = '';
  dom.imagePreview.classList.add('hidden');
  dom.dropzonePlaceholder.classList.remove('hidden');
  dom.previewActions.classList.add('hidden');
  dom.imageFileInput.value = '';
}

// Compress and read image file
function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Compress with max dimension 1400px
      const canvas = document.createElement('canvas');
      const maxDim = 1400;
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      currentUploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.86);
      showImagePreview(currentUploadedImageBase64);
      showToast('Photo uploaded & optimized! 📸');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Delete memory
async function deleteMemoryById(id) {
  try {
    await db.deleteMemory(id);
    currentMemories = currentMemories.filter(m => m.id !== id);
    renderTimeline();
    renderAdminMemoriesList();
    showToast('Memory removed.');
  } catch (err) {
    console.error(err);
    showToast('Failed to delete memory');
  }
}

// =====================================================
// EVENT LISTENERS
// =====================================================
function setupEventListeners() {
  // Filter buttons
  dom.filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      renderTimeline();
    });
  });

  // Admin Modal Triggers
  dom.openAdminBtn.addEventListener('click', openAdminModal);
  dom.adminFooterBtn.addEventListener('click', openAdminModal);
  dom.adminCloseBtn.addEventListener('click', closeAdminModal);
  dom.adminBackdrop.addEventListener('click', closeAdminModal);

  // Add Memory Modal Triggers
  dom.openAddMemoryBtn.addEventListener('click', () => openEditModal());
  dom.adminAddNewBtn.addEventListener('click', () => {
    closeAdminModal();
    openEditModal();
  });
  dom.editModalCloseBtn.addEventListener('click', closeEditModal);
  dom.editMemoryBackdrop.addEventListener('click', closeEditModal);

  // Lightbox Close
  dom.lightboxCloseBtn.addEventListener('click', closeLightbox);
  dom.lightboxBackdrop.addEventListener('click', closeLightbox);

  // Tabs inside Admin Modal
  dom.sheetTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.sheetTabBtns.forEach(b => b.classList.remove('active'));
      dom.sheetTabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      const content = document.getElementById(tabId);
      if (content) content.classList.add('active');
    });
  });

  // Image Upload Dropzone
  dom.dropzone.addEventListener('click', () => dom.imageFileInput.click());
  dom.imageFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  });
  dom.changePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dom.imageFileInput.click();
  });
  dom.removePhotoBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    currentUploadedImageBase64 = '';
    resetImagePreview();
  });

  // Save Memory Form
  dom.memoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = dom.memoryId.value || 'mem-' + Date.now();
    const isNew = !dom.memoryId.value;

    const existingMem = currentMemories.find(m => m.id === id) || {};

    const updatedMemory = {
      ...existingMem,
      id,
      title: dom.memoryTitle.value.trim(),
      category: dom.memoryCategory.value,
      categoryIcon: getCategoryIcon(dom.memoryCategory.value),
      date: dom.memoryDate.value,
      displayDate: dom.memoryDate.value ? formatCustomDate(dom.memoryDate.value) : 'Special Day',
      location: dom.memoryLocation.value.trim(),
      description: dom.memoryDescription.value.trim(),
      image: currentUploadedImageBase64 || existingMem.image || '',
      likes: existingMem.likes || 1,
      order: existingMem.order || (currentMemories.length + 1)
    };

    try {
      await db.saveMemory(updatedMemory);

      if (isNew) {
        currentMemories.push(updatedMemory);
      } else {
        const idx = currentMemories.findIndex(m => m.id === id);
        if (idx !== -1) currentMemories[idx] = updatedMemory;
      }

      closeEditModal();
      renderTimeline();
      renderAdminMemoriesList();
      showToast(isNew ? 'New memory added! 💕' : 'Memory updated! ✨');
    } catch (err) {
      console.error('Error saving memory:', err);
      showToast('Error saving memory');
    }
  });

  // Save Couple Settings
  dom.settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    currentSettings.partnerOne = dom.partnerOneInput.value.trim();
    currentSettings.partnerTwo = dom.partnerTwoInput.value.trim();
    currentSettings.togetherDate = dom.togetherDateInput.value;
    currentSettings.loveQuote = dom.quoteInput.value.trim();

    try {
      await db.saveSetting('coupleSettings', currentSettings);
      updateCoupleDisplays();
      updateCountdownDOM();
      closeAdminModal();
      showToast('Settings saved successfully! 💕');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Error saving settings');
    }
  });

  // Export JSON
  dom.exportJsonBtn.addEventListener('click', () => {
    const exportData = {
      settings: currentSettings,
      memories: currentMemories
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `our-love-story-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Memories exported as JSON! 📥');
  });

  // Copy JSON to clipboard
  dom.copyJsonBtn.addEventListener('click', () => {
    const exportData = {
      settings: currentSettings,
      memories: currentMemories
    };
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => showToast('JSON copied to clipboard! 📋'))
      .catch(() => showToast('Failed to copy to clipboard'));
  });

  // Import JSON
  dom.triggerImportBtn.addEventListener('click', () => dom.importJsonFileInput.click());
  dom.importJsonFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.settings) {
          currentSettings = parsed.settings;
          await db.saveSetting('coupleSettings', currentSettings);
        }
        if (parsed.memories && Array.isArray(parsed.memories)) {
          for (const mem of parsed.memories) {
            await db.saveMemory(mem);
          }
          currentMemories = parsed.memories;
        }
        updateCoupleDisplays();
        updateCountdownDOM();
        renderTimeline();
        renderAdminMemoriesList();
        populateSettingsForm();
        showToast('Memories successfully imported! 💕');
      } catch (err) {
        console.error(err);
        showToast('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  });

  // Reset to Defaults
  dom.resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all memories and settings to default?')) {
      await db.clearAll();
      currentSettings = { ...DEFAULT_SETTINGS };
      currentMemories = [...DEFAULT_MEMORIES];
      for (const mem of DEFAULT_MEMORIES) {
        await db.saveMemory(mem);
      }
      await db.saveSetting('coupleSettings', currentSettings);
      updateCoupleDisplays();
      updateCountdownDOM();
      renderTimeline();
      renderAdminMemoriesList();
      populateSettingsForm();
      closeAdminModal();
      showToast('All memories reset to default 🌸');
    }
  });

  // Heart Burst Button
  dom.heartBurstBtn.addEventListener('click', (e) => {
    const rect = dom.heartBurstBtn.getBoundingClientRect();
    createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  // Tap anywhere for sweet mini heart pop
  document.body.addEventListener('click', (e) => {
    // Only if not clicking a button/input
    if (!e.target.closest('button, input, select, textarea, a, .modal')) {
      createSingleHeart(e.clientX, e.clientY);
    }
  });

  // Music Player Toggles
  dom.musicToggleBtn.addEventListener('click', toggleMusic);
  dom.musicPillPlayBtn.addEventListener('click', toggleMusic);

  // Audio Upload & Settings
  dom.triggerAudioUploadBtn.addEventListener('click', () => dom.audioFileInput.click());
  dom.audioFileInput.addEventListener('change', handleCustomAudioUpload);
  dom.removeCustomAudioBtn.addEventListener('click', resetCustomAudio);

  dom.saveAudioUrlBtn.addEventListener('click', () => {
    const url = dom.customAudioUrlInput.value.trim();
    if (url) {
      setAudioSource(url);
      db.saveSetting('customAudioUrl', url);
      showToast('Custom audio URL saved! 🎵');
    }
  });

  dom.musicVolumeSlider.addEventListener('input', (e) => {
    musicVolume = parseFloat(e.target.value);
    if (dom.bgMusic) dom.bgMusic.volume = musicVolume;
  });
}

// =====================================================
// CANVAS PARTICLES & HEARTS
// =====================================================
function setupCanvasParticles() {
  const canvas = dom.heartCanvas;
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ['#ff85a1', '#ffa5b9', '#ffccd5', '#f8a5c2', '#f5cd79'];

  class FloatingParticle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = height + Math.random() * 50;
      this.size = Math.random() * 12 + 8;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.alpha = Math.random() * 0.4 + 0.2;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotSpeed;
      if (this.y < -30) this.reset();
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      // Draw heart path
      const s = this.size / 15;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-10 * s, -10 * s, -20 * s, 5 * s, 0, 20 * s);
      ctx.bezierCurveTo(20 * s, 5 * s, 10 * s, -10 * s, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create 18 gentle particles
  for (let i = 0; i < 18; i++) {
    const p = new FloatingParticle();
    p.y = Math.random() * height; // initial spread
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// Click Heart Pops
function createSingleHeart(x, y) {
  const el = document.createElement('div');
  const icons = ['💕', '💖', '✨', '💗', '🌸'];
  el.textContent = icons[Math.floor(Math.random() * icons.length)];
  el.style.position = 'fixed';
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.fontSize = `${Math.random() * 12 + 18}px`;
  el.style.pointerEvents = 'none';
  el.style.zIndex = '9999';
  el.style.transform = 'translate(-50%, -50%) scale(0.5)';
  el.style.transition = 'all 0.8s cubic-bezier(0.1, 0.8, 0.3, 1)';
  document.body.appendChild(el);

  requestAnimationFrame(() => {
    el.style.transform = `translate(${ (Math.random() - 0.5) * 40 }px, -70px) scale(1.3)`;
    el.style.opacity = '0';
  });

  setTimeout(() => el.remove(), 850);
}

function createHeartBurst(x, y) {
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      createSingleHeart(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40);
    }, i * 35);
  }
}

// =====================================================
// TAYLOR SWIFT - LOVE STORY MUSIC & SYNTHESIZER ENGINE
// "Romeo, take me somewhere we can be alone..."
// =====================================================

// Note frequencies (Key of D)
const N = {
  D3: 146.83, E3: 164.81, FS3: 185.00, G3: 196.00, A3: 220.00, B3: 246.94,
  D4: 293.66, E4: 329.63, FS4: 369.99, G4: 392.00, A4: 440.00, B4: 493.88,
  CS5: 554.37, D5: 587.33, E5: 659.25, FS5: 739.99
};

// Chorus melody notes & lyrics
const LOVE_STORY_CHORUS = [
  // "Ro-me-o, take me some-where we can be a-lone"
  { note: N.FS4, dur: 280, bass: N.D3, lyric: "“Romeo, take me somewhere we can be alone...” 💕" },
  { note: N.A4,  dur: 280 },
  { note: N.FS4, dur: 440 },
  { note: N.FS4, dur: 260 },
  { note: N.FS4, dur: 260 },
  { note: N.FS4, dur: 260 },
  { note: N.FS4, dur: 260 },
  { note: N.E4,  dur: 260 },
  { note: N.E4,  dur: 260 },
  { note: N.D4,  dur: 260 },
  { note: N.E4,  dur: 300 },
  { note: N.FS4, dur: 700 },
  { note: null,  dur: 240 },

  // "I'll be wait-ing, all there's left to do is run"
  { note: N.FS4, dur: 260, bass: N.A3, lyric: "“I'll be waiting, all there's left to do is run...” ✨" },
  { note: N.FS4, dur: 260 },
  { note: N.G4,  dur: 320 },
  { note: N.FS4, dur: 320 },
  { note: N.E4,  dur: 260 },
  { note: N.D4,  dur: 260 },
  { note: N.D4,  dur: 260 },
  { note: N.D4,  dur: 260 },
  { note: N.E4,  dur: 300 },
  { note: N.FS4, dur: 300 },
  { note: N.E4,  dur: 750 },
  { note: null,  dur: 240 },

  // "You'll be the prince and I'll be the prin-cess"
  { note: N.FS4, dur: 240, bass: N.B3, lyric: "“You'll be the prince and I'll be the princess...” 👑" },
  { note: N.FS4, dur: 240 },
  { note: N.FS4, dur: 200 },
  { note: N.A4,  dur: 400 },
  { note: N.FS4, dur: 200 },
  { note: N.FS4, dur: 240 },
  { note: N.FS4, dur: 240 },
  { note: N.FS4, dur: 200 },
  { note: N.A4,  dur: 400 },
  { note: N.FS4, dur: 600 },
  { note: null,  dur: 240 },

  // "It's a love sto-ry, ba-by, just say, 'Yes'"
  { note: N.FS4, dur: 240, bass: N.G3, lyric: "“It's a love story, baby, just say 'Yes'...” 💖" },
  { note: N.G4,  dur: 240 },
  { note: N.A4,  dur: 350 },
  { note: N.FS4, dur: 350 },
  { note: N.E4,  dur: 280 },
  { note: N.D4,  dur: 280 },
  { note: N.E4,  dur: 320 },
  { note: N.FS4, dur: 300 },
  { note: N.E4,  dur: 400 },
  { note: N.D4,  dur: 1100, bass: N.D3 },
  { note: null,  dur: 800 } // loop pause
];

// Toggle music on/off
async function toggleMusic() {
  if (isPlayingMusic) {
    stopMusic();
  } else {
    await startMusic();
  }
}

async function startMusic(isAuto = false) {
  if (isPlayingMusic) return;
  isPlayingMusic = true;
  updateMusicUI(true);

  // Check if we have audio file loaded (Blob or Source)
  if (dom.bgMusic && dom.bgMusic.src && dom.bgMusic.src.trim() !== '') {
    dom.bgMusic.volume = musicVolume;
    try {
      await dom.bgMusic.play();
      if (!isAuto) showToast('Playing Taylor Swift - Love Story 🎵');
      return;
    } catch (err) {
      console.warn('Audio play failed, falling back to music box synth:', err);
    }
  }

  // Fallback / Default: Sweet synthesized music box version of Love Story!
  startSynthChorus();
  if (!isAuto) showToast('Playing Love Story - Music Box Edition 🎶');
}

function stopMusic() {
  isPlayingMusic = false;
  updateMusicUI(false);

  if (dom.bgMusic) {
    dom.bgMusic.pause();
  }
  if (synthTimeoutId) {
    clearTimeout(synthTimeoutId);
    synthTimeoutId = null;
  }
  dom.songLyrics.textContent = "“Romeo, take me somewhere we can be alone...” 💕";
  showToast('Music paused 🎵');
}

function updateMusicUI(playing) {
  if (playing) {
    dom.musicToggleBtn.classList.add('playing');
    dom.vinylDisc.classList.add('spinning');
    dom.musicPillPlayBtn.classList.add('playing');
    dom.playIcon.textContent = "⏸";
    dom.playText.textContent = "Pause";
  } else {
    dom.musicToggleBtn.classList.remove('playing');
    dom.vinylDisc.classList.remove('spinning');
    dom.musicPillPlayBtn.classList.remove('playing');
    dom.playIcon.textContent = "▶";
    dom.playText.textContent = "Play";
  }
}

// Synthesize Love Story chorus with rich music-box sound
let synthNoteIdx = 0;
function startSynthChorus() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();

    synthNoteIdx = 0;
    playNextSynthNote();
  } catch (e) {
    console.error('Web Audio error:', e);
  }
}

function playNextSynthNote() {
  if (!isPlayingMusic) return;

  const item = LOVE_STORY_CHORUS[synthNoteIdx % LOVE_STORY_CHORUS.length];
  synthNoteIdx++;

  if (item.lyric) {
    dom.songLyrics.textContent = item.lyric;
  }

  // Play bass root chord note if defined
  if (item.bass) {
    playBellTone(item.bass, 0.9, 0.05 * musicVolume, 'triangle');
  }

  // Play lead melody bell note
  if (item.note) {
    playBellTone(item.note, 0.6, 0.1 * musicVolume, 'sine');
    // Soft octave sparkle overtone
    playBellTone(item.note * 2, 0.35, 0.03 * musicVolume, 'sine');
  }

  synthTimeoutId = setTimeout(playNextSynthNote, item.dur || 300);
}

// Bell / Music-box tone generator
function playBellTone(freq, duration = 0.5, volume = 0.08, type = 'sine') {
  if (!audioContext) return;
  const now = audioContext.currentTime;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  // Music box sharp attack and smooth exponential decay
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

// Handle MP3 upload from device
async function handleCustomAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (evt) => {
    const arrayBuffer = evt.target.result;
    const blob = new Blob([arrayBuffer], { type: file.type || 'audio/mpeg' });
    
    // Save to IndexedDB
    await db.saveMedia('custom_bg_audio', blob);
    setAudioBlob(blob);
    dom.removeCustomAudioBtn.classList.remove('hidden');
    dom.musicModeStatus.innerHTML = `<span>🎵 Custom Audio: <strong>${escapeHtml(file.name)}</strong></span>`;
    showToast('Taylor Swift MP3 saved successfully! 💕');
  };
  reader.readAsArrayBuffer(file);
}

function setAudioBlob(blob) {
  if (customAudioBlobUrl) URL.revokeObjectURL(customAudioBlobUrl);
  customAudioBlobUrl = URL.createObjectURL(blob);
  setAudioSource(customAudioBlobUrl);
}

function setAudioSource(src) {
  if (!dom.bgMusic) return;
  dom.bgMusic.src = src;
  dom.bgMusic.load();
}

async function resetCustomAudio() {
  await db.saveMedia('custom_bg_audio', null);
  await db.saveSetting('customAudioUrl', null);
  if (customAudioBlobUrl) {
    URL.revokeObjectURL(customAudioBlobUrl);
    customAudioBlobUrl = null;
  }
  dom.bgMusic.src = 'assets/love-story.mp3';
  dom.removeCustomAudioBtn.classList.add('hidden');
  dom.musicModeStatus.innerHTML = `<span>✨ Built-in Love Story Chorus (Music Box Synth)</span>`;
  showToast('Reset to built-in Love Story music box 🎶');
}

// Load saved custom audio on startup
async function initSavedAudio() {
  try {
    const savedBlob = await db.getMedia('custom_bg_audio');
    if (savedBlob && savedBlob.size > 0) {
      setAudioBlob(savedBlob);
      dom.removeCustomAudioBtn.classList.remove('hidden');
      dom.musicModeStatus.innerHTML = `<span>🎵 Custom Audio Loaded</span>`;
      return;
    }

    const savedUrl = await db.getSetting('customAudioUrl');
    if (savedUrl) {
      setAudioSource(savedUrl);
      dom.customAudioUrlInput.value = savedUrl;
      dom.removeCustomAudioBtn.classList.remove('hidden');
      dom.musicModeStatus.innerHTML = `<span>🎵 Audio URL: ${escapeHtml(savedUrl)}</span>`;
    }
  } catch (err) {
    console.error('Audio init error:', err);
  }
}

// Autoplay setup with cross-browser and mobile gesture fallback
function setupAutoplay() {
  const tryAutoplay = async () => {
    if (isPlayingMusic) return;
    try {
      await startMusic(true);
      removeAutoplayListeners();
    } catch (e) {
      // Autoplay blocked by browser policy without gesture; waiting for first interaction
    }
  };

  const onUserInteraction = async () => {
    if (!isPlayingMusic) {
      await startMusic(true);
    }
    removeAutoplayListeners();
  };

  function removeAutoplayListeners() {
    window.removeEventListener('click', onUserInteraction);
    window.removeEventListener('touchstart', onUserInteraction);
    window.removeEventListener('scroll', onUserInteraction);
    window.removeEventListener('keydown', onUserInteraction);
  }

  // Attempt immediate autoplay on load
  tryAutoplay();

  // Attach immediate fallback triggers on the very first touch/click/scroll
  window.addEventListener('click', onUserInteraction, { once: true, passive: true });
  window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
  window.addEventListener('scroll', onUserInteraction, { once: true, passive: true });
  window.addEventListener('keydown', onUserInteraction, { once: true, passive: true });
}

// =====================================================
// UTILITIES
// =====================================================
function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 2400);
}

function getCategoryIcon(cat) {
  switch (cat) {
    case 'Trip': return '✈️';
    case 'Date': return '🍽️';
    case 'First Date': return '💖';
    case 'Milestone': return '🎉';
    default: return '✨';
  }
}

function formatCustomDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
