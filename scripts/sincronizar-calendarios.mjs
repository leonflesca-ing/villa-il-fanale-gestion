// Sincroniza la disponibilidad de Villa il Fanale con Booking.com y Airbnb.
// Lo ejecuta GitHub Actions cada 30 minutos (ver .github/workflows/calendarios.yml).
//  1) Lee los calendarios iCal de Booking y Airbnb (URLs guardadas como secretos).
//  2) Guarda las fechas ocupadas en reservar/ocupado-externo.json (sin datos personales).
//  3) Genera los calendarios para importar en cada plataforma:
//       reservar/calendario-booking.ics  -> pegar en Booking (todo menos lo que ya es de Booking)
//       reservar/calendario-airbnb.ics   -> pegar en Airbnb  (todo menos lo que ya es de Airbnb)
import { readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  { name: 'Booking.com', url: process.env.BOOKING_ICS_URL },
  { name: 'Airbnb', url: process.env.AIRBNB_ICS_URL }
].filter(source => source.url);

const unfold = text => text.replace(/\r?\n[ \t]/g, '');
const toISO = value => { const v = String(value || '').replace(/^.*:/, '').slice(0, 8); return v.length === 8 ? `${v.slice(0,4)}-${v.slice(4,6)}-${v.slice(6,8)}` : ''; };
const field = (block, key) => { const line = block.split(/\r?\n/).find(l => l.startsWith(key + ':') || l.startsWith(key + ';')); return line ? line.slice(line.indexOf(':') + 1).trim() : ''; };
const addDay = iso => { const d = new Date(`${iso}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const today = new Date().toISOString().slice(0, 10);

function parseICS(text, source) {
  return unfold(text).split('BEGIN:VEVENT').slice(1).map(chunk => {
    const block = chunk.split('END:VEVENT')[0];
    const start = toISO(field(block, 'DTSTART'));
    let end = toISO(field(block, 'DTEND')) || (start ? addDay(start) : '');
    if (end && end <= start) end = addDay(start);
    const summary = field(block, 'SUMMARY');
    const uid = field(block, 'UID') || `${source}-${start}-${end}`;
    const description = field(block, 'DESCRIPTION');
    const code = (description.match(/details\/([A-Z0-9]{6,})/i) || [])[1] || '';
    return { start, end, source, uid, kind: /not available|closed|bloq/i.test(summary) && !/reserv/i.test(summary) ? 'cerrado' : 'reserva', code };
  }).filter(event => event.start && event.end && event.end >= today);
}

async function readJSON(path, fallback) { try { return JSON.parse(await readFile(path, 'utf8')); } catch { return fallback; } }

async function main() {
  const previous = await readJSON('reservar/ocupado-externo.json', { events: [] });
  const events = [];
  const status = {};
  for (const source of SOURCES) {
    try {
      const response = await fetch(source.url, { headers: { 'User-Agent': 'VillaIlFanale-Sync/1.0' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      if (!text.includes('BEGIN:VCALENDAR')) throw new Error('respuesta sin calendario');
      events.push(...parseICS(text, source.name));
      status[source.name] = 'ok';
    } catch (error) {
      console.error(`No se pudo leer ${source.name}:`, error.message);
      status[source.name] = 'error';
      // Si falla una plataforma, conservamos lo último que sabíamos de ella.
      events.push(...(previous.events || []).filter(event => event.source === source.name));
    }
  }
  events.sort((a, b) => a.start.localeCompare(b.start));
  const external = { events, sources: status };
  const before = JSON.stringify({ events: previous.events || [], sources: previous.sources || {} });
  if (before !== JSON.stringify(external)) {
    external.updatedAt = new Date().toISOString();
    await writeFile('reservar/ocupado-externo.json', JSON.stringify(external, null, 2) + '\n');
  }

  // Calendarios de salida para cada plataforma.
  const own = await readJSON('reservar/ocupado.json', { ranges: [] });
  const all = [
    ...(own.ranges || []).map(r => ({ start: r.start, end: r.end, source: r.source || 'Directa', uid: `vif-${r.id || r.start}` })),
    ...events.map(e => ({ start: e.start, end: e.end, source: e.source, uid: `ext-${e.uid}` }))
  ].filter(r => r.end >= today);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const ics = list => [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Villa il Fanale//Disponibilidad//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ...list.flatMap(r => ['BEGIN:VEVENT', `UID:${r.uid.replace(/[^a-zA-Z0-9@._-]/g, '')}@villailfanale`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${r.start.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${r.end.replace(/-/g, '')}`, 'SUMMARY:No disponible', 'END:VEVENT']),
    'END:VCALENDAR', ''
  ].join('\r\n');
  const exclude = name => all.filter(r => r.source !== name);
  for (const [file, name] of [['reservar/calendario-booking.ics', 'Booking.com'], ['reservar/calendario-airbnb.ics', 'Airbnb']]) {
    const next = ics(exclude(name));
    const current = await readFile(file, 'utf8').catch(() => '');
    const strip = text => text.replace(/DTSTAMP:.*\r\n/g, '');
    if (strip(current) !== strip(next)) await writeFile(file, next);
  }
  console.log(`Listo: ${events.length} eventos externos, ${(own.ranges || []).length} propios.`, status);
}

main().catch(error => { console.error(error); process.exit(1); });
