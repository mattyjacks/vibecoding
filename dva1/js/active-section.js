window.DVA.initActiveSection=()=>{
 const links=[...document.querySelectorAll('.nav-links a')];
 if(!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(!entry.isIntersecting)continue;
   for(const link of links){if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')}
  }
 },{rootMargin:'-20% 0px -55% 0px',threshold:0});
 document.querySelectorAll('#about,#services,#partnership,#contact').forEach(section=>observer.observe(section));
};
