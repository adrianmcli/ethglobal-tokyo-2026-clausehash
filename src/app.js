const $ = (selector) => document.querySelector(selector);

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.toggle('active', item === tab));
    document.querySelectorAll('.panel').forEach((panel) => {
      const active = panel.id === tab.dataset.panel;
      panel.classList.toggle('active', active);
      panel.hidden = !active;
    });
  });
}
