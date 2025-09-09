// Конфигурационен скрипт – Етап 11: добавен Екран 0 (Главно меню) + лек рутер (0→1→2→3) 
// 0: Главно меню („Продукти / Бластиране / За нас / Контакти“)
// 1: Продукти (от скрийншота: ABALPR, ABBS, ABPL, …)
// 2: Типове платформи за избрания продукт (за ABPL показваме текущия index-подобен изглед)
// 3: Детайл/Конфигуратор (същият „виж още“ екран) – използва наличния model-viewer и табове
//
// ВАЖНО: Не пипаме пътищата в HTML. Всичко тук е самодостатъчно и обратно съвместимо със script.js.

// ------------------------------
// Runtime стилове (лека помощ за оувърлей и др.)
(function injectRuntimeStyles(){
  const id='runtime-styles';
  if(document.getElementById(id)) return;
  const s=document.createElement('style'); s.id=id;
  s.textContent=`$1
    /* Блокиране на карусел навигацията при ниво 3 (детайл) */
    body.no-carousel-input .arrows button{pointer-events:none;opacity:.35}
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
  screen: 0,            // 0=Главно меню, 1=Продукти, 2=Платформи, 3=Детайл, 4=Статична страница
  productId: null,
  platformId: null,
  pageId: null          // за статичните страници (blast/about/contacts)
};

function goTo(screen, params={}){
  AppState.screen = screen;
  Object.assign(AppState, params);
  // Хеш за лесно връщане/рефреш
  const hash = new URLSearchParams({ 
    s:String(screen), p:AppState.productId||'', f:AppState.platformId||'', pg:AppState.pageId||'' 
  });
  location.hash = hash.toString();
  render();
}

window.addEventListener('hashchange', () => {
  const sp = new URLSearchParams(location.hash.replace(/^#/, ''));
  const s = Number(sp.get('s')||'0');
  const p = sp.get('p') || null;
  const f = sp.get('f') || null;
  const pg = sp.get('pg') || null;
  AppState.screen = [0,1,2,3,4].includes(s)?s:0;
  AppState.productId = p || null;
  AppState.platformId = f || null;
  AppState.pageId = pg || null;
  render();
});
 
// ------------------------------
// Данни (ти можеш спокойно да сменяш текстове/картинки)
const DATA = {
  // Екран 0 – главно меню (ПРОДУКТИ ПЪРВО)
  mainMenu: [
    { id:'products', title:'REALMET', topic:'Продукти', des:'Гама решения за мултилифт системи', preview:`${IMG_ROOT}/menu/products/cover.png`, cta:'Виж повече' },
    { id:'blast',    title:'REALMET', topic:'Бластиране', des:'Подготовка на повърхности, бластиране и покрития', preview:`${IMG_ROOT}/menu/blast/cover.png`, cta:'Виж повече' },
    { id:'about',    title:'REALMET', topic:'За нас', des:'Кратко представяне на компанията', preview:`${IMG_ROOT}/menu/about/cover.png`, cta:'Виж повече' },
    { id:'contacts', title:'REALMET', topic:'Контакти', des:'Свържете се с нас', preview:`${IMG_ROOT}/menu/contacts/cover.png`, cta:'Виж повече' }
  ],

  // Екран 1 – продукти (ABALPR ПЪРВО)
  products: [
    { id:'ABALPR', title:'Алуминиева притча', topic:'Продукт', preview:`${IMG_ROOT}/products/ABALPR/cover.png`, des:'Притча със алуминиеви странични капаци за система мултилифт са изработени съгласно DIN 30722, тествани съгласно DGUV - правило 114-010 (BGR 186) и притежават UVV стикер с инструкции за безопасност.' },
    { id:'ABBS',   title:'Мултилифт контейнер',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABBS/cover.png`,   des:'Мощно и гъвкаво решение. Нашите контейнери за строителни отпадъци предоставят изключително решение за събиране и транспорт на отпадъци от различни строителни и ремонтни дейности.' },
    { id:'ABPL',   title:'Платформа',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABPL/cover.png`,   des:'Гъвкаво решение за вашите транспортни нужди. Нашите мултилифт платформи са проектирани да удовлетворят разнообразни нужди в множество индустрии, предоставяйки надеждност и ефективност при всяко приложение.' },
    { id:'ABPR',   title:'Притча',   topic:'Продукт', preview:`${IMG_ROOT}/products/ABPR/cover.png`,   des:'Притча със стоманени странични капаци за система мултилифт са изработени съгласно DIN 30722, тествани съгласно DGUV - правило 114-010 (BGR 186) и притежават UVV стикер с инструкции за безопасност.' },
    { id:'ABRAM',  title:'Рама',  topic:'Продукт', preview:`${IMG_ROOT}/products/ABRAM/cover.png`,  des:'Рамите за система мултилифт  се произвеждат по DIN 30722, тествани съгласно DGUV - правило 114-010 (BGR 186) и притежават UVV стикер с инструкции за безопасност.' },
    { id:'ABSTB',  title:'Стиковани',  topic:'Продукт', preview:`${IMG_ROOT}/products/ABSTB/cover.png`,  des:'Мултилифт контейнерите за стековане са изработени по DIN 30722, тествани съгласно DGUV - правило 114-010 (BGR 186) и притежават UVV стикер с инструкции за безопасност.' },
    { id:'ABTRPR', title:'Тристранна притча', topic:'Продукт', preview:`${IMG_ROOT}/products/ABTRPR/cover.png`, des:'Притча с тристранно отваряема щора са сертифицирани по DIN 30722 тествани съгласно DGUV - правило 114-010 (BGR 186) и притежават UVV стикер с инструкции за безопасност.' },
    { id:'BDFPL',  title:'BDF Платформа',  topic:'Продукт', preview:`${IMG_ROOT}/products/BDFPL/cover.png`,  des:'BDF платформа.' }
  ],

  // Екран 2 – типове платформи за даден продукт (пример: ABPL → текущите 5 типа)
  platformsByProduct: {
    'ABPL': [
      { id:'platform-standard',    title:'Платформа', topic:'Стандартна',             preview:`${IMG_ROOT}/platform1.png`, des:'Надеждна, базова платформа.' },
      { id:'platform-bevel',       title:'Платформа', topic:'Скосена',                preview:`${IMG_ROOT}/platform2.png`, des:'Скосена предна част.' },
      { id:'platform-bevel-groove',title:'Платформа', topic:'Скосена с вдлъбнатини',  preview:`${IMG_ROOT}/platform3.png`, des:'Допълнителни вдлъбнатини.' },
      { id:'platform-ecco7',       title:'Платформа', topic:'ECCO ALU 7',             preview:`${IMG_ROOT}/platform4.png`, des:'Лек алуминиев вариант.' },
      { id:'platform-ecco7b',      title:'Платформа', topic:'ECCO ALU 7',             preview:`${IMG_ROOT}/platform5.png`, des:'Алтернативна конфигурация.' }
    ]
  },

  // Екран 4 – статични страници (примерно изображение + кратък текст)
  pages: {
    blast:    { title:'Бластиране', img:`${IMG_ROOT}/menu/blast/cover.png`,    text:'Промишлено бластиране и покрития. Свържете се с нас за оферта.' },
    about:    { title:'За нас',     img:`${IMG_ROOT}/menu/about/cover.png`,    text:'REALMET – кратко представяне и мисия.' },
    contacts: { title:'Контакти',   img:`${IMG_ROOT}/menu/contacts/cover.png`, text:'Телефон, имейл и адрес за връзка.' }
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
  if (AppState.screen === 0) return renderScreen0();
  if (AppState.screen === 1) return renderScreen1();
  if (AppState.screen === 2) return renderScreen2(AppState.productId);
  if (AppState.screen === 3) return renderScreen3(AppState.productId, AppState.platformId);
  if (AppState.screen === 4) return renderScreen4(AppState.pageId);
}

function getListEl(){ return document.querySelector('.carousel .list'); }

function hydrateCarousel(items){
  const list = getListEl();
  if (!list) return;
  list.innerHTML = '';

  items.forEach((it) => {
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

  // --- Центриране според CSS-а, който очаква :nth-child(2) за активен ---
  const count = list.children.length;
  if (count === 1) {
    // при един елемент добавяме прозрачен спейсър най-отпред,
    // за да стане реалната карта втори елемент (видим в центъра)
    const spacer = document.createElement('div');
    spacer.className = 'item';
    spacer.style.opacity = '0';
    spacer.style.pointerEvents = 'none';
    list.prepend(spacer);
  } else if (count >= 2) {
    // при 2+ елемента преместваме последния най-отпред,
    // така оригиналният първи става втори (централен)
    list.prepend(list.lastElementChild);
  }

  // ако имаме has-viewer елемент – подсигуряваме, че е „активен“
  const viewerItem = list.querySelector('.item.has-viewer');
  if (viewerItem) viewerItem.classList.add('is-active');

  // след динамичен рендер – маркираме активния (втори елемент)
  try { markActiveItem && markActiveItem(); } catch(e){}
}

function renderScreen0(){$1document.body.classList.remove('showDetail');
  document.body.classList.remove('no-carousel-input');
}

function renderScreen1(){$1document.body.classList.remove('showDetail');
  document.body.classList.remove('no-carousel-input');
}

function renderScreen2(pid){$1document.body.classList.remove('showDetail');
  document.body.classList.remove('no-carousel-input');
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

  const car = document.querySelector('.carousel');
  if (car) car.classList.add('showDetail');
  document.body.classList.add('no-carousel-input');

  try { prepareDOM(); window.showTab(0); generateConfig(true); } catch(e){}
}

function renderScreen4(pageId){$1document.body.classList.remove('showDetail');
  document.body.classList.remove('no-carousel-input');
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

    if (AppState.screen === 0) {
      // Основно меню
      if (id === 'products') return goTo(1);
      return goTo(4, { pageId: id });
    }
    else if (AppState.screen === 1) {
      // Избор на продукт → типове платформи
      return goTo(2, { productId: id });
    }
    else if (AppState.screen === 2) {
      // Избор на платформа → детайл
      return goTo(3, { platformId: id });
    }
    else if (AppState.screen === 3) {
      // В детайла – оставяме текущото поведение (поръчай/модал и т.н.)
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
          <option value="RAL3000_Flame_red">RAL3000 Червен</option>
          <option value="RAL5012_Light_blue">RAL5012 Син</option>
          <option value="RAL7016_Anthracite_gray" selected>RAL7016 Сив</option>
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

// DOM готовност → стартираме от екран 0 (главно меню) или от хеш
(document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', boot) : boot());
function boot(){
  const sp = new URLSearchParams(location.hash.replace(/^#/, ''));
  const s = Number(sp.get('s')||'0');
  const p = sp.get('p') || null;
  const f = sp.get('f') || null;
  const pg = sp.get('pg') || null;
  AppState.screen = [0,1,2,3,4].includes(s)?s:0;
  AppState.productId = p || null;
  AppState.platformId = f || null;
  AppState.pageId = pg || null;
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
  const color=document.getElementById('color')?.value||'RAL7016_Anthracite_gray';
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

// --- Глобални блокери за стрелки и жестове при ниво 3 ---
(function installCarouselInputBlockers(){
  // Блокиране на клавиатурните стрелки
  document.addEventListener('keydown', (e)=>{
    if (!document.body.classList.contains('no-carousel-input')) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true); // capture, преди оригиналните слушатели

  // Блокиране на swipe/gesture върху карусела (мобилно)
  const stopIfNeeded = (e)=>{
    if (!document.body.classList.contains('no-carousel-input')) return;
    if (e.target.closest && e.target.closest('.carousel')) {
      e.stopPropagation();
      // не предотвратяваме скрол на страницата; само карусела
    }
  };
  document.addEventListener('touchstart', stopIfNeeded, true);
  document.addEventListener('touchend',   stopIfNeeded, true);
})();
