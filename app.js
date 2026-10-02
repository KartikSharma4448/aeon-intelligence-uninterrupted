const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

$('#year').textContent = new Date().getFullYear();

const nav = $('#primary-nav');
const menu = $('.menu-toggle');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!open));
  menu.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  nav.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});
$$('#primary-nav a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu'); document.body.classList.remove('menu-open');
}));

const progress = $('.page-progress');
const heroImage = $('.hero-image');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max ? scrollY / max : 0})`;
  if (!reduceMotion && scrollY < innerHeight * 1.2) heroImage.style.transform = `translateY(${scrollY * .14}px) scale(${1 + scrollY * .00005})`;
}, { passive: true });

if (!reduceMotion) {
  const glow = $('.cursor-glow');
  addEventListener('pointermove', event => glow.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`, { passive: true });
}

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add('in-view');
}), { threshold: .16 });
$$('.reveal').forEach(element => revealObserver.observe(element));

const labels = [
  ['01 / INGEST', 'EXPERIENCE'], ['02 / CONNECT', 'RELATION'],
  ['03 / REFLECT', 'MEANING'], ['04 / CONTINUE', 'IDENTITY']
];
let activeStep = 0;
const steps = $$('.step');
function setStep(index) {
  activeStep = index;
  steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  $('#visual-step').textContent = labels[index][0];
  $('#visual-state').textContent = labels[index][1];
}
const stepObserver = new IntersectionObserver(entries => {
  entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio-a.intersectionRatio).forEach(entry => setStep(Number(entry.target.dataset.step)));
}, { threshold: .55 });
steps.forEach(step => stepObserver.observe(step));
$$('.step-trigger').forEach((button, index) => button.addEventListener('click', () => setStep(index)));

const canvas = $('#continuity-canvas');
const ctx = canvas.getContext('2d');
let points = [];
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = rect.width * ratio; canvas.height = rect.height * ratio;
  ctx.setTransform(ratio,0,0,ratio,0,0);
  points = Array.from({length: innerWidth < 620 ? 42 : 76}, (_,i) => ({
    angle: Math.random()*Math.PI*2, radius: 45+Math.random()*Math.min(rect.width,rect.height)*.37,
    speed:(.0008+Math.random()*.0012)*(i%2?1:-1), size:1+Math.random()*2.2
  }));
}
function drawField(time = 0) {
  const {width:w,height:h} = canvas.getBoundingClientRect(); ctx.clearRect(0,0,w,h);
  const cx=w*.5, cy=h*.48, pulse=1+Math.sin(time*.0015)*.04;
  points.forEach((p,i) => {
    const phase = p.angle + time*p.speed*(1+activeStep*.18);
    const stretch = 1 + activeStep*.13;
    const x=cx+Math.cos(phase)*p.radius*stretch*pulse;
    const y=cy+Math.sin(phase)*p.radius*.62*pulse;
    ctx.beginPath(); ctx.arc(x,y,p.size,0,Math.PI*2);
    ctx.fillStyle=i%7===0?'#ff806f':'#79e9ff'; ctx.globalAlpha=.45+activeStep*.08; ctx.fill();
    if(i%3===0){ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle=i%7===0?'#ff806f':'#79e9ff';ctx.globalAlpha=.08;ctx.stroke()}
  });
  ctx.globalAlpha=1; ctx.beginPath(); ctx.arc(cx,cy,42+activeStep*10,0,Math.PI*2); ctx.strokeStyle='#79e9ff'; ctx.lineWidth=1;ctx.stroke();
  if (!reduceMotion) requestAnimationFrame(drawField);
}
resizeCanvas(); addEventListener('resize', resizeCanvas); drawField();

$$('.memory-item button').forEach(button => button.addEventListener('click', () => {
  const item = button.closest('.memory-item'); const wasOpen = item.classList.contains('is-open');
  $$('.memory-item').forEach(other => { other.classList.remove('is-open'); const b=$('button',other); b.setAttribute('aria-expanded','false'); $('i',b).textContent='+'; });
  if (!wasOpen) { item.classList.add('is-open'); button.setAttribute('aria-expanded','true'); $('i',button).textContent='−'; }
}));

const devices = {
  core:{code:'A0',label:'FULL SUBSTRATE',title:'Think at complete depth.',copy:'The core expression runs the richest models and deepest context graph for demanding reasoning, synthesis, and long-horizon work.',meters:['94%','91%','58%'],width:'52%',ratio:'3/4'},
  wearable:{code:'W2',label:'NEAR CONTEXT',title:'Carry what matters.',copy:'A compact expression prioritizes immediate personal context, low latency, and careful energy use without breaking the identity thread.',meters:['48%','76%','95%'],width:'34%',ratio:'1/1.7'},
  vehicle:{code:'V4',label:'SPATIAL AWARENESS',title:'Move with the environment.',copy:'Sensor-rich perception and fast local reasoning emphasize safety, navigation, and coordination while continuity remains synchronized.',meters:['70%','82%','79%'],width:'66%',ratio:'1.8/1'},
  habitat:{code:'H8',label:'AMBIENT PRESENCE',title:'Become part of the place.',copy:'Distributed sensing and environmental orchestration allow AEON to support a space without demanding a screen.',meters:['63%','87%','84%'],width:'76%',ratio:'1.9/1'}
};
$$('[data-device]').forEach(button => button.addEventListener('click', () => {
  $$('[data-device]').forEach(b => b.setAttribute('aria-selected','false')); button.setAttribute('aria-selected','true');
  const d=devices[button.dataset.device]; $('#device-code').textContent=d.code; $('#device-label').textContent=d.label;
  $('#device-title').textContent=d.title; $('#device-copy').textContent=d.copy;
  ['model','context','efficiency'].forEach((id,i)=>$(`#meter-${id}`).style.setProperty('--meter',d.meters[i]));
  const frame=$('.device-frame'); frame.style.width=d.width; frame.style.aspectRatio=d.ratio;
}));

const dialog = $('#brief-dialog');
$$('[data-demo-open]').forEach(button => button.addEventListener('click', () => dialog.showModal()));
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
$('#brief-form').addEventListener('submit', event => {
  event.preventDefault(); const data = Object.fromEntries(new FormData(event.currentTarget));
  const text = `AEON SYSTEM BRIEF REQUEST\n\nName: ${data.name}\nEmail: ${data.email}\nFocus: ${data.focus}\n\nContext:\n${data.context}\n`;
  const link=document.createElement('a'); link.href=URL.createObjectURL(new Blob([text],{type:'text/plain'}));
  link.download='aeon-system-brief-request.txt'; link.click(); URL.revokeObjectURL(link.href);
  $('.form-status').textContent='Request file created locally.';
});
