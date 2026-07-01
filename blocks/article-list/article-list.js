import { createOptimizedPicture } from '../../scripts/aem.js';

function readOptions(block) {
  const rows = [...block.children];
  const options = {
    path: '', limit: 0, excludeCurrent: false, allArticlesLink: '',
  };
  if (rows[0]) options.path = rows[0].textContent.trim();
  if (rows[1]) options.limit = parseInt(rows[1].textContent.trim(), 10) || 0;
  if (rows[2]) options.excludeCurrent = rows[2].textContent.trim().toLowerCase() === 'true';
  if (rows[3]) options.allArticlesLink = rows[3].textContent.trim();
  return options;
}

async function fetchIndex() {
  const resp = await fetch('/query-index.json');
  if (!resp.ok) return [];
  const json = await resp.json();
  return json.data || [];
}

function buildCard(entry, showCta) {
  const li = document.createElement('li');
  const imageDiv = document.createElement('div');
  imageDiv.className = 'article-list-card-image';
  if (entry.image) {
    const picture = createOptimizedPicture(entry.image, entry.title || '', false, [{ width: '750' }]);
    imageDiv.append(picture);
  }
  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'article-list-card-body';

  const title = document.createElement('h3');
  const titleLink = document.createElement('a');
  titleLink.href = entry.path;
  titleLink.textContent = entry.title || entry.path;
  title.append(titleLink);

  const description = document.createElement('p');
  description.textContent = entry.description || '';

  bodyDiv.append(title, description);

  if (showCta) {
    const cta = document.createElement('p');
    const ctaLink = document.createElement('a');
    ctaLink.href = entry.path;
    ctaLink.className = 'button';
    ctaLink.textContent = 'Full Article';
    cta.append(ctaLink);
    bodyDiv.append(cta);
  }

  li.append(imageDiv, bodyDiv);
  return li;
}

function buildAllArticlesLink(href) {
  const p = document.createElement('p');
  p.className = 'article-list-all-link';
  const a = document.createElement('a');
  a.href = href;
  a.className = 'button';
  a.textContent = 'All Articles';
  p.append(a);
  return p;
}

export default async function decorate(block) {
  const {
    path, limit, excludeCurrent, allArticlesLink,
  } = readOptions(block);
  block.textContent = '';

  const currentPath = window.location.pathname;
  let entries = await fetchIndex();
  if (path) entries = entries.filter((e) => e.path.startsWith(`${path}/`));
  if (excludeCurrent) entries = entries.filter((e) => e.path !== currentPath);
  entries.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
  if (limit) entries = entries.slice(0, limit);

  const showCta = !allArticlesLink;
  const ul = document.createElement('ul');
  entries.forEach((entry) => ul.append(buildCard(entry, showCta)));
  block.append(ul);

  if (allArticlesLink) block.append(buildAllArticlesLink(allArticlesLink));
}
