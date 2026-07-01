export default function decorate(block) {
  const [imageWrapper, nameWrapper, occupationsWrapper] = block.children;
  if (imageWrapper) imageWrapper.classList.add('byline-image');
  if (nameWrapper) nameWrapper.classList.add('byline-name');
  if (occupationsWrapper) {
    occupationsWrapper.classList.add('byline-occupations');
    const items = [...occupationsWrapper.querySelectorAll('p')];
    items.sort((a, b) => a.textContent.localeCompare(b.textContent));
    items.forEach((p) => occupationsWrapper.append(p));
  }
}
