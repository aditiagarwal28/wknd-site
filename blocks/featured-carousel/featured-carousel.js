function goToSlide(block, index) {
  const slides = block.querySelectorAll('.carousel-slide');
  const dots = block.querySelectorAll('.carousel-dot');
  const total = slides.length;
  const target = ((index % total) + total) % total;
  block.querySelector('.carousel-track').style.transform = `translateX(-${target * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle('active', i === target));
  block.dataset.activeSlide = target;
}

export default function decorate(block) {
  const items = [...block.children];
  const track = document.createElement('div');
  track.className = 'carousel-track';

  items.forEach((item) => {
    item.classList.add('carousel-slide');
    const [imageWrapper, textWrapper] = item.children;
    if (imageWrapper) imageWrapper.classList.add('carousel-slide-image');
    if (textWrapper) textWrapper.classList.add('carousel-slide-text');
    track.append(item);
  });

  block.textContent = '';
  block.append(track);

  if (items.length > 1) {
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'carousel-arrow carousel-prev';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.addEventListener('click', () => goToSlide(block, (parseInt(block.dataset.activeSlide, 10) || 0) - 1));

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'carousel-arrow carousel-next';
    next.setAttribute('aria-label', 'Next slide');
    next.addEventListener('click', () => goToSlide(block, (parseInt(block.dataset.activeSlide, 10) || 0) + 1));

    const dots = document.createElement('div');
    dots.className = 'carousel-dots';
    items.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(block, i));
      dots.append(dot);
    });

    block.append(prev, next, dots);
  }

  block.dataset.activeSlide = 0;
  goToSlide(block, 0);
}
