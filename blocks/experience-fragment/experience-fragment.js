import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) {
  const xfPath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const fragment = await loadFragment(`${xfPath}/master`);
  block.textContent = '';
  const xf = document.createElement('div');
  while (fragment.firstElementChild) xf.append(fragment.firstElementChild);
  block.append(xf);
}
