// script.js
// Safe initialization: create observer first, then render and observe

// Config
const BATCH = 4; // notes per batch
let shown = 0;   // how many notes currently shown
let revealObserver = null;
let infiniteObserver = null;

document.addEventListener('DOMContentLoaded', () => {
  setupRevealOnScroll();   // for fade-in animation
  renderBatch();           // initial batch
  setupInfiniteScroll();   // load next batch automatically

  // Accessibility: reveal all if user prefers reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealAllImmediately();
  }
});

// Render a batch of notes from the global `notes` array (from notes.js)
function renderBatch() {
  const container = document.getElementById('timeline');
  if (!container) return;
  const remaining = notes.length - shown;
  const toAdd = Math.min(BATCH, remaining);

  for (let i = 0; i < toAdd; i++) {
    const idx = shown + i;
    const n = notes[idx];
    const el = document.createElement('article');
    el.className = 'note';
    el.setAttribute('tabindex', '0');
    el.innerHTML = `
      <div class="note-number">#${idx + 1}</div>
      <h2>${escapeHtml(n.title)}</h2>
      <p>${escapeHtml(n.description)}</p>
      <small>${escapeHtml(n.date || '')}</small>
    `;
    container.appendChild(el);
  }
  shown += toAdd;

  // Observe new notes for reveal animation
  observeNewNotes();

  // Reattach infinite scroll sentinel if not done yet
  if (shown < notes.length) setupInfiniteScroll();
}

// Setup fade-in animation observer
function setupRevealOnScroll() {
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
}

// Observe all newly added notes
function observeNewNotes() {
  if (!revealObserver) return;
  const nodes = document.querySelectorAll('.note:not(.visible)');
  nodes.forEach(n => revealObserver.observe(n));
}

// Automatically load next batch when user scrolls near the end
function setupInfiniteScroll() {
  if (infiniteObserver) infiniteObserver.disconnect();

  const container = document.getElementById('timeline');
  if (!container) return;

  const sentinel = document.createElement('div');
  sentinel.id = 'scrollSentinel';
  container.appendChild(sentinel);

  infiniteObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        infiniteObserver.unobserve(entry.target);
        sentinel.remove();
        renderBatch(); // load next batch
      }
    });
  }, { rootMargin: '200px' });

  infiniteObserver.observe(sentinel);
}

// Accessibility helper: reveal everything if user requests reduced motion
function revealAllImmediately() {
  const container = document.getElementById('timeline');
  while (shown < notes.length) renderBatch();
  document.querySelectorAll('.note').forEach(n => n.classList.add('visible'));
}

// Simple HTML escape
function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}


// === Love Timer ===
function updateLoveTimer() {
  const startDate = new Date("2023-03-01T00:00:00");
  const now = new Date();

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");

  const timerText = `${years} years ${months} months ${days} days - ${hours}:${minutes}:${seconds} together 🤎`;
  document.getElementById("loveTimer").textContent = timerText;
}

updateLoveTimer();
setInterval(updateLoveTimer, 1000);


const bgSound = document.getElementById('bgSound');
const soundToggle = document.getElementById('soundToggle');
let soundOn = false;

soundToggle.addEventListener('click', () => {
  if (soundOn) {
    bgSound.pause();
    soundToggle.textContent = '🌊';
  } else {
    bgSound.play().catch(() => {}); // ignore autoplay block
    soundToggle.textContent = '🔊';
  }
  soundOn = !soundOn;
});