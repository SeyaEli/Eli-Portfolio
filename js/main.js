const menu = document.querySelector('.menu');
const nav = document.querySelector('#navigation');
function closeMenu(){ nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent='Menu +'; }
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'Close −':'Menu +';nav.classList.toggle('open',open)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
window.matchMedia('(min-width:701px)').addEventListener('change',e=>{if(e.matches)closeMenu()});
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));let count=0;document.querySelectorAll('.project').forEach(card=>{card.hidden=button.dataset.filter!=='All projects'&&button.dataset.filter!==card.dataset.category;if(!card.hidden)count++});document.querySelector('#filter-status').textContent=`Showing ${count} projects`;}));
const clock=document.querySelector('.local-time');
if(clock){const update=()=>clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Manila',hour:'2-digit',minute:'2-digit'}).format(new Date())+' PHT';update();setInterval(update,60000)}
const art=document.querySelector('.hero-art');const sculpture=document.querySelector('.sculpture');let rotation=0;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function pose(x=0,y=0){if(sculpture)sculpture.style.transform=`rotateX(${-19+y}deg) rotateY(${-27+x+rotation}deg) rotateZ(-15deg)`}
art?.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=art.getBoundingClientRect();pose((e.clientX-r.left-r.width/2)/25,-(e.clientY-r.top-r.height/2)/30)});
art?.addEventListener('pointerleave',()=>pose());
document.querySelector('.rotate-art')?.addEventListener('click',()=>{rotation+=90;pose()});
document.querySelector('.copy-email')?.addEventListener('click',async()=>{const status=document.querySelector('.copy-status');try{await navigator.clipboard.writeText('johneliseo.cea12@gmail.com');status.textContent='Email address copied.'}catch{status.textContent='Select the email address above to copy it, or click it to open your email app.'}});
document.querySelector('#contact-form')?.addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const subject=`${data.get('topic')} — ${data.get('name')}`;const body=`Hi Eli,\n\n${data.get('message')}\n\nFrom: ${data.get('name')}\nReply to: ${data.get('email')}`;window.location.href=`mailto:johneliseo.cea12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;document.querySelector('#form-status').textContent='Your email draft is ready to open. If no email app opened, use the address on this page to send your message.'});
