export default function decorate(block) {
  const [imageWrapper, textWrapper] = block.children;
  if (imageWrapper) imageWrapper.classList.add('teaser-image');
  if (textWrapper) textWrapper.classList.add('teaser-text');
}
