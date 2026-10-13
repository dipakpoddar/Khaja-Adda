const tabButtons = document.querySelectorAll('.tab-btn');
const chips = document.querySelectorAll('.chip');
const cards = document.querySelectorAll('.food-card');
const revealNodes = document.querySelectorAll('.reveal');

const activateTab = (targetId, triggerButton) => {
  tabButtons.forEach((btn) => btn.classList.remove('active'));
  triggerButton.classList.add('active');
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

tabButtons.forEach((button) => {
  button.addEventListener('click', () => activateTab(button.dataset.target, button));
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');

    const filter = chip.dataset.filter;
    cards.forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.type === filter;
      card.classList.toggle('hide', !shouldShow);
    });
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

revealNodes.forEach((node) => observer.observe(node));

const reviewTrack = document.getElementById('review-track');
let tilt = 0;

setInterval(() => {
  if (!reviewTrack) return;
  tilt = tilt ? 0 : 1;
  reviewTrack.style.transform = `translateY(${tilt}px)`;
}, 1800);
