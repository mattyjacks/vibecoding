window.DVA={};
const dvaBase=new URL('.',document.currentScript.src);
(async()=>{for(const name of ['navigation','reveal','counters','contact','motion','scroll','year','active-section']){try{await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(name+'.js',dvaBase).href;script.onload=resolve;script.onerror=reject;document.head.append(script)});const method='init'+name.split('-').map(part=>part[0].toUpperCase()+part.slice(1)).join('');window.DVA[method]?.()}catch(error){console.warn('DVA enhancement unavailable:',name)}}})();
