import { getExpandedCreatives, getLocalDateString } from './driveUtils';

export function generatePythonScript(ngoName, adRows) {
  const date = getLocalDateString();
  const xlsxFilename = `BantuAds_${ngoName}_${date}.xlsx`;

  // Build grouped creative list (same logic as before)
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

# Each entry: (drive_link, [expected_filenames], is_folder)
CREATIVE_LIST = [
${listItems}
]

META_API_VERSION  = "v19.0"
META_VIDEO_URL    = f"https://graph-video.facebook.com/{META_API_VERSION}"
META_GRAPH_URL    = f"https://graph.facebook.com/{META_API_VERSION}"


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
                if result:
                    print("Selesai")
                else:
                    print("GAGAL")
                    errors.append(filename)
            except Exception as e:
                print(f"ERROR: {e}")
                errors.append(filename)

    return errors


# ── STEP 2: Upload ke Meta & update XLSX ─────────────────────────────────────

def upload_video(filepath, filename, access_token, ad_account_id):
    url = f"{META_VIDEO_URL}/{ad_account_id}/advideos"
    with open(filepath, 'rb') as f:
        r = requests.post(url,
            data={'access_token': access_token, 'name': os.path.splitext(filename)[0]},
            files={'source': (filename, f, 'video/mp4')},
            timeout=300)
    data = r.json()
    if 'id' in data:
        return f"v:{data['id']}"
    raise Exception(str(data.get('error', data)))

def upload_image(filepath, filename, access_token, ad_account_id):
    url = f"{META_GRAPH_URL}/{ad_account_id}/adimages"
    with open(filepath, 'rb') as f:
        r = requests.post(url,
            data={'access_token': access_token},
            files={filename: f},
            timeout=120)
    data = r.json()
    images = data.get('images', {})
    if images:
        return list(images.values())[0].get('hash', '')
    raise Exception(str(data.get('error', data)))

def update_xlsx(filename_to_id):
    if not os.path.exists(XLSX_FILE):
        print(f"  XLSX '{XLSX_FILE}' tidak ditemukan di folder ini.")
        print("  Mapping ID (isi manual ke kolom Video ID / Image Hash):")
        for fname, mid in filename_to_id.items():
            print(f"    {fname}  ->  {mid}")
        return

    wb = openpyxl.load_workbook(XLSX_FILE)
    ws = wb.active
    headers = [cell.value for cell in ws[1]]

    def col(name):
        try:
            return headers.index(name) + 1
        except ValueError:
            return None

    vfn_col  = col('Video File Name')
    vid_col  = col('Video ID')
    ifn_col  = col('Image File Name')
    hash_col = col('Image Hash')

    updated = 0
    for row in ws.iter_rows(min_row=2):
        if vfn_col and vid_col:
            vfn = row[vfn_col - 1].value
            if vfn and vfn in filename_to_id:
                row[vid_col - 1].value = filename_to_id[vfn]
                updated += 1
        if ifn_col and hash_col:
            ifn = row[ifn_col - 1].value
            if ifn and ifn in filename_to_id:
                row[hash_col - 1].value = filename_to_id[ifn]
                updated += 1

    wb.save(XLSX_FILE)
    print(f"  {updated} baris diupdate di '{XLSX_FILE}'. XLSX siap diimport!")

def upload_all_to_meta(access_token, ad_account_id):
    filename_to_id = {}
    all_filenames = [fn for _, fns, _ in CREATIVE_LIST for fn in fns]

    for filename in all_filenames:
        filepath = os.path.join(FOLDER, filename)
        if not os.path.exists(filepath):
            print(f"  File tidak ditemukan, skip: {filename}")
            continue
        ext = os.path.splitext(filename)[1].lower()
        print(f"  Uploading {filename}...", end=" ", flush=True)
        try:
            if ext == '.mp4':
                meta_id = upload_video(filepath, filename, access_token, ad_account_id)
            else:
                meta_id = upload_image(filepath, filename, access_token, ad_account_id)
            filename_to_id[filename] = meta_id
            print(f"OK  ({meta_id})")
        except Exception as e:
            print(f"GAGAL: {e}")

    if filename_to_id:
        print(f"\\nMengupdate {XLSX_FILE}...")
        update_xlsx(filename_to_id)
    else:
        print("Tidak ada file yang berhasil diupload.")


# ── MAIN ─────────────────────────────────────────────────────────────────────

print("=" * 55)
print("  Step 1: Download creative dari Google Drive")
print("=" * 55)
errors = download_all()

total = sum(len(item[1]) for item in CREATIVE_LIST)
if errors:
    print(f"\\n{len(errors)} file gagal. Cek link Google Drive dan coba lagi.")
else:
    print(f"\\n{total} file berhasil didownload ke folder '{FOLDER}'.")

print()
print("=" * 55)
print("  Step 2: Upload ke Meta & isi Video ID otomatis")
print("=" * 55)
print("""
Script ini akan upload semua file ke Meta Media Library
dan mengisi kolom Video ID / Image Hash di XLSX secara otomatis.

Cara dapat Access Token:
  1. Buka https://developers.facebook.com/tools/explorer
  2. Pilih app -> Generate Token
  3. Centang permission: ads_management
  4. Copy token di bawah

Kosongkan (Enter) untuk skip langkah ini.
""")

access_token  = getpass.getpass("Meta Access Token : ").strip()
ad_account_id = input("Ad Account ID     (contoh: act_123456789): ").strip()

if access_token and ad_account_id:
    if not ad_account_id.startswith("act_"):
        ad_account_id = f"act_{ad_account_id}"
    upload_all_to_meta(access_token, ad_account_id)
else:
    print("Step 2 dilewati.")
    print("Isi kolom Video ID / Image Hash di XLSX secara manual setelah upload ke Meta.")

print("\\nSelesai!")
`;
}
