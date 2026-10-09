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
const money = (value, currency = 'ARS') => currency === 'USD'
  ? `US$ ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0)}`
  : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value) || 0);
const CHANNELS = ['Booking.com','WhatsApp','Airbnb','Instagram','Facebook','Página web','Calendario importado'];
const rCur = r => (r && r.currency === 'USD') ? 'USD' : 'ARS';
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
    return saved ? normalizeState(saved) : structuredClone(defaultState);
  } catch { return structuredClone(defaultState); }
}
function normalizeState(saved) {
  const next = { ...structuredClone(defaultState), ...saved, settings: { ...defaultState.settings, ...saved.settings }, publicContent: { ...defaultState.publicContent, ...saved.publicContent } };
  next.meta = { updatedAt: 0, ...(saved.meta || {}) };
  if (!next.meta.autoTasksRemoved) {
    // Las tareas que la app creaba sola con cada reserva ya no se usan.
    next.tasks = (next.tasks || []).filter(task => !task.reservationId);
    next.meta.autoTasksRemoved = true;
  }
  if (!next.meta.contentFix1) {
    // Textos acordados: salida 11 h con posibilidad de extender y mascotas a consultar.
    Object.assign(next.publicContent, {
      rule2Description: 'Check-out hasta las 11 h. Si necesitás salir más tarde, consultanos.',
      importantText: 'Mascotas: consultar previamente · No incluye ropa blanca · No se permiten fiestas ni fumar dentro de la casa.'
    });
    if (/^Climatizacion$/i.test(next.publicContent.amenity5Title || '')) { next.publicContent.amenity5Title = 'Climatización'; next.publicContent.amenity5Description = 'Ventilación y calefacción.'; }
    next.settings.checkout = '11:00';
    next.meta.contentFix1 = true;
  }
  if (!next.meta.contentFix2) {
    if (/consult/i.test(next.publicContent.bookingTitle || '')) next.publicContent.bookingTitle = 'Reservá directo.';
    if (/no bloquea el calendario/i.test(next.publicContent.bookingDescription || '')) next.publicContent.bookingDescription = 'Elegí tus fechas en el calendario y mirá el precio exacto al instante. Te confirmamos por WhatsApp y la reserva queda firme con la seña.';
    next.publicContent.depositPercent ??= 50;
    ['Iglesia de Alpa Corral','Brasería El Alto','Museo Regional','Restaurante El Viejo Correo'].forEach((v, i) => { next.publicContent[`near${i+1}`] ??= v; });
    next.meta.contentFix2 = true;
  }
  return next;
}
function saveState(message, options = {}) {
  state.meta = { ...(state.meta || {}), updatedAt: options.keepTimestamp ? (state.meta?.updatedAt || Date.now()) : Date.now() };
  let ok = true;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { ok = false; }
  Memory.mirror(state);
  Memory.maybeSnapshot(state);
  if (!options.skipCloud) Cloud.schedulePush();
  Availability.schedule();
  if (!ok) toast('El navegador no deja guardar más aquí. Quedó guardado en la memoria de respaldo; eliminá alguna foto agregada.');
  else if (message) toast(message);
  return true;
}

const navItems = [
  ['inicio','⌂','Inicio'], ['reservas','◉','Reservas'], ['calendario','▦','Calendario'],
  ['finanzas','$','Ingresos'], ['pagina','✎','Página web'], ['conexiones','⚙','Ajustes']
];
const navSecondary = [['tareas','✓','Tareas'], ['inventario','◇','Inventario'], ['contenido','✦','Publicaciones'], ['asistente','✺','Asistente']];
const mobileItems = navItems.filter(item => ['inicio','reservas','calendario','pagina','conexiones'].includes(item[0]));
const meta = {
  inicio: ['HOY EN LA VILLA', () => greeting()], consultas: ['RESERVAS Y SOLICITUDES', 'Reservas'], reservas: ['RESERVAS Y SOLICITUDES', 'Reservas'],
  calendario: ['DISPONIBILIDAD', 'Calendario'], tareas: ['PREPARACIÓN', 'Tareas de la casa'],
  finanzas: ['NÚMEROS CLAROS', 'Ingresos'], inventario: ['TODO EN SU LUGAR', 'Inventario'],
  contenido: ['VOZ DE LA VILLA', 'Contenido para redes'], asistente: ['TU COPILOTO', 'Asistente de Villa il Fanale'],
  conexiones: ['CONFIGURACIÓN', 'Ajustes'], pagina: ['SITIO PÚBLICO', 'Editar página pública']
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

async function startApplication() {
  await Memory.init();
  renderNav();
  bindGlobal();
  fetchHolidays();
  render();
  Cloud.start();
  Externals.refresh(false);
  Availability.schedule();
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
  document.querySelector('#desktop-nav').innerHTML = navItems.map(navButton).join('') + `<details class="nav-more" ${navSecondary.some(i=>i[0]===route)?'open':''}><summary>Más herramientas</summary>${navSecondary.map(navButton).join('')}</details>`;
  document.querySelector('#mobile-nav').innerHTML = mobileItems.map(navButton).join('');
  document.querySelectorAll('[data-route]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.route)));
}
function navButton([key, icon, label]) {
  return `<button class="nav-item ${route === key ? 'active' : ''}" data-route="${key}"><span class="nav-icon">${icon}</span><span>${label}</span></button>`;
}
function navigate(next) {
  if (next === 'consultas') next = 'reservas';
  const changed = route !== next;
  route = next;
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.route === route));
  render();
  if (changed) { window.scrollTo({ top: 0 }); const app = document.querySelector('#app'); app.classList.remove('page-in'); void app.offsetWidth; app.classList.add('page-in'); }
}
function render() {
  const [kicker, title] = meta[route];
  document.querySelector('#page-kicker').textContent = kicker;
  document.querySelector('#page-title').textContent = typeof title === 'function' ? title() : title;
  document.querySelector('#quick-add').textContent = '＋ Cargar reserva';
  const pages = { inicio: renderDashboard, consultas: renderReservations, reservas: renderReservations, calendario: renderCalendar, tareas: renderTasks, finanzas: renderFinances, inventario: renderInventory, contenido: renderContent, pagina: renderPublicEditor, asistente: renderAssistant, conexiones: renderConnections };
  document.querySelector('#app').innerHTML = pages[route]();
  bindPage();
  if (route === 'conexiones') Memory.renderList();
  if (route === 'pagina') bindLiveEditor();
  Cloud.renderStatus();
}

function bindGlobal() {
  document.querySelector('#quick-add').addEventListener('click', () => openReservationModal());
  document.querySelector('#import-calendar').addEventListener('click', () => document.querySelector('#calendar-file').click());
  document.querySelector('#calendar-file').addEventListener('change', importICS);
}
function bindPage() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => handleAction(button.dataset.action, button.dataset.id)));
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { leadFilter = button.dataset.filter; render(); }));
  document.querySelectorAll('[data-res-tab]').forEach(button => button.addEventListener('click', () => { reservationTab = button.dataset.resTab; render(); }));
  document.querySelectorAll('[data-route-go]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.routeGo)));
  const resSearch = document.querySelector('#res-search');
  if (resSearch) resSearch.addEventListener('input', () => { reservationSearch = resSearch.value; const pos = resSearch.selectionStart; render(); const again = document.querySelector('#res-search'); again.focus(); again.setSelectionRange(pos, pos); });
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
    addPublicGalleryItem: addPublicGalleryItem,
    acceptLead: () => openAcceptLeadModal(id), dismissLead: () => dismissLead(id),
    completeExternal: () => completeExternal(id), whatsappGuest: () => whatsappGuest(id),
    confirmDeposit: () => openDepositModal(id), copyText: () => copyText(id), syncCalendars: () => Externals.refresh(true),
    cloudSetup: () => Cloud.openSetup(), cloudSyncNow: () => Cloud.syncNow(true), cloudForget: () => Cloud.forgetDevice(),
    restoreSnapshot: () => Memory.restore(Number(id))
  };
  actions[action]?.();
}

function renderDashboard() {
  const today = todayISO();
  const upcoming = activeReservations().filter(r => r.checkout >= today).sort((a,b) => a.checkin.localeCompare(b.checkin));
  const next = upcoming.find(r => r.checkin >= today) || upcoming[0];
  const income = incomeByCurrency();
  const due = upcoming.reduce((acc, r) => { const b = Number(r.total) - Number(r.paid || 0); if (b > 0) acc[rCur(r)] += b; return acc; }, { ARS: 0, USD: 0 });
  const requests = state.leads.filter(l => (l.status === 'nueva' || l.status === 'presupuesto') && (l.checkout || '9999') >= today);
  const pending = activeReservations().filter(r => r.status === 'pending');
  const toComplete = Externals.unmatched();
  const daysToNext = next ? Math.ceil((new Date(`${next.checkin}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86400000) : null;
  const staying = upcoming.find(r => r.checkin <= today && r.checkout > today);
  const occ = occupancy(new Date());
  const agenda = agendaItems(21);
  return `
    <section class="hero hero-v2">
      <div class="hero-copy">
        <span class="eyebrow" style="color:#ead6ae">${staying ? 'AHORA EN LA VILLA' : next ? (daysToNext <= 0 ? 'LLEGA HOY' : `PRÓXIMA LLEGADA · EN ${daysToNext} DÍA${daysToNext===1?'':'S'}`) : 'LOFT SERRANO · DESDE 1981'}</span>
        <h2>${staying ? esc(staying.guest) : next ? esc(next.guest) : 'La villa está lista<br>para su próxima historia'}</h2>
        <p>${(staying || next) ? (r => `${dateLabel(r.checkin)} → ${dateLabel(r.checkout)} · ${r.guests} huésped${Number(r.guests)===1?'':'es'} · ${esc(r.channel||'Directa')}${Number(r.total)-Number(r.paid||0) > 0 ? ` · saldo ${money(Number(r.total)-Number(r.paid||0), rCur(r))}` : ''}`)(staying || next) : 'Todavía no hay una llegada próxima. Cuando entre una reserva la vas a ver acá.'}</p>
        <div class="hero-actions">
          ${(staying || next) ? `<button class="secondary-button" data-action="details" data-id="${(staying||next).id}">Ver reserva</button>${(staying||next).phone ? `<button class="ghost-button on-dark" data-action="whatsappGuest" data-id="${(staying||next).id}">WhatsApp al huésped</button>` : ''}` : `<button class="secondary-button" data-action="newReservation">Cargar reserva</button>`}
        </div>
      </div>
    </section>
    ${Cloud.banner()}
    ${(requests.length || toComplete.length || pending.length) ? `<section class="alert-strip">
      ${requests.length ? `<button class="alert-chip warn" data-route-go="reservas"><b>${requests.length}</b> solicitud${requests.length===1?'':'es'} de la web</button>` : ''}
      ${pending.length ? `<button class="alert-chip gold" data-route-go="reservas"><b>${pending.length}</b> esperando seña</button>` : ''}
      ${toComplete.length ? `<button class="alert-chip blue" data-route-go="reservas"><b>${toComplete.length}</b> de Booking/Airbnb para completar</button>` : ''}
    </section>` : ''}
    <section class="stats-grid">
      ${stat('Ocupación del mes', `${occ.percent}%`, `${occ.nights} de ${occ.total} noches`)}
      ${stat('Próximas estadías', upcoming.length, pending.length ? `${pending.length} esperando seña` : 'Todas confirmadas')}
      ${stat('Por cobrar', amountPair(due), 'Saldos de próximas estadías')}
      ${stat('Ingresos registrados', amountPair(income), 'Histórico')}
    </section>
    <section class="content-grid">
      <div class="card">
        <div class="card-header"><div><span class="eyebrow">PRÓXIMAS 3 SEMANAS</span><h2>Agenda</h2></div><button class="ghost-button" data-route-go="calendario">Ver calendario</button></div>
        ${agenda.length ? `<div class="agenda">${agenda.map(a => `<button class="agenda-item ${a.kind}" ${a.id?`data-action="details" data-id="${a.id}"`:''}><span class="agenda-date"><b>${new Date(`${a.date}T12:00:00`).getDate()}</b><small>${new Intl.DateTimeFormat('es-AR',{month:'short'}).format(new Date(`${a.date}T12:00:00`))}</small></span><span class="agenda-text"><b>${a.title}</b><small>${a.note}</small></span><span class="agenda-tag">${a.tag}</span></button>`).join('')}</div>` : empty('⌂','Agenda libre','No hay llegadas ni salidas en las próximas semanas.')}
      </div>
      <div class="card">
        <div class="card-header"><div><span class="eyebrow">PARA RECORDAR</span><h2>Pendientes</h2></div><button class="ghost-button" data-action="addTask">＋ Tarea</button></div>
        ${state.tasks.filter(t=>!t.done).length ? `<div class="list">${state.tasks.filter(t=>!t.done).slice(0,6).map(t=>`<label class="task"><input type="checkbox" data-task="${t.id}"><span>${esc(t.title)}${t.due?` <small class="muted">· ${dateLabel(t.due)}</small>`:''}</span></label>`).join('')}</div>` : empty('✓','Todo tranquilo','Anotá lo que necesites recordar con “＋ Tarea”.')}
      </div>
    </section>`;
}
function occupancy(date) {
  const y = date.getFullYear(), m = date.getMonth(); const total = new Date(y, m + 1, 0).getDate(); let nights = 0;
  for (let d = 1; d <= total; d++) { const iso = localISO(new Date(y, m, d)); if (activeReservations().some(r => iso >= r.checkin && iso < r.checkout) || Externals.unmatched().some(e => iso >= e.start && iso < e.end)) nights++; }
  return { nights, total, percent: Math.round(nights / total * 100) };
}
function agendaItems(days) {
  const today = todayISO(), limit = localISO(new Date(Date.now() + days * 86400000)); const items = [];
  activeReservations().forEach(r => {
    if (r.checkin >= today && r.checkin <= limit) items.push({ date: r.checkin, kind: 'in', title: `Llega ${esc(r.guest)}`, note: `${r.guests} huésped${Number(r.guests)===1?'':'es'} · ${r.nights} noche${r.nights===1?'':'s'}${r.status==='pending'?' · esperando seña':''}`, tag: esc(r.channel || 'Directa'), id: r.id });
    if (r.checkout >= today && r.checkout <= limit) items.push({ date: r.checkout, kind: 'out', title: `Se va ${esc(r.guest)}`, note: `Salida hasta las ${esc(state.settings.checkout || '11:00')} h`, tag: 'Salida', id: r.id });
  });
  Externals.unmatched().forEach(e => { if (e.start >= today && e.start <= limit) items.push({ date: e.start, kind: 'ext', title: `Reserva de ${esc(e.source)}`, note: 'Faltan los datos del huésped', tag: esc(e.source) }); });
  return items.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'out' ? -1 : 1));
}
function stat(label, value, note) { return `<article class="stat-card"><span class="eyebrow">${label}</span><strong>${value}</strong><small>${note}</small></article>`; }
function empty(icon, title, note) { return `<div class="empty"><span class="empty-icon">${icon}</span><b>${title}</b><p>${note}</p></div>`; }
function reservationRow(r) {
  const cancelled = r.status === 'cancelled', pending = r.status === 'pending'; const balance = cancelled ? 0 : Number(r.total) - Number(r.paid || 0);
  return `<div class="list-item res-row ${cancelled?'cancelled-row':''}"><span class="channel-dot ${channelClass(r.channel)}" title="${esc(r.channel||'Directa')}"></span><div class="list-item-main"><b>${esc(r.guest)}</b><p>${dateLabel(r.checkin)} → ${dateLabel(r.checkout)} · ${r.nights} noche${r.nights===1?'':'s'} · ${r.guests} huésped${Number(r.guests)===1?'':'es'}${r.channel?` · ${esc(r.channel)}`:''}</p></div><div class="row-actions"><span class="pill ${cancelled?'rust':pending?'warn':''}"><span class="dot"></span>${cancelled?'Cancelada':pending?'Esperando seña':'Confirmada'}</span><button data-action="details" data-id="${r.id}">${cancelled?'Ver historial':balance > 0 ? `Saldo ${money(balance, rCur(r))}` : 'Ver'}</button></div></div>`;
}
function taskMini(t) { return `<div class="list-item"><div class="list-item-main"><b>${esc(t.title)}</b><p>${esc(t.category)} · ${t.due ? dateLabel(t.due) : 'Sin fecha'}</p></div></div>`; }

let reservationTab = 'proximas', reservationSearch = '';
function channelClass(channel) { return ({ 'Booking.com': 'ch-booking', Airbnb: 'ch-airbnb', 'Página web': 'ch-web' })[channel] || 'ch-direct'; }
function renderReservations() {
  const today = todayISO(); const q = reservationSearch.trim().toLowerCase();
  const requests = state.leads.filter(l => (l.status === 'nueva' || l.status === 'presupuesto') && (l.checkout || '9999') >= today).sort((a,b) => (a.checkin||'').localeCompare(b.checkin||''));
  const toComplete = Externals.unmatched();
  const groups = {
    proximas: activeReservations().filter(r => r.checkout >= today && r.status !== 'pending').sort((a,b) => a.checkin.localeCompare(b.checkin)),
    pendientes: activeReservations().filter(r => r.status === 'pending').sort((a,b) => a.checkin.localeCompare(b.checkin)),
    pasadas: activeReservations().filter(r => r.checkout < today).sort((a,b) => b.checkin.localeCompare(a.checkin)),
    canceladas: cancelledReservations().sort((a,b) => b.checkin.localeCompare(a.checkin))
  };
  const tabs = [['proximas','Próximas'],['pendientes','Esperando seña'],['pasadas','Pasadas'],['canceladas','Canceladas']];
  const rows = groups[reservationTab].filter(r => !q || [r.guest, r.phone, r.channel, r.bookingRef, r.notes].join(' ').toLowerCase().includes(q));
  const automatic = state.settings.bookingEndpoint && state.settings.bookingAdminKey;
  return `
  ${requests.length ? `<section class="card inbox"><div class="card-header"><div><span class="eyebrow">DESDE TU PÁGINA WEB</span><h2>Solicitudes nuevas</h2><p class="muted">Aceptá para bloquear las fechas y mandarle al huésped los datos de la seña.</p></div>${automatic?'<button class="ghost-button" data-action="syncPublicRequests">Buscar nuevas</button>':''}</div>
    <div class="request-grid">${requests.map(requestCard).join('')}</div></section>` : ''}
  ${toComplete.length ? `<section class="card inbox ext"><div class="card-header"><div><span class="eyebrow">LLEGARON DE BOOKING / AIRBNB</span><h2>Completar datos</h2><p class="muted">Las fechas ya están bloqueadas. Completá el nombre y el importe con la ficha de la plataforma.</p></div></div>
    <div class="list">${toComplete.map(e => `<div class="list-item res-row"><span class="channel-dot ${channelClass(e.source)}"></span><div class="list-item-main"><b>Reserva de ${esc(e.source)}</b><p>${dateLabel(e.start)} → ${dateLabel(e.end)} · ${nightCount(e.start,e.end)} noche${nightCount(e.start,e.end)===1?'':'s'}</p></div><div class="row-actions"><button class="primary-button" data-action="completeExternal" data-id="${esc(e.uid)}">Completar</button></div></div>`).join('')}</div></section>` : ''}
  <section class="card">
    <div class="card-header"><div><span class="eyebrow">TODAS TUS ESTADÍAS</span><h2>Reservas</h2></div><div class="row-actions"><button class="ghost-button" data-action="newLead">＋ Consulta</button><button class="primary-button" data-action="newReservation">＋ Reserva</button></div></div>
    <div class="res-toolbar"><div class="filters">${tabs.map(([k,l]) => `<button class="filter ${reservationTab===k?'active':''}" data-res-tab="${k}">${l}${groups[k].length?` <span class="count">${groups[k].length}</span>`:''}</button>`).join('')}</div><input type="search" id="res-search" placeholder="Buscar por nombre, teléfono o N° de reserva" value="${esc(reservationSearch)}"></div>
    ${rows.length ? `<div class="list">${rows.map(reservationRow).join('')}</div>` : empty('◉', q ? 'Sin resultados' : 'Nada por acá', q ? 'Probá con otra búsqueda.' : 'Cuando haya reservas en esta categoría van a aparecer acá.')}
  </section>
  ${state.leads.filter(l => l.status === 'convertida' || l.status === 'descartada').length ? `<details class="history card"><summary>Solicitudes respondidas (${state.leads.filter(l => l.status === 'convertida' || l.status === 'descartada').length})</summary><div class="list">${state.leads.filter(l => l.status === 'convertida' || l.status === 'descartada').slice(-20).reverse().map(l => `<div class="list-item"><div class="list-item-main"><b>${esc(l.name)}</b><p>${dateLabel(l.checkin)} → ${dateLabel(l.checkout)} · ${esc(l.channel||'')}</p></div><div class="row-actions"><span class="pill gray">${statusLabel(l.status)}</span><button class="danger" data-action="deleteLead" data-id="${l.id}">×</button></div></div>`).join('')}</div></details>` : ''}`;
}
function requestCard(l) {
  const available = checkAvailability(l.checkin, l.checkout);
  const total = Number(l.estimatedTotal || 0) || suggestPrice(l.checkin, l.checkout, l.nightly).total;
  return `<article class="request-card ${available?'':'conflict'}">
    <div class="rc-head"><b>${esc(l.name)}</b><span class="pill ${l.status==='nueva'?'warn':'gray'}">${statusLabel(l.status)}</span></div>
    <p class="rc-dates">${dateLabel(l.checkin)} → ${dateLabel(l.checkout)}</p>
    <p class="muted">${nightCount(l.checkin,l.checkout)} noche${nightCount(l.checkin,l.checkout)===1?'':'s'} · ${l.guests} persona${Number(l.guests)===1?'':'s'} · ${esc(l.channel||'Web')}</p>
    <p class="rc-total">${money(total)}</p>
    ${available ? '' : '<p class="rc-warn">Estas fechas se cruzan con otra reserva</p>'}
    ${l.notes ? `<p class="rc-notes">${esc(l.notes)}</p>` : ''}
    <div class="row-actions">${available?`<button class="primary-button" data-action="acceptLead" data-id="${l.id}">Aceptar</button>`:''}<button data-action="whatsapp" data-id="${l.id}">WhatsApp</button><button class="ghost-button" data-action="dismissLead" data-id="${l.id}">Descartar</button></div>
  </article>`;
}
function statusLabel(status) { return ({ nueva:'Nueva', presupuesto:'Respondida', convertida:'Aceptada', descartada:'Descartada' })[status] || status; }

function renderCalendar() {
  const year = calendarCursor.getFullYear(), month = calendarCursor.getMonth();
  const label = (t => t.charAt(0).toUpperCase() + t.slice(1))(new Intl.DateTimeFormat('es-AR', { month:'long', year:'numeric' }).format(calendarCursor));
  const first = new Date(year, month, 1); const start = new Date(year, month, 1 - ((first.getDay()+6)%7));
  const days = Array.from({length:42}, (_,i) => { const d = new Date(start); d.setDate(start.getDate()+i); return d; });
  return `<section class="card">
    <div class="card-header"><div><span class="eyebrow">RESERVAS, BLOQUEOS Y FERIADOS</span><h2>Disponibilidad</h2></div><div class="row-actions"><button data-action="newBlock">Bloquear fechas</button><button class="primary-button" data-action="newReservation">＋ Reserva</button></div></div>
    <div class="cal-legend-admin"><span><i class="ch-direct"></i>Directa / WhatsApp</span><span><i class="ch-booking"></i>Booking.com</span><span><i class="ch-airbnb"></i>Airbnb</span><span><i class="pending-sw"></i>Esperando seña</span><span><i class="blocked-sw"></i>Bloqueo / feriado</span></div>
    <div class="calendar-toolbar"><button class="icon-button" data-action="prevMonth">‹</button><h2>${label}</h2><button class="icon-button" data-action="nextMonth">›</button></div>
    <div class="calendar-grid">${['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(x=>`<div class="weekday">${x}</div>`).join('')}${days.map(d=>calendarDay(d,month)).join('')}</div>
  </section>
  <section class="content-grid"><div class="card"><div class="card-header"><div><span class="eyebrow">ESTE Y LOS PRÓXIMOS MESES</span><h2>Próximas estadías</h2></div><button class="ghost-button" data-route-go="reservas">Ver todas</button></div>${activeReservations().filter(r=>r.checkout>=todayISO()).length?`<div class="list">${activeReservations().filter(r=>r.checkout>=todayISO()).sort((a,b)=>a.checkin.localeCompare(b.checkin)).map(reservationRow).join('')}</div>`:empty('▦','Calendario despejado','No hay reservas próximas.')}</div><div class="card"><span class="eyebrow">BOOKING.COM Y AIRBNB</span><h2>Sincronización</h2><p class="muted">${Object.keys(Externals.sources).length ? `Conectado: ${Object.entries(Externals.sources).map(([k,v])=>`${k} ${v==='ok'?'✓':'(error)'}`).join(' · ')}. Las fechas de las plataformas aparecen en el calendario con borde punteado hasta que completes los datos.` : 'Todavía no conectaste Booking ni Airbnb. Se hace una sola vez desde Ajustes y después se actualiza solo cada 30 minutos.'}</p><div class="row-actions" style="justify-content:flex-start"><button data-action="syncCalendars">Actualizar ahora</button><button class="ghost-button" data-route-go="conexiones">Ajustes</button></div></div></section>`;
}
function calendarDay(d, shownMonth) {
  const iso = localISO(d); const events = []; const weekStart = (d.getDay() + 6) % 7 === 0;
  activeReservations().forEach(r => { if (iso >= r.checkin && iso < r.checkout) { const first = iso === r.checkin, last = plusDay(iso) === r.checkout; events.push(`<button class="calendar-event bar ${channelClass(r.channel)} ${r.status==='pending'?'pending':''} ${first?'bar-start':''} ${last?'bar-end':''}" data-action="details" data-id="${r.id}" title="${esc(r.guest)} · ${esc(r.channel||'Directa')}">${first || weekStart ? esc(r.guest) : '&nbsp;'}</button>`); } });
  Externals.unmatched().forEach(e => { if (iso >= e.start && iso < e.end) { const first = iso === e.start, last = plusDay(iso) === e.end; events.push(`<button class="calendar-event bar ext ${channelClass(e.source)} ${first?'bar-start':''} ${last?'bar-end':''}" data-action="completeExternal" data-id="${esc(e.uid)}" title="${esc(e.source)} · completar datos">${first || weekStart ? `${esc(e.source)} · completar` : '&nbsp;'}</button>`); } });
  state.blocks.forEach(b => { if (iso >= b.start && iso <= b.end) events.push(`<div class="calendar-event blocked">Bloqueado</div>`); });
  const holiday = state.holidays.find(h => h.fecha === iso || h.date === iso); if (holiday) events.push(`<div class="calendar-event blocked">${esc(holiday.nombre || holiday.localName)}</div>`);
  return `<div class="day ${d.getMonth()!==shownMonth?'outside':''} ${iso===todayISO()?'today':''}"><span class="day-number">${d.getDate()}</span>${events.slice(0,3).join('')}</div>`;
}
function renderTasks() {
  const open = state.tasks.filter(t=>!t.done), done = state.tasks.filter(t=>t.done);
  return `<section class="card"><div class="card-header"><div><span class="eyebrow">CHECKLIST OPERATIVO</span><h2>Preparar Villa il Fanale</h2><p class="muted">Anotá acá lo que quieras recordar. Ya no se crean tareas automáticas con cada reserva.</p></div><button class="primary-button" data-action="addTask">＋ Nueva tarea</button></div>
  ${open.length ? groupTasks(open) : empty('✓','No hay tareas pendientes','La casa está al día.')}
  ${done.length ? `<details><summary>${done.length} tareas terminadas</summary>${groupTasks(done)}</details>` : ''}</section>`;
}
function groupTasks(tasks) {
  const groups = Object.groupBy ? Object.groupBy(tasks, t=>t.category) : tasks.reduce((o,t)=>((o[t.category]??=[]).push(t),o),{});
  return Object.entries(groups).map(([category,items]) => `<div class="task-group"><div class="task-group-title">${esc(category)}</div>${items.map(t=>`<label class="task ${t.done?'done':''}"><input type="checkbox" data-task="${t.id}" ${t.done?'checked':''}><span>${esc(t.title)} ${t.due?`<small class="muted">· ${dateLabel(t.due)}</small>`:''}</span></label>`).join('')}</div>`).join('');
}

function renderFinances() {
  const inc = incomeByCurrency(), exp = expensesByCurrency();
  const income = inc.ARS, expenses = exp.ARS, balance = income-expenses;
  return `<section class="card"><div class="card-header"><div><span class="eyebrow">CONTROL SIMPLE</span><h2>Ingresos de la villa</h2><p class="muted">Empezamos por ingresos; los gastos pueden sumarse cuando lo necesites.</p></div><button class="primary-button" data-action="addMovement">＋ Registrar movimiento</button></div>
    <div class="finance-summary"><div class="money"><small>Ingresos</small><strong>${amountPair(inc)}</strong></div><div class="money expense"><small>Gastos</small><strong>${amountPair(exp)}</strong></div><div class="money balance"><small>Resultado</small><strong>${amountPair({ARS:inc.ARS-exp.ARS,USD:inc.USD-exp.USD})}</strong></div></div>
    ${state.movements.length?`<div class="list">${[...state.movements].reverse().map(m=>`<div class="list-item"><div><b>${esc(m.label)}</b><p class="muted">${dateLabel(m.date)} · ${m.type==='income'?'Ingreso':m.type==='reversal'?'Anulación':'Gasto'}</p></div><strong style="color:${m.type==='income'?'var(--pine)':'var(--rust)'}">${m.type==='income'?'+':'−'} ${money(m.amount, m.currency)}</strong></div>`).join('')}</div>`:empty('$','Todavía no hay movimientos','El primer ingreso aparecerá cuando confirmes una reserva o lo cargues manualmente.')}
  </section>`;
}
function incomeByCurrency() {
  return state.movements.reduce((acc,m) => { const c = m.currency === 'USD' ? 'USD' : 'ARS'; acc[c] += m.type==='income' ? Number(m.amount) : m.type==='reversal' ? -Number(m.amount) : 0; return acc; }, { ARS: 0, USD: 0 });
}
function expensesByCurrency() {
  return state.movements.filter(m=>m.type==='expense').reduce((acc,m) => { acc[m.currency === 'USD' ? 'USD' : 'ARS'] += Number(m.amount); return acc; }, { ARS: 0, USD: 0 });
}
function amountPair(pair) {
  const parts = [];
  if (pair.ARS || !pair.USD) parts.push(money(pair.ARS));
  if (pair.USD) parts.push(`<span class="usd-amount">${money(pair.USD,'USD')}</span>`);
  return parts.join('<br>');
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
  return `<form id="public-editor-form" class="page-editor v2">
    <div class="editor-fields">
      <div class="editor-topbar card"><div><span class="eyebrow">EDITOR DEL SITIO</span><h2>Tu página, en vivo</h2><p class="muted">Cada cambio se ve al instante en la vista previa y se guarda solo. Cuando esté listo, tocá <b>Publicar</b>.</p></div><span class="draft-state ${state.meta?.publicDirty?'dirty':''}" id="draft-state">${state.meta?.publicDirty?'Cambios sin publicar':'Todo publicado'}</span></div>
      <details class="card editor-sec" id="editor-portada" open><summary><span class="eyebrow">PORTADA</span><h2>Primera impresión</h2></summary><div class="form-grid">
        ${field('Texto superior','heroEyebrow','text','ALPA CORRAL · CÓRDOBA',true,undefined,undefined,content.heroEyebrow)}
        ${field('Título principal','heroTitle','text','Una casa con alma',true,undefined,undefined,content.heroTitle)}
        ${field('Título destacado','heroSubtitle','text','de sierra.',true,undefined,undefined,content.heroSubtitle)}
        ${editorTextArea('Descripción breve','heroDescription',content.heroDescription,3)}
      </div>${editorImage('heroImage','Imagen de portada',content.heroImage)}</details>
      <details class="card editor-sec" id="editor-historia" ><summary><span class="eyebrow">HISTORIA</span><h2>Presentación de la villa</h2></summary><div class="form-grid">
        ${field('Texto superior','introEyebrow','text','EL ENCANTO DE LO SIMPLE',true,undefined,undefined,content.introEyebrow)}
        ${field('Título','introTitle','text','Un refugio serrano',true,undefined,undefined,content.introTitle)}
        ${field('Continuación','introSubtitle','text','para volver al ritmo propio.',true,undefined,undefined,content.introSubtitle)}
        ${editorTextArea('Primer párrafo','introCopyOne',content.introCopyOne,5)}
        ${editorTextArea('Segundo párrafo','introCopyTwo',content.introCopyTwo,3)}
        ${field('Leyenda pequeña de la foto','featureCaptionSmall','text','El corazón de la casa',true,undefined,undefined,content.featureCaptionSmall)}
        ${field('Leyenda principal de la foto','featureCaption','text','Un único espacio…',true,undefined,undefined,content.featureCaption)}
      </div>${editorImage('featureImage','Imagen interior de ancho completo',content.featureImage)}</details>
      <details class="card editor-sec" id="editor-galeria" ><summary><span class="eyebrow">ESPACIOS Y GALERÍA</span><h2>Recorrido fotográfico</h2></summary><button type="button" class="secondary-button" data-action="addPublicGalleryItem">＋ Agregar foto</button><div class="form-grid">
        ${field('Texto superior','spacesEyebrow','text','RECORRÉ VILLA IL FANALE',true,undefined,undefined,content.spacesEyebrow)}
        ${field('Título','spacesTitle','text','Rincones que invitan',true,undefined,undefined,content.spacesTitle)}
        ${field('Continuación','spacesSubtitle','text','a quedarse.',true,undefined,undefined,content.spacesSubtitle)}
        ${editorTextArea('Descripción','spacesDescription',content.spacesDescription,3)}
      </div><div class="editor-gallery dynamic-gallery">${galleryItems.map((item,index)=>editorGalleryItem(item,index)).join('')}</div><p class="muted gallery-help">Podés agregar, eliminar, cambiar fotografía y editar el nombre visible de cada imagen. Se publican cuando tocás “Publicar cambios”.</p></details>
      <details class="card editor-sec" id="editor-servicios" ><summary><span class="eyebrow">SERVICIOS</span><h2>Equipamiento y comodidades</h2></summary><div class="form-grid">
        ${field('Texto superior','detailsEyebrow','text','TODO LO NECESARIO',true,undefined,undefined,content.detailsEyebrow)}${field('Título','detailsTitle','text','Preparada para',true,undefined,undefined,content.detailsTitle)}${field('Continuación','detailsSubtitle','text','disfrutarla.',true,undefined,undefined,content.detailsSubtitle)}
        ${[1,2,3,4,5,6].map(i=>`${field(`Servicio ${i}` ,`amenity${i}Title`,'text','',true,undefined,undefined,content[`amenity${i}Title`])}${field(`Descripción ${i}`,`amenity${i}Description`,'text','',true,undefined,undefined,content[`amenity${i}Description`])}`).join('')}
      </div>${editorImage('detailsImage','Imagen lateral de servicios',content.detailsImage)}</details>
      <details class="card editor-sec" id="editor-normas" ><summary><span class="eyebrow">NORMAS Y HORARIOS</span><h2>Información antes de venir</h2></summary><div class="form-grid">
        ${field('Texto superior','rulesEyebrow','text','ANTES DE VENIR',true,undefined,undefined,content.rulesEyebrow)}${field('Título','rulesTitle','text','Información clara,',true,undefined,undefined,content.rulesTitle)}${field('Continuación','rulesSubtitle','text','estadías tranquilas.',true,undefined,undefined,content.rulesSubtitle)}
        ${[1,2,3,4].map(i=>`${field(`Dato ${i}`,`rule${i}Value`,'text','',true,undefined,undefined,content[`rule${i}Value`])}${field(`Título ${i}`,`rule${i}Title`,'text','',true,undefined,undefined,content[`rule${i}Title`])}${editorTextArea(`Explicación ${i}`,`rule${i}Description`,content[`rule${i}Description`],2)}`).join('')}
        ${editorTextArea('Aviso importante','importantText',content.importantText,3)}
      </div></details>
      <details class="card editor-sec" id="editor-ubicacion" ><summary><span class="eyebrow">MAPA Y UBICACIÓN</span><h2>Cómo llegar</h2></summary><div class="form-grid">
        ${field('Texto superior','locationEyebrow','text','UBICACIÓN',true,undefined,undefined,content.locationEyebrow)}
        ${field('Título','locationTitle','text','Zona semicéntrica',true,undefined,undefined,content.locationTitle)}
        ${field('Continuación','locationSubtitle','text','de Alpa Corral.',true,undefined,undefined,content.locationSubtitle)}
        ${editorTextArea('Descripción','locationDescription',content.locationDescription,4)}
        ${field('Búsqueda para el mapa','locationMapQuery','text','Calle Los Ligustros, Alpa Corral, Córdoba',true,undefined,undefined,content.locationMapQuery)}
        ${field('Botón Google Maps','locationMapLink','url','https://maps.app.goo.gl/…',true,undefined,undefined,content.locationMapLink)}
        ${[1,2,3,4].map(i=>field(`Lugar cercano ${i}`,`near${i}`,'text','',false,undefined,undefined,content[`near${i}`] ?? ['Iglesia de Alpa Corral','Brasería El Alto','Museo Regional','Restaurante El Viejo Correo'][i-1])).join('')}
      </div></details>
      <details class="card editor-sec" id="editor-reservas" ><summary><span class="eyebrow">CONSULTAS Y RESERVAS</span><h2>Formulario público</h2></summary><div class="form-grid">
        ${field('Texto superior','bookingEyebrow','text','TU PRÓXIMA ESCAPADA',true,undefined,undefined,content.bookingEyebrow)}${field('Título','bookingTitle','text','Consultá tus fechas.',true,undefined,undefined,content.bookingTitle)}${editorTextArea('Explicación','bookingDescription',content.bookingDescription,4)}${field('Ubicación del pie','footerLocation','text','Alpa Corral · Córdoba · Argentina',true,undefined,undefined,content.footerLocation)}
        ${field('Una sola noche','singleNight','number','100000',true,1,undefined,content.singleNight)}
        ${field('Dos noches o más','regularNight','number','60000',true,1,undefined,content.regularNight)}
        ${field('Temporada alta (nov. a feb.)','highNight','number','65000',true,1,undefined,content.highNight)}
        ${field('Seña para confirmar (%)','depositPercent','number','50',true,1,100,content.depositPercent ?? 50)}
      </div>${editorImage('bookingImage','Imagen junto al formulario',content.bookingImage)}</details>
      <div class="editor-publish"><div><b>¿Todo listo?</b><span>Tus cambios ya están guardados. Publicar actualiza la página que ven los huéspedes.</span></div><div class="row-actions"><button type="button" class="ghost-button" data-action="previewPublicPage">Abrir página</button><button type="button" class="primary-button" data-action="publishPublicPage">Publicar cambios</button></div></div>
    </div>
    <aside class="editor-preview">
      <div class="preview-bar"><div class="seg"><button type="button" class="active" data-preview-size="desktop">Compu</button><button type="button" data-preview-size="mobile">Celular</button></div><span class="muted">Vista previa en vivo</span></div>
      <div class="preview-frame desktop" id="preview-frame"><iframe id="preview-iframe" title="Vista previa de la página" src="reservar/?preview=1"></iframe></div>
    </aside>
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

function capturePublicEditor(silent = false) {
  const form = document.querySelector('#public-editor-form');
  if (!form) return false;
  if (!silent && !form.reportValidity()) { form.querySelectorAll('details.editor-sec').forEach(d => { if (d.querySelector(':invalid')) d.open = true; }); form.reportValidity(); return false; }
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
  ['singleNight','regularNight','highNight','depositPercent'].forEach(key => values[key] = Number(values[key]));
  state.publicContent = { ...(state.publicContent || defaultState.publicContent), ...values, galleryItems };
  return true;
}

function savePublicDraft(event) {
  event.preventDefault();
  if (!capturePublicEditor()) return;
  saveState('Borrador guardado');
}
let previewTimer = null, draftTimer = null, previewUrls = {};
function sendPreview() {
  const frame = document.querySelector('#preview-iframe'); if (!frame?.contentWindow) return;
  Object.entries(pendingPublicImages).forEach(([key, file]) => { if (!previewUrls[key] || previewUrls[key].file !== file) previewUrls[key] = { file, url: URL.createObjectURL(file) }; });
  const images = Object.fromEntries(Object.entries(previewUrls).filter(([key]) => pendingPublicImages[key]).map(([key, v]) => [key, v.url]));
  frame.contentWindow.postMessage({ type: 'villa-preview', content: state.publicContent, images }, location.origin);
}
function bindLiveEditor() {
  const form = document.querySelector('#public-editor-form'); if (!form) return;
  const frame = document.querySelector('#preview-iframe');
  frame?.addEventListener('load', () => setTimeout(sendPreview, 300));
  const markDirty = () => { state.meta.publicDirty = true; const el = document.querySelector('#draft-state'); if (el) { el.textContent = 'Guardando…'; el.className = 'draft-state dirty'; } };
  form.addEventListener('input', () => {
    markDirty();
    clearTimeout(previewTimer); previewTimer = setTimeout(() => { capturePublicEditor(true); sendPreview(); }, 280);
    clearTimeout(draftTimer); draftTimer = setTimeout(() => { capturePublicEditor(true); saveState(''); const el = document.querySelector('#draft-state'); if (el) el.textContent = 'Cambios sin publicar · guardado'; }, 1200);
  });
  const box = document.querySelector('#preview-frame');
  const fit = () => {
    if (!box || !frame) return;
    if (box.classList.contains('desktop')) { const k = box.clientWidth / 1440; frame.style.width = '1440px'; frame.style.height = `${box.clientHeight / k}px`; frame.style.transform = `scale(${k})`; }
    else { frame.style.width = ''; frame.style.height = ''; frame.style.transform = ''; }
  };
  if ('ResizeObserver' in window && box) new ResizeObserver(fit).observe(box);
  fit();
  document.querySelectorAll('[data-preview-size]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-preview-size]').forEach(b => b.classList.toggle('active', b === button));
    box.className = `preview-frame ${button.dataset.previewSize}`; setTimeout(fit, 380); fit();
  }));
  form.querySelectorAll('details.editor-sec').forEach(d => d.addEventListener('toggle', () => {
    if (!d.open) return;
    const map = { portada: 'inicio', historia: 'historia', galeria: 'espacios', servicios: 'detalles', normas: 'reglas', ubicacion: 'ubicacion', reservas: 'reservar' };
    const target = map[d.id.replace('editor-', '')];
    try { const doc = frame.contentDocument; const el = target === 'reglas' ? doc.querySelector('.rules') : doc.getElementById(target); el?.scrollIntoView({ behavior: 'smooth' }); } catch {}
  }));
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
    state.meta.publicDirty = true; sendPreview();
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
    published = true; state.meta.publicDirty = false; saveState('', { keepTimestamp: false });
    const ds = document.querySelector('#draft-state'); if (ds) { ds.textContent = 'Todo publicado'; ds.className = 'draft-state'; }
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
  const site = (state.settings.publicSiteUrl || 'https://leonflesca-ing.github.io/villa-il-fanale-gestion/reservar/').replace(/\/?$/, '/');
  const src = Externals.sources; const evs = Externals.events;
  const srcState = name => src[name] === 'ok' ? `<span class="pill"><span class="dot"></span>Conectado</span>` : src[name] === 'error' ? `<span class="pill rust"><span class="dot"></span>Error al leer</span>` : `<span class="pill warn"><span class="dot"></span>Sin conectar</span>`;
  return `<section class="card calendars-card">
    <div class="card-header"><div><span class="eyebrow">BOOKING.COM Y AIRBNB</span><h2>Calendarios sincronizados</h2><p class="muted">Cada 30 minutos se leen las fechas ocupadas de Booking y Airbnb, y se bloquean en tu página. Tus reservas directas también se bloquean en las plataformas, así nunca se pisan.</p></div><button class="ghost-button" data-action="syncCalendars">Actualizar ahora</button></div>
    <div class="sync-grid">
      <article class="sync-box"><div class="sync-box-head"><b>Booking.com</b>${srcState('Booking.com')}</div>
        <p class="muted">${evs.filter(e=>e.source==='Booking.com').length} fecha(s) ocupadas leídas.</p>
        <span class="eyebrow">PEGAR EN BOOKING → “IMPORTAR CALENDARIO”</span>
        <div class="copy-row"><input readonly value="${esc(site)}calendario-booking.ics"><button data-action="copyText" data-id="${esc(site)}calendario-booking.ics">Copiar</button></div></article>
      <article class="sync-box"><div class="sync-box-head"><b>Airbnb</b>${srcState('Airbnb')}</div>
        <p class="muted">${evs.filter(e=>e.source==='Airbnb').length} fecha(s) ocupadas leídas.</p>
        <span class="eyebrow">PEGAR EN AIRBNB → “IMPORTAR CALENDARIO”</span>
        <div class="copy-row"><input readonly value="${esc(site)}calendario-airbnb.ics"><button data-action="copyText" data-id="${esc(site)}calendario-airbnb.ics">Copiar</button></div></article>
    </div>
    <details class="howto"><summary>¿Cómo se conecta? (una sola vez)</summary><ol>
      <li>En la extranet de Booking: <b>Tarifas y disponibilidad → Sincronizar calendarios → Exportar</b>. Copiá ese enlace. En Airbnb: <b>Calendario → Disponibilidad → Conectar calendarios → Exportar</b>.</li>
      <li>En GitHub, en tu repositorio <b>villa-il-fanale-gestion</b>: <b>Settings → Secrets and variables → Actions → New repository secret</b>. Creá <code>BOOKING_ICS_URL</code> con el enlace de Booking y <code>AIRBNB_ICS_URL</code> con el de Airbnb.</li>
      <li>Pegá en Booking y en Airbnb (en <b>Importar calendario</b>) los enlaces de arriba, así tus reservas directas se bloquean allá.</li>
    </ol></details>
  </section>
  <section class="card security-note"><span class="security-icon">⌂</span><div><b>Página pública de reservas</b><p>Los huéspedes eligen fechas en el calendario y te mandan la solicitud. ${state.settings.bookingEndpoint ? 'Las solicitudes entran solas a “Reservas”.' : 'Configurá el receptor automático abajo para que entren solas.'} <a href="${esc(site)}" target="_blank" rel="noopener">Abrir página</a></p></div></section>
  <section class="content-grid">
    <form class="card" id="connections-form">
      <div class="card-header"><div><span class="eyebrow">TUS DATOS</span><h2>Datos de la casa y cobros</h2><p class="muted">Se usan en comprobantes y en los mensajes de WhatsApp. Se guardan cifrados con tu memoria.</p></div></div>
      <div class="form-grid">
        ${field('Nombre para comprobantes','owner','text','Nombre y apellido',false,undefined,undefined,state.settings.owner)}
        ${field('DNI para comprobantes','dni','text','Se guarda sólo localmente',false,undefined,undefined,state.settings.dni)}
        ${field('WhatsApp','phone','tel','Ej.: 358...',false,undefined,undefined,state.settings.phone)}
        ${field('Alias para la seña','payAlias','text','Ej.: villa.fanale.mp',false,undefined,undefined,state.settings.payAlias||'')}
        ${field('CBU / CVU','payCbu','text','Opcional',false,undefined,undefined,state.settings.payCbu||'')}
        ${field('Titular de la cuenta','payHolder','text','Nombre que verá el huésped',false,undefined,undefined,state.settings.payHolder||'')}
        ${field('Banco / billetera','payBank','text','Ej.: Mercado Pago',false,undefined,undefined,state.settings.payBank||'')}
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
      <span class="eyebrow">TUS DATOS SEGUROS</span><h2>Memoria y respaldo</h2>
      ${installPrompt?'<button class="ghost-button" data-action="installApp">Instalar como app en este dispositivo</button><hr class="soft-rule">':''}
      ${Cloud.panel()}
      <hr class="soft-rule">
      <h3>Historial automático</h3><p class="muted">La app guarda sola una foto de tus datos cada vez que trabajás. Si algo se borra, volvé a una versión anterior.</p>
      <div id="snapshot-list" class="snapshot-list"><p class="muted">Cargando historial…</p></div>
      <hr class="soft-rule">
      <h3>Copia manual</h3><p class="muted">Un archivo con todos tus datos, por si querés guardarlo vos.</p>
      <div class="row-actions" style="justify-content:flex-start"><button data-action="exportBackup">Descargar copia</button><button data-action="importBackup">Cargar copia</button></div>
      <input type="file" id="backup-file" accept="application/json,.json" hidden>
    </div>
  </section>
  <section class="card more-tools"><span class="eyebrow">MÁS HERRAMIENTAS</span><div class="row-actions">${navSecondary.map(([k,,l]) => `<button class="ghost-button" data-route-go="${k}">${l}</button>`).join('')}</div></section>`;
}

function connectionCard(icon,title,status,tone,body,actions) {
  return `<article class="card connection-card"><div class="connection-icon">${icon}</div><div class="connection-head"><div><h3>${title}</h3><span class="pill ${tone==='ready'?'':'warn'}"><span class="dot"></span>${status}</span></div></div><p class="muted">${body}</p><div class="connection-actions">${actions}</div></article>`;
}

function saveConnections(event) {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(event.currentTarget));
  Object.assign(state.settings, values);
  saveState('Ajustes guardados');
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
        channel: 'Página web', status: 'nueva', nightly: 0, estimatedTotal: Number(item.estimatedTotal || 0),
        notes: [item.message, item.estimatedTotal ? `Estimación web: ${money(Number(item.estimatedTotal))}` : ''].filter(Boolean).join(' · ')
      });
      added += 1;
    });
    saveState();
    if (!silent) {
      toast(added ? `${added} solicitud${added===1?' nueva':'es nuevas'} recibida${added===1?'':'s'}` : 'No hay solicitudes nuevas');
      navigate('reservas');
    } else if (route === 'reservas' && added) render();
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
    try { Memory.snapshot(state, 'Antes de cargar una copia'); state = normalizeState(JSON.parse(reader.result)); saveState('Datos restaurados'); render(); }
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
    ${field('Nombre','name','text','Nombre de la persona',true)}${selectField('Canal','channel',CHANNELS,null,'WhatsApp')}
    ${field('Teléfono','phone','tel','358…')}${field('Cantidad de personas','guests','number','Hasta 5',true,'1','5')}
    ${field('Ingreso','checkin','date','',true)}${field('Salida','checkout','date','',true)}
    ${field('Precio por noche','nightly','number','La app lo sugiere')}${selectField('Estado','status',['nueva','presupuesto'],['Nueva','Presupuesto enviado'])}
    ${textareaField('Notas de la conversación','notes','Qué pidió, dudas o detalles…')}
  </div><div id="quote-result"></div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Guardar consulta</button></div></form>`);
  const form = document.querySelector('#lead-form');
  ['checkin','checkout','guests'].forEach(name=>form.elements[name].addEventListener('change',()=>updateQuote(form)));
  form.addEventListener('submit', event => { event.preventDefault(); const data=Object.fromEntries(new FormData(form)); if(!validDates(data.checkin,data.checkout)) return toast('Revisá las fechas'); const suggestion=suggestPrice(data.checkin,data.checkout); data.id=uid(); data.created=todayISO(); data.status=data.status||'nueva'; data.nightly=Number(data.nightly||suggestion.nightly); data.guests=Number(data.guests); state.leads.push(data); saveState('Consulta guardada'); closeModal(); navigate('reservas'); });
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
    ${field('Cantidad de personas','guests','number','Máximo 5',true,'1','5',source.guests||'')}${selectField('Origen','channel',CHANNELS,null,source.channel||'Booking.com')}
    <label class="field booking-only"><span>N° de reserva de Booking</span><input name="bookingRef" type="text" placeholder="Ej.: 6634934028" value="${esc(existing?.bookingRef||'')}"></label>
    ${selectField('Moneda','currency',['USD','ARS'],['Dólares (US$)','Pesos ($)'],existing ? rCur(existing) : 'USD')}
    <label class="field"><span>Precio total acordado</span><input name="total" type="number" step="any" min="0" placeholder="Importe total" required value="${esc(existing?.total ?? suggestedTotal)}"></label>
    <label class="field"><span>Seña / pago recibido</span><input name="paid" type="number" step="any" min="0" placeholder="0 si se cobra todo al ingresar" value="${esc(existing?.paid ?? '')}"></label>
    <label class="field usd-only"><span>Tipo de cambio (opcional)</span><input name="exchangeRate" type="number" step="any" min="0" placeholder="Ej.: 1522,73" value="${esc(existing?.exchangeRate||'')}"></label>
    <label class="field usd-only"><span>Equivalente en pesos (opcional)</span><input name="arsEquivalent" type="number" step="any" min="0" placeholder="Ej.: 201000" value="${esc(existing?.arsEquivalent||'')}"></label>
    ${field('Depósito de garantía','guarantee','number','Opcional, lo definís vos',false,undefined,undefined,existing?.guarantee||'')}${field('Patente','plate','text','Opcional',false,undefined,undefined,existing?.plate||'')}
    ${field('DNI del titular','guestDni','text','Dato opcional',false,undefined,undefined,existing?.guestDni||'')}${field('Fecha de nacimiento','birthdate','date','',false,undefined,undefined,existing?.birthdate||'')}
    ${field('Contacto de emergencia','emergencyPhone','tel','Dato opcional',false,undefined,undefined,existing?.emergencyPhone||'')}${field('Correo electrónico','email','email','Dato opcional',false,undefined,undefined,existing?.email||'')}
    ${field('Ciudad y domicilio','address','text','Dato opcional',false,undefined,undefined,existing?.address||'')}${field('Acompañantes','companions','text','Nombres separados por coma',false,undefined,undefined,existing?.companions||'')}
    ${textareaField('Notas','notes','Datos importantes de la estadía',existing?.notes||'')}
    ${existing?'':'<label class="checkline field full"><input type="checkbox" name="depositConfirmed" required> Confirmo la reserva y que estas fechas deben bloquearse.</label>'}
  </div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">${existing?'Guardar cambios':'Confirmar reserva'}</button></div></form>`);
  const form=document.querySelector('#reservation-form');
  const syncFormVisibility = () => {
    form.classList.toggle('is-usd', form.elements.currency.value === 'USD');
    form.classList.toggle('is-booking', form.elements.channel.value === 'Booking.com');
  };
  form.elements.currency.addEventListener('change', syncFormVisibility);
  form.elements.channel.addEventListener('change', syncFormVisibility);
  syncFormVisibility();
  const linkRate = source => {
    const total = Number(form.elements.total.value || 0), rate = Number(form.elements.exchangeRate.value || 0), ars = Number(form.elements.arsEquivalent.value || 0);
    if (source === 'ars' && total && ars) form.elements.exchangeRate.value = Math.round(ars / total * 100) / 100;
    if (source !== 'ars' && total && rate) form.elements.arsEquivalent.value = Math.round(total * rate);
  };
  form.elements.arsEquivalent.addEventListener('input', () => linkRate('ars'));
  form.elements.exchangeRate.addEventListener('input', () => linkRate('rate'));
  form.elements.total.addEventListener('input', () => linkRate('total'));
  form.addEventListener('submit',event=>{ event.preventDefault(); const data=Object.fromEntries(new FormData(form)); if(!validDates(data.checkin,data.checkout)) return toast('Revisá las fechas'); if(!checkAvailability(data.checkin,data.checkout,existing?.id)) return toast('Esas fechas ya están ocupadas o bloqueadas'); data.guests=Number(data.guests); data.total=Number(data.total); data.paid=Number(data.paid||0); data.guarantee=Number(data.guarantee||0); data.nights=nightCount(data.checkin,data.checkout); data.currency=data.currency==='USD'?'USD':'ARS'; data.exchangeRate=data.currency==='USD'?Number(data.exchangeRate||0):0; data.arsEquivalent=data.currency==='USD'?Number(data.arsEquivalent||0):0; if(data.channel!=='Booking.com') data.bookingRef=''; delete data.depositConfirmed;
    if(data.paid>data.total) return toast('El pago recibido no puede superar el total');
    if(existing){
      const oldPaid=Number(existing.paid||0), delta=data.paid-oldPaid;
      Object.assign(existing,data,{id:existing.id,receipt:existing.receipt,created:existing.created,status:existing.status});
      state.movements.filter(m=>m.reservationId===existing.id).forEach(m=>{ m.currency=data.currency; });
      if(delta>0)state.movements.push({id:uid(),type:'income',label:`Ajuste de pago · ${data.guest}`,amount:delta,currency:data.currency,date:todayISO(),reservationId:existing.id});
      if(delta<0)state.movements.push({id:uid(),type:'reversal',label:`Ajuste de pago · ${data.guest}`,amount:Math.abs(delta),currency:data.currency,date:todayISO(),reservationId:existing.id});
      saveState('Reserva actualizada'); closeModal(); render(); return;
    }
    data.id=uid(); data.receipt=nextReceipt(); data.created=todayISO(); data.status='confirmed'; if(form.dataset.externalUid) data.externalUid=form.dataset.externalUid; state.reservations.push(data); if(data.paid>0) state.movements.push({id:uid(),type:'income',label:`Seña · ${data.guest}`,amount:data.paid,currency:data.currency,date:todayISO(),reservationId:data.id}); if(lead){ const original=state.leads.find(x=>x.id===lead.id); if(original) original.status='convertida'; } saveState('Reserva confirmada'); closeModal(); navigate('calendario'); });
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
  openModal('Registrar movimiento', `<form id="movement-form"><div class="form-grid">${selectField('Tipo','type',['income','expense'],['Ingreso','Gasto'])}${field('Concepto','label','text','Ej.: Seña reserva',true)}${field('Importe','amount','number','0',true)}${field('Fecha','date','date','',true,undefined,undefined,todayISO())}${selectField('Moneda','currency',['ARS','USD'],['Pesos ($)','Dólares (US$)'])}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Guardar</button></div></form>`);const form=document.querySelector('#movement-form');form.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form));d.id=uid();d.amount=Number(d.amount);state.movements.push(d);saveState('Movimiento registrado');closeModal();render();});bindModal();
}
function openInventoryModal() {
  openModal('Agregar al inventario', `<form id="inventory-form"><div class="form-grid">${field('Elemento','name','text','Ej.: Copas',true)}${field('Detalle','detail','text','Qué controlar')}${selectField('Estado','status',['hay','poco','falta'],['Hay','Queda poco','Falta'])}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Agregar</button></div></form>`);const form=document.querySelector('#inventory-form');form.addEventListener('submit',e=>{e.preventDefault();state.inventory.push({...Object.fromEntries(new FormData(form)),id:uid()});saveState('Elemento agregado');closeModal();render();});bindModal();
}

function openReservationDetails(id) {
  const r=state.reservations.find(x=>x.id===id); if(!r)return; const cancelled=r.status==='cancelled'; const balance=cancelled?0:Number(r.total)-Number(r.paid||0);
  openModal(`Reserva de ${esc(r.guest)}`, `${cancelled?'<div class="cancelled-banner"><b>Reserva cancelada</b><span>Las fechas fueron liberadas y los ingresos asociados quedaron anulados.</span></div>':''}<div class="form-grid"><div><span class="eyebrow">ESTADÍA${r.status==='pending'?' · <span style="color:#a46a00">ESPERANDO SEÑA</span>':''}</span><p><b>${dateLabel(r.checkin)} → ${dateLabel(r.checkout)}</b><br>${r.nights} noches · ${r.guests} huéspedes · ${esc(r.channel)}</p></div><div><span class="eyebrow">PAGOS</span><p>Total ${money(r.total, rCur(r))}${r.arsEquivalent?` <small class="muted">(≈ ${money(r.arsEquivalent)})</small>`:''}<br>Pagado ${money(cancelled?0:r.paid, rCur(r))}<br><b>Saldo ${money(balance, rCur(r))}</b></p></div>${r.bookingRef?`<div class="field full"><span class="eyebrow">BOOKING.COM</span><p>Reserva N° ${esc(r.bookingRef)}</p></div>`:''}${r.notes?`<div class="field full"><span class="eyebrow">NOTAS</span><p>${esc(r.notes)}</p></div>`:''}<div class="field full"><span class="eyebrow">DATOS DEL TITULAR</span><p>${esc(r.phone||'Sin teléfono')} · DNI ${esc(r.guestDni||'Sin informar')} · Patente ${esc(r.plate||'Sin informar')}<br>${esc(r.address||'')} ${r.companions?`<br>Acompañantes: ${esc(r.companions)}`:''}</p></div></div><div class="form-actions">${cancelled?`<button class="ghost-button danger" data-action="deleteReservation" data-id="${r.id}">Eliminar historial</button>`:`<button class="ghost-button" data-action="openForm">Formulario</button><button class="ghost-button" data-action="editReservation" data-id="${r.id}">Editar</button><button class="ghost-button danger" data-action="cancelReservation" data-id="${r.id}">Cancelar reserva</button>${r.status==='pending'?`<button class="primary-button" data-action="confirmDeposit" data-id="${r.id}">Registrar seña</button>`:''}${r.phone?`<button class="ghost-button" data-action="whatsappGuest" data-id="${r.id}">WhatsApp</button>`:''}<button class="secondary-button" id="print-receipt">Comprobante</button>${balance>0&&r.status!=='pending'?`<button class="primary-button" id="collect-balance">Registrar saldo</button>`:''}`}</div>`);
  bindModal(); const print=document.querySelector('#print-receipt');if(print)print.addEventListener('click',()=>printReceipt(r)); const collect=document.querySelector('#collect-balance'); if(collect) collect.addEventListener('click',()=>{r.paid=Number(r.total);state.movements.push({id:uid(),type:'income',label:`Saldo · ${r.guest}`,amount:balance,currency:rCur(r),date:todayISO(),reservationId:r.id});saveState('Saldo registrado');closeModal();render();});
}

function openModal(title, body) {
  const root = document.querySelector('#modal-root');
  root.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${title}</h2><button class="icon-button" data-close aria-label="Cerrar">×</button></header><div class="modal-body">${body}</div></section></div>`;
  document.body.classList.add('modal-open');
  root.querySelector('.modal-backdrop').addEventListener('mousedown', event => { if (event.target.classList.contains('modal-backdrop')) closeModal(); });
  setTimeout(() => root.querySelector('.modal input:not([type=hidden]):not([type=checkbox]), .modal select, .modal textarea')?.focus({ preventScroll: true }), 60);
}
document.addEventListener('keydown', event => { if (event.key === 'Escape' && document.querySelector('#modal-root .modal')) closeModal(); });
function bindModal(){document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',closeModal));document.querySelectorAll('#modal-root [data-action]').forEach(b=>b.addEventListener('click',()=>handleAction(b.dataset.action,b.dataset.id)));}
function closeModal(){document.querySelector('#modal-root').innerHTML='';document.body.classList.remove('modal-open');}
function field(label,name,type='text',placeholder='',required=false,min,max,value=''){return `<label class="field"><span>${label}</span><input name="${name}" type="${type}" placeholder="${placeholder}" ${required?'required':''} ${min?`min="${min}"`:''} ${max?`max="${max}"`:''} value="${esc(value)}"></label>`;}
function textareaField(label,name,placeholder='',value=''){return `<label class="field full"><span>${label}</span><textarea name="${name}" placeholder="${placeholder}">${esc(value)}</textarea></label>`;}
function selectField(label,name,values,labels=null,selected=''){return `<label class="field"><span>${label}</span><select name="${name}">${values.map((v,i)=>`<option value="${v}" ${v===selected?'selected':''}>${labels?labels[i]:v}</option>`).join('')}</select></label>`;}

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
  openModal('Cancelar reserva',`<div class="cancel-summary"><span class="cancel-icon">!</span><div><h3>${esc(reservation.guest)}</h3><p>${dateLabel(reservation.checkin)} → ${dateLabel(reservation.checkout)}</p></div></div><div class="quote-box"><b>Al confirmar:</b><p>Se liberarán las fechas y se anularán ${money(amount, rCur(reservation))} de los ingresos registrados. La reserva quedará visible en el historial.</p></div><div class="form-actions"><button class="ghost-button" data-close>Volver</button><button class="primary-button danger-solid" id="confirm-cancel-reservation">Sí, cancelar reserva</button></div>`);
  bindModal();document.querySelector('#confirm-cancel-reservation').addEventListener('click',()=>cancelReservation(id));
}

function cancelReservation(id){
  const reservation=state.reservations.find(r=>r.id===id);if(!reservation||reservation.status==='cancelled')return;
  const amount=reservationNetIncome(id);
  if(amount>0)state.movements.push({id:uid(),type:'reversal',label:`Anulación · ${reservation.guest}`,amount,currency:rCur(reservation),date:todayISO(),reservationId:id});
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
  const cur = rCur(r); const balance = Number(r.total) - Number(r.paid || 0);
  const nightly = r.nights ? Number(r.total) / r.nights : Number(r.total);
  const longDate = v => new Intl.DateTimeFormat('es-AR',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(`${v}T12:00:00`));
  const nightsRows = datesBetween(r.checkin, r.checkout).map(d => `<tr><td>Noche del ${dateLabel(d)} al ${dateLabel(plusDay(d))}</td><td class="num">${money(nightly, cur)}</td></tr>`).join('');
  const rate = r.exchangeRate || (r.arsEquivalent && r.total ? r.arsEquivalent / r.total : 0);
  const owner = state.settings.owner || 'Villa il Fanale';
  const phone = state.settings.phone || '358 484 9524';
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${esc(r.receipt)} · ${esc(r.guest)}</title>
<style>
@page{size:A4;margin:16mm}*{box-sizing:border-box}body{margin:0;font:13px/1.45 Helvetica,Arial,sans-serif;color:#111;-webkit-print-color-adjust:exact}
.sheet{max-width:720px;margin:28px auto;padding:0 8px}
.top{text-align:center;padding-bottom:16px;border-bottom:1.5px solid #111}
.top h1{font:400 30px/1 Georgia,'Times New Roman',serif;letter-spacing:.14em;margin:0}.top p{font:italic 13px Georgia,serif;color:#555;margin:6px 0 0}
.meta{display:flex;justify-content:space-between;align-items:flex-end;margin:18px 0 6px}.meta h2{font-size:15px;letter-spacing:.06em;margin:0}.meta .r{text-align:right;color:#555;font-size:11.5px}
.nf{font-style:italic;color:#666;font-size:11px}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px 18px;margin:20px 0;padding:16px 0;border-top:1px solid #ccc;border-bottom:1px solid #ccc}
.k{display:block;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#666;margin-bottom:3px}.v{font-size:14px;font-weight:600}.s{color:#555;font-size:11.5px}
table{width:100%;border-collapse:collapse;margin-top:6px}th{font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:#666;text-align:left;padding:6px 0;border-bottom:1px solid #ccc}
td{padding:9px 0;border-bottom:1px solid #e3e3e3}.num{text-align:right;white-space:nowrap}
.total{display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding:12px 16px;border:1.5px solid #111}.total b{font-size:13px;letter-spacing:.06em}.total strong{font-size:22px}
.lines{margin-top:12px}.lines div{display:flex;justify-content:space-between;padding:4px 0;color:#333}
.note{margin-top:22px;padding-top:12px;border-top:1px solid #ccc;font-size:11.5px;color:#444}
.foot{margin-top:40px;text-align:center;font-size:11px;color:#555}.foot i{display:block;font:italic 13px Georgia,serif;color:#111;margin-bottom:14px}
.print{display:block;margin:20px auto 0;padding:10px 22px;border:1px solid #111;background:#fff;font:600 13px Helvetica,Arial;cursor:pointer}@media print{.print{display:none}.sheet{margin:0}}
</style></head><body><div class="sheet">
<div class="top"><h1>VILLA IL FANALE</h1><p>Loft Serrano · Alpa Corral, Córdoba</p></div>
<div class="meta"><div><h2>COMPROBANTE DE RESERVA</h2><div class="nf">Documento no válido como factura</div></div><div class="r">${r.bookingRef?`Reserva Booking.com N° ${esc(r.bookingRef)}<br>`:''}Comprobante ${esc(r.receipt)}<br>Emitido: ${new Intl.DateTimeFormat('es-AR').format(new Date())}</div></div>
<div class="grid">
<div><span class="k">Huésped titular</span><span class="v">${esc(r.guest)}</span>${r.phone?`<div class="s">${esc(r.phone)}</div>`:''}</div>
<div><span class="k">Huéspedes</span><span class="v">${r.guests} persona${Number(r.guests)===1?'':'s'}</span></div>
<div><span class="k">Canal</span><span class="v">${esc(r.channel||'Directo')}</span></div>
<div><span class="k">Check-in</span><span class="v">${longDate(r.checkin)}</span><div class="s">desde las ${esc(state.settings.checkin||'15:00')} hs</div></div>
<div><span class="k">Check-out</span><span class="v">${longDate(r.checkout)}</span><div class="s">hasta las ${esc(state.settings.checkout||'10:00')} hs</div></div>
<div><span class="k">Estadía</span><span class="v">${r.nights} noche${r.nights===1?'':'s'}</span><div class="s">Alojamiento completo</div></div>
</div>
<table><thead><tr><th>Detalle</th><th class="num">Importe</th></tr></thead><tbody>${nightsRows}</tbody></table>
<div class="total"><b>TOTAL DE LA ESTADÍA</b><strong>${money(r.total, cur)}</strong></div>
<div class="lines">
${Number(r.paid)>0?`<div><span>Pagado a cuenta</span><span>${money(r.paid, cur)}</span></div>`:''}
<div><span><b>${balance>0?'Saldo a abonar al ingresar':'Saldo'}</b></span><span><b>${money(balance, cur)}</b></span></div>
${cur==='USD'&&r.arsEquivalent?`<div><span>Equivalente en pesos argentinos${r.channel==='Booking.com'?' (según Booking.com)':''}</span><span>${money(r.arsEquivalent)}</span></div>`:''}
${cur==='USD'&&rate?`<div class="s"><span>Tipo de cambio de referencia</span><span>US$ 1 = $ ${new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(rate)}</span></div>`:''}
${Number(r.guarantee)>0?`<div><span>Depósito de garantía (reintegrable al check-out)</span><span>${money(r.guarantee, cur)}</span></div>`:''}
</div>
<div class="note">${cur==='USD'?'El pago en el ingreso se realiza al valor del dólar del día. ':''}Gracias por respetar las normas de la casa.</div>
<div class="foot"><i>¡Gracias por elegirnos! Que disfruten la tranquilidad serrana.</i>${esc(owner)} · ${esc(phone)} · Instagram @villailfanale</div>
<button class="print" onclick="window.print()">Imprimir</button>
</div><script>setTimeout(()=>window.print(),350)<\/script></body></html>`;
  const w=window.open('','_blank'); if(!w) return toast('Permití las ventanas emergentes para ver el comprobante');
  w.document.write(html); w.document.close();
}
async function fetchHolidays(){
  const years=[new Date().getFullYear(),new Date().getFullYear()+1];
  try{const results=await Promise.all(years.map(y=>fetch(`https://api.argentinadatos.com/v1/feriados/${y}`).then(r=>r.ok?r.json():[])));state.holidays=results.flat();saveState();if(route==='calendario')render();}catch{ /* funciona sin conexión; simplemente no destaca feriados */ }
}
function importICS(event){const file=event.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{importICSText(reader.result);event.target.value='';};reader.readAsText(file);}
function importICSText(text){const chunks=text.split('BEGIN:VEVENT').slice(1);let added=0;chunks.forEach(chunk=>{const start=parseICSDate(matchICS(chunk,'DTSTART'));const end=parseICSDate(matchICS(chunk,'DTEND'));const summary=matchICS(chunk,'SUMMARY')||'Reserva externa';if(start&&end&&checkAvailability(start,end)){const id=uid();state.reservations.push({id,guest:summary,phone:'',checkin:start,checkout:end,guests:1,channel:'Calendario importado',total:0,paid:0,guarantee:0,nights:nightCount(start,end),receipt:nextReceipt(),created:todayISO(),external:true});createReservationTasks(state.reservations.at(-1));added++;}});saveState(`${added} eventos importados`);navigate('calendario');}
function matchICS(chunk,key){const line=chunk.split(/\r?\n/).find(l=>l.startsWith(key));return line?line.split(':').slice(1).join(':').replace(/\\,/g,','):'';}
function parseICSDate(value){if(!value)return'';const v=value.slice(0,8);return `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}`;}

function toast(message){const root=document.querySelector('#toast-root');root.innerHTML=`<div class="toast">${esc(message)}</div>`;setTimeout(()=>root.innerHTML='',Math.min(8500, Math.max(2800, String(message).length * 55)));}

/* ===== Solicitudes, seña y WhatsApp ===== */
function paymentText(amount, cur = 'ARS') {
  const st = state.settings; const parts = [];
  if (st.payAlias) parts.push(`Alias: ${st.payAlias}`);
  if (st.payCbu) parts.push(`CBU/CVU: ${st.payCbu}`);
  if (st.payHolder) parts.push(`Titular: ${st.payHolder}`);
  if (st.payBank) parts.push(`Banco: ${st.payBank}`);
  return parts.length ? `\n\nPara confirmar, la seña es de ${money(amount, cur)}:\n${parts.join('\n')}\n\nCuando hagas la transferencia mandame el comprobante por acá. ¡Gracias!` : `\n\nPara confirmar, la seña es de ${money(amount, cur)}. Te paso los datos para transferir.`;
}
function openWhatsAppTo(phone, text) {
  const number = normalizeWhatsApp(phone);
  if (!number) return toast('Este huésped no tiene teléfono cargado');
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
}
function openAcceptLeadModal(id) {
  const l = state.leads.find(x => x.id === id); if (!l) return;
  const total = Number(l.estimatedTotal || 0) || suggestPrice(l.checkin, l.checkout, l.nightly).total;
  const pct = Number(state.publicContent.depositPercent || 50);
  openModal(`Aceptar a ${esc(l.name)}`, `<form id="accept-form"><p class="muted">Se crea la reserva <b>esperando seña</b>: las fechas quedan bloqueadas en tu página, Booking y Airbnb. Después se abre WhatsApp con el mensaje listo.</p>
    <div class="form-grid">
      <label class="field"><span>Total</span><input name="total" type="number" step="any" min="0" required value="${total}"></label>
      <label class="field"><span>Seña a pedir</span><input name="deposit" type="number" step="any" min="0" required value="${Math.round(total * pct / 100)}"></label>
      ${textareaField('Mensaje','message','',`Hola ${l.name}, ¡gracias por elegir Villa il Fanale! Tenemos disponible del ${dateLabel(l.checkin)} al ${dateLabel(l.checkout)} para ${l.guests} persona${Number(l.guests)===1?'':'s'}. El total es ${money(total)}.${paymentText(Math.round(total * pct / 100))}`)}
    </div>${state.settings.payAlias || state.settings.payCbu ? '' : '<div class="quote-box"><b>Tip:</b><p style="margin:5px 0 0">Cargá tu alias o CBU en Ajustes y va a aparecer solo en este mensaje.</p></div>'}
    <div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Aceptar y abrir WhatsApp</button></div></form>`);
  bindModal();
  const form = document.querySelector('#accept-form');
  const refresh = () => { const t = Number(form.elements.total.value || 0), d = Number(form.elements.deposit.value || 0); form.elements.message.value = `Hola ${l.name}, ¡gracias por elegir Villa il Fanale! Tenemos disponible del ${dateLabel(l.checkin)} al ${dateLabel(l.checkout)} para ${l.guests} persona${Number(l.guests)===1?'':'s'}. El total es ${money(t)}.${paymentText(d)}`; };
  form.elements.total.addEventListener('input', () => { form.elements.deposit.value = Math.round(Number(form.elements.total.value || 0) * pct / 100); refresh(); });
  form.elements.deposit.addEventListener('input', refresh);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!checkAvailability(l.checkin, l.checkout)) return toast('Esas fechas ya están ocupadas');
    const total = Number(form.elements.total.value || 0), deposit = Number(form.elements.deposit.value || 0);
    const r = { id: uid(), receipt: nextReceipt(), created: todayISO(), status: 'pending', guest: l.name, phone: l.phone, checkin: l.checkin, checkout: l.checkout, guests: Number(l.guests || 1), nights: nightCount(l.checkin, l.checkout), channel: 'Página web', currency: 'ARS', total, paid: 0, depositRequested: deposit, notes: l.notes || '', leadId: l.id };
    state.reservations.push(r); l.status = 'convertida';
    saveState('Reserva creada: esperando seña');
    openWhatsAppTo(l.phone, form.elements.message.value);
    closeModal(); render();
  });
}
function dismissLead(id) { const l = state.leads.find(x => x.id === id); if (!l) return; l.status = 'descartada'; saveState('Solicitud descartada'); render(); }
function openDepositModal(id) {
  const r = state.reservations.find(x => x.id === id); if (!r) return;
  openModal('Registrar seña', `<form id="deposit-form"><p>${esc(r.guest)} · ${dateLabel(r.checkin)} → ${dateLabel(r.checkout)}</p><div class="form-grid"><label class="field"><span>Importe recibido</span><input name="amount" type="number" step="any" min="0" required value="${r.depositRequested || Math.round(Number(r.total) / 2)}"></label>${field('Fecha','date','date','',true,undefined,undefined,todayISO())}</div><div class="form-actions"><button type="button" class="ghost-button" data-close>Cancelar</button><button class="primary-button">Confirmar reserva</button></div></form>`);
  bindModal();
  const form = document.querySelector('#deposit-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const amount = Number(form.elements.amount.value || 0);
    r.paid = Number(r.paid || 0) + amount; r.status = 'confirmed';
    if (amount > 0) state.movements.push({ id: uid(), type: 'income', label: `Seña · ${r.guest}`, amount, currency: rCur(r), date: form.elements.date.value, reservationId: r.id });
    saveState('Seña registrada: reserva confirmada'); closeModal(); render();
    if (r.phone) {
      openModal('¡Reserva confirmada!', `<p>¿Le mandás a ${esc(r.guest)} la confirmación por WhatsApp?</p><div class="form-actions"><button class="ghost-button" data-close>Ahora no</button><button class="primary-button" id="send-confirm">Enviar confirmación</button></div>`);
      bindModal();
      document.querySelector('#send-confirm').addEventListener('click', () => { openWhatsAppTo(r.phone, `¡Hola ${r.guest}! Recibimos la seña, tu reserva en Villa il Fanale del ${dateLabel(r.checkin)} al ${dateLabel(r.checkout)} quedó confirmada. El check-in es desde las ${state.settings.checkin || '15:00'} h. ¡Los esperamos!`); closeModal(); });
    }
  });
}
function whatsappGuest(id) {
  const r = state.reservations.find(x => x.id === id); if (!r) return;
  openWhatsAppTo(r.phone, `Hola ${r.guest}, ¿cómo estás? Te escribo de Villa il Fanale por tu estadía del ${dateLabel(r.checkin)} al ${dateLabel(r.checkout)}.`);
}
function copyText(text) { navigator.clipboard?.writeText(text).then(() => toast('Copiado')).catch(() => toast(text)); }
function completeExternal(uidValue) {
  const e = Externals.events.find(x => x.uid === uidValue); if (!e) return;
  openReservationModal({ name: '', checkin: e.start, checkout: e.end, channel: e.source, guests: 2, externalUid: e.uid }, null);
  const form = document.querySelector('#reservation-form'); if (!form) return;
  form.elements.channel.value = e.source; form.elements.currency.value = 'USD'; form.dispatchEvent(new Event('change'));
  form.elements.channel.dispatchEvent(new Event('change')); form.elements.currency.dispatchEvent(new Event('change'));
  form.dataset.externalUid = e.uid;
}

/* ===== Calendarios de Booking y Airbnb (los sincroniza GitHub cada 30 min) ===== */
const Externals = (() => {
  let events = [], sources = {}, updatedAt = '';
  const ignored = () => new Set(state.meta?.ignoredExternal || []);
  function matches(e, r) { return r.externalUid === e.uid || (r.checkin === e.start && r.checkout === e.end) || (r.channel === e.source && rangesOverlap(r.checkin, r.checkout, e.start, e.end)); }
  function unmatched() { const today = todayISO(); return events.filter(e => e.end >= today && !ignored().has(e.uid) && !state.reservations.some(r => r.status !== 'cancelled' && matches(e, r))); }
  async function refresh(manual) {
    try {
      const base = location.hostname === 'localhost' || location.hostname === '127.0.0.1' ? 'reservar/' : 'reservar/';
      const response = await fetch(`${base}ocupado-externo.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('sin archivo');
      const data = await response.json(); events = data.events || []; sources = data.sources || {}; updatedAt = data.updatedAt || '';
      if (manual) toast(events.length ? `${events.length} fecha${events.length===1?'':'s'} de Booking/Airbnb al día` : 'Sin fechas nuevas de Booking/Airbnb');
      if (['inicio','reservas','calendario','conexiones'].includes(route)) render();
    } catch { if (manual) toast('Todavía no hay calendarios conectados'); }
  }
  return { refresh, unmatched, get events() { return events; }, get sources() { return sources; }, get updatedAt() { return updatedAt; } };
})();

/* ===== Publicar disponibilidad (sin nombres) para la página y las plataformas ===== */
const Availability = (() => {
  let timer = null;
  function ranges() {
    const list = activeReservations().map(r => ({ id: r.id, start: r.checkin, end: r.checkout, source: r.channel === 'Booking.com' ? 'Booking.com' : r.channel === 'Airbnb' ? 'Airbnb' : 'Directa' }));
    state.blocks.forEach(b => list.push({ id: b.id, start: b.start, end: plusDay(b.end), source: 'Directa' }));
    const today = todayISO();
    return list.filter(r => r.end >= today).sort((a, b) => a.start.localeCompare(b.start));
  }
  function schedule() {
    if (!sessionStorage.getItem(ADMIN_SESSION_KEY)) return;
    clearTimeout(timer); timer = setTimeout(publish, 4000);
  }
  async function publish() {
    const list = ranges(); const hash = JSON.stringify(list);
    if (state.meta?.availabilityHash === hash) return;
    const token = sessionStorage.getItem(ADMIN_SESSION_KEY); if (!token) return;
    try {
      await githubPutFile('reservar/ocupado.json', textToBase64(JSON.stringify({ updatedAt: new Date().toISOString(), ranges: list }, null, 2) + '\n'), 'Actualizar disponibilidad', token);
      state.meta.availabilityHash = hash; state.meta.availabilityAt = Date.now();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
    } catch (error) { console.warn('No se pudo publicar la disponibilidad', error); }
  }
  return { schedule, publish, ranges };
})();

/* =====================================================================
   MEMORIA: los datos se guardan en 3 lugares para que no se pierdan.
   1) El navegador (localStorage), como siempre.
   2) Una memoria de respaldo del navegador (IndexedDB) con historial.
   3) La nube: un archivo CIFRADO en la rama "datos" de GitHub, que
      sólo se puede abrir con tu clave de respaldo. Así los datos
      viajan entre la compu y el celular y sobreviven si el navegador
      borra todo.
   ===================================================================== */
const Memory = (() => {
  const DB_NAME = 'villa-il-fanale-memoria', SNAP_LIMIT = 30, SNAP_EVERY_MS = 10 * 60 * 1000;
  let dbPromise = null, lastSnapAt = 0, mirrorTimer = null;
  function db() {
    if (!('indexedDB' in window)) return Promise.resolve(null);
    dbPromise ??= new Promise(resolve => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('kv');
        request.result.createObjectStore('snapshots', { keyPath: 'at' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
    return dbPromise;
  }
  async function tx(store, mode, fn) {
    const database = await db(); if (!database) return null;
    return new Promise(resolve => {
      try {
        const t = database.transaction(store, mode); const os = t.objectStore(store); const result = fn(os);
        t.oncomplete = () => resolve(result?.result ?? true); t.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  }
  const clone = value => JSON.parse(JSON.stringify(value));
  async function init() {
    try { if (navigator.storage?.persist) await navigator.storage.persist(); } catch {}
    // Si el navegador borró los datos, los recuperamos de la memoria de respaldo.
    const mirrored = await tx('kv', 'readonly', os => os.get('state'));
    const local = (() => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } })();
    if (mirrored && (!local || (mirrored.meta?.updatedAt || 0) > (local.meta?.updatedAt || 0))) {
      state = normalizeState(mirrored);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
      if (!local) setTimeout(() => toast('Recuperé tus datos de la memoria de respaldo'), 600);
    }
    const snaps = await list();
    lastSnapAt = snaps[0]?.at || 0;
  }
  function mirror(value) {
    clearTimeout(mirrorTimer);
    const copy = clone(value);
    mirrorTimer = setTimeout(() => tx('kv', 'readwrite', os => os.put(copy, 'state')), 150);
  }
  function summary(value) {
    const r = (value.reservations || []).filter(x => x.status !== 'cancelled').length;
    return `${r} reserva${r===1?'':'s'} · ${(value.leads||[]).length} consulta${(value.leads||[]).length===1?'':'s'}`;
  }
  async function snapshot(value, reason = 'Guardado automático') {
    lastSnapAt = Date.now();
    const data = clone(value); delete data.photoLibrary;
    await tx('snapshots', 'readwrite', os => os.put({ at: lastSnapAt, reason, summary: summary(value), data }));
    const all = await list();
    if (all.length > SNAP_LIMIT) await tx('snapshots', 'readwrite', os => all.slice(SNAP_LIMIT).forEach(s => os.delete(s.at)));
  }
  function maybeSnapshot(value) { if (Date.now() - lastSnapAt > SNAP_EVERY_MS) snapshot(value); }
  async function list() {
    const all = await tx('snapshots', 'readonly', os => os.getAll()) || [];
    return all.sort((a, b) => b.at - a.at);
  }
  async function renderList() {
    const root = document.querySelector('#snapshot-list'); if (!root) return;
    const all = await list();
    if (!all.length) { root.innerHTML = '<p class="muted">Todavía no hay versiones guardadas. Se crean solas mientras usás la app.</p>'; return; }
    const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    root.innerHTML = all.slice(0, 8).map(s => `<div class="snapshot-row"><div><b>${fmt.format(new Date(s.at))}</b><small>${esc(s.reason)} · ${esc(s.summary)}</small></div><button class="ghost-button" data-snapshot="${s.at}">Volver a esta versión</button></div>`).join('');
    root.querySelectorAll('[data-snapshot]').forEach(button => button.addEventListener('click', () => restore(Number(button.dataset.snapshot))));
  }
  async function restore(at) {
    const snap = (await list()).find(s => s.at === at); if (!snap) return;
    const fmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    openModal('Volver a una versión anterior', `<p>Vas a recuperar tus datos tal como estaban el <b>${fmt.format(new Date(at))}</b> (${esc(snap.summary)}).</p><p class="muted">Antes de hacerlo guardo una copia de cómo está todo ahora, así podés deshacerlo.</p><div class="form-actions"><button class="ghost-button" data-close>Cancelar</button><button class="primary-button" id="confirm-restore">Recuperar esta versión</button></div>`);
    bindModal();
    document.querySelector('#confirm-restore').addEventListener('click', async () => {
      await snapshot(state, 'Antes de recuperar una versión');
      const photos = state.photoLibrary;
      state = normalizeState(snap.data); state.photoLibrary = photos || [];
      saveState('Versión recuperada'); closeModal(); render();
    });
  }
  return { init, mirror, snapshot, maybeSnapshot, list, renderList, restore };
})();

const Cloud = (() => {
  const BRANCH = 'datos', PATH = 'estado.enc', PASS_KEY = 'villa-il-fanale-clave-respaldo';
  let status = 'off', pushTimer = null, busy = false, pendingPush = false, lastSha = null;
  const token = () => sessionStorage.getItem(ADMIN_SESSION_KEY);
  const pass = () => { try { return localStorage.getItem(PASS_KEY) || ''; } catch { return ''; } };
  const available = () => !!token();
  const enabled = () => available() && !!pass();
  const endpoint = () => `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${PATH}`;
  const b64 = bytes => bytesToBase64(bytes);
  const unb64 = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));

  async function key(secret, salt) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  async function encrypt(value, secret) {
    const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
    const data = { ...value }; delete data.photoLibrary;
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(secret, salt), new TextEncoder().encode(JSON.stringify(data)));
    return JSON.stringify({ v: 1, updatedAt: value.meta?.updatedAt || Date.now(), salt: b64(salt), iv: b64(iv), data: b64(new Uint8Array(cipher)) });
  }
  async function decrypt(file, secret) {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(file.iv) }, await key(secret, unb64(file.salt)), unb64(file.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }
  async function readRemote() {
    const headers = githubHeaders(token());
    const info = await fetchWithTimeout(`${endpoint()}?ref=${BRANCH}&_=${Date.now()}`, { headers, cache: 'no-store' }, GITHUB_READ_TIMEOUT_MS);
    if (info.status === 404) { lastSha = null; return null; }
    if (!info.ok) throw new Error(await githubErrorMessage(info, 'No se pudo leer la copia en la nube.'));
    const meta = await info.json(); lastSha = meta.sha;
    let text;
    if (meta.content) text = new TextDecoder().decode(unb64(meta.content.replace(/\s/g, '')));
    else {
      const raw = await fetchWithTimeout(`${endpoint()}?ref=${BRANCH}`, { headers: { ...headers, Accept: 'application/vnd.github.raw' }, cache: 'no-store' }, GITHUB_READ_TIMEOUT_MS);
      text = await raw.text();
    }
    return JSON.parse(text);
  }
  async function writeRemote(secret) {
    const body = { message: `Respaldo de datos ${new Date().toISOString()}`, content: textToBase64(await encrypt(state, secret)), branch: BRANCH, ...(lastSha ? { sha: lastSha } : {}) };
    const response = await fetchWithTimeout(endpoint(), { method: 'PUT', headers: { ...githubHeaders(token()), 'Content-Type': 'application/json' }, body: JSON.stringify(body) }, GITHUB_WRITE_TIMEOUT_MS);
    if (response.status === 409 || response.status === 422) { await readRemote(); return writeRemote(secret); }
    if (!response.ok) throw new Error(await githubErrorMessage(response, 'No se pudo guardar la copia en la nube.'));
    lastSha = (await response.json()).content?.sha || null;
  }
  function setStatus(next) { status = next; renderStatus(); }
  function renderStatus() {
    const el = document.querySelector('#sync-status'); if (!el) return;
    const map = {
      off: ['local', 'Guardado en este dispositivo', available() ? 'Activá la nube' : ''],
      saving: ['saving', 'Guardando en la nube…', ''],
      saved: ['ok', 'Guardado en la nube', ''],
      error: ['err', 'Sin conexión con la nube', 'Reintentar']
    }[status] || ['local', 'Guardado', ''];
    el.className = `sync-status ${map[0]}`; el.innerHTML = `<span class="sync-dot"></span><span class="sync-text">${map[1]}</span>`;
    el.title = map[2] || map[1];
  }
  function schedulePush() {
    if (!enabled()) return setStatus('off');
    setStatus('saving');
    clearTimeout(pushTimer); pushTimer = setTimeout(push, 2200);
  }
  async function push() {
    if (!enabled()) return;
    if (busy) { pendingPush = true; return; }
    busy = true;
    try { await writeRemote(pass()); setStatus('saved'); }
    catch (error) { console.warn(error); setStatus('error'); }
    finally { busy = false; if (pendingPush) { pendingPush = false; push(); } }
  }
  async function syncNow(manual = false) {
    if (!enabled()) { if (manual) openSetup(); return; }
    setStatus('saving');
    try {
      const remote = await readRemote();
      if (remote && (remote.updatedAt || 0) > (state.meta?.updatedAt || 0)) {
        const data = await decrypt(remote, pass());
        await Memory.snapshot(state, 'Antes de traer datos de la nube');
        const photos = state.photoLibrary;
        state = normalizeState(data); state.photoLibrary = photos || [];
        saveState(manual ? 'Datos actualizados desde la nube' : '', { keepTimestamp: true, skipCloud: true });
        render(); setStatus('saved');
        if (!manual) toast('Traje tus últimos cambios desde la nube');
      } else if (!remote || (remote.updatedAt || 0) < (state.meta?.updatedAt || 0)) {
        await writeRemote(pass()); setStatus('saved'); if (manual) toast('Copia en la nube actualizada');
      } else { setStatus('saved'); if (manual) toast('Todo está sincronizado'); }
    } catch (error) {
      console.warn(error);
      if (error?.name === 'OperationError') { setStatus('error'); toast('La clave de respaldo no coincide con la copia en la nube'); }
      else { setStatus('error'); if (manual) toast(error.message || 'No se pudo sincronizar'); }
    }
  }
  function start() {
    renderStatus();
    document.querySelector('#sync-status')?.addEventListener('click', () => enabled() ? syncNow(true) : (available() ? openSetup() : null));
    if (enabled()) syncNow(false);
    window.addEventListener('online', () => enabled() && syncNow(false));
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && enabled() && !busy) syncNow(false); });
  }
  async function openSetup() {
    if (!available()) return toast('La nube se activa cuando entrás con tu clave de GitHub');
    let exists = false;
    try { exists = !!(await readRemote()); } catch {}
    openModal(exists ? 'Conectar este dispositivo' : 'Activar memoria en la nube', `<form id="cloud-form">
      <p>${exists ? 'Ya tenés una copia en la nube. Escribí tu <b>clave de respaldo</b> para traer tus datos a este dispositivo.' : 'Elegí una <b>clave de respaldo</b>. Tus datos se guardan cifrados en GitHub y sólo se pueden abrir con esta clave. Así no se pierden y aparecen en la compu y en el celular.'}</p>
      <div class="form-grid">
        <label class="field full"><span>Clave de respaldo</span><input name="pass" type="password" minlength="8" required autocomplete="new-password" placeholder="Mínimo 8 caracteres"></label>
        ${exists ? '' : '<label class="field full"><span>Repetir clave</span><input name="pass2" type="password" minlength="8" required autocomplete="new-password"></label>'}
      </div>
      <div class="quote-box"><b>Importante:</b><p style="margin:5px 0 0">Anotá esta clave en un lugar seguro. Si la olvidás, la copia en la nube no se puede abrir (los datos de este dispositivo siguen estando).</p></div>
      <div class="form-error-admin" id="cloud-error" hidden></div>
      <div class="form-actions"><button type="button" class="ghost-button" data-close>Ahora no</button><button class="primary-button">${exists ? 'Conectar' : 'Activar'}</button></div></form>`);
    bindModal();
    const form = document.querySelector('#cloud-form');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const errorBox = document.querySelector('#cloud-error'); const button = form.querySelector('.primary-button');
      const secret = form.elements.pass.value;
      if (!exists && secret !== form.elements.pass2.value) { errorBox.textContent = 'Las claves no coinciden.'; errorBox.hidden = false; return; }
      button.disabled = true; button.textContent = 'Comprobando…';
      try {
        const remote = await readRemote();
        if (remote) {
          const data = await decrypt(remote, secret);
          localStorage.setItem(PASS_KEY, secret);
          if ((remote.updatedAt || 0) > (state.meta?.updatedAt || 0)) {
            await Memory.snapshot(state, 'Antes de conectar con la nube');
            const photos = state.photoLibrary; state = normalizeState(data); state.photoLibrary = photos || [];
            saveState('', { keepTimestamp: true, skipCloud: true });
          } else await writeRemote(secret);
        } else {
          localStorage.setItem(PASS_KEY, secret);
          await writeRemote(secret);
        }
        setStatus('saved'); closeModal(); render(); toast('Memoria en la nube activada ✓');
      } catch (error) {
        button.disabled = false; button.textContent = exists ? 'Conectar' : 'Activar';
        errorBox.textContent = error?.name === 'OperationError' ? 'Esa no es la clave de respaldo de tu copia.' : (error.message || 'No se pudo conectar con GitHub.');
        errorBox.hidden = false;
      }
    });
  }
  function forgetDevice() {
    try { localStorage.removeItem(PASS_KEY); } catch {}
    setStatus('off'); render(); toast('Este dispositivo dejó de sincronizar. Tus datos siguen acá.');
  }
  function banner() {
    if (enabled() || !available()) return '';
    return `<section class="cloud-banner"><div><b>Que no se te borre nada</b><p>Activá la memoria en la nube: tus reservas quedan guardadas cifradas y aparecen en todos tus dispositivos.</p></div><button class="primary-button" data-action="cloudSetup">Activar ahora</button></section>`;
  }
  function panel() {
    if (!available()) return `<h3>Memoria en la nube</h3><p class="muted">Disponible cuando entrás a la app con tu clave de GitHub.</p>`;
    if (!enabled()) return `<h3>Memoria en la nube</h3><p class="muted">Guardá tus datos cifrados en GitHub para que no se pierdan y se vean en la compu y el celular.</p><div class="row-actions" style="justify-content:flex-start"><button class="primary-button" data-action="cloudSetup">Activar</button></div>`;
    return `<h3>Memoria en la nube <span class="pill"><span class="dot"></span>Activa</span></h3><p class="muted">Cada cambio se guarda solo, cifrado con tu clave de respaldo.</p><div class="row-actions" style="justify-content:flex-start"><button data-action="cloudSyncNow">Sincronizar ahora</button><button class="ghost-button" data-action="cloudForget">Desconectar este dispositivo</button></div>`;
  }
  return { start, schedulePush, syncNow, openSetup, forgetDevice, banner, panel, renderStatus };
})();

init();
