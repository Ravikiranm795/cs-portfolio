document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.main-nav a').forEach((link) => {
    const linkPath = link.getAttribute('href').split('/').pop();
    link.classList.toggle('active', linkPath === path || (path === '' && linkPath === 'index.html'));
  });

  const tabs = document.querySelectorAll('.works-tab');
  if (tabs.length) {
    const cards = document.querySelectorAll('.work-list-card');
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        cards.forEach((card) => {
          card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }
});
