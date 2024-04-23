export default async function decorate(block) {
  const aempublishurl = 'https://publish-p11802-e92257.adobeaemcloud.com';
  const aemauthorurl = 'https://author-p11802-e92257.adobeaemcloud.com';
  const persistedquery = '/graphql/execute.json/aem-demo-assets/adventure-by-path';
  const insightsPath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
  const url = window.location && window.location.origin && window.location.origin.includes('author')
    ? `${aemauthorurl}${persistedquery};adventurePath=${insightsPath};`
    : `${aempublishurl}${persistedquery};adventurePath=${insightsPath};`;
  const options = { credentials: 'include' };
  const cfReq = await fetch(url, options)
    .then((response) => response.json())
    .then((contentfragment) => {
      let offer = '';
      if (contentfragment.data) {
        offer = contentfragment.data.adventureByPath.item;
      }
      return offer;
    });
  const itemId = `urn:aemconnection:${insightsPath}/jcr:content/data/master`;
  block.innerHTML = `
    <div class='insights' data-aue-resource=${itemId} data-aue-type="reference" data-aue-filter="cf">
        <div>
          <h2 data-aue-prop="headline" data-aue-type="text" class='insights-title'>${cfReq.title}</h2>
          <p data-aue-prop="headline" data-aue-type="text" class='insights-description'>${cfReq.description.plaintext}</p>
        </div>
    </div>
  `;
}
