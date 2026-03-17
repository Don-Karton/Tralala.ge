let appData = {
  categories: [],
  catalog: [],
  durationOptions: []
};

let cart = [];
let selectedItem = null;
let selectedDuration = 1;

// --- DOM ELEMENTS ---
const mainContainer = document.getElementById('main-container');
const activeTitleEl = document.getElementById('active-title');
const sideNavContainer = document.getElementById('side-nav');
const cartCountEl = document.getElementById('cart-count');
const cartDrawer = document.getElementById('cart-drawer');
const modalOverlay = document.getElementById('modal-overlay');

// --- INITIALIZATION ---
async function init() {
  try {
    const response = await fetch('catalog.json');
    appData = await response.json();

    renderApp();
    setupIntersectionObserver();
  } catch (error) {
    console.error('Error loading catalog:', error);
  }
}

function renderApp() {
  // Render Side Nav
  sideNavContainer.innerHTML = appData.categories.map((cat, idx) => `
    <button
      data-nav-id="${cat.id}"
      class="nav-dot group relative flex items-center justify-center"
    >
      <div class="dot-inner w-10 h-10 rounded-sm border border-gray-200 text-gray-400 transition-all duration-500 flex items-center justify-center font-mono text-[10px] bg-white/50 backdrop-blur-sm group-hover:border-gray-400 group-hover:text-gray-600">
        ${idx.toString().padStart(2, '0')}
      </div>
      <div class="absolute right-full mr-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div class="bg-black text-white text-[10px] font-bold px-3 py-1 whitespace-nowrap uppercase tracking-widest border border-blue-500/30 shadow-2xl">
          ${cat.label}
        </div>
      </div>
    </button>
  `).join('');

  // Add click listeners to nav dots
  document.querySelectorAll('.nav-dot').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-nav-id');
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };
  });

  // Render Sections
  const sectionsHtml = appData.categories.map(cat => {
    if (cat.id === 'hero') {
      return `
        <section id="hero" data-label="Adventure.inc" class="snap-start snap-always min-h-screen flex flex-col justify-center px-6 lg:pr-48 max-w-6xl mx-auto transition-all duration-500">
          <header class="pt-20">
            <div class="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8">
              <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span>Premium Events in Tbilisi</span>
            </div>
            <h1 class="text-5xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8">
              ВАШ <br /> ПРАЗДНИК <br /> <span class="text-gray-300">В ДЕТАЛЯХ</span>
            </h1>
            <p class="text-xl text-gray-500 max-w-md font-medium leading-tight">
              Листайте вниз для выбора категории.
            </p>
          </header>
        </section>
      `;
    }

    const items = appData.catalog.filter(i => i.category === cat.id);
    return `
      <section id="${cat.id}" data-label="${cat.label}" class="snap-start snap-always min-h-screen flex flex-col justify-center py-20 scroll-mt-16">
        <div class="max-w-6xl mx-auto w-full px-6 lg:pr-48 relative group/section transition-all duration-500">
          <h2 class="text-5xl font-black tracking-tight mb-12 opacity-90">${cat.label}</h2>

          <div class="hidden md:block">
            <button onclick="scrollCategory('${cat.id}', -400)" class="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/90 backdrop-blur shadow-2xl rounded-full flex items-center justify-center -translate-x-1/2 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-blue-600 hover:text-white">
              <svg class="w-7 h-7 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button onclick="scrollCategory('${cat.id}', 400)" class="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-14 h-14 bg-white/90 backdrop-blur shadow-2xl rounded-full flex items-center justify-center translate-x-1/2 opacity-0 group-hover/section:opacity-100 transition-all hover:bg-blue-600 hover:text-white">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <div id="scroll-${cat.id}" class="flex overflow-x-auto gap-10 pb-10 -mx-6 px-6 snap-x snap-mandatory scroll-smooth scrollbar-hide" style="scroll-snap-stop: always; scroll-padding-left: 1.5rem; scroll-padding-right: 1.5rem;">
            ${items.map(item => `
              <div class="min-w-[85vw] md:min-w-[450px] snap-center cursor-pointer" onclick="openModal('${item.id}')">
                <div class="bg-white rounded-[3.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 group border border-gray-100 h-full">
                  <div class="h-[55vh] relative overflow-hidden">
                    <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div class="absolute bottom-10 left-10 right-10 text-white">
                      <span class="text-xs font-bold uppercase tracking-widest bg-blue-600 px-4 py-1.5 rounded-full mb-4 inline-block">От ${item.hourlyPrice} ₾/час</span>
                      <h3 class="text-3xl font-black leading-tight mb-3">${item.title}</h3>
                      <p class="text-white/70 text-sm font-medium line-clamp-2">${item.shortDesc}</p>
                    </div>
                  </div>
                  <div class="p-8 flex justify-between items-center bg-white">
                    <span class="text-gray-400 font-bold flex items-center gap-2 text-sm uppercase tracking-wider">
                      Детали <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </span>
                    <div class="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors shadow-lg">
                      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
            <div class="min-w-[5vw] shrink-0"></div>
          </div>
        </div>
      </section>
    `;
  }).join('');

  mainContainer.innerHTML = sectionsHtml;
}

function setupIntersectionObserver() {
  const options = {
    root: mainContainer,
    threshold: 0.5,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const label = entry.target.getAttribute('data-label');
        const id = entry.target.getAttribute('id');

        if (label) activeTitleEl.textContent = label;

        // Update Side Nav
        document.querySelectorAll('.nav-dot').forEach(dot => {
          const dotId = dot.getAttribute('data-nav-id');
          const inner = dot.querySelector('.dot-inner');

          if (dotId === id) {
            inner.className = 'dot-inner w-10 h-10 rounded-sm border transition-all duration-500 flex items-center justify-center font-mono text-[10px] bg-white/50 backdrop-blur-sm border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-110 animate-glow-pulse';
            if (!inner.querySelector('.scan-line')) {
              const scan = document.createElement('div');
              scan.className = 'scan-line absolute inset-0 overflow-hidden pointer-events-none';
              scan.innerHTML = '<div class="absolute left-0 w-full h-[2px] bg-blue-400/50 animate-tech-scan"></div>';
              inner.appendChild(scan);
            }
          } else {
            inner.className = 'dot-inner w-10 h-10 rounded-sm border border-gray-200 text-gray-400 transition-all duration-500 flex items-center justify-center font-mono text-[10px] bg-white/50 backdrop-blur-sm group-hover:border-gray-400 group-hover:text-gray-600';
            inner.querySelector('.scan-line')?.remove();
          }
        });
      }
    });
  }, options);

  document.querySelectorAll('section[data-label]').forEach(s => observer.observe(s));
}

function scrollCategory(id, amount) {
  const el = document.getElementById(`scroll-${id}`);
  if (el) el.scrollBy({ left: amount, behavior: 'smooth' });
}

// --- MODAL LOGIC ---
function openModal(itemId) {
  selectedItem = appData.catalog.find(i => i.id === itemId);
  selectedDuration = 1;
  renderModal();
  modalOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  selectedItem = null;
  modalOverlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function renderModal() {
  if (!selectedItem) return;

  const modalContent = document.getElementById('modal-content');
  modalContent.innerHTML = `
    <div class="h-72 relative">
      <img src="${selectedItem.image}" alt="${selectedItem.title}" class="w-full h-full object-cover" />
      <button onclick="closeModal()" class="absolute top-8 right-8 w-12 h-12 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>

    <div class="p-10">
      <h2 class="text-4xl font-black mb-6 leading-tight">${selectedItem.title}</h2>

      <div class="mb-10">
        <label class="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 block italic">Длительность программы</label>
        <div class="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
          ${appData.durationOptions.map(d => `
            <button
              onclick="setDuration(${d})"
              class="duration-btn px-7 py-5 rounded-[1.5rem] font-black text-sm transition-all shrink-0 snap-start border-2 ${
                selectedDuration === d
                ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-xl shadow-blue-500/30'
                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
              }"
            >
              ${d === 0.5 ? '30 МИН' : `${d} Ч.`}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-10">
        ${selectedItem.features.map(f => `
          <div class="flex items-center gap-2 text-[10px] font-black text-gray-400 bg-gray-50 p-4 rounded-2xl uppercase tracking-tighter">
            <svg class="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            ${f}
          </div>
        `).join('')}
      </div>

      <div class="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] mb-10">
        <div>
          <div id="modal-total-price" class="text-4xl font-black tracking-tighter">${Math.round(selectedItem.hourlyPrice * selectedDuration)} ₾</div>
          <div class="text-[10px] font-black text-gray-400 uppercase mt-1">Итоговая стоимость</div>
        </div>
        <div class="text-right">
           <div class="text-xl font-bold">${selectedItem.hourlyPrice} ₾</div>
           <div class="text-[10px] font-black text-gray-400 uppercase">Тариф в час</div>
        </div>
      </div>

      <button
        onclick="addToCart()"
        class="w-full h-20 bg-black text-white rounded-[2.5rem] font-black text-xl hover:bg-blue-600 active:scale-95 transition-all shadow-2xl"
      >
        ЗАБРОНИРОВАТЬ
      </button>
    </div>
  `;
}

function setDuration(d) {
  selectedDuration = d;
  document.querySelectorAll('.duration-btn').forEach(btn => {
    const isSelected = btn.textContent.includes(d === 0.5 ? '30 МИН' : `${d} Ч.`);
    btn.className = `duration-btn px-7 py-5 rounded-[1.5rem] font-black text-sm transition-all shrink-0 snap-start border-2 ${
      isSelected
      ? 'bg-blue-600 border-blue-600 text-white scale-105 shadow-xl shadow-blue-500/30'
      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
    }`;
  });
  document.getElementById('modal-total-price').textContent = `${Math.round(selectedItem.hourlyPrice * selectedDuration)} ₾`;
}

// --- CART LOGIC ---
function addToCart() {
  const cartItem = {
    ...selectedItem,
    cartId: `${selectedItem.id}-${Date.now()}`,
    duration: selectedDuration,
    totalPrice: Math.round(selectedItem.hourlyPrice * selectedDuration)
  };
  cart.push(cartItem);
  updateCartUI();
  closeModal();
}

function removeFromCart(cartId) {
  cart = cart.filter(i => i.cartId !== cartId);
  updateCartUI();
}

function updateCartUI() {
  cartCountEl.textContent = cart.length;
  cartCountEl.classList.toggle('hidden', cart.length === 0);

  const cartItemsContainer = document.getElementById('cart-items');
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="h-full flex flex-col items-center justify-center text-gray-300 opacity-40">
        <svg class="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
        <p class="font-black uppercase tracking-widest text-xs">Корзина пуста</p>
      </div>
    `;
    document.getElementById('cart-footer').classList.add('hidden');
  } else {
    cartItemsContainer.innerHTML = cart.map(item => `
      <div class="flex items-center gap-5 bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 animate-slide-in-right">
        <img src="${item.image}" class="w-20 h-20 rounded-3xl object-cover shadow-sm" />
        <div class="flex-1">
          <h4 class="font-bold text-sm leading-tight mb-2">${item.title}</h4>
          <div class="flex items-center gap-2">
             <span class="text-blue-600 font-black text-lg">${item.totalPrice} ₾</span>
             <span class="text-[10px] bg-white border border-gray-100 text-gray-500 px-3 py-1 rounded-full font-black uppercase">${item.duration} ч.</span>
          </div>
        </div>
        <button onclick="removeFromCart('${item.cartId}')" class="text-red-400 p-3 hover:bg-red-50 rounded-full transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
        </button>
      </div>
    `).join('');

    const total = cart.reduce((acc, item) => acc + item.totalPrice, 0);
    document.getElementById('cart-total-price').textContent = `${total} ₾`;
    document.getElementById('cart-footer').classList.remove('hidden');
  }
}

function toggleCart(open) {
  if (open) {
    cartDrawer.classList.remove('translate-x-full');
    cartDrawer.parentElement.classList.remove('pointer-events-none');
    cartDrawer.previousElementSibling.classList.remove('opacity-0');
  } else {
    cartDrawer.classList.add('translate-x-full');
    cartDrawer.parentElement.classList.add('pointer-events-none');
    cartDrawer.previousElementSibling.classList.add('opacity-0');
    // Reset order complete state if it was shown
    document.getElementById('cart-content').classList.remove('hidden');
    document.getElementById('order-complete-msg').classList.add('hidden');
  }
}

function completeOrder() {
  document.getElementById('cart-content').classList.add('hidden');
  const msg = document.getElementById('order-complete-msg');
  msg.classList.remove('hidden');
  msg.classList.add('animate-zoom-in');
  cart = [];
  updateCartUI();
}

// --- GLOBAL EXPOSURE ---
window.scrollCategory = scrollCategory;
window.openModal = openModal;
window.closeModal = closeModal;
window.setDuration = setDuration;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.completeOrder = completeOrder;

init();
