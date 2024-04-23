import ffetch from '../../scripts/ffetch.js';

export function getOrigin() {
   return window.location.href === 'about:srcdoc' ? window.parent.location.origin : window.location.origin;
 }

/* eslint-disable no-underscore-dangle */
export default async function decorate(block) {
  
   const offerpath = block.querySelector(':scope div:nth-child(1) > div a').innerHTML.trim();

    console.log( offerpath);
    
    const insightsUrl = new URL('https://publish-p11802-e92257.adobeaemcloud.com/graphql/execute.json/aem-demo-assets/adventure-by-path;adventurePath='+offerpath);


    //const insightsUrl = new URL('https://lifesciences.danaher.com/us/en/solutions-index.json', getOrigin());
   const insights = await ffetch(insightsUrl).first();

   let i = 0;
   for await (const insight of insights) {
     console.log(insight._path);
   }

   
  }