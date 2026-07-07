const SHEET_NAME = 'Solicitudes';
const HEADERS = ['id','createdAt','name','phone','guests','checkin','checkout','message','estimatedTotal','status'];
const MAX_MESSAGE_LENGTH = 500;
const MIN_FORM_SECONDS = 2;

function doPost(e) {
  const data = e.parameter || {};
  if (isLikelySpam_(data)) return json_({ ok: true, ignored: true });
  const error = validateRequest_(data);
  if (error) return json_({ ok: false, error });
  const sheet = getSheet_();
  const normalized = normalizeRequest_(data);
  sheet.appendRow(HEADERS.map(key => normalized[key] || (key === 'status' ? 'nueva' : '')));
  const emailSent = notifyHost_(normalized);
  return json_({ ok: true, id: normalized.id, emailSent });
}

function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!key || e.parameter.key !== key) return json_({ ok: false, error: 'unauthorized' });
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  const headers = values.shift() || HEADERS;
  const requests = values.map(row => Object.fromEntries(headers.map((header,index) => [header,row[index]]))).filter(item => item.id);
  return json_({ ok: true, requests });
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function normalizeRequest_(data) {
  return {
    id: String(data.id || `WEB-${Date.now().toString(36).toUpperCase()}`),
    createdAt: String(data.createdAt || new Date().toISOString()),
    name: clean_(data.name),
    phone: clean_(data.phone),
    guests: String(Number(data.guests || 1)),
    checkin: clean_(data.checkin),
    checkout: clean_(data.checkout),
    message: clean_(data.message || '').slice(0, MAX_MESSAGE_LENGTH),
    estimatedTotal: String(Number(data.estimatedTotal || 0)),
    status: 'nueva'
  };
}

function validateRequest_(data) {
  if (!clean_(data.name)) return 'name_required';
  if (!clean_(data.phone)) return 'phone_required';
  const guests = Number(data.guests);
  if (!Number.isInteger(guests) || guests < 1 || guests > 5) return 'invalid_guests';
  if (!clean_(data.checkin) || !clean_(data.checkout) || String(data.checkout) <= String(data.checkin)) return 'invalid_dates';
  if (String(data.message || '').length > MAX_MESSAGE_LENGTH) return 'message_too_long';
  return '';
}

function isLikelySpam_(data) {
  if (data.website) return true;
  const started = Number(data.formStartedAt || 0);
  return started && Date.now() - started < MIN_FORM_SECONDS * 1000;
}

function notifyHost_(request) {
  const email = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (!email) return false;
  const subject = `Nueva solicitud Villa il Fanale — ${request.name}`;
  const body = [
    'Nueva solicitud de disponibilidad desde la página pública de Villa il Fanale.',
    '',
    `Nombre: ${request.name}`,
    `WhatsApp: ${request.phone}`,
    `Huéspedes: ${request.guests}`,
    `Ingreso: ${request.checkin}`,
    `Salida: ${request.checkout}`,
    `Estimación orientativa: ${formatMoney_(request.estimatedTotal)}`,
    `Comentario: ${request.message || 'Sin comentario'}`,
    '',
    `Código de solicitud: ${request.id}`,
    `Fecha de envío: ${request.createdAt}`,
    '',
    'La solicitud también quedó guardada en la hoja y puede sincronizarse desde la app de gestión.'
  ].join('\n');
  try {
    MailApp.sendEmail(email, subject, body);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

function clean_(value) {
  return String(value || '').trim();
}

function formatMoney_(value) {
  const amount = Number(value || 0);
  if (!amount) return 'Sin estimación';
  return `$${amount.toLocaleString('es-AR')}`;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
