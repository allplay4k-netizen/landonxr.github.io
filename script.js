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

// Blue Matrix-style numbers and symbols falling across the background.
const fallingCode = document.querySelector('.falling-code');

if (fallingCode) {
  const chars = '01 10 11 001 101 110 010 < > { } [ ] / \\ + - = * # @ $ % ^ & | : ; ?';
  const columns = Math.max(24, Math.floor(window.innerWidth / 42));

  for (let i = 0; i < columns; i++) {
    const column = document.createElement('div');
    column.className = `code-column${Math.random() > 0.5 ? ' light' : ''}`;

    const lines = 18 + Math.floor(Math.random() * 22);
    column.textContent = Array.from({ length: lines }, () => {
      const length = 2 + Math.floor(Math.random() * 4);
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }).join('\n');

    column.style.left = `${(i / columns) * 100 + (Math.random() * 2 - 1)}%`;
    column.style.animationDuration = `${8 + Math.random() * 14}s`;
    column.style.animationDelay = `${-Math.random() * 20}s`;
    column.style.opacity = `${0.35 + Math.random() * 0.65}`;
    fallingCode.appendChild(column);
  }
}
