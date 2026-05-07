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
        video_map = {}   # title (no ext) → "v:ID"
        for v in paginate(f"{META_URL}/{ad_account_id}/advideos",
                          {'access_token': token, 'fields': 'id,title', 'limit': 100}):
            if 'title' in v:
                video_map[v['title']] = f"v:{v['id']}"
        print(f"{len(video_map)} video ditemukan.")

        # Expected video titles = filename without extension
        for filename in videos:
            title = os.path.splitext(filename)[0]
            if title in video_map:
                filename_to_id[filename] = video_map[title]
                print(f"  ✓ {filename}  →  {video_map[title]}")
            else:
                print(f"  ✗ {filename}  — tidak ditemukan di Media Library (belum diupload?)")

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


def write_xlsx(filename_to_id):
    if not filename_to_id:
        print("\\nTidak ada ID yang cocok ditemukan. XLSX tidak diupdate.")
        return

    if not os.path.exists(XLSX_FILE):
        print(f"\\n'{XLSX_FILE}' tidak ditemukan di folder ini.")
        print("Pastikan file XLSX ada di folder yang sama dengan script ini.")
        print("\\nMapping ID yang ditemukan:")
        for fname, mid in filename_to_id.items():
            print(f"  {fname}  →  {mid}")
        return

    wb   = openpyxl.load_workbook(XLSX_FILE)
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

    wb.save(XLSX_FILE)
    print(f"\\n✓ {updated} baris diupdate di '{XLSX_FILE}'. Siap diimport ke Meta!")


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

print(f"""
Step 2: Upload video ke Meta, lalu script otomatis ambil Video ID-nya.

  Lakukan langkah ini SEBELUM ketik y:

  [1] Upload semua file dari folder ini ke Meta Media Library:
        📁 {os.path.abspath(FOLDER)}
      Caranya: buka Ads Manager → ikon garis tiga (☰) → Media Library → Upload

  [2] Siapkan Access Token:
      → Buka https://developers.facebook.com/tools/explorer
      → Dropdown kanan atas: pilih app kamu, pastikan tertulis "User Token"
      → Klik "Generate Access Token" → centang ads_read → Generate → Copy

  [3] Siapkan Ad Account ID:
      → Buka Ads Manager, lihat URL-nya
      → Cari angka setelah ?act= → itulah Ad Account ID kamu
      → Contoh: ?act=1234567890 → ID-nya adalah 1234567890

  Setelah ketiga langkah di atas selesai, ketik y lalu Enter.
  Script akan otomatis ambil semua Video ID dan isi XLSX.
  (Enter saja = skip, isi XLSX manual nanti.)
""")

ans = input("Lanjut ke Step 2? (y/Enter=skip): ").strip().lower()
if ans != 'y':
    print(f"\\nSkip. Upload file dari folder '{FOLDER}' ke Meta secara manual,")
    print(f"lalu isi kolom Video ID di '{XLSX_FILE}' sebelum import.")
    print("\\nSelesai!")
    sys.exit(0)

token         = getpass.getpass("Access Token   : ").strip()
ad_account_id = input("Ad Account ID  : ").strip()

if not token or not ad_account_id:
    print("Token atau Ad Account ID kosong. Step 2 dilewati.")
    print("\\nSelesai!")
    sys.exit(0)

print("\\nMembuka Meta Media Library di browser...")
webbrowser.open("https://adsmanager.facebook.com/adsmanager/manage/images")
print(f"Upload semua file dari folder ini ke Media Library:")
print(f"  📁 {os.path.abspath(FOLDER)}")
print("Pastikan nama file tidak berubah saat upload.\\n")
input("Tekan Enter setelah semua file selesai diupload di browser...")

print("\\nMengambil ID dari Meta Media Library...")
try:
    filename_to_id = fetch_meta_ids(token, ad_account_id)
    write_xlsx(filename_to_id)
except Exception as e:
    print(f"\\nERROR: {e}")
    print("Coba cek: apakah token masih valid? Apakah Ad Account ID benar?")

print("\\nSelesai!")
`;
}
