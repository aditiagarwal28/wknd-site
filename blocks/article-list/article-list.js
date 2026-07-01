import { createOptimizedPicture } from '../../scripts/aem.js';

function readOptions(block) {
  const rows = [...block.children];
  const options = { path: '', limit: 0, excludeCurrent: false };
  if (rows[0]) options.path = rows[0].textContent.trim();
  if (rows[1]) options.limit = parseInt(rows[1].textContent.trim(), 10) || 0;
  if (rows[2]) options.excludeCurrent = rows[2].textContent.trim().toLowerCase() === 'true';
  return options;
}

async function fetchIndex() {
  const resp = await fetch('/query-index.json');
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.data || [];
}

function buildCard(entry) {
  const li = document.createElement('li');
  const imageDiv = document.createElement('div');
  imageDiv.className = 'article-list-card-image';
  if (entry.image) {
    const picture = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]);
    imageDiv.append(picture);
  }
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'article-list-card-body';
  bodyDiv.innerHTML = `
    <h3><a href="${entry.path}">${entry.title || entry.path}</a></h3>
    <p>${entry.description || ''}</p>
  `;
  li.append(imageDiv, bodyDiv);
  return li;
}

export default async function decorate(block) {
  const { path, limit, excludeCurrent } = readOptions(block);
  block.textContent = '';

  const currentPath = window.location.pathname;
  let entries = await fetchIndex();
  if (path) entries = entries.filter((e) => e.path.startsWith(path));
  if (excludeCurrent) entries = entries.filter((e) => e.path !== currentPath);
  entries.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
  if (limit) entries = entries.slice(0, limit);

  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(buildCard(entry)));
  block.append(ul);
}
