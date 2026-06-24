const config = window.VILLA_CONFIG || {};
const form = document.querySelector('#booking-form');
const success = document.querySelector('#success-panel');
const estimate = document.querySelector('#estimate');
const today = new Date().toISOString().slice(0, 10);

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
  const nightly = nights === 1 ? 100000 : isHighSeason(checkin.value, checkout.value) ? 65000 : 60000;
  estimate.innerHTML = `<span>${nights} noche${nights===1?'':'s'} · estimación orientativa</span><b>${money(nights * nightly)}</b>`;
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  if (values.checkout <= values.checkin) return alert('La fecha de salida debe ser posterior al ingreso.');
  const request = { id: `WEB-${Date.now().toString(36).toUpperCase()}`, createdAt: new Date().toISOString(), ...values, status: 'nueva' };
  const nights = nightCount(values.checkin, values.checkout);
  const nightly = nights === 1 ? 100000 : isHighSeason(values.checkin, values.checkout) ? 65000 : 60000;
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
});

function nightCount(a,b){return Math.max(0,Math.round((new Date(`${b}T12:00:00`)-new Date(`${a}T12:00:00`))/86400000));}
function isHighSeason(a,b){for(let date=new Date(`${a}T12:00:00`),end=new Date(`${b}T12:00:00`);date<end;date.setDate(date.getDate()+1)){if([10,11,0,1].includes(date.getMonth()))return true;}return false;}
function localISO(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function money(value){return new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);}
function dateLabel(value){return new Intl.DateTimeFormat('es-AR',{day:'numeric',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`));}
