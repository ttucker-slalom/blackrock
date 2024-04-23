// import ffetch from '../../scripts/ffetch.js';

// export function getOrigin() {
//    return window.location.href === 'about:srcdoc' ? window.parent.location.origin : window.location.origin;
//  }

// /* eslint-disable no-underscore-dangle */
// export default async function decorate(block) {
  
//    const offerpath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();

//     console.log( offerpath);
    
//    const insightsUrl = new URL('https://publish-p11802-e92257.adobeaemcloud.com/graphql/execute.json/aem-demo-assets/adventure-by-path;adventurePath='+offerpath);
//     //const insightsUrl = new URL('https://publish-p11802-e92257.adobeaemcloud.com/graphql/execute.json/aem-demo-assets/adventures-all');
    


//     //const insightsUrl = new URL('https://lifesciences.danaher.com/us/en/solutions-index.json', getOrigin());
//    const insights = await ffetch(insightsUrl).first();
//    let i = 0;
//    for await (const insight of insights) {
//      console.log(insight.adventureByPath.item._path);
//    }

   
// }

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
    const aempublishurl = 'https://publish-p11802-e92257.adobeaemcloud.com';
    const aemauthorurl = 'https://author-p11802-e92257.adobeaemcloud.com';
    const persistedquery = '/graphql/execute.json/aem-demo-assets/adventure-by-path';
    const insightsPath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();
    //const variationname = block.querySelector(':scope div:nth-child(2) > div').innerHTML.trim();
  
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
    <div class='creditcard' data-aue-resource=${itemId} data-aue-type="reference" data-aue-filter="cf">
        <div>
            <p data-aue-prop="headline" data-aue-type="text" class='ccname'>${cfReq.title}</p>
            <p data-aue-prop="headline" data-aue-type="text" class='ccname'>${cfReq.description.plaintext}</p>
        </div>
        <div class='banner-logo'>
        </div>
    </div>
  `;
  }
  