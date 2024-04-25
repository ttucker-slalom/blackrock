/* eslint-disable linebreak-style */
import { fetchPlaceholders } from '../../scripts/aem.js';

let intervalId;

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function startAutoScroll(block) {
  intervalId = setInterval(() => {
    const activeSlideIndex = parseInt(block.dataset.activeSlide, 10);
    const nextSlideIndex = (activeSlideIndex + 1) % block.querySelectorAll('.carousel-slide').length;
    showSlide(block, nextSlideIndex);
  }, 6000);
}

function stopAutoScroll() {
  clearInterval(intervalId);
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  const scrollingContainer = block.querySelector('.carousel-slides');
  const slides = block.querySelectorAll('.carousel-slide');
  let isMouseDown = false;
  let startX = 0;
  let scrollLeft = 0;
  let visibleSlideIndex = -1;

  scrollingContainer.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    startX = e.pageX - scrollingContainer.offsetLeft;
    scrollLeft = scrollingContainer.scrollLeft;

    // Find the current visible slide
    slides.forEach((slide, index) => {
      if (slide.getAttribute('aria-hidden') === 'false') {
        visibleSlideIndex = index;
      }
    });
  });

  scrollingContainer.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  scrollingContainer.addEventListener('mouseup', (e) => {
    isMouseDown = false;

    if (visibleSlideIndex !== -1) {
      const visibleSlideRect = slides[visibleSlideIndex].getBoundingClientRect();
      const slideWidth = visibleSlideRect.width;
      const offset = 0.2 * slideWidth;

      const currentX = e.pageX - scrollingContainer.offsetLeft;
      const diffX = currentX - startX;

      if (diffX < 0) { // mouse moving right
        if (visibleSlideIndex < slides.length - 1) {
          const nextSlideRect = slides[visibleSlideIndex + 1].getBoundingClientRect();
          if (slideWidth - nextSlideRect.left > offset) {
            showSlide(block, visibleSlideIndex + 1);
            return;
          }
        }
      } else if (diffX > 0) { // mouse moving left
        if (visibleSlideIndex > 0) {
          const prevSlideRect = slides[visibleSlideIndex - 1].getBoundingClientRect();
          if (prevSlideRect.right > offset) {
            showSlide(block, visibleSlideIndex - 1);
            return;
          }
        }
      }
      // Stay where you are if 20% threshold is not crossed
      showSlide(block, visibleSlideIndex);
    }
  });

  scrollingContainer.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - scrollingContainer.offsetLeft;
    const walk = (x - startX) * 2;
    scrollingContainer.scrollLeft = scrollLeft - walk;
  });

  block.addEventListener('mouseenter', () => {
    stopAutoScroll(); // Stop auto-scrolling when mouse enters the slider
  });

  block.addEventListener('mouseleave', () => {
    startAutoScroll(block); // Start auto-scrolling when mouse leaves the slider
  });

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      showSlide(block, visibleSlideIndex);
    }, 1000);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    block.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class= "slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);

  if (!isSingleSlide) {
    bindEvents(block);
    startAutoScroll(block);
  }
}
