const NETWORKS = [
  {
    name: 'facebook',
    label: 'Facebook',
    shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'pinterest',
    label: 'Pinterest',
    shareUrl: (url, title) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
];

export default function decorate(block) {
  const { href: url } = window.location;
  const { title } = document;
  block.textContent = '';

  const ul = document.createElement('ul');
  NETWORKS.forEach(({ name, label, shareUrl }) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${shareUrl(url, title)}" class="sharing-${name}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    ul.append(li);
  });
  block.append(ul);
}
