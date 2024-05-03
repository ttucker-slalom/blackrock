import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function createAnchorEl() {
  const cardsContainer = document.querySelector('.card-cta');
  if (cardsContainer) {
    const cards = cardsContainer.querySelectorAll('li');
    if (cards) {
      for (let i = 0; i < cards.length; i += 1) {
        const wrapper = document.createElement('a');
        const link = cards[i].querySelector('a').href;
        wrapper.setAttribute('href', link);
        wrapper.append(...cards[i].children);
        cards[i].appendChild(wrapper);
      }
    }
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 0) div.remove();
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      if (div.children.length === 1 && div.querySelector('a')) div.className = 'cards-card-link';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
  createAnchorEl();
}
