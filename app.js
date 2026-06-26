const STORAGE_KEY = 'villa-il-fanale-v1';
const ADMIN_SESSION_KEY = 'villa-il-fanale-github-session';
const GITHUB_OWNER = 'leonflesca-ing';
const GITHUB_REPO = 'villa-il-fanale-gestion';
const PUBLIC_IMAGE_MAX_SIDE = 1800;
const PUBLIC_IMAGE_MAX_BYTES = 6 * 1024 * 1024;
const PUBLIC_IMAGE_QUALITY = 0.84;
const GITHUB_READ_TIMEOUT_MS = 18000;
const GITHUB_WRITE_TIMEOUT_MS = 60000;
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const money = value => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value || 0);
const dateLabel = value => value ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) : 'Sin fecha';
const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));

const defaultState = {
  leads: [],
  reservations: [],
  blocks: [],
  tasks: [],
  movements: [],
  holidays: [],
  photoLibrary: [],
  publicContent: {
    heroEyebrow: 'ALPA CORRAL · CÓRDOBA', heroTitle: 'Una casa con alma', heroSubtitle: 'de sierra.',
    heroDescription: 'Un loft amplio entre árboles, madera y silencio. Hasta cinco personas, con todo lo necesario para disfrutar sin apuro.',
    heroImage: '../assets/jardin-entrada.png', introEyebrow: 'EL ENCANTO DE LO SIMPLE', introTitle: 'Un refugio serrano', introSubtitle: 'para volver al ritmo propio.',
    introCopyOne: 'Villa il Fanale es un loft cómodo y generoso, ubicado en una zona semicéntrica de Alpa Corral. Su gran galería y su jardín invitan a pasar más tiempo afuera; su interior de techos altos, madera y objetos con historia conserva la calidez de una verdadera casa de las sierras.',
    introCopyTwo: 'Está completamente equipada para cocinar, compartir y descansar en familia o con amigos.',
    featureImage: '../assets/loft.png', featureCaptionSmall: 'El corazón de la casa', featureCaption: 'Un único espacio, muchas maneras de habitarlo.',
    spacesEyebrow: 'RECORRÉ VILLA IL FANALE', spacesTitle: 'Rincones que invitan', spacesSubtitle: 'a quedarse.', spacesDescription: 'La casa fue pensada para una estadía independiente y tranquila: cocina equipada, espacios amplios y un jardín para disfrutar la vida serrana.',
    gallery1Image: '../assets/jardin-flores.png', gallery1Caption: 'Jardín', gallery2Image: '../assets/altillo.png', gallery2Caption: 'Altillo matrimonial', gallery3Image: '../assets/asador.png', gallery3Caption: 'Asador', gallery4Image: '../assets/galeria.png', gallery4Caption: 'Galería', gallery5Image: '../assets/rincon.png', gallery5Caption: 'Rincones con historia',
    detailsImage: '../assets/cartel.png', detailsEyebrow: 'TODO LO NECESARIO', detailsTitle: 'Preparada para', detailsSubtitle: 'disfrutarla.',
    amenity1Title: 'Hasta 5 personas', amenity1Description: 'Una cama matrimonial y tres individuales.', amenity2Title: 'Cocina equipada', amenity2Description: 'Cocina a gas, heladera, microondas y vajilla completa.', amenity3Title: 'Amplia galería', amenity3Description: 'Un espacio exterior cómodo para comer y descansar.', amenity4Title: 'Jardín arbolado', amenity4Description: 'Sombra, flores y tranquilidad serrana.', amenity5Title: 'Calefacción', amenity5Description: 'Más confort para estadías frescas en las sierras.', amenity6Title: 'Alojamiento Airbnb privado', amenity6Description: 'Casa completa, independiente y sin compartir con otros huéspedes.',
    rulesEyebrow: 'ANTES DE VENIR', rulesTitle: 'Información clara,', rulesSubtitle: 'estadías tranquilas.', rule1Value: '15:00', rule1Title: 'Ingreso', rule1Description: 'Check-in desde las 15 h, coordinado personalmente.', rule2Value: '11:00', rule2Title: 'Salida', rule2Description: 'Check-out hasta las 11 h.', rule3Value: '2+', rule3Title: 'Noches', rule3Description: 'Estadía mínima habitual de dos noches.', rule4Value: '50%', rule4Title: 'Seña', rule4Description: 'La reserva se confirma al recibir el 50%.', importantText: 'No incluye ropa blanca · No se permiten fiestas ni fumar dentro de la casa.',
    locationEyebrow: 'UBICACIÓN', locationTitle: 'Zona semicéntrica', locationSubtitle: 'de Alpa Corral.', locationDescription: 'Villa il Fanale se encuentra sobre calle Los Ligustros, en una zona semicéntrica de Alpa Corral: cerca del movimiento del pueblo, pero con la calma propia de una casa serrana.',
    locationMapQuery: 'Calle Los Ligustros, Alpa Corral, Córdoba', locationMapLink: 'https://maps.app.goo.gl/26wKytrGYrjpThU98',
    bookingEyebrow: 'TU PRÓXIMA ESCAPADA', bookingTitle: 'Consultá tus fechas.', bookingDescription: 'Completá los datos básicos. La solicitud no bloquea el calendario: te responderemos con disponibilidad y valor definitivo. La reserva queda confirmada únicamente con la seña.', bookingImage: '../assets/frente.png', footerLocation: 'Alpa Corral · Córdoba · Argentina',
    regularNight: 60000, highNight: 65000, singleNight: 100000
  },
  inventory: [
    { id: uid(), name: 'Vajilla', detail: 'Platos, vasos y cubiertos', status: 'hay' },
    { id: uid(), name: 'Acolchados', detail: 'Para las cuatro camas', status: 'hay' },
    { id: uid(), name: 'Almohadas', detail: 'Revisar antes de cada ingreso', status: 'hay' },
    { id: uid(), name: 'Productos de limpieza', detail: 'Pisos, muebles y vidrios', status: 'poco' },
    { id: uid(), name: 'Garrafa', detail: 'Cocina y futura calefacción', status: 'hay' }
  ],
  messages: [
    { role: 'assistant', text: 'Hola, Juan. Tengo presente cómo funciona Villa il Fanale. Puedo ayudarte con precios, tareas, reservas, mejoras y publicaciones. Antes de cambiar algo importante, te voy a pedir autorización.' }
  ],
  settings: {
    owner: '', dni: '', phone: '', facebookUrl: '', instagramUrl: '', airbnbIcsUrl: '', bookingEndpoint: '', bookingAdminKey: '',
    publicSiteUrl: 'https://leonflesca-ing.github.io/villa-il-fanale-gestion/reservar/',
    metaUrl: 'https://business.facebook.com/latest/inbox/all',
    maxGuests: 5, singleNight: 100000, regularNight: 60000, highNight: 65000,
    checkin: '15:00', checkout: '11:00', minNights: 2,
    formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfbWGtz_DiTdwsPFv2W6LooVp_pfW49D_LGwdw53VBbkxa3xg/viewform?usp=header'
  }
};

let state = loadState();
let route = 'inicio';
let calendarCursor = new Date();
let leadFilter = 'todas';
let selectedPhoto = 'assets/jardin-entrada.png';
let installPrompt = null;
let pendingPublicImages = {};

function defaultGalleryItems() {
  return [
    { id: 'gallery-1', image: '../assets/jardin-flores.png', caption: 'Jardín' },
    { id: 'gallery-2', image: '../assets/altillo.png', caption: 'Altillo matrimonial' },
    { id: 'gallery-3', image: '../assets/asador.png', caption: 'Asador' },
    { id: 'gallery-4', image: '../assets/galeria.png', caption: 'Galería' },
    { id: 'gallery-5', image: '../assets/rincon.png', caption: 'Rincones con historia' }
  ];
}

function publicGalleryItems(content = state.publicContent || defaultState.publicContent) {
  if (Array.isArray(content.galleryItems)) return content.galleryItems;
  return defaultGalleryItems().map((item, index) => ({
    ...item,
    image: content[`gallery${index + 1}Image`] || item.image,
    caption: content[`gallery${index + 1}Caption`] || item.caption
  }));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved, settings: { ...defaultState.settings, ...saved.settings }, publicContent: { ...defaultState.publicContent, ...saved.publicContent } } : structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}
function saveState(message) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { toast('No queda espacio para guardar más imágenes. Eliminá alguna foto agregada.'); return false; }
  if (message) toast(message);
  return true;
}

const navItems = [
  ['inicio','⌂','Inicio'], ['consultas','◌','Consultas'], ['calendario','▦','Calendario'],
  ['conexiones','⌁','Conexiones'], ['tareas','✓','Tareas'], ['finanzas','$','Ingresos'],
  ['inventario','◇','Inventario'], ['contenido','✦','Contenido'], ['pagina','▤','Editar página'], ['asistente','✺','Asistente']
];
const mobileItems = navItems.filter(item => ['inicio','consultas','calendario','conexiones','tareas','pagina','asistente'].includes(item[0]));
const meta = {
  inicio: ['HOY EN LA VILLA', () => greeting()], consultas: ['OPORTUNIDADES', 'Consultas y reservas'],
  calendario: ['DISPONIBILIDAD', 'Calendario'], tareas: ['PREPARACIÓN', 'Tareas de la casa'],
  finanzas: ['NÚMEROS CLAROS', 'Ingresos'], inventario: ['TODO EN SU LUGAR', 'Inventario'],
  contenido: ['VOZ DE LA VILLA', 'Contenido para redes'], asistente: ['TU COPILOTO', 'Asistente de Villa il Fanale'],
  conexiones: ['CONFIGURACIÓN', 'Conexiones'], pagina: ['SITIO PÚBLICO', 'Editar página pública']
};

function greeting() {
  const hour = new Date().getHours();
  return `${hour < 12 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'}, Juan`;
}

async function init() {
  if (['127.0.0.1','localhost'].includes(location.hostname)) return startApplication();
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!token || !(await validateAdminToken(token))) return renderAccessGate(token ? 'La autorización venció o no pertenece a la cuenta propietaria.' : '');
  startApplication();
}

function startApplication() {
  renderNav();
  bindGlobal();
  fetchHolidays();
  render();
  registerServiceWorker();
  if (state.settings.bookingEndpoint && state.settings.bookingAdminKey) syncPublicRequests(true);
}

function renderAccessGate(message = '') {
  document.querySelector('.app-shell').hidden = true;
  document.querySelector('#mobile-nav').hidden = true;
  const gate = document.createElement('section');
  gate.className = 'access-gate';
  gate.innerHTML = `<div class="access-panel"><img src="assets/farol.png" alt=""><span class="eyebrow">ÁREA PRIVADA</span><h1>Administración<br>Villa il Fanale</h1><p>Este espacio contiene la gestión de la vivienda y sólo puede abrirlo la cuenta propietaria.</p>${message?`<div class="access-error">${esc(message)}</div>`:''}<form id="access-form"><label class="field"><span>Clave privada de GitHub</span><input name="token" type="password" autocomplete="off" required placeholder="github_pat_…"></label><button class="primary-button" type="submit">Ingresar de forma segura</button></form><details><summary>¿Cómo obtengo la clave?</summary><ol><li>Abrí GitHub y creá un token de acceso específico.</li><li>Elegí solamente el repositorio <b>villa-il-fanale-gestion</b>.</li><li>Permití <b>Contents: Read and write</b>.</li><li>Copiá la clave y pegala arriba. Se conserva sólo durante esta sesión.</li></ol><a class="setup-link" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">Crear clave en GitHub →</a></details></div>`;
  document.body.appendChild(gate);
  gate.querySelector('#access-form').addEventListener('submit', async event => {
    event.preventDefault(); const button = event.currentTarget.querySelector('button'); const token = event.currentTarget.elements.token.value.trim();
    button.disabled = true; button.textContent = 'Comprobando…';
    if (await validateAdminToken(token)) { sessionStorage.setItem(ADMIN_SESSION_KEY, token); location.reload(); }
    else { button.disabled = false; button.textContent = 'Ingresar de forma segura'; gate.querySelector('.access-error')?.remove(); const error=document.createElement('div');error.className='access-error';error.textContent='La clave no es válida o no pertenece a la cuenta propietaria.';event.currentTarget.before(error); }
  });
}

async function validateAdminToken(token) {
  if (!token) return false;
  try { const response = await fetchWithTimeout('https://api.github.com/user', { headers: githubHeaders(token) }, GITHUB_READ_TIMEOUT_MS); const profile = await response.json(); return response.ok && profile.login === GITHUB_OWNER; }
  catch { return false; }
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  if (route === 'conexiones') render();
});

function renderNav() {
  document.querySelector('#desktop-nav').innerHTML = navItems.map(navButton).join('');
  document.querySelector('#mobile-nav').innerHTML = mobileItems.map(navButton).join('');
  document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.route)));
}
function navButton([key, icon, label]) {
  return `<button class="nav-item ${route === key ? 'active' : ''}" data-route="${key}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`;
}
function navigate(next) {
  route = next;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.route === route));
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function render() {
  const [kicker, title] = meta[route];
  document.querySelector('#page-kicker').textContent = kicker;
  document.querySelector('#page-title').textContent = typeof title === 'function' ? title() : title;
  document.querySelector('#quick-add').textContent = '＋ Cargar reserva';
  const pages = { inicio: renderDashboard, consultas: renderLeads, calendario: renderCalendar, tareas: renderTasks, finanzas: renderFinances, inventario: renderInventory, contenido: renderContent, pagina: renderPublicEditor, asistente: renderAssistant, conexiones: renderConnections };
  document.querySelector('#app').innerHTML = pages[route]();
  bindPage();
}

function bindGlobal() {
  document.querySelector('#quick-add').addEventListener('click', () => openReservationModal());
  document.querySelector('#import-calendar').addEventListener('click', () => document.querySelector('#calendar-file').click());
  document.querySelector('#calendar-file').addEventListener('change', importICS);
}
function bindPage() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action, button.dataset.id)));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { leadFilter = button.dataset.filter; render(); }));
  document.querySelectorAll('[data-task]').forEach(input => input.addEventListener('change', () => toggleTask(input.dataset.task)));
  document.querySelectorAll('[data-inventory]').forEach(button => button.addEventListener('click', () => cycleInventory(button.dataset.inventory)));
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    const photo = allPhotos().find(item => item.id === button.dataset.photo);
    if (photo) selectedPhoto = photo.src;
    render();
  }));
  const chatForm = document.querySelector('#chat-form');
  if (chatForm) chatForm.addEventListener('submit', submitChat);
  document.querySelectorAll('[data-prompt]').forEach(button => button.addEventListener('click', () => askAssistant(button.dataset.prompt)));
  const postType = document.querySelector('#post-type');
  if (postType) postType.addEventListener('change', render);
  const visualUpload = document.querySelector('#visual-upload');
  if (visualUpload) visualUpload.addEventListener('change', handleVisualUpload);
  document.querySelectorAll('[data-delete-photo]').forEach(button => button.addEventListener('click', event => {
    event.stopPropagation(); deleteUploadedPhoto(button.dataset.deletePhoto);
  }));
  const connectionsForm = document.querySelector('#connections-form');
  if (connectionsForm) connectionsForm.addEventListener('submit', saveConnections);
  const publicEditorForm = document.querySelector('#public-editor-form');
  if (publicEditorForm) publicEditorForm.addEventListener('submit', savePublicDraft);
  document.querySelectorAll('[data-image-slot]').forEach(button => button.addEventListener('click', () => document.querySelector(`[data-image-input="${button.dataset.imageSlot}"]`)?.click()));
  document.querySelectorAll('[data-image-input]').forEach(input => input.addEventListener('change', () => handlePublicImageSelected(input)));
  document.querySelectorAll('[data-remove-gallery-item]').forEach(button => button.addEventListener('click', () => removePublicGalleryItem(button.dataset.removeGalleryItem)));
  const backupFile = document.querySelector('#backup-file');
  if (backupFile) backupFile.addEventListener('change', importBackup);
}

function handleAction(action, id) {
  const actions = {
    newLead: openLeadModal, newReservation: openReservationModal, newBlock: openBlockModal,
    convert: () => openReservationModal(state.leads.find(x => x.id === id)),
    whatsapp: () => openWhatsApp(id), deleteLead: () => deleteLead(id),
    details: () => openReservationDetails(id), editReservation: () => openReservationModal(null, state.reservations.find(x => x.id === id)),
    cancelReservation: () => openCancelReservationModal(id), deleteReservation: () => deleteReservation(id),
    addTask: openTaskModal,
    addMovement: openMovementModal, addInventory: openInventoryModal,
    prevMonth: () => { calendarCursor.setMonth(calendarCursor.getMonth() - 1); render(); },
    nextMonth: () => { calendarCursor.setMonth(calendarCursor.getMonth() + 1); render(); },
    copyPost: copyPost, sharePost: sharePost, downloadPhoto: downloadSelectedPhoto,
    addVisuals: () => document.querySelector('#visual-upload')?.click(),
    openInstagram: () => window.open('https://www.instagram.com/', '_blank'),
    importCalendar: () => document.querySelector('#calendar-file').click(),
    openForm: () => window.open(state.settings.formUrl, '_blank'),
    openMeta: () => window.open(state.settings.metaUrl || 'https://business.facebook.com/latest/inbox/all', '_blank'),
    openFacebook: () => openConfiguredLink('facebookUrl', 'Facebook'),
    openInstagram: () => openConfiguredLink('instagramUrl', 'Instagram'),
    openPublicSite: () => window.open(state.settings.publicSiteUrl, '_blank'),
    syncPublicRequests: () => syncPublicRequests(false),
    syncAirbnb: syncAirbnbCalendar, installApp: installApplication,
    exportBackup: exportBackup, importBackup: () => document.querySelector('#backup-file')?.click(),
    publishPublicPage: publishPublicPage,
    previewPublicPage: previewPublicPage, logoutAdmin: logoutAdmin,
    addPublicGalleryItem: addPublicGalleryItem
  };
  actions[action]?.();
}

function renderDashboard() {
  const upcoming = activeReservations().filter(r => r.checkout >= todayISO()).sort((a,b) => a.checkin.localeCompare(b.checkin));
  const next = upcoming[0];
  const pendingTasks = state.tasks.filter(t => !t.done).length;
  const confirmedIncome = sumMovements('income');
  const activeLeads = state.leads.filter(l => l.status !== 'convertida').length;
  const daysToNext = next ? Math.ceil((new Date(`${next.checkin}T12:00:00`) - new Date()) / 86400000) : null;
  return `
    <section class="hero">
      <div class="hero-copy">
        <span class="eyebrow" style="color:#ead6ae">LOFT SERRANO · DESDE 1981</span>
        <h2>${next ? `Próxima llegada:<br>${esc(next.guest)}` : 'La villa está lista<br>para su próxima historia'}</h2>
        <p>${next ? `${dateLabel(next.checkin)} · ${next.guests} huéspedes · ${next.nights} noches. ${tasksForReservation(next.id).filter(t => !t.done).length} tareas pendientes.` : 'Todavía no hay una llegada próxima. Registrá una consulta o una reserva para poner el sistema en movimiento.'}</p>
        <div class="hero-actions">
          <button class="secondary-button" data-action="newLead">Registrar consulta manual</button>
          <button class="ghost-button" style="color:white;border-color:rgba(255,255,255,.4)" data-action="newReservation">Cargar reserva</button>
        </div>
      </div>
    </section>
    <section class="stats-grid">
      ${stat('Consultas activas', activeLeads, 'Señales de demanda')}
      ${stat('Próximas estadías', upcoming.length, 'Reservas con seña')}
      ${stat('Tareas pendientes', pendingTasks, pendingTasks ? 'Para poner al día' : 'Todo en orden')}
      ${stat('Ingresos registrados', money(confirmedIncome), 'Histórico cargado')}
    </section>
    <section class="content-grid">
      <div class="card">
        <div class="card-header"><div><span class="eyebrow">PRÓXIMAMENTE</span><h2>Llegadas</h2></div><button class="ghost-button" data-route="calendario" onclick="navigate('calendario')">Ver calendario</button></div>
        ${upcoming.length ? `<div class="list">${upcoming.slice(0,4).map(reservationRow).join('')}</div>` : empty('⌂','Sin reservas próximas','Cuando recibas una seña, la estadía aparecerá acá.')}
      </div>
      <div class="card">
        <div class="card-header"><div><span class="eyebrow">ATENCIÓN</span><h2>Para resolver</h2></div></div>
        ${pendingTasks ? `<div class="list">${state.tasks.filter(t=>!t.done).slice(0,5).map(taskMini).join('')}</div>` : empty('✓','Todo tranquilo','No hay tareas pendientes.')}
        ${daysToNext !== null && daysToNext <= 2 ? `<div class="quote-box"><b>Recordatorio de llegada</b><p style="margin:5px 0 0">${esc(next.guest)} ingresa ${daysToNext <= 0 ? 'hoy' : `en ${daysToNext} día${daysToNext===1?'':'s'}`}.</p></div>` : ''}
      </div>
    </section>`;
}
function stat(label, value, note) { return `<article class="stat-card"><span class="eyebrow">${label}</span><strong>${value}</strong><small>${note}</small></article>`; }
function empty(icon, title, note) { return `<div class="empty"><span class="empty-icon">${icon}</span><b>${title}</b><p>${note}</p></div>`; }
function reservationRow(r) {
  const cancelled = r.status === 'cancelled'; const balance = cancelled ? 0 : Number(r.total) - Number(r.paid || 0);
  return `<div class="list-item ${cancelled?'cancelled-row':''}"><div class="list-item-main"><b>${esc(r.guest)}</b><p>${dateLabel(r.checkin)} → ${dateLabel(r.checkout)} · ${r.guests} huéspedes</p></div><div class="row-actions"><span class="pill ${cancelled?'rust':''}"><span class="dot"></span>${cancelled?'Cancelada':'Confirmada'}</span><button data-action="details" data-id="${r.id}">${cancelled?'Ver historial':balance > 0 ? `Saldo ${money(balance)}` : 'Ver'}</button></div></div>`;
}
function taskMini(t) { return `<div class="list-item"><div class="list-item-main"><b>${esc(t.title)}</b><p>${esc(t.category)} · ${t.due ? dateLabel(t.due) : 'Sin fecha'}</p></div></div>`; }

function renderLeads() {
  const filters = [['todas','Todas'],['nueva','Nuevas'],['presupuesto','Presupuesto enviado'],['convertida','Convertidas']];
  const rows = state.leads.filter(l => leadFilter === 'todas' || l.status === leadFilter);
  const automatic = state.settings.bookingEndpoint && state.settings.bookingAdminKey;
  return `<section class="booking-intake ${automatic?'connected':''}"><div><span class="booking-intake-icon">${automatic?'✓':'⌂'}</span><div><b>${automatic?'Página de reservas conectada':'Tu página pública está lista'}</b><p>${automatic?'Las solicitudes de la web pueden entrar automáticamente a esta bandeja.':'Los huéspedes pueden consultar fechas y enviarte su solicitud por WhatsApp.'}</p></div></div><div class="row-actions"><button data-action="openPublicSite">Ver página pública</button>${automatic?'<button class="primary-button" data-action="syncPublicRequests">Buscar solicitudes</button>':''}</div></section>
  <section class="card">
    <div class="card-header"><div><span class="eyebrow">DE LA WEB, WHATSAPP, FACEBOOK, INSTAGRAM Y AIRBNB</span><h2>Consultas</h2><p class="muted">La carga manual sigue disponible para cualquier conversación que quieras registrar.</p></div><button class="primary-button" data-action="newLead">＋ Registrar consulta manual</button></div>
    <div class="filters">${filters.map(([k,l]) => `<button class="filter ${leadFilter===k?'active':''}" data-filter="${k}">${l}</button>`).join('')}</div>
    ${rows.length ? `<div class="list">${rows.map(leadRow).join('')}</div>` : empty('◌','No hay consultas en esta vista','Cargá la próxima persona que pregunte por fechas.')}
  </section>`;
}
function leadRow(l) {
  const available = checkAvailability(l.checkin, l.checkout);
  return `<div class="list-item"><div class="list-item-main"><b>${esc(l.name)}</b> <span class="pill gray">${esc(l.channel)}</span><p>${dateLabel(l.checkin)} → ${dateLabel(l.checkout)} · ${l.guests} personas · ${available ? 'Disponible' : 'Cruza una fecha ocupada'}</p></div><div class="row-actions"><span class="pill ${l.status==='nueva'?'warn':''}">${statusLabel(l.status)}</span><button data-action="whatsapp" data-id="${l.id}">Responder</button>${l.status!=='convertida'?`<button data-action="convert" data-id="${l.id}">Confirmar seña</button>`:''}<button class="danger" data-action="deleteLead" data-id="${l.id}">×</button></div></div>`;
}
function statusLabel(status) { return ({ nueva:'Nueva', presupuesto:'Presupuesto enviado', convertida:'Reserva confirmada' })[status] || status; }

function renderCalendar() {
  const year = calendarCursor.getFullYear(), month = calendarCursor.getMonth();
  const label = new Intl.DateTimeFormat('es-AR', { month:'long', year:'numeric' }).format(calendarCursor);
  const first = new Date(year, month, 1); const start = new Date(year, month, 1 - ((first.getDay()+6)%7));
  const days = Array.from({length:42}, (_,i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });
  return `<section class="card">
    <div class="card-header"><div><span class="eyebrow">RESERVAS, BLOQUEOS Y FERIADOS</span><h2>Disponibilidad</h2></div><div class="row-actions"><button data-action="newBlock">Bloquear fechas</button><button data-action="newReservation">Cargar reserva</button><button data-action="importCalendar">Importar .ics</button></div></div>
    <div class="calendar-toolbar"><button class="icon-button" data-action="prevMonth">‹</button><h2>${label}</h2><button class="icon-button" data-action="nextMonth">›</button></div>
    <div class="calendar-grid">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<div class="weekday">${x}</div>`).join('')}${days.map(d=>calendarDay(d,month)).join('')}</div>
  </section>
  <section class="content-grid"><div class="card"><h2>Reservas confirmadas</h2>${activeReservations().length?`<div class="list">${activeReservations().sort((a,b)=>a.checkin.localeCompare(b.checkin)).map(reservationRow).join('')}</div>`:empty('▦','Calendario despejado','No hay reservas activas.')}${cancelledReservations().length?`<details class="history"><summary>${cancelledReservations().length} reserva${cancelledReservations().length===1?'':'s'} cancelada${cancelledReservations().length===1?'':'s'}</summary><div class="list">${cancelledReservations().map(reservationRow).join('')}</div></details>`:''}</div><div class="card"><h2>Calendarios conectados</h2><p class="muted">Airbnb puede sincronizar disponibilidad en ambos sentidos mediante dos enlaces iCal. La aplicación necesita un servidor de calendario para ofrecer su propio enlace; la importación actual todavía es una copia manual.</p><button class="secondary-button" data-route="conexiones" onclick="navigate('conexiones')">Ver conexiones</button></div></section>`;
}
function calendarDay(d, shownMonth) {
  const iso = localISO(d); const events = [];
  activeReservations().forEach(r => { if (iso >= r.checkin && iso < r.checkout) events.push(`<div class="calendar-event">${esc(r.guest)}</div>`); });
  state.blocks.forEach(b => { if (iso >= b.start && iso <= b.end) events.push(`<div class="calendar-event blocked">Bloqueado</div>`); });
  const holiday = state.holidays.find(h => h.fecha === iso || h.date === iso); if (holiday) events.push(`<div class="calendar-event blocked">${esc(holiday.nombre || holiday.localName)}</div>`);
  return `<div class="day ${d.getMonth()!==shownMonth?'outside':''} ${iso===todayISO()?'today':''}"><span class="day-number">${d.getDate()}</span>${events.slice(0,3).join('')}</div>`;
}
function renderTasks() {
  const open = state.tasks.filter(t=>!t.done), done = state.tasks.filter(t=>t.done);
  return `<section class="card"><div class="card-header"><div><span class="eyebrow">CHECKLIST OPERATIVO</span><h2>Preparar Villa il Fanale</h2><p class="muted">Cada reserva crea su lista automáticamente. Las fotos son opcionales.</p></div><button class="primary-button" data-action="addTask">＋ Nueva tarea</button></div>
  ${open.length ? groupTasks(open) : empty('✓','No hay tareas pendientes','La casa está al día.')}
  ${done.length ? `<details><summary>${done.length} tareas terminadas</summary>${groupTasks(done)}</details>` : ''}</section>`;
}
function groupTasks(tasks) {
  const groups = Object.groupBy ? Object.groupBy(tasks, t=>t.category) : tasks.reduce((o,t)=>((o[t.category]??=[]).push(t),o),{});
  return Object.entries(groups).map(([category,items]) => `<div class="task-group"><div class="task-group-title">${esc(category)}</div>${items.map(t=>`<label class="task ${t.done?'done':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><span>${esc(t.title)} ${t.due?`<small class="muted">· ${dateLabel(t.due)}</small>`:''}</span></label>`).join('')}</div>`).join('');
}

function renderFinances() {
  const income = sumMovements('income'), expenses = sumMovements('expense'), balance = income-expenses;
  return `<section class="card"><div class="card-header"><div><span class="eyebrow">CONTROL SIMPLE</span><h2>Ingresos de la villa</h2><p class="muted">Empezamos por ingresos; los gastos pueden sumarse cuando lo necesites.</p></div><button class="primary-button" data-action="addMovement">＋ Registrar movimiento</button></div>
    <div class="finance-summary"><div class="money"><small>Ingresos</small><strong>${money(income)}</strong></div><div class="money expense"><small>Gastos</small><strong>${money(expenses)}</strong></div><div class="money balance"><small>Resultado</small><strong>${money(balance)}</strong></div></div>
    ${state.movements.length?`<div class="list">${[...state.movements].reverse().map(m=>`<div class="list-item"><div><b>${esc(m.label)}</b><p class="muted">${dateLabel(m.date)} · ${m.type==='income'?'Ingreso':m.type==='reversal'?'Anulación':'Gasto'}</p></div><strong style="color:${m.type==='income'?'var(--pine)':'var(--rust)'}">${m.type==='income'?'+':'−'} ${money(m.amount)}</strong></div>`).join('')}</div>`:empty('$','Todavía no hay movimientos','El primer ingreso aparecerá cuando confirmes una reserva o lo cargues manualmente.')}
  </section>`;
}
function sumMovements(type) {
  if (type === 'income') return state.movements.reduce((sum,m) => sum + (m.type==='income'?Number(m.amount):m.type==='reversal'?-Number(m.amount):0), 0);
  return state.movements.filter(m=>m.type===type).reduce((s,m)=>s+Number(m.amount),0);
}

function renderInventory() {
  return `<section class="card"><div class="card-header"><div><span class="eyebrow">HAY · QUEDA POCO · FALTA</span><h2>Inventario esencial</h2></div><button class="primary-button" data-action="addInventory">＋ Agregar elemento</button></div><div class="inventory-grid">${state.inventory.map(i=>`<article class="inventory-item"><h3>${esc(i.name)}</h3><p class="muted">${esc(i.detail)}</p><button class="status-button status-${i.status}" data-inventory="${i.id}">${({hay:'Hay',poco:'Queda poco',falta:'Falta'})[i.status]}</button></article>`).join('')}</div></section>`;
}

const builtInPhotos = [
  ['assets/jardin-entrada.png','El jardín'],['assets/jardin-flores.png','Flores'],['assets/loft.png','El loft'],
  ['assets/altillo.png','Altillo'],['assets/asador.png','Asador'],['assets/galeria.png','Galería'],['assets/cartel.png','Historia'],['assets/frente.png','Frente']
];
function allPhotos() {
  return [
    ...builtInPhotos.map(([src,label]) => ({ id: src, src, label, uploaded: false })),
    ...(state.photoLibrary || []).map(photo => ({ ...photo, uploaded: true }))
  ];
}
function renderContent() {
  const type = document.querySelector('#post-type')?.value || 'escapada';
  const copy = postCopy(type);
  const photos = allPhotos();
  if (!photos.some(photo => photo.src === selectedPhoto)) selectedPhoto = photos[0].src;
  return `<section class="generator"><div class="card"><div class="card-header"><div><span class="eyebrow">ELEGANTE, CÁLIDO Y SERRANO</span><h2>Biblioteca visual</h2><p class="muted">Elegí una foto existente o agregá material nuevo.</p></div><button class="secondary-button" data-action="addVisuals">＋ Agregar fotos</button></div><input type="file" id="visual-upload" accept="image/jpeg,image/png,image/webp" multiple hidden><div class="photo-grid">${photos.map(photo=>`<div class="photo-tile"><button class="photo-option ${selectedPhoto===photo.src?'selected':''}" data-photo="${photo.id}" title="${esc(photo.label)}"><img src="${photo.src}" alt="${esc(photo.label)}"></button>${photo.uploaded?`<button class="photo-delete" data-delete-photo="${photo.id}" aria-label="Eliminar ${esc(photo.label)}">×</button>`:''}</div>`).join('')}</div><p class="library-count">${photos.length} imágenes · Las fotos agregadas quedan guardadas en este dispositivo.</p></div>
  <div class="card"><div class="card-header"><div><span class="eyebrow">BORRADOR PARA REDES</span><h2>Nueva publicación</h2></div><select id="post-type" style="width:auto"><option value="escapada" ${type==='escapada'?'selected':''}>Escapada serrana</option><option value="disponibilidad" ${type==='disponibilidad'?'selected':''}>Fechas disponibles</option><option value="historia" ${type==='historia'?'selected':''}>Historia de la casa</option></select></div><div class="post-preview"><img src="${selectedPhoto}" alt="Vista previa"><div class="post-copy" id="post-copy">${esc(copy)}</div></div><div class="share-tip"><span>↗</span><p><b>Desde el celular</b><br>Compartí la imagen y elegí Instagram en el menú del dispositivo. El texto también quedará copiado para pegarlo como descripción.</p></div><div class="form-actions post-actions"><button class="ghost-button" data-action="copyPost">Copiar texto</button><button class="ghost-button" data-action="downloadPhoto">Guardar imagen</button><button class="primary-button" data-action="sharePost">Compartir publicación</button></div></div></section>`;
}

function renderPublicEditor() {
  const content = state.publicContent || defaultState.publicContent;
  const galleryItems = publicGalleryItems(content);
  return `<section class="editor-intro card"><div><span class="eyebrow">EDITOR DEL SITIO</span><h2>Tu página, sin tocar código</h2><p class="muted">Modificá el contenido, guardá un borrador y publicalo cuando estés conforme. Los visitantes sólo ven la última versión publicada.</p></div><div class="editor-status"><span class="dot"></span><div><b>Acceso verificado</b><small>Cuenta ${GITHUB_OWNER}</small></div></div></section>
  <form id="public-editor-form" class="page-editor">
    <div class="card editor-sidebar"><span class="eyebrow">EDITOR COMPLETO</span><h3>Todos los contenidos</h3><p class="muted">Podés cambiar los textos, precios y las fotografías del sitio. Guardá primero un borrador y publicá sólo cuando estés conforme.</p><a href="#editor-portada">Portada</a><a href="#editor-historia">Historia</a><a href="#editor-galeria">Galería</a><a href="#editor-servicios">Servicios</a><a href="#editor-normas">Normas</a><a href="#editor-ubicacion">Ubicación</a><a href="#editor-reservas">Reservas</a><button type="button" class="ghost-button" data-action="previewPublicPage">Ver página publicada</button><button type="button" class="danger-link" data-action="logoutAdmin">Cerrar sesión privada</button></div>
    <div class="editor-fields">
      <section class="card" id="editor-portada"><div class="card-header"><div><span class="eyebrow">PORTADA</span><h2>Primera impresión</h2></div></div><div class="form-grid">
        ${field('Texto superior','heroEyebrow','text','ALPA CORRAL · CÓRDOBA',true,undefined,undefined,content.heroEyebrow)}
        ${field('Título principal','heroTitle','text','Una casa con alma',true,undefined,undefined,content.heroTitle)}
        ${field('Título destacado','heroSubtitle','text','de sierra.',true,undefined,undefined,content.heroSubtitle)}
        ${editorTextArea('Descripción breve','heroDescription',content.heroDescription,3)}
      </div>${editorImage('heroImage','Imagen de portada',content.heroImage)}</section>
      <section class="card" id="editor-historia"><div class="card-header"><div><span class="eyebrow">HISTORIA</span><h2>Presentación de la villa</h2></div></div><div class="form-grid">
        ${field('Texto superior','introEyebrow','text','EL ENCANTO DE LO SIMPLE',true,undefined,undefined,content.introEyebrow)}
        ${field('Título','introTitle','text','Un refugio serrano',true,undefined,undefined,content.introTitle)}
        ${field('Continuación','introSubtitle','text','para volver al ritmo propio.',true,undefined,undefined,content.introSubtitle)}
        ${editorTextArea('Primer párrafo','introCopyOne',content.introCopyOne,5)}
        ${editorTextArea('Segundo párrafo','introCopyTwo',content.introCopyTwo,3)}
        ${field('Leyenda pequeña de la foto','featureCaptionSmall','text','El corazón de la casa',true,undefined,undefined,content.featureCaptionSmall)}
        ${field('Leyenda principal de la foto','featureCaption','text','Un único espacio…',true,undefined,undefined,content.featureCaption)}
      </div>${editorImage('featureImage','Imagen interior de ancho completo',content.featureImage)}</section>
      <section class="card" id="editor-galeria"><div class="card-header"><div><span class="eyebrow">ESPACIOS Y GALERÍA</span><h2>Recorrido fotográfico</h2></div><button type="button" class="secondary-button" data-action="addPublicGalleryItem">＋ Agregar foto</button></div><div class="form-grid">
        ${field('Texto superior','spacesEyebrow','text','RECORRÉ VILLA IL FANALE',true,undefined,undefined,content.spacesEyebrow)}
        ${field('Título','spacesTitle','text','Rincones que invitan',true,undefined,undefined,content.spacesTitle)}
        ${field('Continuación','spacesSubtitle','text','a quedarse.',true,undefined,undefined,content.spacesSubtitle)}
        ${editorTextArea('Descripción','spacesDescription',content.spacesDescription,3)}
      </div><div class="editor-gallery dynamic-gallery">${galleryItems.map((item,index)=>editorGalleryItem(item,index)).join('')}</div><p class="muted gallery-help">Podés agregar, eliminar, cambiar fotografía y editar el nombre visible de cada imagen. Se publican cuando tocás “Publicar cambios”.</p></section>
      <section class="card" id="editor-servicios"><div class="card-header"><div><span class="eyebrow">SERVICIOS</span><h2>Equipamiento y comodidades</h2></div></div><div class="form-grid">
        ${field('Texto superior','detailsEyebrow','text','TODO LO NECESARIO',true,undefined,undefined,content.detailsEyebrow)}${field('Título','detailsTitle','text','Preparada para',true,undefined,undefined,content.detailsTitle)}${field('Continuación','detailsSubtitle','text','disfrutarla.',true,undefined,undefined,content.detailsSubtitle)}
        ${[1,2,3,4,5,6].map(i=>`${field(`Servicio ${i}` ,`amenity${i}Title`,'text','',true,undefined,undefined,content[`amenity${i}Title`])}${field(`Descripción ${i}`,`amenity${i}Description`,'text','',true,undefined,undefined,content[`amenity${i}Description`])}`).join('')}
      </div>${editorImage('detailsImage','Imagen lateral de servicios',content.detailsImage)}</section>
      <section class="card" id="editor-normas"><div class="card-header"><div><span class="eyebrow">NORMAS Y HORARIOS</span><h2>Información antes de venir</h2></div></div><div class="form-grid">
        ${field('Texto superior','rulesEyebrow','text','ANTES DE VENIR',true,undefined,undefined,content.rulesEyebrow)}${field('Título','rulesTitle','text','Información clara,',true,undefined,undefined,content.rulesTitle)}${field('Continuación','rulesSubtitle','text','estadías tranquilas.',true,undefined,undefined,content.rulesSubtitle)}
        ${[1,2,3,4].map(i=>`${field(`Dato ${i}`,`rule${i}Value`,'text','',true,undefined,undefined,content[`rule${i}Value`])}${field(`Título ${i}`,`rule${i}Title`,'text','',true,undefined,undefined,content[`rule${i}Title`])}${editorTextArea(`Explicación ${i}`,`rule${i}Description`,content[`rule${i}Description`],2)}`).join('')}
        ${editorTextArea('Aviso importante','importantText',content.importantText,3)}
      </div></section>
      <section class="card" id="editor-ubicacion"><div class="card-header"><div><span class="eyebrow">MAPA Y UBICACIÓN</span><h2>Cómo llegar</h2></div></div><div class="form-grid">
        ${field('Texto superior','locationEyebrow','text','UBICACIÓN',true,undefined,undefined,content.locationEyebrow)}
        ${field('Título','locationTitle','text','Zona semicéntrica',true,undefined,undefined,content.locationTitle)}
        ${field('Continuación','locationSubtitle','text','de Alpa Corral.',true,undefined,undefined,content.locationSubtitle)}
        ${editorTextArea('Descripción','locationDescription',content.locationDescription,4)}
        ${field('Búsqueda para el mapa','locationMapQuery','text','Calle Los Ligustros, Alpa Corral, Córdoba',true,undefined,undefined,content.locationMapQuery)}
        ${field('Botón Google Maps','locationMapLink','url','https://maps.app.goo.gl/…',true,undefined,undefined,content.locationMapLink)}
      </div></section>
      <section class="card" id="editor-reservas"><div class="card-header"><div><span class="eyebrow">CONSULTAS Y RESERVAS</span><h2>Formulario público</h2></div></div><div class="form-grid">
        ${field('Texto superior','bookingEyebrow','text','TU PRÓXIMA ESCAPADA',true,undefined,undefined,content.bookingEyebrow)}${field('Título','bookingTitle','text','Consultá tus fechas.',true,undefined,undefined,content.bookingTitle)}${editorTextArea('Explicación','bookingDescription',content.bookingDescription,4)}${field('Ubicación del pie','footerLocation','text','Alpa Corral · Córdoba · Argentina',true,undefined,undefined,content.footerLocation)}
        ${field('Una sola noche','singleNight','number','100000',true,1,undefined,content.singleNight)}
        ${field('Dos noches o más','regularNight','number','60000',true,1,undefined,content.regularNight)}
        ${field('Temporada alta','highNight','number','65000',true,1,undefined,content.highNight)}
      </div>${editorImage('bookingImage','Imagen junto al formulario',content.bookingImage)}</section>
      <div class="editor-publish"><div><b>¿Todo listo?</b><span>Primero guardá el borrador. Publicar actualizará la página que ven los huéspedes.</span></div><div class="row-actions"><button type="submit" class="ghost-button">Guardar borrador</button><button type="button" class="primary-button" data-action="publishPublicPage">Publicar cambios</button></div></div>
    </div>
  </form>`;
}

function editorTextArea(label,name,value,rows=3) { return `<label class="field full"><span>${label}</span><textarea name="${name}" rows="${rows}" required>${esc(value)}</textarea></label>`; }
function editorImage(key,label,src) { const preview=src?.startsWith('../')?src.slice(3):src; return `<div class="editor-image editor-image-slot"><img id="preview-${key}" src="${esc(preview||'assets/loft.png')}" alt="${esc(label)}"><div><b>${esc(label)}</b><p class="muted">JPG, PNG o WebP.</p><button type="button" class="secondary-button" data-image-slot="${key}">Cambiar fotografía</button><small id="file-${key}">${esc(src||'Imagen actual')}</small></div><input type="file" data-image-input="${key}" accept="image/jpeg,image/png,image/webp" hidden></div>`; }
function editorGalleryItem(item,index) {
  const key = `galleryItem-${item.id}`;
  const preview = item.image?.startsWith('../') ? item.image.slice(3) : item.image;
  return `<article class="gallery-editor-card">
    <img id="preview-${key}" src="${esc(preview || 'assets/jardin-entrada.png')}" alt="${esc(item.caption || `Foto ${index + 1}`)}">
    <label class="field"><span>Nombre visible</span><input name="galleryItemCaption:${esc(item.id)}" type="text" required value="${esc(item.caption || `Foto ${index + 1}`)}"></label>
    <div class="row-actions gallery-editor-actions"><button type="button" class="secondary-button" data-image-slot="${key}">Cambiar fotografía</button><button type="button" class="danger-link" data-remove-gallery-item="${esc(item.id)}">Eliminar</button></div>
    <small id="file-${key}">${esc(item.image || 'Imagen actual')}</small>
    <input type="file" data-image-input="${key}" accept="image/jpeg,image/png,image/webp" hidden>
  </article>`;
}

function capturePublicEditor() {
  const form = document.querySelector('#public-editor-form');
  if (!form || !form.reportValidity()) return false;
  const values = Object.fromEntries(new FormData(form));
  const currentGallery = publicGalleryItems();
  const galleryItems = currentGallery.map(item => ({
    id: item.id,
    image: item.image,
    caption: values[`galleryItemCaption:${item.id}`] || item.caption || 'Foto'
  }));
  Object.keys(values).forEach(key => {
    if (key.startsWith('galleryItemCaption:')) delete values[key];
  });
  ['singleNight','regularNight','highNight'].forEach(key => values[key] = Number(values[key]));
  state.publicContent = { ...(state.publicContent || defaultState.publicContent), ...values, galleryItems };
  return true;
}

function savePublicDraft(event) {
  event.preventDefault();
  if (!capturePublicEditor()) return;
  saveState('Borrador guardado en esta computadora');
}

async function handlePublicImageSelected(input) {
  const file = input.files?.[0];
  if (!file) return;
  const key = input.dataset.imageInput;
  try {
    const name = document.querySelector(`#file-${key}`);
    if (name) name.textContent = `Optimizando ${file.name}…`;
    const preparedFile = await preparePublicImage(file);
    pendingPublicImages[key] = preparedFile;
    const preview = document.querySelector(`#preview-${key}`);
    if (preview) preview.src = URL.createObjectURL(preparedFile);
    if (name) name.textContent = `${preparedFile.name} · ${formatFileSize(preparedFile.size)} · lista para publicar`;
    if (preparedFile.size < file.size) toast(`Imagen optimizada: ${formatFileSize(file.size)} → ${formatFileSize(preparedFile.size)}`);
  } catch (error) {
    input.value = '';
    const name = document.querySelector(`#file-${key}`);
    if (name) name.textContent = 'No se pudo preparar esta imagen';
    toast(error.message || 'No se pudo preparar la imagen. Probá con JPG, PNG o WebP.');
  }
}

function addPublicGalleryItem() {
  if (!capturePublicEditor()) return;
  const currentGallery = publicGalleryItems();
  const galleryItems = [...currentGallery, { id: uid(), image: '../assets/jardin-entrada.png', caption: `Nueva foto ${currentGallery.length + 1}` }];
  state.publicContent.galleryItems = galleryItems;
  saveState('Foto agregada al recorrido');
  render();
  setTimeout(() => document.querySelector('#editor-galeria')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
}

function removePublicGalleryItem(id) {
  if (!capturePublicEditor()) return;
  state.publicContent.galleryItems = publicGalleryItems().filter(item => item.id !== id);
  Object.keys(pendingPublicImages).forEach(key => { if (key === `galleryItem-${id}`) delete pendingPublicImages[key]; });
  saveState('Foto eliminada del recorrido');
  render();
}

async function publishPublicPage() {
  if (!capturePublicEditor()) return;
  const token = sessionStorage.getItem(ADMIN_SESSION_KEY);
  const button = document.querySelector('[data-action="publishPublicPage"]');
  if (button) { button.disabled = true; button.textContent = 'Publicando…'; }
  let published = false;
  try {
    if (!token) throw new Error('Tu sesión de GitHub se cerró. Volvé a ingresar la clave privada.');
    if (!(await validateAdminToken(token))) throw new Error('La clave de GitHub venció o ya no pertenece a la cuenta propietaria. Cerrá sesión privada e ingresá una clave nueva.');
    for (const [key,file] of Object.entries(pendingPublicImages)) {
      if (file.size > PUBLIC_IMAGE_MAX_BYTES) throw new Error(`${file.name} sigue siendo muy pesada (${formatFileSize(file.size)}). Probá con una imagen menor a ${formatFileSize(PUBLIC_IMAGE_MAX_BYTES)}.`);
      const extension = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
      const path = `assets/pagina-${key}-${Date.now()}.${extension}`;
      await githubPutFile(path, bytesToBase64(new Uint8Array(await file.arrayBuffer())), `Actualizar ${key} de la página`, token);
      if (key.startsWith('galleryItem-')) {
        const id = key.replace('galleryItem-', '');
        state.publicContent.galleryItems = publicGalleryItems().map(item => item.id === id ? { ...item, image: `../${path}` } : item);
      } else {
        state.publicContent[key] = `../${path}`;
      }
    }
    pendingPublicImages = {};
    const json = `${JSON.stringify(state.publicContent, null, 2)}\n`;
    await githubPutFile('reservar/content.json', textToBase64(json), 'Actualizar contenido de la página pública', token);
    const publicConfig = `window.VILLA_CONFIG = ${JSON.stringify({ bookingEndpoint: state.settings.bookingEndpoint || '', whatsapp: normalizeWhatsApp(state.settings.phone || '3584849524') }, null, 2)};\n`;
    await githubPutFile('reservar/config.js', textToBase64(publicConfig), 'Actualizar conexión de la página pública', token);
    state.settings.singleNight = state.publicContent.singleNight;
    state.settings.regularNight = state.publicContent.regularNight;
    state.settings.highNight = state.publicContent.highNight;
    saveState();
    published = true;
    toast('Cambios publicados. Si cambiaste fotos, esperá un minuto y recargá la página pública para verlas definitivas.');
    if (button) {
      button.textContent = 'Publicado ✓';
      setTimeout(() => { button.disabled = false; button.textContent = 'Publicar cambios'; }, 2200);
    }
  } catch (error) {
    toast(error.message || 'No se pudo publicar. Revisá los permisos de la clave.');
  } finally {
    if (button && !published) { button.disabled = false; button.textContent = 'Publicar cambios'; }
  }
}

async function githubPutFile(path, content, message, token) {
  const endpoint = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const current = await fetchWithTimeout(endpoint, { headers: githubHeaders(token) }, GITHUB_READ_TIMEOUT_MS);
  let sha;
  if (current.ok) sha = (await current.json()).sha;
  else if (current.status !== 404) throw new Error(await githubErrorMessage(current, 'No se pudo leer el sitio en GitHub.'));
  const response = await fetchWithTimeout(endpoint, { method:'PUT', headers:{ ...githubHeaders(token), 'Content-Type':'application/json' }, body:JSON.stringify({ message, content, branch:'main', ...(sha?{sha}:{}) }) }, GITHUB_WRITE_TIMEOUT_MS);
  if (!response.ok) throw new Error(await githubErrorMessage(response, 'GitHub no pudo guardar este cambio.'));
}

async function fetchWithTimeout(resource, options = {}, timeout = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(resource, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('GitHub tardó demasiado en responder. Revisá la conexión y volvé a intentar; no se borró tu borrador.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function githubErrorMessage(response, fallback) {
  let detail = '';
  try {
    const payload = await response.clone().json();
    detail = payload?.message ? ` Detalle: ${payload.message}` : '';
  } catch {}
  if (response.status === 401) return 'La clave de GitHub no es válida o venció. Cerrá sesión privada e ingresá una clave nueva.';
  if (response.status === 403) return 'La clave necesita permiso “Contents: Read and write” para este repositorio, o GitHub bloqueó temporalmente la operación.' + detail;
  if (response.status === 404) return 'GitHub no encuentra el repositorio con esta clave. Revisá que la clave tenga acceso a villa-il-fanale-gestion.' + detail;
  if (response.status === 409) return 'GitHub recibió cambios al mismo tiempo. Esperá unos segundos y tocá “Publicar cambios” de nuevo.';
  if (response.status === 413 || response.status === 422) return 'GitHub rechazó el archivo o el cambio. Si era una foto, probá con una imagen más liviana.' + detail;
  return `${fallback} Código ${response.status}.${detail}`;
}

function githubHeaders(token) { return { Authorization:`Bearer ${token}`, Accept:'application/vnd.github+json', 'X-GitHub-Api-Version':'2022-11-28' }; }
function textToBase64(text) { return bytesToBase64(new TextEncoder().encode(text)); }
function bytesToBase64(bytes) {
  let binary = '';
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) binary += String.fromCharCode(...bytes.subarray(index, index + chunk));
  return btoa(binary);
}
async function preparePublicImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('El archivo elegido no parece ser una imagen.');
  if (file.type === 'image/gif') throw new Error('Por ahora la página no admite GIF. Usá JPG, PNG o WebP.');
  const image = await loadImageFile(file);
  const scale = Math.min(1, PUBLIC_IMAGE_MAX_SIDE / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = '#fffdf8';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', PUBLIC_IMAGE_QUALITY));
  if (!blob) throw new Error('No se pudo optimizar esta imagen. Probá con otra foto.');
  const name = `${file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9-_]+/gi, '-').replace(/^-|-$/g, '') || 'foto'}.jpg`;
  const prepared = new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
  return prepared.size <= file.size || file.size > PUBLIC_IMAGE_MAX_BYTES ? prepared : file;
}
function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No pude leer esta imagen. Probá con JPG, PNG o WebP.')); };
    image.src = url;
  });
}
function formatFileSize(bytes) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.0','')} MB`;
}
function previewPublicPage() { window.open(`${state.settings.publicSiteUrl}?v=${Date.now()}`, '_blank'); }
function logoutAdmin() { sessionStorage.removeItem(ADMIN_SESSION_KEY); location.reload(); }
function postCopy(type) {
  const variants = {
    escapada: `Un refugio con alma de sierra. 🌿\n\nVilla il Fanale es un loft amplio y totalmente equipado para hasta 5 personas, con jardín, galería y asador en una zona tranquila de Alpa Corral.\n\nUn lugar para bajar el ritmo, cocinar sin apuro y volver a escuchar el silencio.\n\nConsultas y reservas por WhatsApp: ${state.settings.phone}\n\n#AlpaCorral #SierrasDeCórdoba #VillaIlFanale #EscapadaSerrana`,
    disponibilidad: `Hay fechas disponibles para una pausa en las sierras. ✨\n\nLoft serrano para hasta 5 personas, equipado para disfrutar en familia o con amigos. Estadía mínima de dos noches.\n\nEscribinos por WhatsApp para consultar disponibilidad: ${state.settings.phone}\n\n#AlpaCorral #TurismoCórdoba #VillaIlFanale`,
    historia: `Desde 1981, este farol acompaña las historias de Villa il Fanale. 🏮\n\nMadera, jardín y esos rincones que conservan el encanto de las casas serranas. Hoy abrimos sus puertas para compartirla con quienes buscan descanso y naturaleza.\n\n#VillaIlFanale #LoftSerrano #AlpaCorral`
  }; return variants[type];
}

function renderAssistant() {
  const prompts = ['¿Qué tengo que hacer hoy?','Sugerime un precio','¿Cómo viene el negocio?','Ayudame con la calefacción','Creá una publicación'];
  return `<section class="chat-layout"><aside class="card chat-prompts"><span class="eyebrow">ATAJOS</span><h2>Preguntame</h2>${prompts.map(p=>`<button data-prompt="${esc(p)}">${esc(p)}</button>`).join('')}<p class="muted" style="margin-top:20px;font-size:12px">Las recomendaciones se basan en la información cargada. Para investigar precios o productos actuales, el asistente te propone una búsqueda y te pide autorización.</p></aside><div class="card chat-box"><div class="messages" id="messages">${state.messages.map(m=>`<div class="message ${m.role==='user'?'user':''}">${esc(m.text)}</div>`).join('')}</div><form class="chat-input" id="chat-form"><input name="message" placeholder="Preguntá sobre la casa, una reserva o una mejora…" autocomplete="off"><button class="primary-button">Enviar</button></form></div></section>`;
}

function renderConnections() {
  const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
  const imported = state.reservations.filter(r => r.external).length;
  return `<section class="connection-hero card">
    <div><span class="eyebrow">CENTRO DE CONEXIONES</span><h2>Todo entra por acá</h2><p class="muted">La aplicación sigue siendo gratuita. Ninguna conexión compra servicios ni envía información sin que vos lo apruebes.</p></div>
    <div class="connection-badge ${isSecure ? 'ready' : ''}"><span>${isSecure ? '✓' : '○'}</span><b>${isSecure ? 'Lista para instalar' : 'Modo local'}</b><small>${isSecure ? 'Abierta desde una dirección segura' : 'Para instalarla como app debe publicarse en HTTPS'}</small></div>
  </section>
  <section class="connections-grid">
    ${connectionCard('⌂','Página pública de reservas', state.settings.bookingEndpoint ? 'Recepción automática' : 'Lista para compartir', state.settings.bookingEndpoint?'ready':'manual', `Una vidriera propia de Villa il Fanale para mostrar la casa, calcular una estadía y recibir solicitudes. Si cargás un receptor automático, publicá cambios desde “Editar página” para que el sitio lo use.`, `<button class="primary-button" data-action="openPublicSite">Abrir página pública</button>${state.settings.bookingEndpoint&&state.settings.bookingAdminKey?`<button class="ghost-button" data-action="syncPublicRequests">Buscar solicitudes</button>`:''}`)}
    ${connectionCard('▦','Airbnb Calendar', imported ? `${imported} eventos importados` : 'Todavía sin importar', imported?'ready':'manual', `Descargá el calendario de Airbnb como archivo .ics y cargalo acá. También podés guardar el enlace privado para tenerlo a mano.`, `<button class="primary-button" data-action="importCalendar">Importar archivo .ics</button>${state.settings.airbnbIcsUrl?`<button class="ghost-button" data-action="syncAirbnb">Intentar sincronizar</button>`:''}`)}
    ${connectionCard('','Calendario de Apple','Importación manual','manual','En Calendario de Apple elegí Archivo → Exportar → Exportar y seleccioná el archivo .ics desde la aplicación.',`<button class="primary-button" data-action="importCalendar">Importar desde Apple</button>`)}
    ${connectionCard('◉','Meta Business Suite','Facebook + Instagram','ready','Abrí la bandeja unificada para leer y responder mensajes de Facebook e Instagram. Desde ahí registrás la consulta en la app.',`<button class="primary-button" data-action="openMeta">Abrir bandeja de Meta</button>`)}
    ${connectionCard('◌','Formulario de huéspedes','Conectado','ready','Abre el formulario real de Villa il Fanale para que el titular complete sus datos y condiciones.',`<button class="primary-button" data-action="openForm">Abrir formulario</button>`)}
  </section>
  <section class="content-grid">
    <form class="card" id="connections-form">
      <div class="card-header"><div><span class="eyebrow">ENLACES Y DATOS LOCALES</span><h2>Configurar conexiones</h2><p class="muted">Estos datos se guardan solamente en este dispositivo.</p></div></div>
      <div class="form-grid">
        ${field('Nombre para comprobantes','owner','text','Nombre y apellido',false,undefined,undefined,state.settings.owner)}
        ${field('DNI para comprobantes','dni','text','Se guarda sólo localmente',false,undefined,undefined,state.settings.dni)}
        ${field('WhatsApp','phone','tel','Ej.: 358...',false,undefined,undefined,state.settings.phone)}
        ${field('Facebook de Villa il Fanale','facebookUrl','url','https://facebook.com/...',false,undefined,undefined,state.settings.facebookUrl)}
        ${field('Instagram de Villa il Fanale','instagramUrl','url','https://instagram.com/...',false,undefined,undefined,state.settings.instagramUrl)}
        ${field('Enlace privado .ics de Airbnb','airbnbIcsUrl','url','https://www.airbnb.com/calendar/ical/...',false,undefined,undefined,state.settings.airbnbIcsUrl)}
        ${field('Dirección de la página pública','publicSiteUrl','url','https://.../reservar/',false,undefined,undefined,state.settings.publicSiteUrl)}
        ${field('Receptor automático de solicitudes','bookingEndpoint','url','Enlace de Google Apps Script',false,undefined,undefined,state.settings.bookingEndpoint)}
        ${field('Clave privada de recepción','bookingAdminKey','password','Sólo para esta aplicación',false,undefined,undefined,state.settings.bookingAdminKey)}
      </div>
      <div class="form-actions"><button class="primary-button">Guardar configuración</button></div>
    </form>
    <div class="card">
      <span class="eyebrow">INSTALACIÓN Y SEGURIDAD</span><h2>Usarla como aplicación</h2>
      <p class="muted">Una vez publicada gratuitamente en una dirección HTTPS, podrás instalarla desde Safari o Chrome. Los datos seguirán siendo privados en cada dispositivo.</p>
      <button class="primary-button" data-action="installApp" ${!installPrompt?'disabled':''}>${installPrompt?'Instalar ahora':'Disponible después de publicar'}</button>
      <hr class="soft-rule">
      <h3>Mover datos entre dispositivos</h3><p class="muted">Mientras no usemos una base online, esta copia es la forma gratuita y privada de pasar reservas de la computadora al celular.</p>
      <div class="row-actions" style="justify-content:flex-start"><button data-action="exportBackup">Guardar copia</button><button data-action="importBackup">Cargar copia</button></div>
      <input type="file" id="backup-file" accept="application/json,.json" hidden>
    </div>
  </section>
  <section class="card security-note"><span class="security-icon">⌁</span><div><b>Automatización sin costos mensuales</b><p>La página pública puede recibir solicitudes mediante una hoja privada de Google. Para activarla hará falta una única autorización de tu cuenta; Facebook, Instagram y WhatsApp mantienen sus propias limitaciones y permisos.</p></div></section>`;
}

function connectionCard(icon,title,status,tone,body,actions) {
  return `<article class="card connection-card"><div class="connection-icon">${icon}</div><div class="connection-head"><div><h3>${title}</h3><span class="pill ${tone==='ready'?'':'warn'}"><span class="dot"></span>${status}</span></div></div><p class="muted">${body}</p><div class="connection-actions">${actions}</div></article>`;
}

function saveConnections(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  Object.assign(state.settings, values);
  saveState('Conexiones guardadas en este dispositivo');
  render();
}

function openConfiguredLink(key, label) {
  const url = state.settings[key];
  if (!url) return toast(`Primero guardá el enlace de ${label} en Conexiones`);
  window.open(url, '_blank');
}

async function syncAirbnbCalendar() {
  const url = state.settings.airbnbIcsUrl;
  if (!url) return toast('Primero guardá el enlace .ics de Airbnb');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('calendar');
    importICSText(await response.text());
  } catch {
    toast('Airbnb bloqueó la lectura directa. Descargá el archivo .ics e importalo manualmente.');
  }
}

async function syncPublicRequests(silent = false) {
  const endpoint = state.settings.bookingEndpoint;
  const key = state.settings.bookingAdminKey;
  if (!endpoint || !key) {
    if (!silent) toast('Primero configurá el receptor de solicitudes en Conexiones');
    return;
  }
  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'list');
    url.searchParams.set('key', key);
    url.searchParams.set('_', Date.now());
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error('request');
    const payload = await response.json();
    if (!payload.ok) throw new Error(payload.error || 'request');
    let added = 0;
    (payload.requests || []).forEach(item => {
      const externalRequestId = String(item.id || '');
      if (!externalRequestId || state.leads.some(lead => lead.externalRequestId === externalRequestId)) return;
      state.leads.push({
        id: uid(), externalRequestId,
        created: normalizeRequestDate(item.createdAt) || todayISO(),
        name: item.name || 'Consulta desde la web', phone: String(item.phone || ''),
        guests: Number(item.guests || 1), checkin: normalizeRequestDate(item.checkin), checkout: normalizeRequestDate(item.checkout),
        channel: 'Página web', status: 'nueva', nightly: 0,
        notes: [item.message, item.estimatedTotal ? `Estimación web: ${money(Number(item.estimatedTotal))}` : ''].filter(Boolean).join(' · ')
      });
      added += 1;
    });
    saveState();
    if (!silent) {
      toast(added ? `${added} solicitud${added===1?' nueva':'es nuevas'} recibida${added===1?'':'s'}` : 'No hay solicitudes nuevas');
      navigate('consultas');
    } else if (route === 'consultas' && added) render();
  } catch {
    if (!silent) toast('No se pudo consultar la página pública. Revisá la conexión.');
  }
}

function normalizeRequestDate(value) {
  if (!value) return '';
  const text = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : localISO(date);
}

async function installApplication() {
  if (!installPrompt) return toast('La instalación estará disponible cuando la aplicación tenga una dirección HTTPS');
  await installPrompt.prompt();
  installPrompt = null;
  render();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `villa-il-fanale-${todayISO()}.json`; link.click();
  URL.revokeObjectURL(url);
  toast('Copia preparada');
}

function importBackup(event) {
  const file = event.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try { state = { ...defaultState, ...JSON.parse(reader.result) }; saveState('Datos restaurados'); render(); }
    catch { toast('La copia no es válida'); }
  };
  reader.readAsText(file);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('./sw.js').then(registration => registration.update()).catch(() => {});
  }
}

function openLeadModal() {
  openModal('Nueva consulta', `<form id="lead-form"><div class="form-grid">
    ${field('Nombre','name','text','Nombre de la persona',true)}${selectField('Canal','channel',['WhatsApp','Facebook','Instagram','Airbnb'])}
    ${field('Teléfono','phone','tel','358…')}${field('Cantidad de personas','guests','number','Hasta 5',true,'1','5')}
    ${field('Ingreso','checkin','date','',true)}${field('Salida','checkout','date','',true)}
    ${field('Precio por noche','nightly','number','La app lo sugiere')}${selectField('Estado','status',['nueva','presupuesto'],['Nueva','Presupuesto enviado'])}
    ${textareaField('Notas de la conversación','notes','Qué pidió, dudas o detalles…')}
  </div><div id="quote-result"></div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Guardar consulta</button></div></form>`);
  const form = document.querySelector('#lead-form');
  ['checkin','checkout','guests'].forEach(name=>form.elements[name].addEventListener('change',()=>updateQuote(form)));
  form.addEventListener('submit', event => { event.preventDefault(); const data=Object.fromEntries(new FormData(form)); if(!validDates(data.checkin,data.checkout)) return toast('Revisá las fechas'); const suggestion=suggestPrice(data.checkin,data.checkout); data.id=uid(); data.created=todayISO(); data.status=data.status||'nueva'; data.nightly=Number(data.nightly||suggestion.nightly); data.guests=Number(data.guests); state.leads.push(data); saveState('Consulta guardada'); closeModal(); navigate('consultas'); });
  bindModal();
}
function updateQuote(form) {
  if(!form.elements.checkin.value || !form.elements.checkout.value) return;
  const suggestion=suggestPrice(form.elements.checkin.value,form.elements.checkout.value);
  document.querySelector('#quote-result').innerHTML=`<div class="quote-box"><span class="eyebrow">SUGERENCIA DE LA APP</span><p><strong>${money(suggestion.nightly)} por noche</strong> · ${suggestion.nights} noche${suggestion.nights===1?'':'s'} · total sugerido ${money(suggestion.total)}</p><small>${suggestion.reason}</small></div>`;
  if(!form.elements.nightly.value) form.elements.nightly.value=suggestion.nightly;
}

function openReservationModal(lead=null, existing=null) {
  const source = existing || lead || {};
  const suggestedTotal = lead ? suggestPrice(lead.checkin,lead.checkout,lead.nightly).total : '';
  openModal(existing ? 'Editar reserva' : lead ? 'Confirmar reserva con seña' : 'Cargar reserva confirmada', `<form id="reservation-form"><div class="form-grid">
    ${field('Titular de la reserva','guest','text','Nombre y apellido',true,undefined,undefined,existing?.guest||lead?.name||'')}${field('Teléfono','phone','tel','358…',false,undefined,undefined,source.phone||'')}
    ${field('Ingreso','checkin','date','',true,undefined,undefined,source.checkin||'')}${field('Salida','checkout','date','',true,undefined,undefined,source.checkout||'')}
    ${field('Cantidad de personas','guests','number','Máximo 5',true,'1','5',source.guests||'')}${selectField('Origen','channel',['WhatsApp','Facebook','Instagram','Airbnb','Calendario importado'],null,source.channel||'WhatsApp')}
    ${field('Precio total acordado','total','number','Importe total',true,undefined,undefined,existing?.total||suggestedTotal)}${field('Seña recibida','paid','number','50% del total',true,undefined,undefined,existing?.paid||'')}
    ${field('Depósito de garantía','guarantee','number','Opcional, lo definís vos',false,undefined,undefined,existing?.guarantee||'')}${field('Patente','plate','text','Opcional',false,undefined,undefined,existing?.plate||'')}
    ${field('DNI del titular','guestDni','text','Dato opcional',false,undefined,undefined,existing?.guestDni||'')}${field('Fecha de nacimiento','birthdate','date','',false,undefined,undefined,existing?.birthdate||'')}
    ${field('Contacto de emergencia','emergencyPhone','tel','Dato opcional',false,undefined,undefined,existing?.emergencyPhone||'')}${field('Correo electrónico','email','email','Dato opcional',false,undefined,undefined,existing?.email||'')}
    ${field('Ciudad y domicilio','address','text','Dato opcional',false,undefined,undefined,existing?.address||'')}${field('Acompañantes','companions','text','Nombres separados por coma',false,undefined,undefined,existing?.companions||'')}
    ${textareaField('Notas','notes','Datos importantes de la estadía',existing?.notes||'')}
    ${existing?'':'<label class="checkline field full"><input type="checkbox" name="depositConfirmed" required> Confirmo que recibí la seña y que estas fechas deben bloquearse.</label>'}
  </div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">${existing?'Guardar cambios':'Confirmar reserva'}</button></div></form>`);
  const form=document.querySelector('#reservation-form');
  form.elements.total.addEventListener('change', () => {
    if (!form.elements.paid.value) form.elements.paid.value = Math.round(Number(form.elements.total.value || 0) * .5);
  });
  form.addEventListener('submit',event=>{ event.preventDefault(); const data=Object.fromEntries(new FormData(form)); if(!validDates(data.checkin,data.checkout)) return toast('Revisá las fechas'); if(!checkAvailability(data.checkin,data.checkout,existing?.id)) return toast('Esas fechas ya están ocupadas o bloqueadas'); data.guests=Number(data.guests); data.total=Number(data.total); data.paid=Number(data.paid); data.guarantee=Number(data.guarantee||0); data.nights=nightCount(data.checkin,data.checkout);
    if(existing){
      const oldPaid=Number(existing.paid||0), delta=data.paid-oldPaid;
      Object.assign(existing,data,{id:existing.id,receipt:existing.receipt,created:existing.created,status:existing.status});
      if(delta>0)state.movements.push({id:uid(),type:'income',label:`Ajuste de pago · ${data.guest}`,amount:delta,date:todayISO(),reservationId:existing.id});
      if(delta<0)state.movements.push({id:uid(),type:'reversal',label:`Ajuste de pago · ${data.guest}`,amount:Math.abs(delta),date:todayISO(),reservationId:existing.id});
      tasksForReservation(existing.id).forEach(task=>task.due=data.checkin);
      saveState('Reserva actualizada'); closeModal(); navigate('calendario'); return;
    }
    data.id=uid(); data.receipt=nextReceipt(); data.created=todayISO(); data.status='confirmed'; state.reservations.push(data); if(data.paid>0) state.movements.push({id:uid(),type:'income',label:`Seña · ${data.guest}`,amount:data.paid,date:todayISO(),reservationId:data.id}); createReservationTasks(data); if(lead){ const original=state.leads.find(x=>x.id===lead.id); if(original) original.status='convertida'; } saveState('Reserva confirmada y tareas creadas'); closeModal(); navigate('calendario'); });
  bindModal();
}

function openBlockModal() {
  openModal('Bloquear disponibilidad', `<form id="block-form"><div class="form-grid">${field('Desde','start','date','',true)}${field('Hasta','end','date','',true)}${field('Motivo','reason','text','Ej.: no puedo viajar',true)}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Bloquear</button></div></form>`);
  const form=document.querySelector('#block-form'); form.addEventListener('submit',e=>{e.preventDefault(); const data=Object.fromEntries(new FormData(form)); data.id=uid(); state.blocks.push(data); saveState('Fechas bloqueadas'); closeModal(); render();}); bindModal();
}
function openTaskModal() {
  openModal('Nueva tarea', `<form id="task-form"><div class="form-grid">${field('Tarea','title','text','Qué hay que hacer',true)}${selectField('Categoría','category',['Exterior','Limpieza interior','Cocina y vajilla','Camas','Bienvenida','Mantenimiento'])}${field('Fecha','due','date')}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Guardar tarea</button></div></form>`); const form=document.querySelector('#task-form');form.addEventListener('submit',e=>{e.preventDefault();state.tasks.push({...Object.fromEntries(new FormData(form)),id:uid(),done:false});saveState('Tarea creada');closeModal();render();});bindModal();
}
function openMovementModal() {
  openModal('Registrar movimiento', `<form id="movement-form"><div class="form-grid">${selectField('Tipo','type',['income','expense'],['Ingreso','Gasto'])}${field('Concepto','label','text','Ej.: Seña reserva',true)}${field('Importe','amount','number','0',true)}${field('Fecha','date','date','',true,undefined,undefined,todayISO())}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Guardar</button></div></form>`);const form=document.querySelector('#movement-form');form.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));d.id=uid();d.amount=Number(d.amount);state.movements.push(d);saveState('Movimiento registrado');closeModal();render();});bindModal();
}
function openInventoryModal() {
  openModal('Agregar al inventario', `<form id="inventory-form"><div class="form-grid">${field('Elemento','name','text','Ej.: Copas',true)}${field('Detalle','detail','text','Qué controlar')}${selectField('Estado','status',['hay','poco','falta'],['Hay','Queda poco','Falta'])}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Agregar</button></div></form>`);const form=document.querySelector('#inventory-form');form.addEventListener('submit',e=>{e.preventDefault();state.inventory.push({...Object.fromEntries(new FormData(form)),id:uid()});saveState('Elemento agregado');closeModal();render();});bindModal();
}

function openReservationDetails(id) {
  const r=state.reservations.find(x=>x.id===id); if(!r)return; const cancelled=r.status==='cancelled'; const balance=cancelled?0:Number(r.total)-Number(r.paid||0);
  openModal(`Reserva de ${esc(r.guest)}`, `${cancelled?'<div class="cancelled-banner"><b>Reserva cancelada</b><span>Las fechas fueron liberadas y los ingresos asociados quedaron anulados.</span></div>':''}<div class="form-grid"><div><span class="eyebrow">ESTADÍA</span><p><b>${dateLabel(r.checkin)} → ${dateLabel(r.checkout)}</b><br>${r.nights} noches · ${r.guests} huéspedes · ${esc(r.channel)}</p></div><div><span class="eyebrow">PAGOS</span><p>Total original ${money(r.total)}<br>Ingreso vigente ${money(cancelled?0:r.paid)}<br><b>Saldo ${money(balance)}</b></p></div><div class="field full"><span class="eyebrow">DATOS DEL TITULAR</span><p>${esc(r.phone||'Sin teléfono')} · DNI ${esc(r.guestDni||'Sin informar')} · Patente ${esc(r.plate||'Sin informar')}<br>${esc(r.address||'')} ${r.companions?`<br>Acompañantes: ${esc(r.companions)}`:''}</p></div></div><div class="form-actions">${cancelled?`<button class="ghost-button danger" data-action="deleteReservation" data-id="${r.id}">Eliminar historial</button>`:`<button class="ghost-button" data-action="openForm">Formulario</button><button class="ghost-button" data-action="editReservation" data-id="${r.id}">Editar</button><button class="ghost-button danger" data-action="cancelReservation" data-id="${r.id}">Cancelar reserva</button><button class="secondary-button" id="print-receipt">Comprobante</button>${balance>0?`<button class="primary-button" id="collect-balance">Registrar saldo</button>`:''}`}</div>`);
  bindModal(); const print=document.querySelector('#print-receipt');if(print)print.addEventListener('click',()=>printReceipt(r)); const collect=document.querySelector('#collect-balance'); if(collect) collect.addEventListener('click',()=>{r.paid=Number(r.total);state.movements.push({id:uid(),type:'income',label:`Saldo · ${r.guest}`,amount:balance,date:todayISO(),reservationId:r.id});saveState('Saldo registrado');closeModal();render();});
}

function openModal(title, body) {
  document.querySelector('#modal-root').innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${title}</h2><button class="icon-button" data-close aria-label="Cerrar">×</button></header><div class="modal-body">${body}</div></section></div>`;
}
function bindModal(){document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModal));document.querySelectorAll('#modal-root [data-action]').forEach(b=>b.addEventListener('click',()=>handleAction(b.dataset.action,b.dataset.id)));}
function closeModal(){document.querySelector('#modal-root').innerHTML='';}
function field(label,name,type='text',placeholder='',required=false,min,max,value=''){return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" placeholder="${placeholder}" ${required?'required':''} ${min?`min="${min}"`:''} ${max?`max="${max}"`:''} value="${esc(value)}"></label>`;}
function textareaField(label,name,placeholder='',value=''){return `<label class="field full"><span>${label}</span><textarea name="${name}" placeholder="${placeholder}">${esc(value)}</textarea></label>`;}
function selectField(label,name,values,labels=null,selected=''){return `<label class="field"><span>${label}</span><select name="${name}">${values.map((v,i)=>`<option value="${v}" ${v===selected?'selected':''}>${labels?labels[i]:v}</option>`).join('')}</select></label>`;}

function createReservationTasks(r) {
  const checklist={
    'Exterior':['Cortar el césped','Barrer la galería grande','Ordenar el jardín y el ingreso'],
    'Limpieza interior':['Limpiar los vidrios','Barrer el interior','Pasar el trapo y encerar el piso','Limpiar el polvo de todos los muebles'],
    'Cocina y vajilla':['Revisar y dejar limpia toda la vajilla','Controlar garrafa y cocina','Limpiar heladera y microondas'],
    'Camas':['Airear los colchones','Preparar las camas con acolchados y almohadas'],
    'Bienvenida':['Colocar el mantel tejido de bienvenida','Preparar cartelería, manual y normas','Colocar desodorante de ambientes','Confirmar entrega personal de llaves']
  };
  Object.entries(checklist).forEach(([category,titles])=>titles.forEach(title=>state.tasks.push({id:uid(),title,category,due:r.checkin,done:false,reservationId:r.id})));
}
function tasksForReservation(id){return state.tasks.filter(t=>t.reservationId===id);}
function activeReservations(){return state.reservations.filter(r=>r.status!=='cancelled');}
function cancelledReservations(){return state.reservations.filter(r=>r.status==='cancelled');}
function reservationNetIncome(id){return state.movements.filter(m=>m.reservationId===id).reduce((sum,m)=>sum+(m.type==='income'?Number(m.amount):m.type==='reversal'?-Number(m.amount):0),0);}
function toggleTask(id){const t=state.tasks.find(x=>x.id===id);if(t){t.done=!t.done;saveState();render();}}
function cycleInventory(id){const item=state.inventory.find(x=>x.id===id);const cycle={hay:'poco',poco:'falta',falta:'hay'};item.status=cycle[item.status];saveState('Estado actualizado');render();}
function deleteLead(id){state.leads=state.leads.filter(x=>x.id!==id);saveState('Consulta eliminada');render();}

function openCancelReservationModal(id){
  const reservation=state.reservations.find(r=>r.id===id);if(!reservation)return;
  const amount=reservationNetIncome(id);
  openModal('Cancelar reserva',`<div class="cancel-summary"><span class="cancel-icon">!</span><div><h3>${esc(reservation.guest)}</h3><p>${dateLabel(reservation.checkin)} → ${dateLabel(reservation.checkout)}</p></div></div><div class="quote-box"><b>Al confirmar:</b><p>Se liberarán las fechas, se eliminarán las tareas pendientes y se anularán ${money(amount)} de los ingresos registrados. La reserva quedará visible en el historial.</p></div><div class="form-actions"><button class="ghost-button" data-close>Volver</button><button class="primary-button danger-solid" id="confirm-cancel-reservation">Sí, cancelar reserva</button></div>`);
  bindModal();document.querySelector('#confirm-cancel-reservation').addEventListener('click',()=>cancelReservation(id));
}

function cancelReservation(id){
  const reservation=state.reservations.find(r=>r.id===id);if(!reservation||reservation.status==='cancelled')return;
  const amount=reservationNetIncome(id);
  if(amount>0)state.movements.push({id:uid(),type:'reversal',label:`Anulación · ${reservation.guest}`,amount,date:todayISO(),reservationId:id});
  reservation.status='cancelled';reservation.cancelledAt=new Date().toISOString();reservation.paid=0;
  state.tasks=state.tasks.filter(task=>task.reservationId!==id);
  saveState('Reserva cancelada: fechas e ingresos liberados');closeModal();navigate('calendario');
}

function deleteReservation(id){
  const reservation=state.reservations.find(r=>r.id===id);if(!reservation||reservation.status!=='cancelled')return;
  state.reservations=state.reservations.filter(r=>r.id!==id);
  state.tasks=state.tasks.filter(task=>task.reservationId!==id);
  state.movements=state.movements.filter(movement=>movement.reservationId!==id);
  saveState('Historial de reserva eliminado');closeModal();navigate('calendario');
}

function suggestPrice(checkin, checkout, override) {
  const nights=nightCount(checkin,checkout); let nightly=Number(override)||state.settings.regularNight; let reason='Tarifa base para estadías de dos noches o más.';
  if(nights===1){nightly=state.settings.singleNight;reason='Tarifa fija para una sola noche.';}
  else {
    const dates=datesBetween(checkin,checkout); const high=dates.some(d=>{const m=new Date(`${d}T12:00:00`).getMonth();return m===10||m===11||m===0||m===1;});
    const holiday=dates.some(d=>state.holidays.some(h=>(h.fecha||h.date)===d));
    const competing=state.leads.filter(l=>l.status!=='convertida'&&rangesOverlap(checkin,checkout,l.checkin,l.checkout)).length;
    if(high||holiday||competing>=2){nightly=state.settings.highNight;reason=[high?'temporada alta (noviembre a febrero)':'',holiday?'feriado cercano':'',competing>=2?`${competing} consultas similares`:''].filter(Boolean).join(', ')+'. Precio final siempre a tu criterio.';}
  }
  return {nights,nightly,total:nights*nightly,reason};
}
function nightCount(a,b){return Math.max(0,Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000));}
function validDates(a,b){return a&&b&&b>a&&nightCount(a,b)>0;}
function datesBetween(a,b){const dates=[];for(let d=new Date(`${a}T12:00:00`),end=new Date(`${b}T12:00:00`);d<end;d.setDate(d.getDate()+1))dates.push(localISO(d));return dates;}
function localISO(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function rangesOverlap(a1,a2,b1,b2){return a1<b2&&b1<a2;}
function checkAvailability(checkin,checkout,excludeId=null){if(!checkin||!checkout)return true;return !activeReservations().some(r=>r.id!==excludeId&&rangesOverlap(checkin,checkout,r.checkin,r.checkout))&&!state.blocks.some(b=>rangesOverlap(checkin,checkout,b.start,plusDay(b.end)));}
function plusDay(iso){const d=new Date(`${iso}T12:00:00`);d.setDate(d.getDate()+1);return localISO(d);}
function nextReceipt(){return `VIF-${String(state.reservations.length+1).padStart(4,'0')}`;}

function openWhatsApp(id){const l=state.leads.find(x=>x.id===id);if(!l)return;const q=suggestPrice(l.checkin,l.checkout,l.nightly);const text=`Hola ${l.name}, ¿cómo estás? Gracias por comunicarte con Villa il Fanale. Tenemos disponibilidad del ${dateLabel(l.checkin)} al ${dateLabel(l.checkout)} para ${l.guests} persona${l.guests==1?'':'s'}. El valor es de ${money(q.nightly)} por noche, con un total de ${money(q.total)}. La reserva queda confirmada al recibir una seña del 50%; el saldo se abona al ingresar. El check-in es a las ${state.settings.checkin} y el check-out a las ${state.settings.checkout}. No incluye ropa blanca. Mascotas: consultar previamente. Si te parece bien, avanzamos con la reserva.`;l.status='presupuesto';saveState();const phone=normalizeWhatsApp(l.phone);window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`,'_blank');render();}
function normalizeWhatsApp(phone){let digits=(phone||'').replace(/\D/g,'').replace(/^0/,'');if(!digits)return'';if(digits.startsWith('54'))return digits;return `549${digits}`;}
function copyPost(){navigator.clipboard?.writeText(document.querySelector('#post-copy').innerText);toast('Publicación copiada');}

async function handleVisualUpload(event) {
  const incoming = [...event.target.files];
  if (!incoming.length) return;
  const available = Math.max(0, 12 - (state.photoLibrary || []).length);
  if (!available) return toast('La biblioteca admite hasta 12 fotos agregadas. Eliminá alguna para continuar.');
  const files = incoming.slice(0, available);
  toast(`Preparando ${files.length} imagen${files.length===1?'':'es'}…`);
  const prepared = [];
  for (const file of files) {
    try {
      const src = await compressImage(file);
      prepared.push({ id: uid(), src, label: file.name.replace(/\.[^.]+$/, '') || 'Foto agregada', added: todayISO() });
    } catch { /* ignora archivos que el navegador no pueda leer */ }
  }
  state.photoLibrary = [...(state.photoLibrary || []), ...prepared];
  if (prepared.length) selectedPhoto = prepared.at(-1).src;
  if (saveState(`${prepared.length} imagen${prepared.length===1?' agregada':'es agregadas'}`)) render();
  event.target.value = '';
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image(); const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 1400, scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', .72));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    image.src = url;
  });
}

function deleteUploadedPhoto(id) {
  const photo = (state.photoLibrary || []).find(item => item.id === id);
  state.photoLibrary = (state.photoLibrary || []).filter(item => item.id !== id);
  if (photo?.src === selectedPhoto) selectedPhoto = builtInPhotos[0][0];
  saveState('Imagen eliminada de este dispositivo'); render();
}

async function selectedPhotoFile() {
  const response = await fetch(selectedPhoto);
  const blob = await response.blob();
  return new File([blob], `villa-il-fanale-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
}

async function sharePost() {
  const text = document.querySelector('#post-copy').innerText;
  try { await navigator.clipboard.writeText(text); } catch { /* el menú compartir conserva el texto cuando es compatible */ }
  try {
    const file = await selectedPhotoFile();
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: 'Villa il Fanale', text, files: [file] });
      toast('Publicación compartida'); return;
    }
    downloadFile(file);
    toast('Imagen guardada y texto copiado. Ya podés abrir Instagram y crear la publicación.');
  } catch (error) {
    if (error?.name !== 'AbortError') toast('No se pudo abrir el menú. Usá “Guardar imagen” y “Copiar texto”.');
  }
}

async function downloadSelectedPhoto() {
  try { downloadFile(await selectedPhotoFile()); toast('Imagen guardada'); }
  catch { toast('No se pudo guardar esta imagen'); }
}

function downloadFile(file) {
  const url = URL.createObjectURL(file); const link = document.createElement('a');
  link.href = url; link.download = file.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function submitChat(event){event.preventDefault();const input=event.currentTarget.elements.message;const text=input.value.trim();if(!text)return;input.value='';askAssistant(text);}
function askAssistant(text){state.messages.push({role:'user',text});state.messages.push({role:'assistant',text:assistantReply(text)});saveState();render();setTimeout(()=>{const box=document.querySelector('#messages');if(box)box.scrollTop=box.scrollHeight;},0);}
function assistantReply(text){
  const q=text.toLowerCase(); const pending=state.tasks.filter(t=>!t.done); const upcoming=state.reservations.filter(r=>r.checkout>=todayISO()).sort((a,b)=>a.checkin.localeCompare(b.checkin));
  if(q.includes('hoy')||q.includes('tarea')) return pending.length?`Tenés ${pending.length} tareas pendientes. Las próximas son:\n${pending.slice(0,5).map(t=>`• ${t.title}${t.due?` (${dateLabel(t.due)})`:''}`).join('\n')}\n\n¿Querés que te lleve a la lista de tareas?`:'Hoy no hay tareas pendientes. La casa está al día.';
  if(q.includes('precio')||q.includes('tarifa')) return `Para sugerirte un precio necesito las fechas y la cantidad de noches. Como regla actual: una noche cuesta ${money(state.settings.singleNight)}; dos noches o más parten de ${money(state.settings.regularNight)} y suben a ${money(state.settings.highNight)} en verano, feriados o alta demanda. Vos siempre confirmás el valor final.`;
  if(q.includes('negocio')||q.includes('ingreso')||q.includes('ganancia')) return `Hasta ahora registraste ${money(sumMovements('income'))} en ingresos y ${state.reservations.length} reservas confirmadas. Hay ${state.leads.filter(l=>l.status!=='convertida').length} consultas activas, que sirven como indicador de demanda.`;
  if(q.includes('calef')||q.includes('estufa')||q.includes('garrafa')) return `Para el loft de techos altos, una estufa garrafera puede ser una solución inicial de menor inversión, pero hay que dimensionarla por metros cúbicos, asegurar ventilación permanente y verificar instalación y monóxido con un gasista matriculado. La leña suma experiencia serrana, aunque exige más mantenimiento y es menos simple para huéspedes. Mi propuesta: comparar potencia, seguridad, costo de garrafas e instalación antes de comprar. ¿Querés que prepare una lista exacta de datos y luego investigue opciones actuales con tu autorización?`;
  if(q.includes('publica')||q.includes('instagram')||q.includes('facebook')) return `Puedo prepararla. Primero elegiría una foto del jardín o del loft y un enfoque: escapada serrana, fechas disponibles o historia de la casa. La sección Contenido ya genera un borrador que vos aprobás antes de publicar.`;
  if(q.includes('reserva')) return upcoming.length?`La próxima reserva es de ${upcoming[0].guest}, con ingreso el ${dateLabel(upcoming[0].checkin)}. Tiene ${tasksForReservation(upcoming[0].id).filter(t=>!t.done).length} tareas pendientes.`:'No hay reservas próximas. Las consultas sólo cierran fechas cuando recibís la seña.';
  return `Lo tomo. Con la información actual puedo ayudarte a convertir esto en una tarea, una decisión o un mensaje. Antes de modificar reservas o enviar algo, voy a pedirte autorización. ¿Qué resultado concreto querés obtener?`;
}

function printReceipt(r){
  const w=window.open('','_blank');const balance=Number(r.total)-Number(r.paid||0);w.document.write(`<!doctype html><html><head><title>Comprobante ${r.receipt}</title><style>body{font-family:Arial;max-width:700px;margin:50px auto;color:#24372b}.head{display:flex;justify-content:space-between;border-bottom:2px solid #244f3a;padding-bottom:20px}.tag{color:#777}.box{margin:25px 0;padding:20px;background:#f5f3ec;border-radius:12px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #ddd}.total{font-size:22px;font-weight:bold}.note{margin-top:40px;font-size:12px;color:#777}</style></head><body><div class="head"><div><h1>Villa il Fanale</h1><div>Loft serrano · Alpa Corral</div></div><div><b>${r.receipt}</b><br><span class="tag">Comprobante no fiscal</span></div></div><div class="box"><b>Responsable del alojamiento</b><p>${state.settings.owner}<br>DNI ${state.settings.dni}<br>Tel. ${state.settings.phone}</p></div><h2>Reserva de ${esc(r.guest)}</h2><p>${dateLabel(r.checkin)} al ${dateLabel(r.checkout)} · ${r.nights} noches · ${r.guests} huéspedes</p><div class="row"><span>Valor total</span><b>${money(r.total)}</b></div><div class="row"><span>Seña / importe abonado</span><b>${money(r.paid)}</b></div><div class="row total"><span>Saldo al ingresar</span><b>${money(balance)}</b></div><p class="note">La reserva se confirma con la seña. En caso de cancelación, la seña no es reembolsable. Este documento es un comprobante interno y no constituye factura.</p><script>window.print()<\/script></body></html>`);w.document.close();}

async function fetchHolidays(){
  const years=[new Date().getFullYear(),new Date().getFullYear()+1];
  try{const results=await Promise.all(years.map(y=>fetch(`https://api.argentinadatos.com/v1/feriados/${y}`).then(r=>r.ok?r.json():[])));state.holidays=results.flat();saveState();if(route==='calendario')render();}catch{ /* funciona sin conexión; simplemente no destaca feriados */ }
}
function importICS(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{importICSText(reader.result);event.target.value='';};reader.readAsText(file);}
function importICSText(text){const chunks=text.split('BEGIN:VEVENT').slice(1);let added=0;chunks.forEach(chunk=>{const start=parseICSDate(matchICS(chunk,'DTSTART'));const end=parseICSDate(matchICS(chunk,'DTEND'));const summary=matchICS(chunk,'SUMMARY')||'Reserva externa';if(start&&end&&checkAvailability(start,end)){const id=uid();state.reservations.push({id,guest:summary,phone:'',checkin:start,checkout:end,guests:1,channel:'Calendario importado',total:0,paid:0,guarantee:0,nights:nightCount(start,end),receipt:nextReceipt(),created:todayISO(),external:true});createReservationTasks(state.reservations.at(-1));added++;}});saveState(`${added} eventos importados`);navigate('calendario');}
function matchICS(chunk,key){const line=chunk.split(/\r?\n/).find(l=>l.startsWith(key));return line?line.split(':').slice(1).join(':').replace(/\\,/g,','):'';}
function parseICSDate(value){if(!value)return'';const v=value.slice(0,8);return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;}

function toast(message){const root=document.querySelector('#toast-root');root.innerHTML=`<div class="toast">${esc(message)}</div>`;setTimeout(()=>root.innerHTML='',Math.min(8500, Math.max(2800, String(message).length * 55)));}

init();
