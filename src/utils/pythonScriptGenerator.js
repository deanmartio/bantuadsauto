import { getExpandedCreatives, getLocalDateString } from './driveUtils';

export function generatePythonScript(ngoName, adRows) {
  const date = getLocalDateString();
  const xlsxFilename = `BantuAds_${ngoName}_${date}.xlsx`;

  const items = [];
  adRows.forEach(row => {
    getExpandedCreatives(row).forEach(({ link, filename, isFolder }) => {
      if (isFolder) {
        const existing = items.find(i => i.isFolder && i.link === link);
        if (existing) {
          existing.filenames.push(filename);
        } else {
          items.push({ link, filenames: [filename], isFolder: true });
        }
      } else {
        items.push({ link, filenames: [filename], isFolder: false });
      }
    });
  });

  const listItems = items
    .map(({ link, filenames, isFolder }) =>
      `    (${JSON.stringify(link)}, ${JSON.stringify(filenames)}, ${isFolder ? 'True' : 'False'}),`
    )
    .join('\n');

  return `import os
import sys
import shutil
import webbrowser
import getpass

try:
    import gdown
    import requests
    import openpyxl
except ImportError:
    print("Install dulu: pip install gdown requests openpyxl")
    sys.exit(1)

NGO_NAME   = ${JSON.stringify(ngoName)}
DATE       = ${JSON.stringify(date)}
FOLDER     = f"{NGO_NAME}_creatives_{DATE}"
XLSX_FILE  = ${JSON.stringify(xlsxFilename)}
META_URL   = "https://graph.facebook.com/v25.0"

CREATIVE_LIST = [
${listItems}
]


# ── STEP 1: Download dari Google Drive ───────────────────────────────────────

def download_all():
    os.makedirs(FOLDER, exist_ok=True)
    errors = []

    for drive_link, filenames, is_folder in CREATIVE_LIST:
        if is_folder:
            print(f"\\nLink folder terdeteksi. Mendownload {len(filenames)} file...")
            temp_dir = os.path.join(FOLDER, f"_tmp_{filenames[0].replace('.', '_')}")
            os.makedirs(temp_dir, exist_ok=True)
            try:
                gdown.download_folder(drive_link, output=temp_dir, quiet=False, remaining_ok=True)
            except Exception as e:
                print(f"  ERROR: {e}")
                errors.extend(filenames)
                shutil.rmtree(temp_dir, ignore_errors=True)
                continue

            downloaded = sorted([
                f for f in os.listdir(temp_dir)
                if os.path.isfile(os.path.join(temp_dir, f)) and not f.startswith('.')
            ])

            if not downloaded:
                print("  Tidak ada file yang berhasil didownload.")
                errors.extend(filenames)
            else:
                for i, expected_name in enumerate(filenames):
                    if i < len(downloaded):
                        os.replace(os.path.join(temp_dir, downloaded[i]),
                                   os.path.join(FOLDER, expected_name))
                        print(f"  Disimpan sebagai '{expected_name}'")
                    else:
                        print(f"  PERINGATAN: file ke-{i+1} tidak ada di folder Drive.")
                        errors.append(expected_name)
            shutil.rmtree(temp_dir, ignore_errors=True)
        else:
            filename = filenames[0]
            filepath = os.path.join(FOLDER, filename)
            print(f"Mendownload {filename}...", end=" ", flush=True)
            try:
                result = gdown.download(drive_link, filepath, quiet=False, fuzzy=True)
                print("Selesai" if result else "GAGAL")
                if not result:
                    errors.append(filename)
            except Exception as e:
                print(f"ERROR: {e}")
                errors.append(filename)

    return errors


# ── STEP 2: Fetch IDs from Meta & update XLSX ────────────────────────────────

def paginate(url, params):
    """Yield all items across paginated Meta API responses."""
    while url:
        r = requests.get(url, params=params, timeout=30)
        d = r.json()
        if 'error' in d:
            raise Exception(d['error'].get('message', str(d['error'])))
        yield from d.get('data', [])
        url = d.get('paging', {}).get('next')
        params = {}   # next URL already contains all params


def fetch_meta_ids(token, ad_account_id):
    """Return {filename: meta_id} by querying advideos + adimages."""
    if not ad_account_id.startswith('act_'):
        ad_account_id = f"act_{ad_account_id}"

    all_files = [fn for _, fns, _ in CREATIVE_LIST for fn in fns]
    videos    = [f for f in all_files if f.lower().endswith('.mp4')]
    images    = [f for f in all_files if not f.lower().endswith('.mp4')]
    filename_to_id = {}

    # ── Videos ───────────────────────────────────────────────────────────────
    if videos:
        print("  Mengambil daftar video dari Media Library...", end=" ", flush=True)
        all_video_data = list(paginate(f"{META_URL}/{ad_account_id}/advideos",
                          {'access_token': token, 'fields': 'id,title,created_time', 'limit': 100}))
        print(f"{len(all_video_data)} video ditemukan.")

        # Build lookup: both exact title and lowercased, with and without .mp4
        video_map = {}
        for v in all_video_data:
            raw = v.get('title', '')
            meta_id = f"v:{v['id']}"
            for key in [raw, raw.lower(), os.path.splitext(raw)[0], os.path.splitext(raw)[0].lower()]:
                if key:
                    video_map[key] = meta_id

        # Show 8 most recently uploaded titles so user can see exact format
        recent = sorted(all_video_data, key=lambda x: x.get('created_time',''), reverse=True)[:8]
        print("  8 video terbaru di Media Library:")
        for v in recent:
            print(f"    title={repr(v.get('title',''))}  id=v:{v['id']}")

        # Match: try filename without ext, lowercased, and with ext
        for filename in videos:
            stem  = os.path.splitext(filename)[0]          # Braille_1
            found = (video_map.get(stem) or
                     video_map.get(stem.lower()) or
                     video_map.get(filename) or
                     video_map.get(filename.lower()))
            if found:
                filename_to_id[filename] = found
                print(f"  ✓ {filename}  →  {found}")
            else:
                print(f"  ✗ {filename}  — tidak cocok. Cek format title di atas.")

    # ── Images ───────────────────────────────────────────────────────────────
    if images:
        print("  Mengambil daftar gambar dari Media Library...", end=" ", flush=True)
        image_map = {}   # name → hash  (Meta stores name with extension)
        for img in paginate(f"{META_URL}/{ad_account_id}/adimages",
                            {'access_token': token, 'fields': 'hash,name', 'limit': 100}):
            if 'name' in img and 'hash' in img:
                image_map[img['name']] = img['hash']
                # also index without extension as fallback
                image_map[os.path.splitext(img['name'])[0]] = img['hash']
        print(f"{len(image_map) // 2} gambar ditemukan.")

        for filename in images:
            key = filename if filename in image_map else os.path.splitext(filename)[0]
            if key in image_map:
                filename_to_id[filename] = image_map[key]
                print(f"  ✓ {filename}  →  {image_map[key][:16]}...")
            else:
                print(f"  ✗ {filename}  — tidak ditemukan di Media Library (belum diupload?)")

    return filename_to_id


def resolve_path(raw):
    """Strip shell escaping and quotes from a drag-and-dropped path."""
    import shlex
    raw = raw.strip()
    try:
        parts = shlex.split(raw)
        if parts:
            return parts[0]
    except Exception:
        pass
    # fallback: strip surrounding quotes only
    if len(raw) >= 2 and raw[0] == raw[-1] and raw[0] in (chr(34), chr(39)):
        raw = raw[1:-1]
    return raw


def find_xlsx():
    """Return a valid XLSX path, retrying until the user provides one."""
    if os.path.exists(XLSX_FILE):
        return XLSX_FILE
    while True:
        print(f"\\n'{XLSX_FILE}' tidak ditemukan di folder script ini.")
        print("Drag & drop file XLSX ke terminal ini, lalu tekan Enter:")
        raw = input("  Path XLSX: ")
        path = resolve_path(raw)
        if os.path.exists(path):
            return path
        print(f"  File tidak ditemukan: '{path}'")
        print("  Pastikan path benar dan coba lagi.")


def write_xlsx(filename_to_id, xlsx_path):
    wb   = openpyxl.load_workbook(xlsx_path)
    ws   = wb.active
    hdrs = [cell.value for cell in ws[1]]

    def colidx(name):
        try:    return hdrs.index(name) + 1
        except: return None

    vfn_c  = colidx('Video File Name')
    vid_c  = colidx('Video ID')
    ifn_c  = colidx('Image File Name')
    hash_c = colidx('Image Hash')

    updated = 0
    for row in ws.iter_rows(min_row=2):
        if vfn_c and vid_c:
            v = row[vfn_c - 1].value
            if v and v in filename_to_id:
                row[vid_c - 1].value = filename_to_id[v]
                updated += 1
        if ifn_c and hash_c:
            v = row[ifn_c - 1].value
            if v and v in filename_to_id:
                row[hash_c - 1].value = filename_to_id[v]
                updated += 1

    wb.save(xlsx_path)
    print(f"\\n✓ {updated} baris diupdate di '{xlsx_path}'. Siap diimport ke Meta!")


# ── MAIN ─────────────────────────────────────────────────────────────────────

print("=" * 55)
print("  Step 1: Download creative dari Google Drive")
print("=" * 55)
errors = download_all()
total  = sum(len(item[1]) for item in CREATIVE_LIST)

print(f"\\n{'=' * 55}")
if errors:
    print(f"  {len(errors)} file gagal didownload.")
else:
    print(f"  Selesai! {total} file tersimpan di folder '{FOLDER}'.")
print("=" * 55)

AD_ACCOUNT_ID = "act_1593004558017073"

print(f"""
Step 2: Upload video ke Meta, lalu script otomatis ambil Video ID-nya.

  [1] Upload semua file dari folder ini ke Meta Media Library:
        📁 {os.path.abspath(FOLDER)}
      Caranya: buka Ads Manager → ikon garis tiga (☰) → Media Library → Upload

  [2] Siapkan Access Token:
      → Buka https://developers.facebook.com/tools/explorer
      → Dropdown kanan atas: pilih app kamu, pastikan tertulis "User Token"
      → Klik "Generate Access Token" → centang ads_read → Generate → Copy

  Setelah kedua langkah di atas selesai, ketik y lalu Enter.
  (Enter saja = skip, isi XLSX manual nanti.)
""")

ans = input("Lanjut ke Step 2? (y/Enter=skip): ").strip().lower()
if ans != 'y':
    print(f"\\nSkip. Upload file dari folder '{FOLDER}' ke Meta secara manual,")
    print(f"lalu isi kolom Video ID di '{XLSX_FILE}' sebelum import.")
    print("\\nSelesai!")
    sys.exit(0)

# ── Token input with validation loop ─────────────────────────────────────────
while True:
    token = getpass.getpass("Access Token: ").strip()
    if not token:
        print("  Token tidak boleh kosong. Coba lagi.")
        continue
    print("  Memvalidasi token...", end=" ", flush=True)
    try:
        r = requests.get(f"{META_URL}/me", params={'access_token': token, 'fields': 'name'}, timeout=15)
        d = r.json()
        if 'error' in d:
            print(f"GAGAL\\n  {d['error'].get('message', str(d['error']))}")
            print("  Generate token baru dan coba lagi.")
            continue
        print(f"OK ({d.get('name', '')})")
        break
    except Exception as e:
        print(f"GAGAL\\n  Koneksi error: {e}")
        print("  Cek koneksi internet dan coba lagi.")
        continue

# ── Open browser & wait for upload ───────────────────────────────────────────
print("\\nMembuka Meta Media Library di browser...")
webbrowser.open("https://adsmanager.facebook.com/adsmanager/manage/images")
print(f"Upload semua file dari folder ini ke Media Library:")
print(f"  📁 {os.path.abspath(FOLDER)}")
print("Pastikan nama file tidak berubah saat upload.\\n")
input("Tekan Enter setelah semua file selesai diupload di browser...")

# ── Fetch IDs with retry loop ─────────────────────────────────────────────────
while True:
    print("\\nMengambil ID dari Meta Media Library...")
    try:
        filename_to_id = fetch_meta_ids(token, AD_ACCOUNT_ID)
        break
    except Exception as e:
        print(f"  ERROR: {e}")
        print("  Pilihan:")
        print("  [r] Coba lagi dengan token baru")
        print("  [s] Skip — cetak ID yang sudah didapat dan lanjut")
        choice = input("  Pilihan (r/s): ").strip().lower()
        if choice == 's':
            filename_to_id = {}
            break
        # re-enter token
        while True:
            token = getpass.getpass("  Access Token baru: ").strip()
            if not token:
                print("  Token tidak boleh kosong.")
                continue
            print("  Memvalidasi...", end=" ", flush=True)
            try:
                r = requests.get(f"{META_URL}/me", params={'access_token': token, 'fields': 'name'}, timeout=15)
                d = r.json()
                if 'error' in d:
                    print(f"GAGAL: {d['error'].get('message', '')}")
                    continue
                print(f"OK ({d.get('name', '')})")
                break
            except Exception as e2:
                print(f"GAGAL: {e2}")
                continue

if not filename_to_id:
    print("\\nTidak ada ID yang cocok. XLSX tidak diupdate.")
    print("\\nSelesai!")
    sys.exit(0)

# ── Find XLSX with retry loop ─────────────────────────────────────────────────
xlsx_path = find_xlsx()
write_xlsx(filename_to_id, xlsx_path)

print("\\nSelesai!")
`;
}
