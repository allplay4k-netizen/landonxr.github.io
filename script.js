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

// Subtle Matrix-style numbers and symbols falling behind the page.
const fallingCode = document.querySelector('.falling-code');
const chars = '01 01 101 110 001 100 <>{}[] /\\ +-= *# @ $ % ^ & | : ; ? XR LANDON';

for (let i = 0; i < 34; i++) {
  const column = document.createElement('div');
  column.className = `code-column${Math.random() > 0.55 ? ' light' : ''}`;
  column.textContent = Array.from({ length: 12 + Math.floor(Math.random() * 18) }, () => {
    return chars[Math.floor(Math.random() * chars.length)];
  }).join('\n');
  column.style.left = `${Math.random() * 100}%`;
  column.style.animationDuration = `${9 + Math.random() * 16}s`;
  column.style.animationDelay = `${-Math.random() * 22}s`;
  column.style.opacity = `${0.2 + Math.random() * 0.55}`;
  fallingCode.appendChild(column);
}
