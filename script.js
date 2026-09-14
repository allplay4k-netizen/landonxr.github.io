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
