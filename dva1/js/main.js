window.DVA={};
const dvaBase=new URL('.',document.currentScript.src);
(async()=>{for(const name of ['navigation','reveal','counters','contact','motion','scroll','year']){try{await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL(name+'.js',dvaBase).href;script.onload=resolve;script.onerror=reject;document.head.append(script)});const method='init'+name[0].toUpperCase()+name.slice(1);window.DVA[method]?.()}catch(error){console.warn('DVA enhancement unavailable:',name)}}})();
