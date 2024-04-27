import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function expandSection(block) {
  if (block) {
    requestAnimationFrame(() => {
      const gray = block.querySelector('.gray');
      if (gray) {
        const button = gray.querySelector('.button');
        if (button) {
          const buttonContainer = button.parentElement;
          const defaultContainer = buttonContainer.parentElement;
          button.addEventListener('click', (e) => {
            e.preventDefault();
            defaultContainer.style.display = 'none';
            gray.style.maxHeight = `${gray.scrollHeight}px`;
          });
        }
      }
    });
  }
}

function createClassNames(block) {
  if (block) {
    requestAnimationFrame(() => {
      const gray = block.querySelector('.gray');
      if (gray) {
        const columnsBlock = gray.querySelector('.columns');
        if (columnsBlock) {
          columnsBlock.querySelectorAll(':scope > div div').forEach((column0) => {
            if (column0.querySelector('ul')) {
              const level0 = column0.querySelector('ul');
              level0.classList.add('main-column');
              level0.querySelectorAll(':scope > li > ul').forEach((column1) => {
                if (column1) {
                  column1.classList.add('column-level-1');
                  column1.querySelectorAll(':scope > li > ul').forEach((column2) => {
                    if (column2) {
                      column2.classList.add('column-level-2');
                    }
                  });
                }
              });
            }
          });
        }
      }
    });
  }
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  createClassNames(block);
  expandSection(block);
  block.append(footer);
}
