// =====================================================
// OUR LOVE STORY - APPLICATION LOGIC
// =====================================================
import { authService, firestoreDb, storageService, isAllowedEmail, ALLOWED_EMAILS } from './firebase-config.js';

let currentSettings = { ...DEFAULT_SETTINGS };
let currentMemories = [...DEFAULT_MEMORIES];
let currentFilter = 'all';

// Daily Markdown State
let currentDailyMarkdowns = typeof DEFAULT_DAILY_MARKDOWNS !== 'undefined' ? [...DEFAULT_DAILY_MARKDOWNS] : [];
let currentDailyFilter = 'all';
let currentDailyView = 'calendar'; // 'calendar' | 'list'
const todayInit = new Date();
let selectedDateStr = `${todayInit.getFullYear()}-${String(todayInit.getMonth() + 1).padStart(2, '0')}-${String(todayInit.getDate()).padStart(2, '0')}`;
let calCurrentYear = todayInit.getFullYear();
let calCurrentMonth = todayInit.getMonth();
let currentDailyImageBase64 = '';

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

  // Auth Elements
  authGateModal: document.getElementById('authGateModal'),
  authForm: document.getElementById('authForm'),
  authEmailInput: document.getElementById('authEmailInput'),
  authPasswordInput: document.getElementById('authPasswordInput'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authSubmitBtnText: document.getElementById('authSubmitBtnText'),
  authAlertBox: document.getElementById('authAlertBox'),
  toggleAuthModeBtn: document.getElementById('toggleAuthModeBtn'),
  currentUserEmail: document.getElementById('currentUserEmail'),
  logoutBtn: document.getElementById('logoutBtn'),

  // Toast
  toast: document.getElementById('toast'),
  heartCanvas: document.getElementById('heartCanvas'),

  // Submodule Switcher & Header Button
  openDailyHeaderBtn: document.getElementById('openDailyHeaderBtn'),
  tabDailyMarkdown: document.getElementById('tabDailyMarkdown'),
  tabMemories: document.getElementById('tabMemories'),
  dailyMarkdownBadge: document.getElementById('dailyMarkdownBadge'),
  memoriesBadge: document.getElementById('memoriesBadge'),
  dailyMarkdownSection: document.getElementById('dailyMarkdownSection'),
  memoriesSection: document.getElementById('memoriesSection'),

  // Daily Markdown Section & Stats
  dailyStatsBar: document.getElementById('dailyStatsBar'),
  statDaysCount: document.getElementById('statDaysCount'),
  statSportsCount: document.getElementById('statSportsCount'),
  statPhotosCount: document.getElementById('statPhotosCount'),
  dailyFilterTabs: document.getElementById('dailyFilterTabs'),
  viewCalendarBtn: document.getElementById('viewCalendarBtn'),
  viewListBtn: document.getElementById('viewListBtn'),
  calendarWrapper: document.getElementById('calendarWrapper'),
  dailyListWrapper: document.getElementById('dailyListWrapper'),

  // Calendar Controls & Grid
  calPrevMonthBtn: document.getElementById('calPrevMonthBtn'),
  calNextMonthBtn: document.getElementById('calNextMonthBtn'),
  calTodayBtn: document.getElementById('calTodayBtn'),
  calMonthYearText: document.getElementById('calMonthYearText'),
  calendarDaysGrid: document.getElementById('calendarDaysGrid'),

  // Selected Day Panel
  selectedDayCard: document.getElementById('selectedDayCard'),
  selectedDateHeading: document.getElementById('selectedDateHeading'),
  selectedDateRel: document.getElementById('selectedDateRel'),
  openAddDailyBtn: document.getElementById('openAddDailyBtn'),
  selectedDayEntries: document.getElementById('selectedDayEntries'),
  dailyAllEntriesList: document.getElementById('dailyAllEntriesList'),
  openAddDailyListBtn: document.getElementById('openAddDailyListBtn'),

  // Daily Markdown Modal
  dailyMarkdownModal: document.getElementById('dailyMarkdownModal'),
  dailyMarkdownBackdrop: document.getElementById('dailyMarkdownBackdrop'),
  dailyModalCloseBtn: document.getElementById('dailyModalCloseBtn'),
  dailyModalHeading: document.getElementById('dailyModalHeading'),
  dailyMarkdownForm: document.getElementById('dailyMarkdownForm'),
  dailyEntryId: document.getElementById('dailyEntryId'),
  dailyEntryDate: document.getElementById('dailyEntryDate'),
  dailyCategoryChips: document.getElementById('dailyCategoryChips'),
  dailyCategoryInput: document.getElementById('dailyCategoryInput'),
  dailyCategoryIconInput: document.getElementById('dailyCategoryIconInput'),
  dailyActivityInput: document.getElementById('dailyActivityInput'),
  dailyActivityLabel: document.getElementById('dailyActivityLabel'),
  dailySuggestRow: document.getElementById('dailySuggestRow'),
  dailyContentInput: document.getElementById('dailyContentInput'),
  dailyDropzone: document.getElementById('dailyDropzone'),
  dailyDropzonePlaceholder: document.getElementById('dailyDropzonePlaceholder'),
  dailyImageFileInput: document.getElementById('dailyImageFileInput'),
  dailyImagePreview: document.getElementById('dailyImagePreview'),
  dailyPreviewActions: document.getElementById('dailyPreviewActions'),
  changeDailyPhotoBtn: document.getElementById('changeDailyPhotoBtn'),
  removeDailyPhotoBtn: document.getElementById('removeDailyPhotoBtn'),
  dailyLoggedByInput: document.getElementById('dailyLoggedByInput'),
  saveDailySubmitBtn: document.getElementById('saveDailySubmitBtn'),

  // Admin Daily Logs Tab
  adminDailyTab: document.getElementById('dailyAdminTab'),
  adminDailyList: document.getElementById('adminDailyList'),
  adminAddDailyBtn: document.getElementById('adminAddDailyBtn'),
  exportDailyJsonBtn: document.getElementById('exportDailyJsonBtn')
};

// =====================================================
// INITIALIZATION
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupAuthHandlers();
  await initSavedAudio();
  setupCountdown();
  setupCanvasParticles();
  setupEventListeners();
  setupAutoplay();
});

// =====================================================
// AUTHENTICATION & ACCESS CONTROL
// =====================================================
function setupAuthHandlers() {
  if (!dom.authForm) return;

  // Handle Log In Form Submission (Registration is blocked; login only)
  dom.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = dom.authEmailInput.value.trim();
    const password = dom.authPasswordInput.value;

    if (!isAllowedEmail(email)) {
      showAuthError(`⛔ Access Denied: "${email}" is not authorized to access this private space. All other accounts are blocked.`);
      return;
    }

    try {
      dom.authSubmitBtn.disabled = true;
      dom.authSubmitBtnText.textContent = 'Logging In...';
      if (dom.authAlertBox) dom.authAlertBox.classList.add('hidden');

      await authService.login(email, password);
      showToast('Welcome back to Our Love Story 💕');
    } catch (err) {
      console.error('Auth error:', err);
      let msg = err.message || 'Authentication failed';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Incorrect password. Please verify your credentials and try again.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No authorized account found for this email. Registration is closed.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please wait a moment and try again.';
      }
      showAuthError(msg);
    } finally {
      dom.authSubmitBtn.disabled = false;
      dom.authSubmitBtnText.textContent = 'Log In 💕';
    }
  });

  // Logout Button
  if (dom.logoutBtn) {
    dom.logoutBtn.addEventListener('click', async () => {
      try {
        await authService.logout();
        closeAdminModal();
        showToast('Signed out of Our Love Story 🌸');
      } catch (err) {
        console.error('Logout error:', err);
      }
    });
  }

  // Real-time Authentication State Listener
  authService.onStateChanged(async (user, err) => {
    if (user && isAllowedEmail(user.email)) {
      // Authorized user is active
      if (dom.authGateModal) dom.authGateModal.classList.add('hidden');
      if (dom.currentUserEmail) dom.currentUserEmail.textContent = user.email;
      await loadData();
      renderTimeline();
      renderAdminMemoriesList();
      populateSettingsForm();

      // Listen for real-time Daily Markdown sync
      if (window.firestoreDb && window.firestoreDb.listenDailyMarkdown) {
        window.firestoreDb.listenDailyMarkdown((updatedList) => {
          if (updatedList && Array.isArray(updatedList) && updatedList.length > 0) {
            currentDailyMarkdowns = updatedList;
            renderCalendar();
            renderSelectedDateEntries();
            renderDailyListView();
            renderDailyStats();
            renderAdminDailyList();
          }
        });
      }
    } else {
      // Not authenticated or blocked
      if (dom.authGateModal) dom.authGateModal.classList.remove('hidden');
      if (dom.currentUserEmail) dom.currentUserEmail.textContent = 'Not signed in';
      if (err) {
        showAuthError(err.message);
      }
    }
  });
}

function showAuthError(message) {
  if (!dom.authAlertBox) return;
  dom.authAlertBox.className = 'auth-alert error';
  dom.authAlertBox.textContent = message;
  dom.authAlertBox.classList.remove('hidden');
}

// Load settings and memories from Firestore / DB
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
      // Seed default memories into Firestore / DB
      for (const mem of DEFAULT_MEMORIES) {
        await db.saveMemory(mem);
      }
      await db.saveSetting('coupleSettings', currentSettings);
      currentMemories = [...DEFAULT_MEMORIES];
    }
  } catch (err) {
    console.error('Error loading data from DB:', err);
    currentSettings = { ...DEFAULT_SETTINGS };
    currentMemories = [...DEFAULT_MEMORIES];
  }

  // Load Daily Markdowns from DB
  try {
    const savedDaily = await db.getAllDailyMarkdown();
    if (savedDaily && savedDaily.length > 0) {
      currentDailyMarkdowns = savedDaily;
    } else if (typeof DEFAULT_DAILY_MARKDOWNS !== 'undefined' && DEFAULT_DAILY_MARKDOWNS.length > 0) {
      for (const d of DEFAULT_DAILY_MARKDOWNS) {
        await db.saveDailyMarkdown(d);
      }
      currentDailyMarkdowns = [...DEFAULT_DAILY_MARKDOWNS];
    }
  } catch (dErr) {
    console.warn('Error loading daily markdowns:', dErr);
    if (typeof DEFAULT_DAILY_MARKDOWNS !== 'undefined') {
      currentDailyMarkdowns = [...DEFAULT_DAILY_MARKDOWNS];
    }
  }

  updateCoupleDisplays();
  updateCountdownDOM();
  renderCalendar();
  renderSelectedDateEntries();
  renderDailyListView();
  renderDailyStats();
  renderAdminDailyList();
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
  renderAdminDailyList();
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
      // Compress with max dimension 1000px for optimal Firebase Cloud sync
      const canvas = document.createElement('canvas');
      const maxDim = 1000;
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

      currentUploadedImageBase64 = canvas.toDataURL('image/jpeg', 0.78);
      showImagePreview(currentUploadedImageBase64);
      showToast('Photo uploaded & optimized for Cloud! 📸');
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
// SUBMODULE: DAILY MARKDOWN ENGINE
// Calendar, Activity Logger, Markdown Renderer & Photos
// =====================================================

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatCalendarDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, month, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getRelativeDateLabel(dateStr) {
  if (!dateStr) return '';
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (dateStr === todayStr) return 'Today 💕';

  const parts = dateStr.split('-');
  if (parts.length < 3) return '';
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  const target = new Date(y, m, d);
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.round((todayZero - target) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1) return `${diffDays} days ago`;
  if (diffDays < -1) return `In ${Math.abs(diffDays)} days`;
  return '';
}

function parseMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);

  // Headers: ###, ##, #
  html = html.replace(/^### (.*$)/gim, '<h5 style="margin:4px 0;font-size:0.92rem;color:var(--text-dark);font-weight:700;">$1</h5>');
  html = html.replace(/^## (.*$)/gim, '<h4 style="margin:6px 0;font-size:1.02rem;color:var(--text-dark);font-weight:700;">$1</h4>');
  html = html.replace(/^# (.*$)/gim, '<h3 style="margin:8px 0;font-size:1.1rem;color:var(--text-dark);font-weight:700;">$1</h3>');

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Blockquotes: > quote
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bullet items: - or *
  html = html.replace(/(?:^|\n)[-*]\s+(.+)/g, (match, item) => {
    return `\n<ul><li>${item}</li></ul>`;
  });
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Line breaks
  html = html.replace(/\n{2,}/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function insertMarkdownTool(tool) {
  const textarea = dom.dailyContentInput;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  let replacement = '';

  switch (tool) {
    case 'bold':
      replacement = selectedText ? `**${selectedText}**` : `**bold text**`;
      break;
    case 'italic':
      replacement = selectedText ? `*${selectedText}*` : `*italic text*`;
      break;
    case 'list':
      replacement = selectedText ? `\n- ${selectedText}` : `\n- Match 1: 21-19\n- Match 2: 18-21`;
      break;
    case 'quote':
      replacement = selectedText ? `\n> ${selectedText}` : `\n> Sweet memory or note`;
      break;
    case 'heart':
      replacement = ` 💕 `;
      break;
    default:
      return;
  }

  textarea.setRangeText(replacement, start, end, 'end');
  textarea.focus();
}

function renderCalendar() {
  if (!dom.calendarDaysGrid || !dom.calMonthYearText) return;
  dom.calMonthYearText.textContent = `${MONTH_NAMES[calCurrentMonth]} ${calCurrentYear}`;

  const firstDayOfMonth = new Date(calCurrentYear, calCurrentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(calCurrentYear, calCurrentMonth, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let html = '';

  // Previous month trailing padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonth = calCurrentMonth === 0 ? 11 : calCurrentMonth - 1;
    const prevYear = calCurrentMonth === 0 ? calCurrentYear - 1 : calCurrentYear;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    html += `<div class="cal-day-cell other-month" data-date="${dateStr}">
      <span class="cal-day-num">${d}</span>
    </div>`;
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${calCurrentYear}-${String(calCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDateStr;

    // Filter markdowns for this day
    const dayEntries = currentDailyMarkdowns.filter(e => e.date === dateStr);

    let matchesFilter = true;
    if (currentDailyFilter === 'Sport') {
      matchesFilter = dayEntries.some(e => (e.category || '').toLowerCase() === 'sport');
    } else if (currentDailyFilter === 'Date') {
      matchesFilter = dayEntries.some(e => (e.category || '').toLowerCase() === 'date');
    } else if (currentDailyFilter === 'Photo') {
      matchesFilter = dayEntries.some(e => Boolean(e.image));
    }

    const hasEntries = dayEntries.length > 0;
    const hasPhoto = dayEntries.some(e => Boolean(e.image));

    let indicatorsHtml = '';
    if (hasEntries && (currentDailyFilter === 'all' || matchesFilter)) {
      indicatorsHtml += '<div class="cal-day-indicators">';
      const icons = dayEntries.map(e => e.categoryIcon || (e.category === 'Sport' ? '🏸' : '💖')).slice(0, 2);
      icons.forEach(ic => {
        indicatorsHtml += `<span class="cal-mini-icon">${ic}</span>`;
      });

      if (dayEntries.length > 2) {
        indicatorsHtml += `<span class="cal-multi-badge">+${dayEntries.length - 2}</span>`;
      }

      if (hasPhoto) {
        indicatorsHtml += `<span class="cal-photo-dot" title="Photo attached"></span>`;
      }
      indicatorsHtml += '</div>';
    }

    const cellClasses = [
      'cal-day-cell',
      isToday ? 'today' : '',
      isSelected ? 'selected' : '',
      hasEntries ? 'has-entry' : ''
    ].filter(Boolean).join(' ');

    html += `<div class="${cellClasses}" data-date="${dateStr}">
      <span class="cal-day-num">${day}</span>
      ${indicatorsHtml}
    </div>`;
  }

  // Next month leading padding days
  const totalCellsSoFar = firstDayOfMonth + daysInMonth;
  const nextDays = (7 - (totalCellsSoFar % 7)) % 7;
  for (let d = 1; d <= nextDays; d++) {
    const nextMonth = calCurrentMonth === 11 ? 0 : calCurrentMonth + 1;
    const nextYear = calCurrentMonth === 11 ? calCurrentYear + 1 : calCurrentYear;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    html += `<div class="cal-day-cell other-month" data-date="${dateStr}">
      <span class="cal-day-num">${d}</span>
    </div>`;
  }

  dom.calendarDaysGrid.innerHTML = html;
}

function renderSelectedDateEntries() {
  if (!dom.selectedDateHeading) return;

  dom.selectedDateHeading.textContent = formatCalendarDate(selectedDateStr);
  const relLabel = getRelativeDateLabel(selectedDateStr);
  dom.selectedDateRel.textContent = relLabel;
  dom.selectedDateRel.style.display = relLabel ? 'inline-block' : 'none';

  const dayEntries = currentDailyMarkdowns.filter(e => e.date === selectedDateStr);

  if (dayEntries.length === 0) {
    dom.selectedDayEntries.innerHTML = `
      <div class="daily-empty-state">
        <span class="daily-empty-icon">🏸🌸</span>
        <h4>No activities marked down for this day</h4>
        <p>Did you play badminton, go on a date, or share a sweet moment? Tap below to mark it down!</p>
        <button class="btn primary-btn small-btn" id="emptyStateAddDailyBtn">
          <span>➕</span> Mark Down This Day 💕
        </button>
      </div>
    `;
    const emptyBtn = document.getElementById('emptyStateAddDailyBtn');
    if (emptyBtn) {
      emptyBtn.addEventListener('click', () => openDailyMarkdownModal(null, selectedDateStr));
    }
    return;
  }

  dom.selectedDayEntries.innerHTML = dayEntries.map(entry => renderDailyEntryCard(entry)).join('');
  attachDailyEntryCardListeners(dom.selectedDayEntries);
}

function renderDailyEntryCard(entry) {
  const cat = entry.category || 'Sport';
  const icon = entry.categoryIcon || (cat === 'Sport' ? '🏸' : '💖');
  const catClass = (cat || '').toLowerCase().replace(/[^a-z]/g, '');
  const hasPhoto = entry.image && entry.image.trim() !== '';

  return `
    <div class="daily-entry-card" data-id="${entry.id}">
      <div class="daily-entry-header">
        <div class="daily-badge-group">
          <span class="daily-cat-badge ${catClass}">
            <span>${icon}</span>
            <span>${escapeHtml(cat)}</span>
          </span>
          ${entry.loggedBy ? `<span class="daily-logged-by">✍️ ${escapeHtml(entry.loggedBy)}</span>` : ''}
        </div>
        <div class="daily-entry-actions">
          <button class="daily-action-btn edit" data-action="edit" data-id="${entry.id}" title="Edit this log">
            <span>✏️</span> Edit
          </button>
          <button class="daily-action-btn delete" data-action="delete" data-id="${entry.id}" title="Delete this log">
            <span>🗑️</span>
          </button>
        </div>
      </div>

      <div class="daily-activity-title">
        <span>${escapeHtml(entry.activity || 'Activity')}</span>
      </div>

      ${entry.content ? `<div class="daily-markdown-content">${parseMarkdown(entry.content)}</div>` : ''}

      ${hasPhoto ? `
        <div class="daily-photo-card" data-action="zoom" data-id="${entry.id}">
          <img class="daily-photo-img" src="${entry.image}" alt="${escapeHtml(entry.activity || 'Photo')}" loading="lazy">
          <div class="daily-photo-zoom-hint">
            <span>🔍</span>
            <span>Tap to view photo in fullscreen</span>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function attachDailyEntryCardListeners(container) {
  if (!container) return;

  // Zoom photo in lightbox
  container.querySelectorAll('[data-action="zoom"]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const entry = currentDailyMarkdowns.find(e => e.id === id);
      if (entry && entry.image) {
        openDailyLightbox(entry);
      }
    });
  });

  // Edit log
  container.querySelectorAll('[data-action="edit"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const entry = currentDailyMarkdowns.find(e => e.id === id);
      if (entry) {
        openDailyMarkdownModal(entry);
      }
    });
  });

  // Delete log
  container.querySelectorAll('[data-action="delete"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this daily markdown?')) {
        await deleteDailyMarkdownEntry(id);
      }
    });
  });
}

function openDailyLightbox(entry) {
  dom.lightboxImg.src = entry.image;
  dom.lightboxBadge.textContent = `${entry.categoryIcon || '📸'} ${entry.category || 'Daily Log'}`;
  dom.lightboxTitle.textContent = entry.activity || 'Our Daily Moment 💕';
  dom.lightboxLocation.textContent = `🗓️ ${formatCalendarDate(entry.date)}`;
  dom.lightboxDesc.textContent = entry.content || '';
  dom.lightboxModal.classList.add('active');
  dom.lightboxModal.setAttribute('aria-hidden', 'false');
}

function renderDailyListView() {
  if (!dom.dailyAllEntriesList) return;

  let list = [...currentDailyMarkdowns];

  if (currentDailyFilter === 'Sport') {
    list = list.filter(e => (e.category || '').toLowerCase() === 'sport');
  } else if (currentDailyFilter === 'Date') {
    list = list.filter(e => (e.category || '').toLowerCase() === 'date');
  } else if (currentDailyFilter === 'Photo') {
    list = list.filter(e => Boolean(e.image));
  }

  list.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.createdAt || 0) - (a.createdAt || 0));

  if (list.length === 0) {
    dom.dailyAllEntriesList.innerHTML = `
      <div class="daily-empty-state">
        <span class="daily-empty-icon">📝✨</span>
        <h4>No markdowns match this filter</h4>
        <p>Tap below to mark down a sport or activity for any day!</p>
        <button class="btn primary-btn small-btn" id="listEmptyAddBtn">
          <span>➕</span> Mark Down Day
        </button>
      </div>
    `;
    const btn = document.getElementById('listEmptyAddBtn');
    if (btn) btn.addEventListener('click', () => openDailyMarkdownModal(null, selectedDateStr));
    return;
  }

  dom.dailyAllEntriesList.innerHTML = list.map(entry => {
    return `
      <div class="daily-list-item-wrapper" style="margin-bottom: 14px;">
        <div style="font-size:0.8rem;font-weight:700;color:var(--primary-pink);margin-bottom:6px;padding-left:4px;">
          🗓️ ${formatCalendarDate(entry.date)} ${getRelativeDateLabel(entry.date) ? `• ${getRelativeDateLabel(entry.date)}` : ''}
        </div>
        ${renderDailyEntryCard(entry)}
      </div>
    `;
  }).join('');

  attachDailyEntryCardListeners(dom.dailyAllEntriesList);
}

function renderDailyStats() {
  const uniqueDays = new Set(currentDailyMarkdowns.map(e => e.date)).size;
  const sportsCount = currentDailyMarkdowns.filter(e => (e.category || '').toLowerCase() === 'sport').length;
  const photosCount = currentDailyMarkdowns.filter(e => Boolean(e.image)).length;

  if (dom.statDaysCount) dom.statDaysCount.textContent = uniqueDays;
  if (dom.statSportsCount) dom.statSportsCount.textContent = sportsCount;
  if (dom.statPhotosCount) dom.statPhotosCount.textContent = photosCount;
  if (dom.dailyMarkdownBadge) dom.dailyMarkdownBadge.textContent = currentDailyMarkdowns.length;
}

function renderAdminDailyList() {
  if (!dom.adminDailyList) return;
  dom.adminDailyList.innerHTML = '';

  if (currentDailyMarkdowns.length === 0) {
    dom.adminDailyList.innerHTML = `<p style="padding:16px;text-align:center;color:var(--text-muted);">No daily markdowns yet.</p>`;
    return;
  }

  currentDailyMarkdowns.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'admin-item-card';

    const thumb = entry.image
      ? `<img src="${entry.image}" alt="${escapeHtml(entry.activity)}">`
      : `<span>${entry.categoryIcon || '🗓️'}</span>`;

    card.innerHTML = `
      <div class="admin-item-thumb">${thumb}</div>
      <div class="admin-item-info">
        <h4 class="admin-item-title">${escapeHtml(entry.activity || 'Activity')}</h4>
        <span class="admin-item-date">${escapeHtml(entry.date)} • ${escapeHtml(entry.category || 'Log')}</span>
      </div>
      <div class="admin-item-actions">
        <button class="btn secondary-btn small-btn admin-daily-edit-btn" data-id="${entry.id}">Edit</button>
        <button class="btn danger-btn small-btn admin-daily-delete-btn" data-id="${entry.id}">Delete</button>
      </div>
    `;
    dom.adminDailyList.appendChild(card);
  });

  dom.adminDailyList.querySelectorAll('.admin-daily-edit-btn').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const item = currentDailyMarkdowns.find(e => e.id === id);
      if (item) {
        closeAdminModal();
        openDailyMarkdownModal(item);
      }
    });
  });

  dom.adminDailyList.querySelectorAll('.admin-daily-delete-btn').forEach(b => {
    b.addEventListener('click', async () => {
      const id = b.getAttribute('data-id');
      if (confirm('Are you sure you want to delete this daily markdown?')) {
        await deleteDailyMarkdownEntry(id);
      }
    });
  });
}

function openDailyMarkdownModal(entry = null, defaultDate = null) {
  if (entry) {
    dom.dailyModalHeading.textContent = 'Edit Daily Markdown 📝💕';
    dom.dailyEntryId.value = entry.id;
    dom.dailyEntryDate.value = entry.date || selectedDateStr;
    dom.dailyCategoryInput.value = entry.category || 'Sport';
    dom.dailyCategoryIconInput.value = entry.categoryIcon || '🏸';
    dom.dailyActivityInput.value = entry.activity || '';
    dom.dailyContentInput.value = entry.content || '';
    dom.dailyLoggedByInput.value = entry.loggedBy || '';

    const chips = dom.dailyCategoryChips.querySelectorAll('.category-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-category') === (entry.category || 'Sport'));
    });

    if (entry.image) {
      currentDailyImageBase64 = entry.image;
      showDailyImagePreview(entry.image);
    } else {
      currentDailyImageBase64 = '';
      resetDailyImagePreview();
    }
  } else {
    dom.dailyModalHeading.textContent = 'Mark Down This Day 📝💕';
    dom.dailyMarkdownForm.reset();
    dom.dailyEntryId.value = '';

    const chosenDate = defaultDate || selectedDateStr || new Date().toISOString().split('T')[0];
    dom.dailyEntryDate.value = chosenDate;

    dom.dailyCategoryInput.value = 'Sport';
    dom.dailyCategoryIconInput.value = '🏸';
    const chips = dom.dailyCategoryChips.querySelectorAll('.category-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-category') === 'Sport');
    });

    dom.dailyLoggedByInput.value = currentSettings.partnerOne || 'David';
    currentDailyImageBase64 = '';
    resetDailyImagePreview();
  }

  updateCategoryFormState(dom.dailyCategoryInput.value);

  dom.dailyMarkdownModal.classList.add('active');
  dom.dailyMarkdownModal.setAttribute('aria-hidden', 'false');
}

function closeDailyMarkdownModal() {
  dom.dailyMarkdownModal.classList.remove('active');
  dom.dailyMarkdownModal.setAttribute('aria-hidden', 'true');
}

function updateCategoryFormState(cat) {
  if (cat === 'Sport') {
    dom.dailyActivityLabel.textContent = 'What Sport / Activity did we do? *';
    dom.dailyActivityInput.placeholder = 'e.g. Badminton, Gym (Leg Day), Jogging, Swimming...';
    if (dom.dailySuggestRow) dom.dailySuggestRow.style.display = 'flex';
  } else {
    dom.dailyActivityLabel.textContent = 'Activity / Event Title *';
    dom.dailyActivityInput.placeholder = 'e.g. Dinner Date, Movie Night, Sunset Walk...';
    if (dom.dailySuggestRow) dom.dailySuggestRow.style.display = 'none';
  }
}

function showDailyImagePreview(src) {
  dom.dailyImagePreview.src = src;
  dom.dailyImagePreview.classList.remove('hidden');
  dom.dailyDropzonePlaceholder.classList.add('hidden');
  dom.dailyPreviewActions.classList.remove('hidden');
}

function resetDailyImagePreview() {
  dom.dailyImagePreview.src = '';
  dom.dailyImagePreview.classList.add('hidden');
  dom.dailyDropzonePlaceholder.classList.remove('hidden');
  dom.dailyPreviewActions.classList.add('hidden');
  dom.dailyImageFileInput.value = '';
}

function handleDailyImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('Please select a valid image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1000;
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

      currentDailyImageBase64 = canvas.toDataURL('image/jpeg', 0.78);
      showDailyImagePreview(currentDailyImageBase64);
      showToast('Photo attached & optimized! 📸');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function deleteDailyMarkdownEntry(id) {
  try {
    await db.deleteDailyMarkdown(id);
    currentDailyMarkdowns = currentDailyMarkdowns.filter(e => e.id !== id);
    renderCalendar();
    renderSelectedDateEntries();
    renderDailyListView();
    renderDailyStats();
    renderAdminDailyList();
    showToast('Daily markdown removed.');
  } catch (err) {
    console.error(err);
    showToast('Failed to delete daily markdown');
  }
}

function setDailyViewMode(mode) {
  currentDailyView = mode;
  if (mode === 'calendar') {
    dom.viewCalendarBtn.classList.add('active');
    dom.viewListBtn.classList.remove('active');
    dom.calendarWrapper.classList.remove('hidden');
    dom.dailyListWrapper.classList.add('hidden');
  } else {
    dom.viewCalendarBtn.classList.remove('active');
    dom.viewListBtn.classList.add('active');
    dom.calendarWrapper.classList.add('hidden');
    dom.dailyListWrapper.classList.remove('hidden');
    renderDailyListView();
  }
}

function switchSubmoduleTab(targetId) {
  const isDaily = targetId === 'dailyMarkdownSection';
  if (dom.tabDailyMarkdown) {
    dom.tabDailyMarkdown.classList.toggle('active', isDaily);
    dom.tabDailyMarkdown.setAttribute('aria-selected', isDaily ? 'true' : 'false');
  }
  if (dom.tabMemories) {
    dom.tabMemories.classList.toggle('active', !isDaily);
    dom.tabMemories.setAttribute('aria-selected', !isDaily ? 'true' : 'false');
  }

  const targetElem = document.getElementById(targetId);
  if (targetElem) {
    targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  if (dom.exportJsonBtn) {
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
  }

  // Copy JSON to clipboard
  if (dom.copyJsonBtn) {
    dom.copyJsonBtn.addEventListener('click', () => {
      const exportData = {
        settings: currentSettings,
        memories: currentMemories
      };
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
        .then(() => showToast('JSON copied to clipboard! 📋'))
        .catch(() => showToast('Failed to copy to clipboard'));
    });
  }

  // Import JSON
  if (dom.triggerImportBtn && dom.importJsonFileInput) {
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
  }

  // Reset to Defaults
  dom.resetDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all memories, daily logs, and settings to default?')) {
      await db.clearAll();
      currentSettings = { ...DEFAULT_SETTINGS };
      currentMemories = [...DEFAULT_MEMORIES];
      currentDailyMarkdowns = typeof DEFAULT_DAILY_MARKDOWNS !== 'undefined' ? [...DEFAULT_DAILY_MARKDOWNS] : [];

      for (const mem of DEFAULT_MEMORIES) {
        await db.saveMemory(mem);
      }
      for (const dm of currentDailyMarkdowns) {
        await db.saveDailyMarkdown(dm);
      }
      await db.saveSetting('coupleSettings', currentSettings);

      updateCoupleDisplays();
      updateCountdownDOM();
      renderTimeline();
      renderAdminMemoriesList();
      renderCalendar();
      renderSelectedDateEntries();
      renderDailyListView();
      renderDailyStats();
      renderAdminDailyList();
      populateSettingsForm();
      closeAdminModal();
      showToast('All memories & daily logs reset to default 🌸');
    }
  });

  // --- SUBMODULE: DAILY MARKDOWN EVENT LISTENERS ---

  // Submodule navigation tabs
  if (dom.tabDailyMarkdown) {
    dom.tabDailyMarkdown.addEventListener('click', () => switchSubmoduleTab('dailyMarkdownSection'));
  }
  if (dom.tabMemories) {
    dom.tabMemories.addEventListener('click', () => switchSubmoduleTab('memoriesSection'));
  }
  if (dom.openDailyHeaderBtn) {
    dom.openDailyHeaderBtn.addEventListener('click', () => switchSubmoduleTab('dailyMarkdownSection'));
  }

  // Calendar month navigation
  if (dom.calPrevMonthBtn) {
    dom.calPrevMonthBtn.addEventListener('click', () => {
      calCurrentMonth--;
      if (calCurrentMonth < 0) {
        calCurrentMonth = 11;
        calCurrentYear--;
      }
      renderCalendar();
    });
  }

  if (dom.calNextMonthBtn) {
    dom.calNextMonthBtn.addEventListener('click', () => {
      calCurrentMonth++;
      if (calCurrentMonth > 11) {
        calCurrentMonth = 0;
        calCurrentYear++;
      }
      renderCalendar();
    });
  }

  if (dom.calTodayBtn) {
    dom.calTodayBtn.addEventListener('click', () => {
      const now = new Date();
      calCurrentYear = now.getFullYear();
      calCurrentMonth = now.getMonth();
      selectedDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      renderCalendar();
      renderSelectedDateEntries();
      showToast('Centered on Today 💕');
    });
  }

  // Calendar days grid click (delegated)
  if (dom.calendarDaysGrid) {
    dom.calendarDaysGrid.addEventListener('click', (e) => {
      const cell = e.target.closest('.cal-day-cell');
      if (!cell) return;
      const dateStr = cell.getAttribute('data-date');
      if (!dateStr) return;

      selectedDateStr = dateStr;
      const [y, m] = dateStr.split('-').map(Number);
      if (y !== calCurrentYear || m - 1 !== calCurrentMonth) {
        calCurrentYear = y;
        calCurrentMonth = m - 1;
      }

      renderCalendar();
      renderSelectedDateEntries();

      // Smooth scroll to selected day card on mobile
      if (window.innerWidth <= 600 && dom.selectedDayCard) {
        dom.selectedDayCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  // Daily Markdown filter buttons
  if (dom.dailyFilterTabs) {
    dom.dailyFilterTabs.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.dailyFilterTabs.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDailyFilter = btn.getAttribute('data-daily-filter') || 'all';
        renderCalendar();
        if (currentDailyView === 'list') {
          renderDailyListView();
        }
      });
    });
  }

  // View mode toggle (Calendar vs List)
  if (dom.viewCalendarBtn) {
    dom.viewCalendarBtn.addEventListener('click', () => setDailyViewMode('calendar'));
  }
  if (dom.viewListBtn) {
    dom.viewListBtn.addEventListener('click', () => setDailyViewMode('list'));
  }

  // Daily Markdown Modal Triggers
  if (dom.openAddDailyBtn) {
    dom.openAddDailyBtn.addEventListener('click', () => openDailyMarkdownModal(null, selectedDateStr));
  }
  if (dom.openAddDailyListBtn) {
    dom.openAddDailyListBtn.addEventListener('click', () => openDailyMarkdownModal(null, selectedDateStr));
  }
  if (dom.adminAddDailyBtn) {
    dom.adminAddDailyBtn.addEventListener('click', () => {
      closeAdminModal();
      openDailyMarkdownModal(null, selectedDateStr);
    });
  }
  if (dom.dailyModalCloseBtn) {
    dom.dailyModalCloseBtn.addEventListener('click', closeDailyMarkdownModal);
  }
  if (dom.dailyMarkdownBackdrop) {
    dom.dailyMarkdownBackdrop.addEventListener('click', closeDailyMarkdownModal);
  }

  // Category chips inside modal
  if (dom.dailyCategoryChips) {
    dom.dailyCategoryChips.querySelectorAll('.category-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        dom.dailyCategoryChips.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const cat = chip.getAttribute('data-category');
        const icon = chip.getAttribute('data-icon') || '✨';
        dom.dailyCategoryInput.value = cat;
        dom.dailyCategoryIconInput.value = icon;
        updateCategoryFormState(cat);
      });
    });
  }

  // Sport suggestion quick-picks
  if (dom.dailySuggestRow) {
    dom.dailySuggestRow.querySelectorAll('.suggest-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-suggest');
        if (text) {
          dom.dailyActivityInput.value = text;
          dom.dailyActivityInput.focus();
        }
      });
    });
  }

  // Markdown helper toolbar
  document.querySelectorAll('.md-tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      insertMarkdownTool(btn.getAttribute('data-tool'));
    });
  });

  // Daily photo upload dropzone
  if (dom.dailyDropzone) {
    dom.dailyDropzone.addEventListener('click', () => dom.dailyImageFileInput.click());
  }
  if (dom.dailyImageFileInput) {
    dom.dailyImageFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleDailyImageFile(e.target.files[0]);
      }
    });
  }
  if (dom.changeDailyPhotoBtn) {
    dom.changeDailyPhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.dailyImageFileInput.click();
    });
  }
  if (dom.removeDailyPhotoBtn) {
    dom.removeDailyPhotoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentDailyImageBase64 = '';
      resetDailyImagePreview();
    });
  }

  // Daily Markdown form submit
  if (dom.dailyMarkdownForm) {
    dom.dailyMarkdownForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = dom.dailyEntryId.value || 'daily-' + Date.now();
      const isNew = !dom.dailyEntryId.value;
      const dateVal = dom.dailyEntryDate.value || selectedDateStr;

      const existing = currentDailyMarkdowns.find(item => item.id === id) || {};

      const newEntry = {
        ...existing,
        id,
        date: dateVal,
        category: dom.dailyCategoryInput.value || 'Sport',
        categoryIcon: dom.dailyCategoryIconInput.value || '🏸',
        activity: dom.dailyActivityInput.value.trim(),
        content: dom.dailyContentInput.value.trim(),
        image: currentDailyImageBase64 || existing.image || '',
        loggedBy: dom.dailyLoggedByInput.value.trim() || currentSettings.partnerOne || 'David',
        createdAt: existing.createdAt || Date.now()
      };

      try {
        await db.saveDailyMarkdown(newEntry);

        if (isNew) {
          currentDailyMarkdowns.unshift(newEntry);
        } else {
          const idx = currentDailyMarkdowns.findIndex(item => item.id === id);
          if (idx !== -1) currentDailyMarkdowns[idx] = newEntry;
        }

        selectedDateStr = dateVal;
        const [y, m] = dateVal.split('-').map(Number);
        if (y !== calCurrentYear || m - 1 !== calCurrentMonth) {
          calCurrentYear = y;
          calCurrentMonth = m - 1;
        }

        closeDailyMarkdownModal();
        renderCalendar();
        renderSelectedDateEntries();
        renderDailyListView();
        renderDailyStats();
        renderAdminDailyList();
        showToast(isNew ? 'Daily markdown saved! 💕' : 'Markdown updated! ✨');
      } catch (err) {
        console.error('Error saving daily markdown:', err);
        showToast('Error saving daily markdown');
      }
    });
  }

  // Export Daily Markdowns JSON
  if (dom.exportDailyJsonBtn) {
    dom.exportDailyJsonBtn.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(currentDailyMarkdowns, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `our-love-story-daily-markdown-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Daily markdowns exported as JSON! 📥');
    });
  }

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

  dom.saveAudioUrlBtn.addEventListener('click', async () => {
    const url = dom.customAudioUrlInput.value.trim();
    if (url) {
      setAudioSource(url);
      await db.saveSetting('customAudioUrl', url);
      await db.saveSetting('customAudioName', 'External Audio URL');
      dom.removeCustomAudioBtn.classList.remove('hidden');
      dom.musicModeStatus.innerHTML = `<span>🎵 Custom Audio Link synced to all devices</span>`;
      showToast('Custom audio URL synced to all devices! 🎵');
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

// Handle MP3 upload from device to Firebase Cloud Storage
async function handleCustomAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    dom.musicModeStatus.innerHTML = `<span>⏳ Uploading <strong>${escapeHtml(file.name)}</strong> to Firebase Cloud... (0%)</span>`;
    showToast('Uploading song to Firebase Cloud... ☁️');

    const result = await storageService.uploadMusic(file, (percent) => {
      dom.musicModeStatus.innerHTML = `<span>⏳ Uploading <strong>${escapeHtml(file.name)}</strong>... ${Math.round(percent)}%</span>`;
    });

    const downloadUrl = result.downloadUrl;

    // Save cloud URL and original filename to Firestore settings so ALL devices get it
    await db.saveSetting('customAudioUrl', downloadUrl);
    await db.saveSetting('customAudioName', file.name);

    // Also update current device
    setAudioSource(downloadUrl);
    dom.customAudioUrlInput.value = downloadUrl;
    dom.removeCustomAudioBtn.classList.remove('hidden');
    dom.musicModeStatus.innerHTML = `<span>🎵 Cloud Music: <strong>${escapeHtml(file.name)}</strong> (Synced across all devices)</span>`;
    showToast('Song uploaded & synced to all devices! 💕🎶');
  } catch (err) {
    console.error('Custom music upload error:', err);
    let msg = err.message || 'Failed to upload audio to Firebase';
    if (err.code === 'storage/unauthorized' || err.code === 'storage/unknown') {
      msg = 'Firebase Storage needs to be initialized. Please visit Firebase Console > Storage to enable.';
    }
    showToast(`Upload error: ${msg}`);
    dom.musicModeStatus.innerHTML = `<span class="danger-text">⚠️ ${escapeHtml(msg)}</span>`;
  }
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
  await db.saveSetting('customAudioUrl', null);
  await db.saveSetting('customAudioName', null);
  resetCustomAudioLocally();
  showToast('Reset to built-in Love Story music box 🎶');
}

function resetCustomAudioLocally() {
  if (customAudioBlobUrl) {
    URL.revokeObjectURL(customAudioBlobUrl);
    customAudioBlobUrl = null;
  }
  dom.bgMusic.src = 'assets/love-story.mp3?v=2';
  if (dom.customAudioUrlInput) dom.customAudioUrlInput.value = '';
  if (dom.removeCustomAudioBtn) dom.removeCustomAudioBtn.classList.add('hidden');
  if (dom.musicModeStatus) {
    dom.musicModeStatus.innerHTML = `<span>✨ Built-in Love Story Chorus (Music Box Synth)</span>`;
  }
}

// Load saved custom audio on startup & listen for real-time changes across devices
async function initSavedAudio() {
  try {
    const savedUrl = await db.getSetting('customAudioUrl');
    const savedName = await db.getSetting('customAudioName');

    if (savedUrl) {
      setAudioSource(savedUrl);
      if (dom.customAudioUrlInput) dom.customAudioUrlInput.value = savedUrl;
      if (dom.removeCustomAudioBtn) dom.removeCustomAudioBtn.classList.remove('hidden');
      const displayName = savedName || 'Custom Cloud Track';
      if (dom.musicModeStatus) {
        dom.musicModeStatus.innerHTML = `<span>🎵 Cloud Music: <strong>${escapeHtml(displayName)}</strong> (Synced)</span>`;
      }
    } else {
      dom.bgMusic.src = 'assets/love-story.mp3?v=2';
    }

    // Real-time synchronization across all devices
    if (window.firestoreDb && window.firestoreDb.listenSetting) {
      window.firestoreDb.listenSetting('customAudioUrl', async (newUrl) => {
        if (newUrl && newUrl !== dom.bgMusic.src) {
          const newName = await db.getSetting('customAudioName');
          setAudioSource(newUrl);
          if (dom.customAudioUrlInput) dom.customAudioUrlInput.value = newUrl;
          if (dom.removeCustomAudioBtn) dom.removeCustomAudioBtn.classList.remove('hidden');
          const displayName = newName || 'Custom Cloud Track';
          if (dom.musicModeStatus) {
            dom.musicModeStatus.innerHTML = `<span>🎵 Cloud Music: <strong>${escapeHtml(displayName)}</strong> (Synced)</span>`;
          }
          if (isPlayingMusic) {
            await dom.bgMusic.play().catch(() => {});
          }
        } else if (!newUrl && dom.bgMusic.src && !dom.bgMusic.src.includes('love-story.mp3')) {
          resetCustomAudioLocally();
        }
      });
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
