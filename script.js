// First-visit welcome popup.
const welcomeOverlay = document.createElement('div');
welcomeOverlay.className = 'welcome-overlay';
welcomeOverlay.id = 'welcomeOverlay';
welcomeOverlay.setAttribute('aria-hidden', 'false');
welcomeOverlay.innerHTML = `
  <div class="welcome-popup" role="dialog" aria-modal="true" aria-labelledby="welcomeTitle">
    <button class="welcome-close" id="welcomeClose" aria-label="Close welcome message">×</button>
    <div class="welcome-label">LANDON<span>XR</span></div>
    <h2 id="welcomeTitle">Welcome to LandonXR</h2>
    <p class="welcome-intro">Looks like it's your first time here.</p>
    <p>This site is my personal space for showing off my coding projects, experiments, VR and gaming content, hardware projects, and 3D designs.</p>
    <p>It's still a work in progress, so more features, projects, and updates are coming as I keep building it.</p>
    <p class="welcome-domain">I'm also working on getting an <strong>is-a.dev</strong> subdomain for the site.</p>
    <button class="welcome-button" id="welcomeContinue">Explore LandonXR</button>
  </div>
`;
document.body.prepend(welcomeOverlay);

document.body.style.overflow = 'hidden';

const closeWelcome = () => {
  welcomeOverlay.classList.add('hidden');
  welcomeOverlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  localStorage.setItem('landonxrWelcomeSeen', 'true');
};

document.getElementById('welcomeClose').addEventListener('click', closeWelcome);
document.getElementById('welcomeContinue').addEventListener('click', closeWelcome);
welcomeOverlay.addEventListener('click', (event) => {
  if (event.target === welcomeOverlay) closeWelcome();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !welcomeOverlay.classList.contains('hidden')) closeWelcome();
});

if (localStorage.getItem('landonxrWelcomeSeen') === 'true') {
  closeWelcome();
}

const cards = document.querySelectorAll('.card, .project');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

cards.forEach((card) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(14px)';
  card.style.transition = 'opacity .55s ease, transform .55s ease, border-color .25s ease, background .25s ease';
  observer.observe(card);
});

// Subtle blue code falling through the background.
const fallingCode = document.querySelector('.falling-code');

if (fallingCode) {
  const chars = '01 10 11 001 101 < > { } / + - =';
  const columns = Math.max(12, Math.floor(window.innerWidth / 85));

  for (let i = 0; i < columns; i++) {
    const column = document.createElement('div');
    column.className = `code-column${Math.random() > 0.75 ? ' light' : ''}`;

    const lines = 10 + Math.floor(Math.random() * 12);
    column.textContent = Array.from({ length: lines }, () => {
      const length = 2 + Math.floor(Math.random() * 3);
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }).join('\n');

    column.style.left = `${(i / columns) * 100 + (Math.random() * 4 - 2)}%`;
    column.style.animationDuration = `${11 + Math.random() * 16}s`;
    column.style.animationDelay = `${-Math.random() * 24}s`;
    column.style.opacity = `${0.18 + Math.random() * 0.28}`;
    fallingCode.appendChild(column);
  }
}
