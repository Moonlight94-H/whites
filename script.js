const grid = document.getElementById('project-grid');
const filters = document.getElementById('filters');
const modal = document.getElementById('project-modal');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('modal-close');
const loadedImages = new Set();

function cardTemplate(project, index) {
  const cover = project.images[0];
  return `<article class="project-card" data-name="${project.name}" tabindex="0" role="button" aria-label="查看${project.name}">
    <div class="project-image"><img src="${encodeURI(cover)}" alt="${project.name}项目展示" loading="${index < 4 ? 'eager' : 'lazy'}"></div>
    <div class="project-info"><div><h3>${project.name}</h3><p>${project.type}</p></div><span class="project-number">${String(index+1).padStart(2,'0')}</span></div>
  </article>`;
}
function renderProjects(filter='全部') {
  const list = PROJECTS.filter(p => filter === '全部' || p.category === filter);
  grid.innerHTML = list.map(p => cardTemplate(p, PROJECTS.indexOf(p))).join('');
}
function initCompareSliders() {
  modalContent.querySelectorAll('.compare-range').forEach(range => {
    const frame = range.closest('[data-compare]');
    const clip = frame.querySelector('.compare-after-clip');
    const divider = frame.querySelector('.compare-divider');
    const update = () => {
      const value = Number(range.value);
      clip.style.clipPath = `inset(0 0 0 ${value}%)`;
      divider.style.left = `${value}%`;
    };
    range.addEventListener('input', update);
    update();
  });
}
function openProject(name) {
  const project = PROJECTS.find(p => p.name === name);
  if (!project) return;
  const comparison = project.beforeImages && project.afterImages ? `
    <section class="comparison-section">
      <div class="comparison-heading"><span class="eyebrow">BEFORE / AFTER</span><h2>拖动滑块，查看改造前后<span>.</span></h2><p>拖动中间的分割线，直观比较原始现场与改造后的空间概念效果。</p></div>
      <div class="comparison-sliders">
        ${project.beforeImages.map((beforeSrc,i)=>{
          const afterSrc=project.afterImages[Math.min(i,project.afterImages.length-1)];
          const beforeLabel=i===0?'原有厨房柜体与设备布局':'原有实验室整体空间与操作动线';
          const afterLabel=i===0?'厨房实验设备整合与展示优化':'实验室功能分区与科技展示升级';
          return `<div class="comparison-item"><div class="comparison-label-row"><span>${beforeLabel}</span><span>${afterLabel}</span></div><div class="compare-frame" data-compare><img class="compare-before" src="${encodeURI(beforeSrc)}" alt="改造前：${beforeLabel}"><div class="compare-after-clip" style="clip-path:inset(0 0 0 50%)"><img class="compare-after" src="${encodeURI(afterSrc)}" alt="改造后：${afterLabel}"></div><div class="compare-divider" style="left:50%"><span>↔</span></div><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="拖动滑块对比改造前后"></div><div class="compare-caption"><span>改造前 <small>BEFORE</small></span><span>改造后 <small>AFTER</small></span></div></div>`;
        }).join('')}
      </div>
    </section>` : '';
  modalContent.innerHTML = `<div class="modal-kicker">PROJECT / ${String(PROJECTS.indexOf(project)+1).padStart(2,'0')}　—　${project.category}</div>
    <h1 class="modal-title">${project.name}</h1><p class="modal-desc">${project.description}</p>
    <section class="design-explanation"><div class="eyebrow">DESIGN STATEMENT / 设计说明</div><div class="design-explanation-grid"><div><h2>设计策略</h2><p>${project.designApproach || project.description}</p></div><div><h2>设计落点</h2><p>${project.designNotes || '围绕项目目标梳理视觉层级、空间体验与实际执行需求，确保设计概念能够清晰传达并具备落地可行性。'}</p></div></div></section>
    ${comparison}
    <div class="modal-gallery">${project.images.map((src,i)=>`<img src="${encodeURI(src)}" alt="${project.name}项目图片 ${i+1}" loading="${i<2?'eager':'lazy'}">`).join('')}</div>
    <div class="modal-footer"><span>${project.type}</span><span>${project.images.length} IMAGES</span></div>`;
  initCompareSliders();
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden'; modal.scrollTop=0;
}
function closeProject() { modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
filters.addEventListener('click',e=>{
  const button=e.target.closest('.filter'); if(!button)return;
  filters.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));
  renderProjects(button.dataset.filter);
});
grid.addEventListener('click',e=>{const card=e.target.closest('.project-card');if(card)openProject(card.dataset.name);});
grid.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('project-card')){e.preventDefault();openProject(e.target.dataset.name);}});
closeModal.addEventListener('click',closeProject);
modal.addEventListener('click',e=>{if(e.target===modal)closeProject();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProject();});
renderProjects();

// Preload the cover images, then reveal the page at 100%.
const loader = document.getElementById('loader');
const fill = document.getElementById('progress-fill');
const number = document.getElementById('progress-number');
const shell = document.getElementById('site-shell');
const covers = PROJECTS.map(p=>p.images[0]).filter(Boolean);
let completed=0;
function updateProgress() {
  const pct = covers.length ? Math.round(completed/covers.length*100) : 100;
  fill.style.width=pct+'%'; number.textContent=String(pct).padStart(2,'0')+'%';
}
if (!covers.length) finishLoading();
else {
  covers.forEach(src=>{
    const img=new Image();
    img.onload=img.onerror=()=>{completed++;updateProgress();if(completed>=covers.length)finishLoading();};
    img.src=encodeURI(src);
  });
}
function finishLoading(){
  fill.style.width='100%';number.textContent='100%';
  setTimeout(()=>{shell.classList.add('ready');loader.classList.add('dismiss');window.scrollTo(0,0);},260);
}
// Keep nav state in sync with the visible section.
const navLinks=[...document.querySelectorAll('.nav-link')];
const sections=['works','about'].map(id=>document.getElementById(id));
if ('IntersectionObserver' in window) {
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting)navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id));});
  },{rootMargin:'-25% 0px -60% 0px'});
  sections.forEach(section=>observer.observe(section));
}

// Tiny playful interaction: click the cover mascot for a quick pop.
const mascot = document.querySelector('.comic-mascot');
if (mascot) {
  mascot.setAttribute('role','button');
  mascot.setAttribute('tabindex','0');
  mascot.setAttribute('aria-label','点击小怪物，触发趣味动画');
  const popMascot = () => { mascot.classList.remove('playful-pop'); void mascot.offsetWidth; mascot.classList.add('playful-pop'); };
  mascot.addEventListener('click', popMascot);
  mascot.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); popMascot(); } });
  mascot.addEventListener('animationend', () => mascot.classList.remove('playful-pop'));
}


// Scroll progress indicator.
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress';
scrollProgress.setAttribute('aria-hidden','true');
scrollProgress.innerHTML = '<span></span>';
document.body.appendChild(scrollProgress);
const scrollProgressFill = scrollProgress.querySelector('span');
function updatePageProgress(){
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  scrollProgressFill.style.width = (maxScroll > 0 ? Math.min(100, window.scrollY / maxScroll * 100) : 0) + '%';
}
window.addEventListener('scroll', updatePageProgress, {passive:true});
window.addEventListener('resize', updatePageProgress);
window.addEventListener('load', updatePageProgress);
updatePageProgress();

// Subtle 3D tilt for desktop project cards; the existing click-to-open behavior remains intact.
const supportsFinePointer = window.matchMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches;
if (supportsFinePointer) {
  grid.addEventListener('pointermove', event => {
    const card = event.target.closest('.project-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `perspective(950px) rotateX(${(-y*2).toFixed(2)}deg) rotateY(${(x*2).toFixed(2)}deg) translateY(-3px)`;
  });
  grid.addEventListener('pointerout', event => {
    const card = event.target.closest('.project-card');
    if (card && !card.contains(event.relatedTarget)) card.style.transform = '';
  });
}

// Tiny click sparkles on interactive elements, disabled for reduced-motion preferences.
document.addEventListener('click', event => {
  if (!event.target.closest('a,button,.project-card')) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const symbols = ['✦','✧','✳'];
  symbols.forEach((symbol, index) => {
    const spark = document.createElement('span');
    spark.className = 'interaction-spark';
    spark.textContent = symbol;
    spark.style.left = (event.clientX + (Math.random()*20-10)) + 'px';
    spark.style.top = (event.clientY + (Math.random()*20-10)) + 'px';
    spark.style.setProperty('--dx', (Math.random()*56-28) + 'px');
    spark.style.setProperty('--dy', (-24-Math.random()*38) + 'px');
    spark.style.animationDelay = (index*25) + 'ms';
    document.body.appendChild(spark);
    spark.addEventListener('animationend', () => spark.remove(), {once:true});
  });
});

