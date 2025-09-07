// Конфигурационен скрипт – Етап 9: стабилизиране на табовете и обновяване на 3D/превюта
// - Добавя глобално window.showTab за inline onclick в HTML
// - Не изисква #interactiveModel (намира viewer-а и без id)
// - Създава .thumbnail-row автоматично, ако липсва
// - Пътищата към /img се решават чрез <link rel="icon"> (Вариант B)

(function injectRuntimeStyles(){
  const id='runtime-styles';
  if(document.getElementById(id)) return;
  const s=document.createElement('style'); s.id=id;
  s.textContent=`
    .spinner{border:4px solid #444;border-top:4px solid #cc0000;border-radius:50%;width:44px;height:44px;animation:spin 1s linear infinite;margin:12px auto}
    @keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
    .fade-out{opacity:.35;filter:grayscale(.15);transition:opacity .35s ease,filter .35s ease}
    .fade-in{opacity:1;filter:none;transition:opacity .35s ease,filter .35s ease}
    .viewer-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:rgba(0,0,0,.35);backdrop-filter:blur(1px);z-index:5}
    .viewer-overlay .stage{color:#ccc;margin-top:8px;font-size:14px}
    .thumbnail-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
    .thumbnail-row img{display:block;width:120px;height:80px;object-fit:cover;cursor:pointer;border:1px solid #333;border-radius:6px}
    @media (max-width: 768px){
      .main-container{grid-template-columns: 1fr !important;}
      .config-panel, .preview-panel{height:auto !important;}
    }
  `; document.head.appendChild(s);
})();

// Вариант B: надеждно откриване на корена към /img на база <link rel="icon">,
// с fallback към относителен път спрямо текущата страница
function resolveImgRoot(){
  try{
    const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if(icon && icon.href){
      const u = new URL('.', icon.href); // директорията на иконата (обикновено ../img/)
      return u.href.replace(/\/$/, '');
    }
  }catch(e){/* ignore */}
  return new URL('../img/', document.baseURI).href.replace(/\/$/, '');
}
const IMG_ROOT = resolveImgRoot();

// --- TAB DATA (глобално, достъпно от showTab) ---
window.TAB_DATA = [
  `
    <div class="inline-fields">
      <div>
        <label for="length">Дължина (A)</label>
        <select id="length">
          <option value="5500">5500 mm</option>
          <option value="6000">6000 mm</option>
          <option value="7000" selected>7000 mm</option>
        </select>
      </div>
      <div>
        <label for="color">Цвят (RAL)</label>
        <select id="color">
          <option value="RAL1026_Luminous_yellow">RAL1026 Жълт</option>
          <option value="RAL3000_Flame_red" selected>RAL3000 Червен</option>
          <option value="RAL5012_Light_blue">RAL5012 Син</option>
        </select>
      </div>
    </div>
  `,
  `
    <label>Вид ламарина дъно</label><input type="text" class="readonly" value="Гладка S235" readonly>
    <label>Дебелина ламарина</label><input type="text" class="readonly" value="5 mm" readonly>
    <label>C-заключване</label><input type="text" class="readonly" value="Да" readonly>
    <label>Вид ролки</label><input type="text" class="readonly" value="Стоманени" readonly>
  `,
  `
    <label>Скосена челна стена</label><input type="text" class="readonly" value="Не" readonly>
    <label>Височина</label><input type="text" class="readonly" value="1500 mm" readonly>
    <label>Дебелина ламарина CS</label><input type="text" class="readonly" value="3 mm" readonly>
    <label>Укрепване към дъното</label><input type="text" class="readonly" value="Да" readonly>
  `,
  `
    <label>Вид укрепване (халки 7000 кг)</label><input type="text" class="readonly" value="Да" readonly>
    <label>Отстояние първа халка</label><input type="text" class="readonly" value="500 mm" readonly>
    <label>Брой халки на страна</label><input type="text" class="readonly" value="10" readonly>
  `
];

// Глобална функция за inline onclick в HTML
window.showTab = function(i){
  const tabButtons = document.querySelectorAll('.tab-labels button');
  const content = document.getElementById('tab-content');
  if(!content || !tabButtons.length) return;
  tabButtons.forEach(b=>b.classList.remove('active'));
  if (tabButtons[i]) tabButtons[i].classList.add('active');
  content.innerHTML = (window.TAB_DATA && window.TAB_DATA[i]) ? window.TAB_DATA[i] : '';
  if (i === 0) initAutoReload();
};

document.addEventListener('DOMContentLoaded',()=>{
  prepareDOM();
  initTabs();
  // първоначален таб 0
  window.showTab(0);
  generateConfig(true);
});

function getActiveItem(){
  return document.querySelector('.carousel .list .item.has-viewer') ||
         document.querySelector('.carousel .list .item:nth-child(2)');
}
function getViewer(){
  return document.getElementById('interactiveModel') ||
         document.querySelector('.item.has-viewer model-viewer.viewer') ||
         document.querySelector('.carousel .list .item:nth-child(2) .visual model-viewer.viewer');
}
function getViewerContainer(){
  return document.querySelector('.item.has-viewer .visual') ||
         document.querySelector('.carousel .list .item:nth-child(2) .visual');
}
function getDetailPanel(){
  return document.querySelector('.item.has-viewer .detail') ||
         document.querySelector('.carousel .list .item:nth-child(2) .detail');
}

function ensureThumbRow(){
  let thumbRow = document.getElementById('thumbRow') || document.querySelector('.thumbnail-row');
  if (!thumbRow) {
    const detail = getDetailPanel();
    if (!detail) return null;
    thumbRow = document.createElement('div');
    thumbRow.className = 'thumbnail-row';
    thumbRow.id = 'thumbRow';
    detail.appendChild(thumbRow);
  }
  return thumbRow;
}

function prepareDOM(){
  // overlay върху viewer контейнера
  const wrap = getViewerContainer();
  if(wrap && !document.getElementById('viewerOverlay')){
    const overlay=document.createElement('div');
    overlay.className='viewer-overlay'; overlay.id='viewerOverlay'; overlay.style.display='none';
    overlay.innerHTML=`<div class="spinner"></div><div class="stage" id="viewerStage">Подготовка…</div>`;
    wrap.style.position = wrap.style.position || 'relative';
    wrap.appendChild(overlay);
  }
  ensureThumbRow();
}

function initTabs(){
  // освен inline onclick, подсигуряваме и addEventListener
  const tabButtons=document.querySelectorAll('.tab-labels button');
  tabButtons.forEach((btn,i)=>btn.addEventListener('click',()=>window.showTab(i)));
}

function initAutoReload(){
  const lengthEl=document.getElementById('length');
  const colorEl=document.getElementById('color');
  if(!lengthEl||!colorEl) return;
  const handler=debounce(()=>generateConfig(),150);
  lengthEl.addEventListener('change',handler);
  colorEl.addEventListener('change',handler);
}

function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn.apply(null,a),ms); } }

function stageOverlay(text,delay){
  const stage=document.getElementById('viewerStage');
  return new Promise(res=>setTimeout(()=>{ if(stage) stage.textContent=text; res(); }, delay));
}

function toggleOverlay(show){
  const overlay=document.getElementById('viewerOverlay');
  if(overlay) overlay.style.display=show?'flex':'none';
}

function generateConfig(initial){
  const length=document.getElementById('length')?.value||'7000';
  const color=document.getElementById('color')?.value||'RAL3000_Flame_red';
  const configID=`${length}_${color}`;
  const basePath=`${IMG_ROOT}/${configID}`; // коректен корен към /img

  const mv=getViewer();
  const thumbRow=ensureThumbRow();
  if(!mv||!thumbRow) return;

  mv.classList.add('fade-out');
  toggleOverlay(true);
  const stage=document.getElementById('viewerStage'); if(stage) stage.textContent='Въвеждане на входните параметри…';

  Promise.resolve()
    .then(()=>stageOverlay('Изчисляване на чертежа…',1200))
    .then(()=>stageOverlay('Зареждане…',1200))
    .then(()=>{
    
      mv.setAttribute('src',`${basePath}/model.glb`);
      thumbRow.innerHTML=`
        <img src="${basePath}/view1.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view1.png">
        <img src="${basePath}/view2.png" class="lightbox-trigger" data-type="image" data-src="${basePath}/view2.png">
        <img src="${basePath}/preview_drawing.png" class="lightbox-trigger" data-type="pdf" data-src="${basePath}/drawing.pdf">
      `;
      enableLightbox();
      return stageOverlay('Финализиране…',400);
    })
    .then(()=>{
      toggleOverlay(false);
      mv.classList.remove('fade-out');
      mv.classList.add('fade-in');
      // ако е с reveal="manual" — махни постера
      mv.dismissPoster && mv.dismissPoster();
      // отреагирай и при load на модела
      mv.addEventListener('load',()=>{ try{mv.dismissPoster&&mv.dismissPoster();}catch(e){} }, {once:true});
    });
}

function enableLightbox(){
  const triggers=document.querySelectorAll('.lightbox-trigger');
  triggers.forEach(el=>{
    if(el.dataset.lbInit) return; // предотвратяваме двойно закачане
    el.dataset.lbInit = '1';
    el.addEventListener('click',()=>{
      const src=el.dataset.src;
      const type=el.dataset.type;
      const modal=document.createElement('div');
      modal.className='lightbox-modal';
      modal.style.position='fixed';
      modal.style.top='0';
      modal.style.left='0';
      modal.style.width='100vw';
      modal.style.height='100vh';
      modal.style.background='rgba(0,0,0,0.85)';
      modal.style.display='flex';
      modal.style.alignItems='center';
      modal.style.justifyContent='center';
      modal.style.zIndex='9999';
      modal.innerHTML=`<div style="max-width:90%;max-height:90%;">${type==='pdf'?`<iframe src="${src}" style="width:100%;height:100%;border:none;"></iframe>`:`<img src="${src}" style="max-width:100%;max-height:100%">`}</div>`;
      modal.addEventListener('click',()=>modal.remove());
      document.body.appendChild(modal);
    });
  });
}

function showOrderModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='block'; }
function closeModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='none'; }
window.onclick=function(e){ const m=document.getElementById('orderModal'); if(e.target===m) closeModal(); }
