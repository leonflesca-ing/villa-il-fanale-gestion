const SHEET_NAME = 'Solicitudes';
const HEADERS = ['id','createdAt','name','phone','guests','checkin','checkout','message','estimatedTotal','status'];

function doPost(e) {
  const data = e.parameter || {};
  const sheet = getSheet_();
  sheet.appendRow(HEADERS.map(key => data[key] || (key === 'status' ? 'nueva' : '')));
  return json_({ ok: true, id: data.id });
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

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
