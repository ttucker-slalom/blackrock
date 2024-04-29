/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */
let isIfrmae = false;
function iniFrame() {
  if (window.location !== window.parent.location) {
    // The page is in an iFrames
    isIfrmae = true;
  }
}

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  iniFrame();
  if (!isIfrmae) {
    [...block.children].forEach((row) => {
      // decorate accordion item label
      const label = row.children[0];
      const summary = document.createElement('summary');
      summary.className = 'accordion-item-label';
      summary.append(...label.childNodes);
      if (!hasWrapper(summary)) {
        summary.innerHTML = `<p>${summary.innerHTML}</p>`;
      }
      // decorate accordion item body
      const body = row.children[1];
      body.className = 'accordion-item-body';
      if (!hasWrapper(body)) {
        body.innerHTML = `<p>${body.innerHTML}</p>`;
      }
      // decorate accordion item
      const details = document.createElement('details');
      details.className = 'accordion-item';
      details.append(summary, body);
      row.replaceWith(details);
    });
  }
}
