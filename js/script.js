// === Навигация на карусела и отваряне на детайли ===
let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');
let seeMoreButtons = document.querySelectorAll('.seeMore');
let backButton = document.getElementById('back');

// обезопаси липсващи елементи
if (!carousel) {
  console.warn('Carousel not found'); 
}

// централизирано маркиране на активния елемент (втори в списъка)
function markActiveItem() {
  const items = document.querySelectorAll('.carousel .list .item');
  items.forEach(el => el.classList.remove('is-active'));
  const active = document.querySelector('.carousel .list .item:nth-child(2)');
  if (active) active.classList.add('is-active');
}
markActiveItem();

// Навигационни бутони
if (nextButton) nextButton.onclick = function(){ showSlider('next'); }
if (prevButton) prevButton.onclick = function(){ showSlider('prev'); }

let unAcceppClick;
const showSlider = (type) => {
  if (!listHTML) return;

  if (nextButton) nextButton.style.pointerEvents = 'none';
  if (prevButton) prevButton.style.pointerEvents = 'none';

  carousel.classList.remove('next', 'prev');
  let items = document.querySelectorAll('.carousel .list .item');
  if (items.length === 0) return;

  if(type === 'next'){
    listHTML.appendChild(items[0]);
    carousel.classList.add('next');
  } else {
    listHTML.prepend(items[items.length - 1]);
    carousel.classList.add('prev');
  }

  // обнови маркировката
  markActiveItem();

  clearTimeout(unAcceppClick);
  unAcceppClick = setTimeout(()=>{
    if (nextButton) nextButton.style.pointerEvents = 'auto';
    if (prevButton) prevButton.style.pointerEvents = 'auto';
  }, 600);
};

// „Виж още“ → режим детайли + lazy зареждане на viewer-а
seeMoreButtons.forEach((button) => {
  button.onclick = function(){
    if (!carousel) return;
    carousel.classList.remove('next', 'prev');
    carousel.classList.add('showDetail');

    markActiveItem();

    // активен елемент (втори)
    let activeItem = document.querySelector('.carousel .list .item:nth-child(2)');
    if(activeItem){
      let viewer = activeItem.querySelector('model-viewer');
      if(viewer){
        // лениво задаване на src при първо отваряне
        if(!viewer.hasAttribute('src')){
          const dataSrc = viewer.getAttribute('data-src');
          if(dataSrc){
            viewer.setAttribute('src', dataSrc);
          }
        }
        // при reveal="manual" да махнем постера
        const dismiss = () => viewer.dismissPoster && viewer.dismissPoster();
        dismiss();
        viewer.addEventListener('load', dismiss, { once: true });
      }
    }
  }
});

// „Назад“ от детайли
if (backButton) {
  backButton.onclick = function(){
    if (!carousel) return;
    carousel.classList.remove('showDetail');
  }
}

// === ТЕМА (запазване в localStorage) ===
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark');
}
window.toggleTheme = function() {
  document.body.classList.toggle('dark');
  const newTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', newTheme);
}

// === Навигация с КЛАВИАТУРНИТЕ стрелки за карусела ===
document.addEventListener('keydown', (e) => {
  // ако е отворен модален лайтбокс – остави него да получи стрелките
  if (document.querySelector('.lightbox-modal')) return;
  if (e.key === 'ArrowRight') showSlider('next');
  else if (e.key === 'ArrowLeft') showSlider('prev');
});

// === Swipe на мобилно за карусела ===
(function(){
  if (!carousel) return;
  let startX = null, startY = null;
  const THRESHOLD = 30; // px

  const area = listHTML || carousel;
  area.addEventListener('touchstart', (e)=>{
    if(e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, {passive:true});

  area.addEventListener('touchend', (e)=>{
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = startY = null;

    // хоризонтален жест
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > THRESHOLD) {
      showSlider(dx < 0 ? 'next' : 'prev');
    }
  }, {passive:true});
})();
