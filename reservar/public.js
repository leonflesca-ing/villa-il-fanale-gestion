const config = window.VILLA_CONFIG || {};
const form = document.querySelector('#booking-form');
const success = document.querySelector('#success-panel');
const estimate = document.querySelector('#estimate');
const today = new Date().toISOString().slice(0, 10);
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
  detailsImage: '../assets/cartel.png', detailsEyebrow: 'TODO LO NECESARIO', detailsTitle: 'Preparada para', detailsSubtitle: 'disfrutarla.',
  amenity1Title: 'Hasta 5 personas', amenity1Description: 'Una cama matrimonial y tres individuales.', amenity2Title: 'Cocina equipada', amenity2Description: 'Cocina a gas, heladera, microondas y vajilla completa.', amenity3Title: 'Amplia galería', amenity3Description: 'Un espacio exterior cómodo para comer y descansar.', amenity4Title: 'Jardín arbolado', amenity4Description: 'Sombra, flores y tranquilidad serrana.', amenity5Title: 'Calefacción', amenity5Description: 'Más confort para estadías frescas en las sierras.', amenity6Title: 'Alojamiento Airbnb privado', amenity6Description: 'Casa completa, independiente y sin compartir con otros huéspedes.',
  rulesEyebrow: 'ANTES DE VENIR', rulesTitle: 'Información clara,', rulesSubtitle: 'estadías tranquilas.', rule1Value: '15:00', rule1Title: 'Ingreso', rule1Description: 'Check-in desde las 15 h, coordinado personalmente.', rule2Value: '11:00', rule2Title: 'Salida', rule2Description: 'Check-out hasta las 11 h.', rule3Value: '2+', rule3Title: 'Noches', rule3Description: 'Estadía mínima habitual de dos noches.', rule4Value: '50%', rule4Title: 'Seña', rule4Description: 'La reserva se confirma al recibir el 50%.', importantText: 'No incluye ropa blanca · No se permiten fiestas ni fumar dentro de la casa.',
  locationEyebrow: 'UBICACIÓN', locationTitle: 'Zona semicéntrica', locationSubtitle: 'de Alpa Corral.', locationDescription: 'Villa il Fanale se encuentra sobre calle Los Ligustros, en una zona semicéntrica de Alpa Corral: cerca del movimiento del pueblo, pero con la calma propia de una casa serrana.', locationMapQuery: 'Calle Los Ligustros, Alpa Corral, Córdoba', locationMapLink: 'https://maps.app.goo.gl/26wKytrGYrjpThU98',
  bookingEyebrow: 'TU PRÓXIMA ESCAPADA', bookingTitle: 'Consultá tus fechas.', bookingDescription: 'Completá los datos básicos. La solicitud no bloquea el calendario: te responderemos con disponibilidad y valor definitivo. La reserva queda confirmada únicamente con la seña.', bookingImage: '../assets/frente.png', footerLocation: 'Alpa Corral · Córdoba · Argentina',
  regularNight: 60000, highNight: 65000, singleNight: 100000
};

loadSiteContent();

document.querySelector('[name="checkin"]').min = today;
document.querySelector('[name="checkout"]').min = today;

document.querySelector('#menu-toggle').addEventListener('click', () => document.querySelector('#public-nav').classList.toggle('open'));
document.querySelectorAll('#public-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('#public-nav').classList.remove('open')));

const checkin = form.elements.checkin;
const checkout = form.elements.checkout;
[checkin, checkout].forEach(input => input.addEventListener('change', updateEstimate));
checkin.addEventListener('change', () => {
  if (checkin.value) {
    const next = new Date(`${checkin.value}T12:00:00`); next.setDate(next.getDate() + 1);
    checkout.min = localISO(next);
    if (checkout.value && checkout.value <= checkin.value) checkout.value = '';
  }
});

function updateEstimate() {
  if (!checkin.value || !checkout.value || checkout.value <= checkin.value) {
    estimate.innerHTML = '<span>Completá las fechas para ver una estimación.</span>'; return;
  }
  const nights = nightCount(checkin.value, checkout.value);
  const nightly = nights === 1 ? Number(siteContent.singleNight) : isHighSeason(checkin.value, checkout.value) ? Number(siteContent.highNight) : Number(siteContent.regularNight);
  estimate.innerHTML = `<span>${nights} noche${nights===1?'':'s'} · estimación orientativa</span><b>${money(nights * nightly)}</b>`;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  if (values.checkout <= values.checkin) return alert('La fecha de salida debe ser posterior al ingreso.');
  const request = { id: `WEB-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), ...values, status: 'nueva' };
  const nights = nightCount(values.checkin, values.checkout);
  const nightly = nights === 1 ? Number(siteContent.singleNight) : isHighSeason(values.checkin, values.checkout) ? Number(siteContent.highNight) : Number(siteContent.regularNight);
  request.estimatedTotal = nights * nightly;

  let automatic = false;
  if (config.bookingEndpoint) {
    try {
      await fetch(config.bookingEndpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' }, body: new URLSearchParams(request) });
      automatic = true;
    } catch { automatic = false; }
  }

  const message = `Hola, quiero consultar disponibilidad en Villa il Fanale.\n\nNombre: ${values.name}\nFechas: ${dateLabel(values.checkin)} al ${dateLabel(values.checkout)}\nPersonas: ${values.guests}\nEstimación orientativa: ${money(request.estimatedTotal)}${values.message?`\nComentario: ${values.message}`:''}\n\nCódigo de solicitud: ${request.id}`;
  const whatsapp = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
  document.querySelector('#whatsapp-link').href = whatsapp;
  document.querySelector('#whatsapp-link').textContent = automatic ? 'También avisar por WhatsApp' : 'Continuar en WhatsApp';
  success.querySelector('h3').textContent = automatic ? 'Solicitud recibida' : 'Solicitud preparada';
  success.querySelector('p').textContent = automatic ? 'La consulta quedó registrada. Te responderemos para confirmar disponibilidad y precio.' : 'Vamos a abrir WhatsApp con todos los datos. Revisá el mensaje y envialo para que podamos responderte.';
  form.hidden = true; success.hidden = false;
  success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => { window.location.href = whatsapp; }, 500);
});

function nightCount(a,b){return Math.max(0,Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000));}
function isHighSeason(a,b){for(let date=new Date(`${a}T12:00:00`),end=new Date(`${b}T12:00:00`);date<end;date.setDate(date.getDate()+1)){if([10,11,0,1].includes(date.getMonth()))return true;}return false;}
function localISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function money(value){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);}
function dateLabel(value){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`));}

async function loadSiteContent() {
  try {
    const response = await fetch(`content.json?v=${Date.now()}`);
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
  Object.entries(images).forEach(([id,src]) => { const image=document.getElementById(id); if(image&&src) image.src=src; });
  if (siteContent.heroImage) document.querySelector('.public-hero').style.backgroundImage = `url("${siteContent.heroImage.replace(/"/g,'')}")`;
  const map = document.querySelector('#location-map');
  if (map && siteContent.locationMapQuery) map.src = `https://www.google.com/maps?q=${encodeURIComponent(siteContent.locationMapQuery)}&output=embed`;
  const mapLink = document.querySelector('#location-map-link');
  if (mapLink && siteContent.locationMapLink) mapLink.href = siteContent.locationMapLink;
  document.querySelector('#public-rate').textContent = money(Number(siteContent.regularNight));
  updateEstimate();
}
