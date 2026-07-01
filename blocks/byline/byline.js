export default function decorate(block) {
  const [imageWrapper, nameWrapper, occupationsWrapper] = block.children;
  if (imageWrapper) imageWrapper.classList.add('byline-image');
  if (nameWrapper) nameWrapper.classList.add('byline-name');
  if (occupationsWrapper) {
    occupationsWrapper.classList.add('byline-occupations');
    const list = occupationsWrapper.querySelector('ul');
    if (list) {
      const items = [...list.querySelectorAll('li')];
      items.sort((a, b) => a.textContent.localeCompare(b.textContent));
      items.forEach((li) => list.append(li));
    }
  }
}
