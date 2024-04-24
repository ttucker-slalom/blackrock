import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const contentPath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const fragment = await loadFragment(contentPath);
  block.textContent = '';
  const content = document.createElement('div');
  while (fragment.firstElementChild) content.append(fragment.firstElementChild);
  block.append(content);
}
