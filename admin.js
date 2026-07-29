/* ================================================================
   admin.js
   ----------------------------------------------------------------
   Logique du poste de commandement (admin.html).
   - Authentification Firebase (email / mot de passe)
   - Navigation sidebar (SPA légère, sans framework)
   - CRUD notifications (créer / modifier / supprimer / republier)
   - Édition des 13 dates d'énigmes
   - Édition de la date finale (TARGET_DATE)
   Tout est synchronisé en temps réel avec index.html via Firebase
   Realtime Database (onValue).
   ================================================================ */

import { db, auth } from './firebase-config.js';
import {
  ref, onValue, push, set, update, remove
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js';
import {
  onAuthStateChanged, signInWithEmailAndPassword, signOut
} from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js';

/* ================================================================
   RÉFÉRENCE — Titres & dates par défaut des 13 énigmes
   (Copie en lecture seule des valeurs codées en dur dans index.html,
   utilisée uniquement comme fallback tant que Firebase est vide.)
   ================================================================ */
   const DEFAULT_ENIGMES = [
    { num: 1,  title: "FRAGMENT I — Le réveil",            date: new Date(2026, 6, 18, 23, 23, 0) },
    { num: 2,  title: "FRAGMENT II — Les marées",          date: new Date(2026, 6, 29, 18, 4, 0) },
    { num: 3,  title: "FRAGMENT III — Les artistes",       date: new Date(2026, 7, 8, 11, 11, 0) },
    { num: 4,  title: "FRAGMENT IV — Le vent",             date: new Date(2026, 7, 18, 14, 0, 0) },
    { num: 5,  title: "FRAGMENT V — Le port",              date: new Date(2026, 7, 28, 20, 0, 0) },
    { num: 6,  title: "FRAGMENT VI — Les quais",           date: new Date(2026, 8, 7, 8, 0, 0) },
    { num: 7,  title: "FRAGMENT VII — Les mouettes",       date: new Date(2026, 8, 17, 17, 17, 0) },
    { num: 8,  title: "FRAGMENT VIII — Les pavés",         date: new Date(2026, 8, 27, 19, 0, 0) },
    { num: 9,  title: "FRAGMENT IX — Le clocher",          date: new Date(2026, 9, 2, 16, 30, 0) },
    { num: 10, title: "FRAGMENT X — Les souvenirs",        date: new Date(2026, 9, 7, 12, 0, 0) },
    { num: 11, title: "FRAGMENT XI — Le secret",           date: new Date(2026, 9, 11, 21, 0, 0) },
    { num: 12, title: "FRAGMENT XII — La confiance",       date: new Date(2026, 9, 14, 18, 30, 0) },
    { num: 13, title: "FRAGMENT XIII — Le dernier fragment", date: new Date(2026, 9, 16, 22, 22, 0) },
  ];
const DEFAULT_TARGET_DATE = new Date(2026, 9, 19, 6, 45, 0);

/* ================================================================
   UTILITAIRES
   ================================================================ */
function pad(n) { return String(n).padStart(2, '0'); }

// Date JS -> valeur pour <input type="datetime-local"> (heure locale)
function toLocalInputValue(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function formatDateFr(d) {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} — ${pad(d.getHours())}h${pad(d.getMinutes())}`;
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}
function showToast(message, isError = false) {
  const container = document.getElementById('admin-toast-container');
  const toast = document.createElement('div');
  toast.className = 'admin-toast' + (isError ? ' error' : '');
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ================================================================
   AUTHENTIFICATION
   ================================================================ */
const loginScreen = document.getElementById('login-screen');
const adminApp = document.getElementById('admin-app');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  loginBtn.disabled = true;
  loginBtn.textContent = 'Connexion…';
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = "Identifiants incorrects ou compte inconnu.";
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = 'Se connecter';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  signOut(auth);
});

let dataListenersStarted = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Connecté → afficher l'admin, masquer le login
    loginScreen.style.display = 'none';
    adminApp.classList.add('visible');
    document.getElementById('sidebar-user').textContent = user.email || 'Compte connecté';
    document.getElementById('settings-user-email').textContent = user.email || '—';
    if (!dataListenersStarted) {
      startRealtimeListeners();
      dataListenersStarted = true;
    }
  } else {
    // Non connecté → redirection vers l'écran de connexion
    adminApp.classList.remove('visible');
    loginScreen.style.display = 'flex';
  }
});

/* ================================================================
   NAVIGATION SIDEBAR
   ================================================================ */
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');

function goToPage(pageId) {
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${pageId}`));
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.page === pageId));
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('visible');
}

navLinks.forEach(link => {
  link.addEventListener('click', () => goToPage(link.dataset.page));
});
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => goToPage(btn.dataset.goto));
});

document.getElementById('menu-toggle').addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarBackdrop.classList.add('visible');
});
sidebarBackdrop.addEventListener('click', () => {
  sidebar.classList.remove('open');
  sidebarBackdrop.classList.remove('visible');
});

/* ================================================================
   ÉTAT LOCAL (mis à jour par les listeners temps réel)
   ================================================================ */
let notificationsData = {};
let enigmesData = {};
let targetDateValue = null; // string ISO ou null

function startRealtimeListeners() {
  onValue(ref(db, 'notifications'), (snap) => {
    notificationsData = snap.val() || {};
    renderNotificationsList();
    updateDashboardKpis();
  });

  onValue(ref(db, 'enigmes'), (snap) => {
    enigmesData = snap.val() || {};
    renderEnigmesEditor();
    updateDashboardKpis();
  });

  onValue(ref(db, 'config/targetDate'), (snap) => {
    targetDateValue = snap.val() || null;
    renderTargetDateField();
    updateDashboardKpis();
  });
}

/* ================================================================
   TABLEAU DE BORD — KPI
   ================================================================ */
function updateDashboardKpis() {
  const visibleCount = Object.values(notificationsData).filter(n => n.visible !== false).length;
  document.getElementById('kpi-notif-count').textContent = visibleCount;

  const now = new Date();
  let locked = 0, unlocked = 0;
  DEFAULT_ENIGMES.forEach(e => {
    const effectiveDate = getEffectiveEnigmeDate(e.num);
    if (effectiveDate <= now) unlocked++; else locked++;
  });
  document.getElementById('kpi-enigmes-locked').textContent = locked;
  document.getElementById('kpi-enigmes-unlocked').textContent = unlocked;

  const effectiveTarget = targetDateValue ? new Date(targetDateValue) : DEFAULT_TARGET_DATE;
  document.getElementById('kpi-target-date').textContent = formatDateFr(effectiveTarget);
}

function getEffectiveEnigmeDate(num) {
  const remote = enigmesData[String(num)];
  if (remote && remote.date) {
    const d = new Date(remote.date);
    if (!isNaN(d.getTime())) return d;
  }
  const fallback = DEFAULT_ENIGMES.find(e => e.num === num);
  return fallback ? fallback.date : new Date();
}

/* ================================================================
   NOTIFICATIONS
   ================================================================ */
const notifTitleInput = document.getElementById('notif-title-input');
const notifMessageInput = document.getElementById('notif-message-input');
const notifEditIdInput = document.getElementById('notif-edit-id');
const notifFormTitle = document.getElementById('notif-form-title');
const notifCancelEditBtn = document.getElementById('notif-cancel-edit-btn');

document.getElementById('notif-send-btn').addEventListener('click', async () => {
  const title = notifTitleInput.value.trim();
  const message = notifMessageInput.value.trim();
  if (!title || !message) {
    showToast('Merci de remplir le titre et le message.', true);
    return;
  }

  const editId = notifEditIdInput.value;
  try {
    if (editId) {
      // Modification d'une notification existante (conserve son historique)
      await update(ref(db, `notifications/${editId}`), { title, message });
      showToast('Notification modifiée.');
    } else {
      // Nouvelle notification
      const newRef = push(ref(db, 'notifications'));
      await set(newRef, {
        title,
        message,
        visible: true,
        createdAt: Date.now(),
        date: new Date().toISOString()
      });
      showToast('Notification envoyée.');
    }
    resetNotifForm();
  } catch (err) {
    showToast("Erreur lors de l'envoi : " + err.message, true);
  }
});

notifCancelEditBtn.addEventListener('click', resetNotifForm);

function resetNotifForm() {
  notifEditIdInput.value = '';
  notifTitleInput.value = '';
  notifMessageInput.value = '';
  notifFormTitle.textContent = 'Nouvelle notification';
  notifCancelEditBtn.style.display = 'none';
}

function renderNotificationsList() {
  const container = document.getElementById('notif-list');
  const entries = Object.entries(notificationsData)
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

  if (entries.length === 0) {
    container.innerHTML = '<div class="empty-state">Aucune notification pour le moment.</div>';
    return;
  }

  container.innerHTML = '';
  entries.forEach(([id, n]) => {
    const item = document.createElement('div');
    item.className = 'list-item';
    const isVisible = n.visible !== false;
    const dateLabel = n.createdAt ? formatDateFr(new Date(n.createdAt)) : '—';

    item.innerHTML = `
      <div class="list-item-main">
        <div class="list-item-title">${escapeHtml(n.title)}</div>
        <div class="list-item-sub">${escapeHtml(n.message)}</div>
        <div class="list-item-meta">
          <span class="badge ${isVisible ? 'badge-on' : 'badge-off'}">${isVisible ? 'Visible' : 'Masquée'}</span>
          &nbsp;·&nbsp; ${dateLabel}
        </div>
      </div>
      <div class="list-item-actions">
        <button class="btn btn-ghost btn-sm" data-action="edit">✏️ Modifier</button>
        <button class="btn btn-ghost btn-sm" data-action="toggle">${isVisible ? '🙈 Masquer' : '👁 Afficher'}</button>
        <button class="btn btn-ghost btn-sm" data-action="republish">🔁 Republier</button>
        <button class="btn btn-danger btn-sm" data-action="delete">🗑 Supprimer</button>
      </div>
    `;

    item.querySelector('[data-action="edit"]').addEventListener('click', () => {
      notifEditIdInput.value = id;
      notifTitleInput.value = n.title || '';
      notifMessageInput.value = n.message || '';
      notifFormTitle.textContent = 'Modifier la notification';
      notifCancelEditBtn.style.display = 'inline-flex';
      goToPage('notifications');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    item.querySelector('[data-action="toggle"]').addEventListener('click', async () => {
      try {
        await update(ref(db, `notifications/${id}`), { visible: !isVisible });
      } catch (err) {
        showToast('Erreur : ' + err.message, true);
      }
    });

    item.querySelector('[data-action="republish"]').addEventListener('click', async () => {
      try {
        // Republier = réafficher + rafraîchir createdAt afin qu'elle
        // réapparaisse même si elle avait été fermée par la personne.
        await update(ref(db, `notifications/${id}`), {
          visible: true,
          createdAt: Date.now()
        });
        showToast('Notification republiée.');
      } catch (err) {
        showToast('Erreur : ' + err.message, true);
      }
    });

    item.querySelector('[data-action="delete"]').addEventListener('click', async () => {
      if (!confirm('Supprimer définitivement cette notification ?')) return;
      try {
        await remove(ref(db, `notifications/${id}`));
        showToast('Notification supprimée.');
      } catch (err) {
        showToast('Erreur : ' + err.message, true);
      }
    });

    container.appendChild(item);
  });
}

/* ================================================================
   ÉNIGMES — ÉDITEUR DES 13 DATES
   ================================================================ */
function renderEnigmesEditor() {
  const container = document.getElementById('enigmes-editor');
  container.innerHTML = '';

  DEFAULT_ENIGMES.forEach(e => {
    const effectiveDate = getEffectiveEnigmeDate(e.num);
    const row = document.createElement('div');
    row.className = 'enigme-row';
    row.innerHTML = `
      <div class="enigme-row-num">N°${pad(e.num)}</div>
      <div>
        <div class="enigme-row-title">${escapeHtml(e.title)}</div>
        <div class="enigme-row-current">Actuelle : ${formatDateFr(effectiveDate)}</div>
      </div>
      <input type="datetime-local" data-num="${e.num}" value="${toLocalInputValue(effectiveDate)}">
      <div></div>
    `;
    container.appendChild(row);
  });
}

document.getElementById('enigmes-save-btn').addEventListener('click', async () => {
  const inputs = document.querySelectorAll('#enigmes-editor input[type="datetime-local"]');
  const updates = {};
  let hasInvalid = false;

  inputs.forEach(input => {
    if (!input.value) return;
    const d = new Date(input.value);
    if (isNaN(d.getTime())) { hasInvalid = true; return; }
    updates[`enigmes/${input.dataset.num}/date`] = d.toISOString();
  });

  if (hasInvalid) {
    showToast('Une ou plusieurs dates sont invalides.', true);
    return;
  }

  try {
    await update(ref(db), updates);
    showToast('Dates des énigmes sauvegardées.');
  } catch (err) {
    showToast('Erreur lors de la sauvegarde : ' + err.message, true);
  }
});

/* ================================================================
   DATE FINALE (TARGET_DATE)
   ================================================================ */
function renderTargetDateField() {
  const input = document.getElementById('target-date-input');
  const currentLabel = document.getElementById('target-date-current');
  const effective = targetDateValue ? new Date(targetDateValue) : DEFAULT_TARGET_DATE;
  input.value = toLocalInputValue(effective);
  currentLabel.textContent = 'Date actuelle : ' + formatDateFr(effective);
}

document.getElementById('target-date-save-btn').addEventListener('click', async () => {
  const input = document.getElementById('target-date-input');
  if (!input.value) {
    showToast('Merci de choisir une date.', true);
    return;
  }
  const d = new Date(input.value);
  if (isNaN(d.getTime())) {
    showToast('Date invalide.', true);
    return;
  }
  try {
    await set(ref(db, 'config/targetDate'), d.toISOString());
    showToast('Date finale sauvegardée.');
  } catch (err) {
    showToast('Erreur lors de la sauvegarde : ' + err.message, true);
  }
});
