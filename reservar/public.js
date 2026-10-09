const config = window.VILLA_CONFIG || {};
const form = document.querySelector('#booking-form');
const success = document.querySelector('#success-panel');
const estimate = document.querySelector('#estimate');
const today = (d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)(new Date());
const assetVersion = Date.now().toString();
const formStartedAt = Date.now();
const MAX_MESSAGE_LENGTH = 500;
let siteContent = {
  heroEyebrow: 'ALPA CORRAL · CÓRDOBA', heroTitle: 'Una casa con alma', heroSubtitle: 'de sierra.',
  heroDescription: 'Un loft amplio entre árboles, madera y silencio. Hasta cinco personas, con todo lo necesario para disfrutar sin apuro.',
  heroImage: '../assets/jardin-entrada.png', introEyebrow: 'EL ENCANTO DE LO SIMPLE',
  introTitle: 'Un refugio serrano', introSubtitle: 'para volver al ritmo propio.',
  introCopyOne: 'Villa il Fanale es un loft cómodo y generoso, ubicado en una zona semicéntrica de Alpa Corral. Su gran galería y su jardín invitan a pasar más tiempo afuera; su interior de techos altos, madera y objetos con historia conserva la calidez de una verdadera casa de las sierras.',
  introCopyTwo: 'Está completamente equipada para cocinar, compartir y descansar en familia o con amigos.',
  featureImage: '../assets/loft.png', featureCaptionSmall: 'El corazón de la casa', featureCaption: 'Un único espacio, muchas maneras de habitarlo.',
  spacesEyebrow: 'RECORRÉ VILLA IL FANALE', spacesTitle: 'Rincones que invitan', spacesSubtitle: 'a quedarse.', spacesDescription: 'La casa fue pensada para una estadía independiente y tranquila: cocina equipada, espacios amplios y un jardín para disfrutar la vida serrana.',
  gallery1Image: '../assets/jardin-flores.png', gallery1Caption: 'Jardín', gallery2Image: '../assets/altillo.png', gallery2Caption: 'Altillo matrimonial', gallery3Image: '../assets/asador.png', gallery3Caption: 'Asador', gallery4Image: '../assets/galeria.png', gallery4Caption: 'Galería', gallery5Image: '../assets/rincon.png', gallery5Caption: 'Rincones con historia',
  galleryItems: [
    { id: 'gallery-1', image: '../assets/jardin-flores.png', caption: 'Jardín' },
    { id: 'gallery-2', image: '../assets/altillo.png', caption: 'Altillo matrimonial' },
    { id: 'gallery-3', image: '../assets/asador.png', caption: 'Asador' },
    { id: 'gallery-4', image: '../assets/galeria.png', caption: 'Galería' },
    { id: 'gallery-5', image: '../assets/rincon.png', caption: 'Rincones con historia' }
  ],
  detailsImage: '../assets/cartel.png', detailsEyebrow: 'TODO LO NECESARIO', detailsTitle: 'Preparada para', detailsSubtitle: 'disfrutarla.',
  amenity1Title: 'Hasta 5 personas', amenity1Description: 'Una cama matrimonial y tres individuales.', amenity2Title: 'Cocina equipada', amenity2Description: 'Cocina a gas, heladera, microondas y vajilla completa.', amenity3Title: 'Amplia galería', amenity3Description: 'Un espacio exterior cómodo para comer y descansar.', amenity4Title: 'Jardín arbolado', amenity4Description: 'Sombra, flores y tranquilidad serrana.', amenity5Title: 'Calefacción', amenity5Description: 'Más confort para estadías frescas en las sierras.', amenity6Title: 'Alojamiento Airbnb privado', amenity6Description: 'Casa completa, independiente y sin compartir con otros huéspedes.',
  rulesEyebrow: 'ANTES DE VENIR', rulesTitle: 'Información clara,', rulesSubtitle: 'estadías tranquilas.', rule1Value: '15:00', rule1Title: 'Ingreso', rule1Description: 'Check-in desde las 15 h, coordinado personalmente.', rule2Value: '11:00', rule2Title: 'Salida', rule2Description: 'Check-out hasta las 11 h.', rule3Value: '2+', rule3Title: 'Noches', rule3Description: 'Estadía mínima habitual de dos noches.', rule4Value: '50%', rule4Title: 'Seña', rule4Description: 'La reserva se confirma al recibir el 50%.', importantText: 'No incluye ropa blanca · No se permiten fiestas ni fumar dentro de la casa.',
  locationEyebrow: 'UBICACIÓN', locationTitle: 'Zona semicéntrica', locationSubtitle: 'de Alpa Corral.', locationDescription: 'Villa il Fanale se encuentra sobre calle Los Ligustros, en una zona semicéntrica de Alpa Corral: cerca del movimiento del pueblo, pero con la calma propia de una casa serrana.', locationMapQuery: 'Calle Los Ligustros, Alpa Corral, Córdoba', locationMapLink: 'https://maps.app.goo.gl/26wKytrGYrjpThU98',
  bookingEyebrow: 'TU PRÓXIMA ESCAPADA', bookingTitle: 'Reservá directo.', bookingDescription: 'Completá los datos básicos. La solicitud no bloquea el calendario: te responderemos con disponibilidad y valor definitivo. La reserva queda confirmada únicamente con la seña.', bookingImage: '../assets/frente.png', footerLocation: 'Alpa Corral · Córdoba · Argentina',
  regularNight: 60000, highNight: 65000, singleNight: 100000
};

loadSiteContent();


document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#public-nav').classList.toggle('open'));
document.querySelectorAll('#public-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('#public-nav').classList.remove('open')));

const checkin = form.elements.checkin;
const checkout = form.elements.checkout;

/* ===== Calendario de disponibilidad ===== */
const Booking = {
  busy: new Set(),          // noches ocupadas (ISO de la noche)
  start: '', end: '',
  cursor: (() => { const d = new Date(); d.setDate(1); return d; })(),
  loaded: false
};
const MONTHS_TO_SHOW = () => (window.matchMedia('(max-width: 720px)').matches ? 1 : 2);
const fmtShort = iso => new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${iso}T12:00:00`));

async function loadAvailability() {
  const ranges = [];
  for (const file of ['ocupado.json', 'ocupado-externo.json']) {
    try {
      const response = await fetch(`${file}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) continue;
      const data = await response.json();
      (data.ranges || data.events || []).forEach(r => r.start && r.end && ranges.push(r));
    } catch { /* sin datos: se muestran libres y confirmamos por WhatsApp */ }
  }
  ranges.forEach(r => { for (let d = new Date(`${r.start}T12:00:00`), e = new Date(`${r.end}T12:00:00`); d < e; d.setDate(d.getDate() + 1)) Booking.busy.add(localISO(d)); });
  Booking.loaded = true;
  renderCalendar();
}
function plusDays(iso, n) { const d = new Date(`${iso}T12:00:00`); d.setDate(d.getDate() + n); return localISO(d); }
function rangeFree(a, b) { for (let d = a; d < b; d = plusDays(d, 1)) if (Booking.busy.has(d)) return false; return true; }
function nightPrice(iso, nights) {
  if (nights === 1) return Number(siteContent.singleNight);
  const m = new Date(`${iso}T12:00:00`).getMonth();
  return [10, 11, 0, 1].includes(m) ? Number(siteContent.highNight) : Number(siteContent.regularNight);
}
function quote(a, b) {
  const nights = nightCount(a, b); const lines = [];
  for (let d = a; d < b; d = plusDays(d, 1)) lines.push({ date: d, price: nightPrice(d, nights) });
  const total = lines.reduce((sum, l) => sum + l.price, 0);
  const deposit = Math.round(total * (Number(siteContent.depositPercent || 50) / 100));
  return { nights, lines, total, deposit };
}

function renderCalendar() {
  const root = document.querySelector('#cal-months'); if (!root) return;
  const months = MONTHS_TO_SHOW();
  let html = '';
  for (let i = 0; i < months; i++) {
    const first = new Date(Booking.cursor.getFullYear(), Booking.cursor.getMonth() + i, 1);
    const label = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(first);
    const offset = (first.getDay() + 6) % 7; const daysIn = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    html += `<div class="cal-month"><h4>${label}</h4><div class="cal-grid">${['L','M','M','J','V','S','D'].map(d => `<span class="cal-dow">${d}</span>`).join('')}${'<span></span>'.repeat(offset)}`;
    for (let day = 1; day <= daysIn; day++) {
      const iso = localISO(new Date(first.getFullYear(), first.getMonth(), day));
      const past = iso < today, busy = Booking.busy.has(iso);
      const prevBusy = Booking.busy.has(plusDays(iso, -1));
      // Se puede salir un día ocupado (salida a la mañana) si la noche anterior está libre.
      const canCheckout = Booking.start && !Booking.end && iso > Booking.start && rangeFree(Booking.start, iso);
      const selectable = !past && (busy ? canCheckout : true);
      const cls = ['cal-day', past ? 'past' : '', busy ? 'busy' : '', busy && !prevBusy ? 'busy-start' : '',
        iso === Booking.start ? 'sel-start' : '', iso === Booking.end ? 'sel-end' : '',
        Booking.start && Booking.end && iso > Booking.start && iso < Booking.end ? 'in-range' : '',
        iso === today ? 'today' : '', canCheckout ? 'can-out' : ''].filter(Boolean).join(' ');
      html += `<button type="button" class="${cls}" data-day="${iso}" ${selectable ? '' : 'disabled'} aria-label="${fmtShort(iso)}${busy ? ', ocupado' : ''}">${day}</button>`;
    }
    html += '</div></div>';
  }
  root.innerHTML = html;
  const prev = document.querySelector('[data-cal="prev"]');
  const now = new Date(); prev.disabled = Booking.cursor.getFullYear() === now.getFullYear() && Booking.cursor.getMonth() <= now.getMonth();
  root.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => pickDay(button.dataset.day)));
  root.querySelectorAll('[data-day]').forEach(button => button.addEventListener('mouseenter', () => hoverDay(button.dataset.day)));
}
function hoverDay(iso) {
  if (!Booking.start || Booking.end) return;
  document.querySelectorAll('#cal-months [data-day]').forEach(b => b.classList.toggle('hover-range', b.dataset.day > Booking.start && b.dataset.day <= iso && rangeFree(Booking.start, iso)));
}
function pickDay(iso) {
  if (!Booking.start || Booking.end || iso <= Booking.start) {
    if (Booking.busy.has(iso)) return;
    Booking.start = iso; Booking.end = '';
  } else if (rangeFree(Booking.start, iso)) {
    Booking.end = iso;
  } else { Booking.start = Booking.busy.has(iso) ? '' : iso; Booking.end = ''; }
  syncSelection();
}
function setSelection(a, b) {
  if (a && b && b > a && a >= today && rangeFree(a, b)) { Booking.start = a; Booking.end = b; }
  else if (a && !Booking.busy.has(a)) { Booking.start = a; Booking.end = ''; }
  const target = new Date(`${(Booking.start || today)}T12:00:00`); Booking.cursor = new Date(target.getFullYear(), target.getMonth(), 1);
  syncSelection();
}
function syncSelection() {
  checkin.value = Booking.start || ''; checkout.value = Booking.end || '';
  const hint = document.querySelector('#cal-hint');
  if (hint) hint.textContent = !Booking.start ? 'Tocá el día de llegada y después el de salida.' : !Booking.end ? `Llegada ${fmtShort(Booking.start)}. Ahora elegí el día de salida.` : `${fmtShort(Booking.start)} → ${fmtShort(Booking.end)} · podés cambiarlas tocando otro día.`;
  const hbIn = document.querySelector('#hb-in'), hbOut = document.querySelector('#hb-out');
  if (hbIn) hbIn.textContent = Booking.start ? fmtShort(Booking.start) : 'Elegir fecha';
  if (hbOut) hbOut.textContent = Booking.end ? fmtShort(Booking.end) : 'Elegir fecha';
  const ready = !!(Booking.start && Booking.end);
  document.querySelector('#guest-step').disabled = !ready;
  document.querySelector('#booking-submit').disabled = !ready;
  document.querySelectorAll('.booking-steps li').forEach(li => li.classList.toggle('active', Number(li.dataset.step) <= (ready ? 2 : 1)));
  renderCalendar(); updateEstimate();
}
document.querySelector('[data-cal="prev"]')?.addEventListener('click', () => { Booking.cursor.setMonth(Booking.cursor.getMonth() - 1); renderCalendar(); });
document.querySelector('[data-cal="next"]')?.addEventListener('click', () => { Booking.cursor.setMonth(Booking.cursor.getMonth() + 1); renderCalendar(); });
window.matchMedia('(max-width: 720px)').addEventListener?.('change', renderCalendar);
document.querySelectorAll('[data-open-calendar]').forEach(button => button.addEventListener('click', () => {
  const guests = document.querySelector('#hb-guests')?.value; if (guests) form.elements.guests.value = guests;
  document.querySelector('#reservar').scrollIntoView({ behavior: 'smooth' });
}));
loadAvailability();

function updateEstimate() {
  if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
    estimate.innerHTML = '<span>Elegí tus fechas para ver el precio exacto.</span>'; estimate.classList.remove('ready'); return;
  }
  const q = quote(checkin.value, checkout.value);
  const groups = q.lines.reduce((acc, l) => { (acc[l.price] ??= 0); acc[l.price] += 1; return acc; }, {});
  estimate.classList.add('ready');
  estimate.innerHTML = `<div class="est-lines">${Object.entries(groups).map(([price, n]) => `<div><span>${money(Number(price))} × ${n} noche${n === 1 ? '' : 's'}</span><span>${money(Number(price) * n)}</span></div>`).join('')}</div>
    <div class="est-total"><span>Total de la estadía</span><b>${money(q.total)}</b></div>
    <div class="est-deposit"><span>Seña para confirmar (${Number(siteContent.depositPercent || 50)}%)</span><span>${money(q.deposit)}</span></div>`;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form));
  const validationError = validateRequest(values);
  const errorBox = document.querySelector('#form-error');
  if (validationError) { if (errorBox) { errorBox.textContent = validationError; errorBox.hidden = false; errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else alert(validationError); return; }
  if (errorBox) errorBox.hidden = true;
  const request = {
    id: `WEB-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    name: values.name.trim(),
    phone: values.phone.trim(),
    guests: values.guests,
    checkin: values.checkin,
    checkout: values.checkout,
    message: values.message.trim(),
    website: values.website || '',
    formStartedAt,
    status: 'nueva'
  };
  const q = quote(values.checkin, values.checkout);
  request.estimatedTotal = q.total;
  if (values.email) request.message = `${request.message ? request.message + ' · ' : ''}Correo: ${values.email.trim()}`;
  request.message = `${request.message ? request.message + ' · ' : ''}Solicitud de reserva (${q.nights} noche${q.nights===1?'':'s'}, seña ${money(q.deposit)})`;

  let automatic = false;
  if (config.bookingEndpoint) {
    try {
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Enviando solicitud…'; }
      await fetch(config.bookingEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: new URLSearchParams(request) });
      automatic = true;
    } catch { automatic = false; }
    finally { if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = 'Enviar solicitud <span>→</span>'; } }
  }

  const message = `Hola, quiero reservar Villa il Fanale.\n\nNombre: ${request.name}\nFechas: ${dateLabel(request.checkin)} al ${dateLabel(request.checkout)}\nPersonas: ${request.guests}\nTotal: ${money(request.estimatedTotal)}\nCódigo: ${request.id}`;
  const whatsapp = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  document.querySelector('#whatsapp-link').href = whatsapp;
  document.querySelector('#whatsapp-link').textContent = 'Escribirle al anfitrión';
  success.querySelector('h3').textContent = automatic ? '¡Solicitud enviada!' : 'Terminá tu pedido por WhatsApp';
  success.querySelector('p').textContent = automatic ? 'Recibimos tu pedido de reserva. Te escribimos por WhatsApp para confirmarla y pasarte los datos de la seña.' : 'No pudimos registrar el pedido automáticamente. Tocá el botón y envianos los datos por WhatsApp.';
  success.querySelector('small').textContent = automatic ? '¿Querés adelantarte?' : '';
  const sq = quote(request.checkin, request.checkout);
  document.querySelector('#success-summary').innerHTML = `<div><span>Fechas</span><b>${fmtShort(request.checkin)} → ${fmtShort(request.checkout)}</b></div><div><span>Personas</span><b>${request.guests}</b></div><div><span>Total</span><b>${money(sq.total)}</b></div><div><span>Seña</span><b>${money(sq.deposit)}</b></div>`;
  document.querySelectorAll('.booking-steps li').forEach(li => li.classList.add('active'));
  form.hidden = true;
  success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function validateRequest(values) {
  if (values.website) return 'No se pudo enviar la solicitud.';
  if (Date.now() - Number(values.formStartedAt || formStartedAt) < 2500) return 'Esperá unos segundos y volvé a intentar.';
  if (!values.name?.trim()) return 'Ingresá tu nombre y apellido.';
  if (!values.phone?.trim()) return 'Ingresá un WhatsApp de contacto.';
  const guests = Number(values.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 5) return 'La casa admite entre 1 y 5 huéspedes.';
  if (!values.checkin || !values.checkout || values.checkout <= values.checkin) return 'Elegí en el calendario el día de llegada y el de salida.';
  if (!rangeFree(values.checkin, values.checkout)) return 'Algunas de esas noches ya están ocupadas. Elegí otras fechas.';
  if (!values.accept) return 'Marcá la casilla de condiciones para continuar.';
  if ((values.message || '').length > MAX_MESSAGE_LENGTH) return `El comentario puede tener hasta ${MAX_MESSAGE_LENGTH} caracteres.`;
  return '';
}

function nightCount(a,b){return Math.max(0,Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000));}
function isHighSeason(a,b){for(let date=new Date(`${a}T12:00:00`),end=new Date(`${b}T12:00:00`);date<end;date.setDate(date.getDate()+1)){if([10,11,0,1].includes(date.getMonth()))return true;}return false;}
function localISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function money(value){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);}
function dateLabel(value){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`));}
function esc(value){return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));}
function publicImageSrc(src) {
  if (!src) return src;
  return src.includes('assets/pagina-') ? `${src}${src.includes('?') ? '&' : '?'}v=${assetVersion}` : src;
}
function galleryItems() {
  if (Array.isArray(siteContent.galleryItems)) return siteContent.galleryItems;
  return [1,2,3,4,5].map(index => ({
    id: `gallery-${index}`,
    image: siteContent[`gallery${index}Image`],
    caption: siteContent[`gallery${index}Caption`]
  })).filter(item => item.image);
}
function galleryClass(index, total) {
  if (total >= 4 && index === 0) return 'gallery-tall';
  if (total >= 4 && index === 3) return 'gallery-wide';
  if (index === total - 1 && total >= 4) {
    const cells = total + 2;
    if (cells % 3 === 2) return 'gallery-wide';
    if (cells % 3 === 1) return 'gallery-full';
  }
  return '';
}

function galleryFigure(item,index,list) {
  const src = publicImageSrc(item.image);
  const caption = item.caption || 'Villa il Fanale';
  return `<figure class="${galleryClass(index, list.length)}" role="button" tabindex="0" data-gallery-open data-index="${index}" data-src="${esc(src)}" data-caption="${esc(caption)}"><img src="${esc(src)}" alt="${esc(caption)}" loading="lazy" decoding="async"><figcaption>${esc(caption)}</figcaption></figure>`;
}

async function loadSiteContent(override) {
  if (override) siteContent = { ...siteContent, ...override };
  else try {
    const response = await fetch(`content.json?v=${Date.now()}`);
    if (window.__villaPreview) return;
    if (response.ok) siteContent = { ...siteContent, ...await response.json() };
  } catch { /* conserva el contenido incluido en la página */ }
  const values = {
    'hero-eyebrow': siteContent.heroEyebrow, 'hero-title': siteContent.heroTitle, 'hero-subtitle': siteContent.heroSubtitle,
    'hero-description': siteContent.heroDescription, 'intro-eyebrow': siteContent.introEyebrow, 'intro-title': siteContent.introTitle, 'intro-subtitle': siteContent.introSubtitle,
    'intro-copy-one': siteContent.introCopyOne, 'intro-copy-two': siteContent.introCopyTwo, 'feature-caption-small': siteContent.featureCaptionSmall, 'feature-caption': siteContent.featureCaption,
    'spaces-eyebrow': siteContent.spacesEyebrow, 'spaces-title': siteContent.spacesTitle, 'spaces-subtitle': siteContent.spacesSubtitle, 'spaces-description': siteContent.spacesDescription,
    'gallery-1-caption': siteContent.gallery1Caption, 'gallery-2-caption': siteContent.gallery2Caption, 'gallery-3-caption': siteContent.gallery3Caption, 'gallery-4-caption': siteContent.gallery4Caption, 'gallery-5-caption': siteContent.gallery5Caption,
    'details-eyebrow': siteContent.detailsEyebrow, 'details-title': siteContent.detailsTitle, 'details-subtitle': siteContent.detailsSubtitle,
    'amenity-1-title': siteContent.amenity1Title, 'amenity-1-description': siteContent.amenity1Description, 'amenity-2-title': siteContent.amenity2Title, 'amenity-2-description': siteContent.amenity2Description, 'amenity-3-title': siteContent.amenity3Title, 'amenity-3-description': siteContent.amenity3Description, 'amenity-4-title': siteContent.amenity4Title, 'amenity-4-description': siteContent.amenity4Description, 'amenity-5-title': siteContent.amenity5Title, 'amenity-5-description': siteContent.amenity5Description, 'amenity-6-title': siteContent.amenity6Title, 'amenity-6-description': siteContent.amenity6Description,
    'rules-eyebrow': siteContent.rulesEyebrow, 'rules-title': siteContent.rulesTitle, 'rules-subtitle': siteContent.rulesSubtitle,
    'rule-1-value': siteContent.rule1Value, 'rule-1-title': siteContent.rule1Title, 'rule-1-description': siteContent.rule1Description, 'rule-2-value': siteContent.rule2Value, 'rule-2-title': siteContent.rule2Title, 'rule-2-description': siteContent.rule2Description, 'rule-3-value': siteContent.rule3Value, 'rule-3-title': siteContent.rule3Title, 'rule-3-description': siteContent.rule3Description, 'rule-4-value': siteContent.rule4Value, 'rule-4-title': siteContent.rule4Title, 'rule-4-description': siteContent.rule4Description, 'important-text': siteContent.importantText,
    'location-eyebrow': siteContent.locationEyebrow, 'location-title': siteContent.locationTitle, 'location-subtitle': siteContent.locationSubtitle, 'location-description': siteContent.locationDescription,
    'booking-eyebrow': siteContent.bookingEyebrow, 'booking-title': siteContent.bookingTitle, 'booking-description': siteContent.bookingDescription, 'footer-location': siteContent.footerLocation
  };
  Object.entries(values).forEach(([id, value]) => { const element = document.getElementById(id); if (element && value) element.textContent = value; });
  const images = { 'feature-image':siteContent.featureImage, 'gallery-1-image':siteContent.gallery1Image, 'gallery-2-image':siteContent.gallery2Image, 'gallery-3-image':siteContent.gallery3Image, 'gallery-4-image':siteContent.gallery4Image, 'gallery-5-image':siteContent.gallery5Image, 'details-image':siteContent.detailsImage, 'booking-image':siteContent.bookingImage };
  Object.entries(images).forEach(([id,src]) => { const image=document.getElementById(id); if(image&&src) image.src=publicImageSrc(src); });
  const gallery = document.querySelector('#gallery-grid');
  if (gallery) {
    gallery.innerHTML = galleryItems().map(galleryFigure).join('');
    bindGalleryLightbox();
  }
  if (siteContent.heroImage) document.querySelector('.public-hero').style.backgroundImage = `url("${publicImageSrc(siteContent.heroImage).replace(/"/g,'')}")`;
  const map = document.querySelector('#location-map');
  if (map && siteContent.locationMapQuery) map.src = `https://www.google.com/maps?q=${encodeURIComponent(siteContent.locationMapQuery)}&output=embed`;
  const mapLink = document.querySelector('#location-map-link');
  if (mapLink && siteContent.locationMapLink) mapLink.href = siteContent.locationMapLink;
  document.querySelector('#public-rate').textContent = money(Number(siteContent.regularNight));
  const mr = document.querySelector('#mr-price'); if (mr) mr.textContent = `Desde ${money(Number(siteContent.regularNight))}`;
  const dp = document.querySelector('#deposit-percent'); if (dp) dp.textContent = `${Number(siteContent.depositPercent || 50)}%`;
  [1,2,3,4].forEach(i => { const el = document.getElementById(`near-${i}`); if (el && siteContent[`near${i}`]) el.textContent = siteContent[`near${i}`]; });
  updateEstimate();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('../sw.js').then(registration => registration.update()).catch(() => {});
  }
}

registerServiceWorker();

let lightboxIndex = 0;
function galleryFigures() { return [...document.querySelectorAll('[data-gallery-open]')]; }

function bindGalleryLightbox() {
  galleryFigures().forEach((figure, index) => {
    figure.addEventListener('click', () => openGalleryLightbox(index));
    figure.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openGalleryLightbox(index); }
    });
  });
}

function openGalleryLightbox(index) {
  const figures = galleryFigures();
  const lightbox = document.querySelector('#gallery-lightbox');
  const image = document.querySelector('#lightbox-image');
  const label = document.querySelector('#lightbox-caption');
  const count = document.querySelector('#lightbox-count');
  if (!lightbox || !image || !figures.length) return;
  lightboxIndex = (index + figures.length) % figures.length;
  const figure = figures[lightboxIndex];
  image.style.animation = 'none'; void image.offsetWidth; image.style.animation = '';
  image.src = figure.dataset.src || '';
  image.alt = figure.dataset.caption || 'Foto de Villa il Fanale';
  if (label) label.textContent = figure.dataset.caption || '';
  if (count) count.textContent = `${lightboxIndex + 1} / ${figures.length}`;
  const wasHidden = lightbox.hidden;
  lightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  if (wasHidden) lightbox.querySelector('.gallery-lightbox-close')?.focus();
}

function closeGalleryLightbox() {
  const lightbox = document.querySelector('#gallery-lightbox');
  const image = document.querySelector('#lightbox-image');
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  if (image) image.src = '';
  document.body.classList.remove('lightbox-open');
  galleryFigures()[lightboxIndex]?.focus({ preventScroll: true });
}

document.querySelector('#gallery-lightbox')?.addEventListener('click', event => {
  if (event.target.closest('.gallery-lightbox-nav.prev')) return openGalleryLightbox(lightboxIndex - 1);
  if (event.target.closest('.gallery-lightbox-nav.next')) return openGalleryLightbox(lightboxIndex + 1);
  if (event.target.id === 'gallery-lightbox' || event.target.closest('.gallery-lightbox-close')) closeGalleryLightbox();
});

let touchStartX = null;
document.querySelector('#gallery-lightbox')?.addEventListener('touchstart', event => { touchStartX = event.touches[0].clientX; }, { passive: true });
document.querySelector('#gallery-lightbox')?.addEventListener('touchend', event => {
  if (touchStartX === null) return;
  const delta = event.changedTouches[0].clientX - touchStartX; touchStartX = null;
  if (Math.abs(delta) > 45) openGalleryLightbox(lightboxIndex + (delta < 0 ? 1 : -1));
});

document.addEventListener('keydown', event => {
  const lightbox = document.querySelector('#gallery-lightbox');
  if (!lightbox || lightbox.hidden) return;
  if (event.key === 'Escape') closeGalleryLightbox();
  if (event.key === 'ArrowRight') openGalleryLightbox(lightboxIndex + 1);
  if (event.key === 'ArrowLeft') openGalleryLightbox(lightboxIndex - 1);
});

/* Cabecera, menú, WhatsApp y animaciones */
(function enhancePage() {
  const header = document.querySelector('#header');
  const floatButton = document.querySelector('.whatsapp-float');
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle('scrolled', y > 40);
    floatButton?.classList.toggle('visible', y > window.innerHeight * 0.7);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const toggle = document.querySelector('#menu-toggle');
  const nav = document.querySelector('#public-nav');
  const syncToggle = () => toggle?.setAttribute('aria-expanded', nav?.classList.contains('open') ? 'true' : 'false');
  toggle?.addEventListener('click', () => setTimeout(syncToggle));
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setTimeout(syncToggle)));

  const phone = config.whatsapp || '5493584849524';
  const text = encodeURIComponent('Hola, quería consultar disponibilidad en Villa il Fanale.');
  document.querySelectorAll('[data-whatsapp]').forEach(link => { link.href = `https://wa.me/${phone}?text=${text}`; });
  const year = document.querySelector('#footer-year'); if (year) year.textContent = new Date().getFullYear();

  const targets = document.querySelectorAll('.intro-title, .intro-copy, .section-heading, .details-content, .rules-grid, .rule-note, .location-copy, .location-map, .booking-copy > *:not(img), .booking-panel');
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('in'); observer.unobserve(entry.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  targets.forEach((element, index) => { element.classList.add('reveal'); element.style.transitionDelay = `${(index % 3) * 70}ms`; observer.observe(element); });
})();

/* Vista previa en vivo desde el editor del panel */
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.data?.type !== 'villa-preview') return;
  window.__villaPreview = true;
  const content = { ...event.data.content };
  Object.entries(event.data.images || {}).forEach(([key, url]) => {
    if (key.startsWith('galleryItem-')) {
      const id = key.replace('galleryItem-', '');
      content.galleryItems = (content.galleryItems || []).map(item => item.id === id ? { ...item, image: url } : item);
    } else content[key] = url;
  });
  loadSiteContent(content);
});
if (new URLSearchParams(location.search).has('preview')) document.documentElement.classList.add('is-preview');

/* Barra de reserva en celular: aparece después de la portada */
(() => {
  const bar = document.querySelector('#mobile-reserve'); const target = document.querySelector('#reservar');
  if (!bar || !target) return;
  const update = () => { const r = target.getBoundingClientRect(); bar.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8 && (r.top > window.innerHeight || r.bottom < 0)); };
  window.addEventListener('scroll', update, { passive: true }); update();
})();
