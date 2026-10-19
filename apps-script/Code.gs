/**
 * BantuAds intake + tracker (Google Apps Script web app).
 *
 * Public:  POST {action:"submit", ...}  -> saves the ZIP to Drive, logs one tracker row.
 *          POST {action:"folder", folderId} -> lists a public Drive folder's files (preview + file count).
 * Private: POST {action:"list"|"update"|"zip", key, ...} -> used by KawanBantu's
 *          "process new BantuAds submissions" command. Needs ADMIN_KEY.
 *
 * Deploy: run setup() once, then Deploy > New deployment > Web app,
 *         Execute as: Me, Who has access: Anyone. See apps-script/README.md.
 */

var CONFIG = {
  ROOT_FOLDER_NAME: 'BantuAds Submissions',
  SPREADSHEET_NAME: 'BantuAds Submission Tracker',
  SHEET_NAME: 'Tracker',
  TIMEZONE: 'Asia/Jakarta',
  MAX_ZIP_BYTES: 15 * 1024 * 1024,
  MAX_ZIP_ENTRIES: 10,
  MAX_ADS: 300,
  MAX_POST_LINKS: 100,
  MAX_SUBMITS_PER_MINUTE: 20,
  MAX_SUBMITS_PER_NGO_PER_HOUR: 10,
  MAX_FOLDER_LOOKUPS_PER_MINUTE: 60,
  MAX_FOLDER_FILES: 50,
  DATE_TOLERANCE_DAYS: 3,
};

var STATUSES = ['Received', 'Processed', 'Ready to publish', 'Published', 'Problem'];
var MODES = ['drive', 'existing_post', 'mixed'];

// The first 8 columns are the tracker Dean asked for; the last 4 are what the
// processing command needs (ad set date, existing-post links, the ZIP itself).
var HEADERS = [
  'Submission ID', 'Received at', 'NGO', 'Ad count', 'Mode', 'Drive folder link', 'Status', 'Notes',
  'Submission date', 'Post links', 'Zip file ID', 'Zip SHA-256',
];
var COL = {};
HEADERS.forEach(function (h, i) { COL[h] = i + 1; });

// ── Entry points ──────────────────────────────────────────────────────────────

function doGet() {
  return json_({ ok: true, service: 'BantuAds intake' });
}

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '');
  } catch (err) {
    return json_({ ok: false, error: 'Format kiriman tidak valid.' });
  }
  if (!body || typeof body !== 'object') return json_({ ok: false, error: 'Format kiriman tidak valid.' });

  try {
    switch (body.action) {
      case 'submit': return json_(handleSubmit_(body));
      case 'folder': return json_(handleFolder_(body));
      case 'list':   return json_(withAdmin_(body, handleList_));
      case 'update': return json_(withAdmin_(body, handleUpdate_));
      case 'zip':    return json_(withAdmin_(body, handleZip_));
      default:       return json_({ ok: false, error: 'Aksi tidak dikenal.' });
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'Terjadi kesalahan di server. Silakan coba lagi atau kirim ZIP via WhatsApp.' });
  }
}

// ── Public: submit ────────────────────────────────────────────────────────────

function handleSubmit_(body) {
  // Honeypot: real users never see or fill this field.
  if (body.website) return { ok: false, error: 'Kiriman ditolak.' };

  var v = validateSubmission_(body, new Date());
  if (!v.ok) return v;

  var cache = CacheService.getScriptCache();
  if (!rateLimit_(cache, 'rl:global', CONFIG.MAX_SUBMITS_PER_MINUTE, 60)) {
    return { ok: false, error: 'Server sedang sibuk. Coba lagi dalam 1 menit.' };
  }
  if (!rateLimit_(cache, 'rl:ngo:' + v.ngoKey, CONFIG.MAX_SUBMITS_PER_NGO_PER_HOUR, 3600)) {
    return { ok: false, error: 'Terlalu banyak kiriman untuk NGO ini dalam 1 jam. Hubungi tim KawanBantu.' };
  }

  var bytes = Utilities.base64Decode(v.zipBase64);
  var zipCheck = checkZip_(bytes, v.zipName, v.mode);
  if (!zipCheck.ok) return zipCheck;

  var sha = sha256Hex_(bytes);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    // Same ZIP sent twice (double click, retry): return the first submission instead of a duplicate row.
    var existing = findRowBy_(sheet, COL['Zip SHA-256'], sha);
    if (existing) {
      return {
        ok: true, duplicate: true,
        submissionId: existing.values[COL['Submission ID'] - 1],
        receivedAt: existing.values[COL['Received at'] - 1],
      };
    }

    var now = new Date();
    var id = 'BA-' + Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' +
      Utilities.getUuid().slice(0, 4).toUpperCase();
    var receivedAt = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');

    var root = DriveApp.getFolderById(prop_('ROOT_FOLDER_ID'));
    var folder = root.createFolder(id + ' ' + v.ngoName);
    var file = folder.createFile(Utilities.newBlob(bytes, 'application/zip', v.zipName));

    var row = new Array(HEADERS.length);
    row[COL['Submission ID'] - 1] = id;
    row[COL['Received at'] - 1] = receivedAt;
    row[COL['NGO'] - 1] = safeCell_(v.ngoName);
    row[COL['Ad count'] - 1] = v.adCount;
    row[COL['Mode'] - 1] = v.mode;
    row[COL['Drive folder link'] - 1] = folder.getUrl();
    row[COL['Status'] - 1] = 'Received';
    row[COL['Notes'] - 1] = v.replaces ? safeCell_('Pengganti ' + v.replaces + ' (NGO mengedit setelah kirim)') : '';
    row[COL['Submission date'] - 1] = v.submissionDate;
    row[COL['Post links'] - 1] = safeCell_(v.postLinks.join('\n'));
    row[COL['Zip file ID'] - 1] = file.getId();
    row[COL['Zip SHA-256'] - 1] = sha;
    sheet.appendRow(row);

    // An NGO edited and re-sent: flag the earlier row so processing skips it.
    if (v.replaces) {
      var old = findRowBy_(sheet, COL['Submission ID'], v.replaces);
      if (old && cleanText_(old.values[COL['NGO'] - 1]).toLowerCase() === v.ngoName.toLowerCase()) {
        var stamp = Utilities.formatDate(now, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
        var prev = String(old.values[COL['Notes'] - 1] || '');
        var line = '[' + stamp + '] Diganti oleh ' + id + ' (NGO mengedit setelah kirim).';
        sheet.getRange(old.row, COL['Notes']).setValue(safeCell_(prev ? prev + '\n' + line : line));
        if (String(old.values[COL['Status'] - 1]) === 'Received') sheet.getRange(old.row, COL['Status']).setValue('Problem');
      }
    }

    return { ok: true, submissionId: id, receivedAt: receivedAt };
  } finally {
    lock.releaseLock();
  }
}

// Pure validation (no Google services) so it can be unit-tested outside Apps Script.
function validateSubmission_(body, now) {
  var fail = function (msg) { return { ok: false, error: msg }; };

  var ngoName = cleanText_(body.ngoName);
  if (ngoName.length < 2 || ngoName.length > 120) return fail('Nama NGO wajib diisi (2-120 karakter).');

  var submissionDate = String(body.submissionDate || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(submissionDate)) return fail('Tanggal submission tidak valid.');
  var d = new Date(submissionDate + 'T12:00:00+07:00');
  if (isNaN(d.getTime())) return fail('Tanggal submission tidak valid.');
  var diffDays = Math.abs(d.getTime() - now.getTime()) / 86400000;
  if (diffDays > CONFIG.DATE_TOLERANCE_DAYS + 1) return fail('Tanggal submission terlalu jauh dari hari ini.');

  var adCount = Number(body.adCount);
  if (!Number.isInteger(adCount) || adCount < 1 || adCount > CONFIG.MAX_ADS) {
    return fail('Jumlah iklan harus antara 1 dan ' + CONFIG.MAX_ADS + '.');
  }

  var mode = String(body.mode || '');
  if (MODES.indexOf(mode) === -1) return fail('Mode tidak valid.');

  var postLinks = Array.isArray(body.postLinks) ? body.postLinks : [];
  if (postLinks.length > CONFIG.MAX_POST_LINKS) return fail('Terlalu banyak link postingan.');
  for (var i = 0; i < postLinks.length; i++) {
    if (!isPostLink_(postLinks[i])) return fail('Link postingan ke-' + (i + 1) + ' bukan link Instagram/Facebook yang valid.');
  }
  if (mode !== 'drive' && postLinks.length === 0) return fail('Mode postingan butuh minimal 1 link postingan.');
  if (mode === 'drive' && postLinks.length > 0) return fail('Mode Drive tidak boleh berisi link postingan.');

  var replaces = body.replacesSubmissionId ? String(body.replacesSubmissionId) : '';
  if (replaces && !/^BA-\d{8}-\d{6}-[A-F0-9]{4}$/.test(replaces)) return fail('Nomor submission yang diedit tidak valid.');

  var zipName = String(body.zipName || '');
  if (!/^BantuAds_[^\/\\:*?"<>|]{1,150}_\d{4}-\d{2}-\d{2}\.zip$/.test(zipName)) return fail('Nama file ZIP tidak valid.');

  var zipBase64 = String(body.zipBase64 || '');
  if (!zipBase64 || !/^[A-Za-z0-9+\/]+={0,2}$/.test(zipBase64)) return fail('File ZIP tidak ditemukan atau rusak.');
  var approxBytes = Math.floor(zipBase64.length * 3 / 4);
  if (approxBytes > CONFIG.MAX_ZIP_BYTES) return fail('File ZIP terlalu besar (maks 15 MB).');

  return {
    ok: true,
    ngoName: ngoName,
    ngoKey: ngoName.toLowerCase().replace(/[^a-z0-9]+/g, ''),
    submissionDate: submissionDate,
    adCount: adCount,
    mode: mode,
    postLinks: postLinks.map(function (l) { return String(l).trim(); }),
    zipName: zipName,
    zipBase64: zipBase64,
    replaces: replaces,
  };
}

// ── Public: list a Drive folder's files ───────────────────────────────────────

function handleFolder_(body) {
  var folderId = String(body.folderId || '');
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(folderId)) return { ok: false, error: 'Link folder tidak valid.' };
  var cache = CacheService.getScriptCache();
  var cached = cache.get('folder:' + folderId);
  if (cached) return JSON.parse(cached);
  if (!rateLimit_(cache, 'rl:folder', CONFIG.MAX_FOLDER_LOOKUPS_PER_MINUTE, 60)) {
    return { ok: false, error: 'Server sedang sibuk. Coba lagi dalam 1 menit.' };
  }
  var result;
  try {
    var it = DriveApp.getFolderById(folderId).getFiles();
    var files = [];
    while (it.hasNext() && files.length < CONFIG.MAX_FOLDER_FILES) {
      var f = it.next();
      var type = f.getMimeType();
      if (/^(video|image)\//.test(type)) files.push({ id: f.getId(), name: f.getName(), type: type.split('/')[0] });
    }
    // Same order the download script uses: natural sort by file name.
    files.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }); });
    result = { ok: true, files: files };
  } catch (err) {
    result = { ok: false, error: 'Folder tidak bisa dibuka. Pastikan folder di-share ke "Anyone with the link".' };
  }
  cache.put('folder:' + folderId, JSON.stringify(result), 600);
  return result;
}

function isPostLink_(link) {
  var s = String(link || '').trim();
  if (s.length > 500) return false;
  var m = s.match(/^https:\/\/(www\.|m\.|web\.)?(instagram\.com|facebook\.com|fb\.com|fb\.watch)\/[^\s]+$/i);
  return !!m;
}

function checkZip_(bytes, zipName, mode) {
  var fail = function (msg) { return { ok: false, error: msg }; };
  if (bytes.length > CONFIG.MAX_ZIP_BYTES) return fail('File ZIP terlalu besar (maks 15 MB).');
  // ZIP magic number "PK\x03\x04"
  if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4B || bytes[2] !== 0x03 || bytes[3] !== 0x04) {
    return fail('File yang dikirim bukan ZIP.');
  }
  var entries;
  try {
    entries = Utilities.unzip(Utilities.newBlob(bytes, 'application/zip', zipName));
  } catch (err) {
    return fail('File ZIP rusak dan tidak bisa dibuka.');
  }
  return checkZipEntries_(entries.map(function (b) { return b.getName(); }), mode);
}

// Pure check on the list of file names inside the ZIP.
function checkZipEntries_(names, mode) {
  var fail = function (msg) { return { ok: false, error: msg }; };
  if (names.length === 0 || names.length > CONFIG.MAX_ZIP_ENTRIES) return fail('Isi file ZIP tidak sesuai.');
  var counts = { xlsx: 0, py: 0, json: 0 };
  for (var i = 0; i < names.length; i++) {
    var n = names[i];
    if (n.indexOf('..') !== -1 || n.indexOf('/') !== -1 || n.indexOf('\\') !== -1) return fail('Isi file ZIP tidak sesuai.');
    var ext = (n.match(/\.([a-z0-9]+)$/i) || [])[1];
    ext = ext ? ext.toLowerCase() : '';
    if (!(ext in counts)) return fail('File ZIP berisi file yang tidak diizinkan: ' + n);
    counts[ext]++;
  }
  if (mode !== 'existing_post' && (counts.xlsx !== 1 || counts.py !== 1)) {
    return fail('File ZIP harus berisi 1 file .xlsx dan 1 file .py dari BantuAds.');
  }
  return { ok: true };
}

// ── Private: admin actions for the processing command ─────────────────────────

function withAdmin_(body, fn) {
  var expected = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
  if (!expected || !safeEquals_(String(body.key || ''), expected)) return { ok: false, error: 'Unauthorized' };
  return fn(body);
}

function handleList_(body) {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) return { ok: true, rows: [] };
  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getDisplayValues();
  var want = body.status ? String(body.status) : null;
  var rows = values
    .map(function (r, i) {
      var o = { row: i + 2 };
      HEADERS.forEach(function (h, j) { o[h] = r[j]; });
      return o;
    })
    .filter(function (o) { return !want || o['Status'] === want; });
  return { ok: true, rows: rows };
}

function handleUpdate_(body) {
  var status = body.status ? String(body.status) : null;
  if (status && STATUSES.indexOf(status) === -1) return { ok: false, error: 'Invalid status' };
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getSheet_();
    var found = findRowBy_(sheet, COL['Submission ID'], String(body.submissionId || ''));
    if (!found) return { ok: false, error: 'Submission not found' };
    if (status) sheet.getRange(found.row, COL['Status']).setValue(status);
    if (body.note) {
      var stamp = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm');
      var old = String(found.values[COL['Notes'] - 1] || '');
      var line = '[' + stamp + '] ' + cleanText_(body.note);
      sheet.getRange(found.row, COL['Notes']).setValue(safeCell_(old ? old + '\n' + line : line));
    }
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function handleZip_(body) {
  var sheet = getSheet_();
  var found = findRowBy_(sheet, COL['Submission ID'], String(body.submissionId || ''));
  if (!found) return { ok: false, error: 'Submission not found' };
  var file = DriveApp.getFileById(found.values[COL['Zip file ID'] - 1]);
  return { ok: true, name: file.getName(), zipBase64: Utilities.base64Encode(file.getBlob().getBytes()) };
}

// ── One-time setup (run from the editor) ──────────────────────────────────────

function setup() {
  var props = PropertiesService.getScriptProperties();

  var rootId = props.getProperty('ROOT_FOLDER_ID');
  var root = rootId ? DriveApp.getFolderById(rootId) : DriveApp.createFolder(CONFIG.ROOT_FOLDER_NAME);
  props.setProperty('ROOT_FOLDER_ID', root.getId());

  var ssId = props.getProperty('SPREADSHEET_ID');
  var ss = ssId ? SpreadsheetApp.openById(ssId) : SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
  props.setProperty('SPREADSHEET_ID', ss.getId());
  if (!ssId) DriveApp.getFileById(ss.getId()).moveTo(root);

  var sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getSheets()[0];
  sheet.setName(CONFIG.SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#D9D9D9');
  sheet.setFrozenRows(1);
  var statusRule = SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build();
  sheet.getRange(2, COL['Status'], sheet.getMaxRows() - 1, 1).setDataValidation(statusRule);
  sheet.hideColumns(COL['Zip file ID'], 2);

  if (!props.getProperty('ADMIN_KEY')) {
    props.setProperty('ADMIN_KEY', Utilities.getUuid() + Utilities.getUuid().replace(/-/g, ''));
  }

  Logger.log('Folder:  ' + root.getUrl());
  Logger.log('Tracker: ' + ss.getUrl());
  Logger.log('Setup done. Run showAdminKey() to see the admin key for the processing command.');
}

function showAdminKey() {
  Logger.log(PropertiesService.getScriptProperties().getProperty('ADMIN_KEY'));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getSheet_() {
  return SpreadsheetApp.openById(prop_('SPREADSHEET_ID')).getSheetByName(CONFIG.SHEET_NAME);
}

function prop_(name) {
  var v = PropertiesService.getScriptProperties().getProperty(name);
  if (!v) throw new Error('Missing script property ' + name + '. Run setup() first.');
  return v;
}

function findRowBy_(sheet, col, value) {
  if (!value) return null;
  var last = sheet.getLastRow();
  if (last < 2) return null;
  var values = sheet.getRange(2, 1, last - 1, HEADERS.length).getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (String(values[i][col - 1]) === value) return { row: i + 2, values: values[i] };
  }
  return null;
}

function rateLimit_(cache, key, max, seconds) {
  var n = Number(cache.get(key) || 0);
  if (n >= max) return false;
  cache.put(key, String(n + 1), seconds);
  return true;
}

function sha256Hex_(bytes) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, bytes)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
}

// Strip control characters (keep newlines) and trim.
function cleanText_(s) {
  return String(s == null ? '' : s).replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim();
}

// Stop spreadsheet formula injection from user-supplied text.
function safeCell_(s) {
  var t = String(s == null ? '' : s);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function safeEquals_(a, b) {
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
