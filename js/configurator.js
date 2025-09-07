// Конфигурационен скрипт – Етап 10: лек рутер (екрани 1→2→3) + запазена стара логика за „детайл“
// Екран 1: Продукти (от скрийншота: ABALPR, ABBS, ABPL, …)
// Екран 2: Типове платформи за избрания продукт (за ABPL показваме текущия index-подобен изглед)
// Екран 3: Детайл/Конфигуратор (същият „виж още“ екран) – използва наличния model-viewer и табове
//
// ВАЖНО: Не пипаме пътищата в HTML. Всичко тук е самодостатъчно и обратно съвместимо със script.js.

// ------------------------------
// Runtime стилове (лека помощ за оувърлей и др.)
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
    .card-click{cursor:pointer}
    .hidden{display:none!important}
  `; document.head.appendChild(s);
})();

// ------------------------------
// Път до /img – извличаме от <link rel="icon">, с fallback
function resolveImgRoot(){
  try{
    const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if(icon && icon.href){
      const u = new URL('.', icon.href);
      return u.href.replace(/\/$/, '');
    }
  }catch(e){}
  return new URL('../img/', document.baseURI).href.replace(/\/$/, '');
}
const IMG_ROOT = resolveImgRoot();

// ------------------------------
// Мини „рутер“
const AppState = {
  screen: 1,            // 1=Продукти, 2=Платформи, 3=Детайл
  productId: null,
  platformId: null
};

function goTo(screen, params={}){
  AppState.screen = screen;
  Object.assign(AppState, params);
  // Хеш за лесно връщане/рефреш
  const hash = new URLSearchParams({ s:String(screen), p:AppState.productId||'', f:AppState.platformId||'' });
  location.hash = hash.toString();
  render();
}

window.addEventListener('hashchange', () => {
  const sp = new URLSearchParams(location.hash.replace(/^#/, ''));
  const s = Number(sp.get('s')||'1');
  const p = sp.get('p') || null;
  const f = sp.get('f') || null;
  AppState.screen = [1,2,3].includes(s)?s:1;
  AppState.productId = p || null;
  AppState.platformId = f || null;
  render();
});

// ------------------------------
// Данни (ти можеш спокойно да сменяш текстове/картинки)
const DATA = {
  // Екран 1 – продукти (изображенията са примерни пътища, подмени ги когато имаш готови)
  products: [
    { id:'ABALPR', title:'ABALPR', topic:'Продукт', preview:`${IMG_ROOT}/products/ABALPR/cover.png`, des:'Алуминиева платформа – лека и здрава.' },
    { id:'ABBS',   title:'ABBS',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABBS/cover.png`,   des:'Бордова система – универсална.' },
    { id:'ABPL',   title:'ABPL',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABPL/cover.png`,   des:'Платформа – стандартни и скосени варианти.' },
    { id:'ABPR',   title:'ABPR',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABPR/cover.png`,   des:'Платформа с ролки.' },
    { id:'ABRAM',  title:'ABRAM',  topic:'Продукт', preview:`${IMG_ROOT}/products/ABRAM/cover.png`,  des:'Рампа / помощни решения.' },
    { id:'ABSTB',  title:'ABSTB',  topic:'Продукт', preview:`${IMG_ROOT}/products/ABSTB/cover.png`,  des:'Степенки и бордове.' },
    { id:'ABTRPR', title:'ABTRPR', topic:'Продукт', preview:`${IMG_ROOT}/products/ABTRPR/cover.png`, des:'Транспортни приспособления.' },
    { id:'BDFPL',  title:'BDFPL',  topic:'Продукт', preview:`${IMG_ROOT}/products/BDFPL/cover.png`,  des:'BDF платформа.' },
    { id:'BDFTRPR',title:'BDFTRPR',topic:'Продукт', preview:`${IMG_ROOT}/products/BDFTRPR/cover.png`,des:'BDF транспортни решения.' }
  ],

  // Екран 2 – типове платформи за даден продукт (пример: ABPL → текущите 5 типа)
  platformsByProduct: {
    // Специално условие по изискването: при ABPL показваме „сегашния index“ (типове платформи)
    'ABPL': [
      { id:'platform-standard',   title:'Платформа', topic:'Стандартна',         preview:`${IMG_ROOT}/platform1.png`, des:'Надеждна, базова платформа.' },
      { id:'platform-bevel',      title:'Платформа', topic:'Скосена',            preview:`${IMG_ROOT}/platform2.png`, des:'Скосена предна част.' },
      { id:'platform-bevel-groove',title:'Платформа', topic:'Скосена с вдлъбнатини', preview:`${IMG_ROOT}/platform3.png`, des:'Допълнителни вдлъбнатини.' },
      { id:'platform-ecco7',      title:'Платформа', topic:'ECCO ALU 7',         preview:`${IMG_ROOT}/platform4.png`, des:'Лек алуминиев вариант.' },
      { id:'platform-ecco7b',     title:'Платформа', topic:'ECCO ALU 7',         preview:`${IMG_ROOT}/platform5.png`, des:'Алтернативна конфигурация.' }
    ]
    // За останалите продукти можеш да добавиш различни списъци; ако липсва – ще ползваме базов fallback
  }
};

// Fallback за продукти без конкретни платформи – показваме поне един общ тип
function getPlatformsForProduct(pid){
  if (DATA.platformsByProduct[pid]) return DATA.platformsByProduct[pid];
  return [
    { id:'platform-generic', title:'Платформа', topic:'Стандартна', preview:`${IMG_ROOT}/platform1.png`, des:'Базова платформа.' }
  ];
}

// ------------------------------
// Рендер функции
function render(){
  if (AppState.screen === 1) return renderScreen1();
  if (AppState.screen === 2) return renderScreen2(AppState.productId);
  if (AppState.screen === 3) return renderScreen3(AppState.productId, AppState.platformId);
}

function getListEl(){ return document.querySelector('.carousel .list'); }

function hydrateCarousel(items){
  const list = getListEl();
  if (!list) return;
  list.innerHTML = '';

  items.forEach((it, idx) => {
    const item = document.createElement('div');
    item.className = 'item' + (it.hasViewer ? ' has-viewer' : '');
    item.dataset.id = it.id || '';

    // visual
    const visual = document.createElement('div');
    visual.className = 'visual card-click';
    visual.innerHTML = `<img class="preview" src="${it.preview}" alt="${(it.title||'')}">` + (it.hasViewer? it.viewerHTML||'' : '');

    // introduce
    const intro = document.createElement('div');
    intro.className = 'introduce';
    intro.innerHTML = `
      <div class="title">${it.title||''}</div>
      <div class="topic">${it.topic||''}</div>
      <div class="des">${it.des||''}</div>
      <button class="seeMore">${it.cta||'Избери'} &#8599</button>
    `;

    // detail (само ако е детайлен екран)
    const detail = document.createElement('div');
    detail.className = 'detail' + (it.detailHTML ? '' : ' hidden');
    if (it.detailHTML) detail.innerHTML = it.detailHTML;

    item.appendChild(visual);
    item.appendChild(intro);
    item.appendChild(detail);

    list.appendChild(item);
  });

  // след динамичен рендер – маркираме активния (втори елемент)
  try { markActiveItem && markActiveItem(); } catch(e){}
}

function renderScreen1(){
  // Продукти
  const items = DATA.products.map(p => ({
    id: p.id,
    title: 'Продукт',
    topic: p.title,
    des: p.des||'',
    preview: p.preview,
    cta: 'Избери'
  }));
  hydrateCarousel(items);
  document.body.classList.remove('showDetail');
}

function renderScreen2(pid){
  const platforms = getPlatformsForProduct(pid);
  const items = platforms.map(pl => ({
    id: pl.id,
    title: pl.title,
    topic: pl.topic,
    des: pl.des||'',
    preview: pl.preview,
    cta: 'Избери'
  }));
  hydrateCarousel(items);
  document.body.classList.remove('showDetail');
}

function renderScreen3(pid, fid){
  // Екран 3 – строим една детайлна карта (has-viewer) + табовете/тъмбнейлите
  const baseDetail = `
    <div class="title">Стандартна</div>
    <div class="des">
      Платформите намират приложение в – строителство, логистика, пътно поддържане и др.
    </div>
    <div class="main-container">
      <div class="config-panel">
        <div class="tab-labels">
          <button class="active" onclick="showTab(0)">Основни параметри</button>
          <button onclick="showTab(1)">Дъно</button>
          <button onclick="showTab(2)">Челна стена</button>
          <button onclick="showTab(3)">Вид укрепване</button>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
          <div id="tab-content" class="tab-content"></div>
        </div>
      </div>
      <div class="thumb-wrap">
        <div class="thumbnail-row" id="thumbRow"></div>
      </div>
    </div>
    <div class="checkout">
      <button class="action" onclick="showOrderModal()">Поръчай</button>
    </div>
  `;

  const viewerHTML = `
    <model-viewer id="interactiveModel" class="viewer"
      src="${IMG_ROOT}/7000_RAL7016_Anthracite_gray/model.glb"
      camera-controls auto-rotate reveal="manual" style="background: transparent;"
      exposure="1" shadow-intensity="1" camera-orbit="200deg 75deg 13m">
    </model-viewer>`;

  const items = [
    { id: fid||'platform-selected', title:'Платформа', topic:'Стандартна', des:'', preview:`${IMG_ROOT}/platform1.png`, hasViewer:true, viewerHTML:viewerHTML, detailHTML:baseDetail, cta:'Виж още' }
  ];

  hydrateCarousel(items);

  // имитираме текущия „showDetail“ режим
  const car = document.querySelector('.carousel');
  if (car) car.classList.add('showDetail');

  // Инициализираме табовете и снимките
  try { prepareDOM(); window.showTab(0); generateConfig(true); } catch(e){}
}

// ------------------------------
// Делегация на кликове върху .seeMore и върху визуализацията (картата)
(function setupDelegatedClicks(){
  const list = document.querySelector('.carousel .list');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.seeMore');
    const card = e.target.closest('.item');
    if (!btn && !e.target.closest('.visual')) return; // кликове само по бутона/визуала
    if (!card) return;

    const id = card.dataset.id;

    if (AppState.screen === 1) {
      // Избор на продукт
      goTo(2, { productId: id });
    }
    else if (AppState.screen === 2) {
      // Избор на платформа
      goTo(3, { platformId: id });
    }
    else if (AppState.screen === 3) {
      // В детайла – можем да отворим модала или да игнорираме
    }
  });
})();

// ------------------------------
// СЪЩЕСТВУВАЩА ЛОГИКА ЗА ДЕТАЙЛ (НЕ СЕ ПИПА, само е интегрирана по-надолу)
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

// DOM готовност → стартираме от екран 1 (продукти) или от хеш
(document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot());
function boot(){
  const sp = new URLSearchParams(location.hash.replace(/^#/, ''));
  const s = Number(sp.get('s')||'1');
  const p = sp.get('p') || null;
  const f = sp.get('f') || null;
  AppState.screen = [1,2,3].includes(s)?s:1;
  AppState.productId = p || null;
  AppState.platformId = f || null;
  render();
}

// === Вспомагателни функции за детайла (повторно използвани) ===
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
  const wrap = getViewerContainer();
  if(wrap && !document.getElementById('viewerOverlay')){
    const overlay=document.createElement('div');
    overlay.className='viewer-overlay'; overlay.id='viewerOverlay'; overlay.style.display='none';
    overlay.innerHTML=`<div class="spinner"></div><div class="stage" id="viewerStage">Подготовка…</div>`;
    if (!wrap.style.position) wrap.style.position = 'relative';
    wrap.appendChild(overlay);
  }
  ensureThumbRow();
}

function initTabs(){
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
  const basePath=`${IMG_ROOT}/${configID}`;

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
      mv.dismissPoster && mv.dismissPoster();
      mv.addEventListener('load',()=>{ try{mv.dismissPoster&&mv.dismissPoster();}catch(e){} }, {once:true});
    });
}

function enableLightbox(){
  const triggers=document.querySelectorAll('.lightbox-trigger');
  triggers.forEach(el=>{
    if(el.dataset.lbInit) return;
    el.dataset.lbInit = '1';
    el.addEventListener('click',()=>{
      const src=el.dataset.src;
      const type=el.dataset.type;
      const modal=document.createElement('div');
      modal.className='lightbox-modal';
      Object.assign(modal.style,{position:'fixed',top:'0',left:'0',width:'100vw',height:'100vh',background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:'9999'});
      modal.innerHTML=`<div style="max-width:90%;max-height:90%;">${type==='pdf'?`<iframe src="${src}" style="width:100%;height:100%;border:none;"></iframe>`:`<img src="${src}" style="max-width:100%;max-height:100%">`}</div>`;
      modal.addEventListener('click',()=>modal.remove());
      document.body.appendChild(modal);
    });
  });
}

function showOrderModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='block'; }
function closeModal(){ const m=document.getElementById('orderModal'); if(m) m.style.display='none'; }
window.onclick=function(e){ const m=document.getElementById('orderModal'); if(e.target===m) closeModal(); }
