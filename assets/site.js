const search = document.querySelector('#publication-search');
const papers = [...document.querySelectorAll('[data-publication]')];
const count = document.querySelector('#publication-count');
const noResults = document.querySelector('#no-results');
if (search) {
  search.addEventListener('input', () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    for (const paper of papers) {
      const match = paper.dataset.search.includes(query);
      paper.hidden = !match;
      if (match) visible++;
    }
    count.textContent = `${visible} ${visible === 1 ? 'publication' : 'publications'}`;
    noResults.hidden = visible > 0;
  });
}
document.addEventListener('click', async event => {
  const toggle = event.target.closest('[data-toggle]');
  if (toggle) {
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    return;
  }
  const copy = event.target.closest('[data-copy]');
  if (copy) {
    const text = document.getElementById(copy.dataset.copy).textContent;
    const feedback = copy.nextElementSibling;
    try {
      await navigator.clipboard.writeText(text);
      feedback.textContent = 'Copied';
      setTimeout(() => { feedback.textContent = ''; }, 2000);
    } catch {
      feedback.textContent = 'Please select and copy the citation below.';
    }
  }
});
