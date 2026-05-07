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
import getpass

try:
    import gdown
    import requests
    import openpyxl
except ImportError:
    print("Install dulu: pip install gdown requests openpyxl")
    sys.exit(1)

NGO_NAME  = ${JSON.stringify(ngoName)}
DATE      = ${JSON.stringify(date)}
FOLDER    = f"{NGO_NAME}_creatives_{DATE}"
XLSX_FILE = ${JSON.stringify(xlsxFilename)}

CREATIVE_LIST = [
${listItems}
]

CHUNK_SIZE       = 4 * 1024 * 1024   # 4 MB per chunk
META_VIDEO_URL   = "https://graph-video.facebook.com/v21.0"
META_GRAPH_URL   = "https://graph.facebook.com/v21.0"


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


# ── STEP 2: Upload ke Meta Media Library ─────────────────────────────────────

def upload_video(filepath, filename, token, ad_account_id):
    """Resumable (chunked) upload — handles files of any size."""
    file_size = os.path.getsize(filepath)
    name      = os.path.splitext(filename)[0]

    # Phase 1: start session
    r = requests.post(f"{META_VIDEO_URL}/{ad_account_id}/advideos", data={
        'access_token': token, 'upload_phase': 'start',
        'file_size': file_size, 'name': name,
    }, timeout=30)
    d = r.json()
    if 'error' in d:
        raise Exception(d['error'].get('message', str(d['error'])))

    video_id         = d['video_id']
    session_id       = d['upload_session_id']
    start_offset     = int(d['start_offset'])
    end_offset       = int(d['end_offset'])

    # Phase 2: upload chunks
    with open(filepath, 'rb') as f:
        while start_offset < file_size:
            f.seek(start_offset)
            chunk = f.read(end_offset - start_offset)
            r = requests.post(f"{META_VIDEO_URL}/{video_id}", data={
                'access_token': token, 'upload_phase': 'transfer',
                'upload_session_id': session_id, 'start_offset': start_offset,
            }, files={'video_file_chunk': chunk}, timeout=300)
            d = r.json()
            if 'error' in d:
                raise Exception(d['error'].get('message', str(d['error'])))
            start_offset = int(d['start_offset'])
            end_offset   = int(d['end_offset'])
            pct = min(100, int(start_offset / file_size * 100))
            print(f"\\r  Uploading... {pct}%", end="", flush=True)

    # Phase 3: finish
    r = requests.post(f"{META_VIDEO_URL}/{video_id}", data={
        'access_token': token, 'upload_phase': 'finish',
        'upload_session_id': session_id,
    }, timeout=60)
    d = r.json()
    if not d.get('success'):
        raise Exception(str(d))

    print(f"\\r  Upload selesai (100%)        ")
    return f"v:{video_id}"


def upload_image(filepath, filename, token, ad_account_id):
    with open(filepath, 'rb') as f:
        r = requests.post(f"{META_GRAPH_URL}/{ad_account_id}/adimages",
            data={'access_token': token},
            files={filename: f}, timeout=120)
    d = r.json()
    images = d.get('images', {})
    if images:
        return list(images.values())[0].get('hash', '')
    raise Exception(str(d.get('error', d)))


def update_xlsx(filename_to_id):
    if not os.path.exists(XLSX_FILE):
        print(f"  '{XLSX_FILE}' tidak ditemukan di folder ini.")
        print("  Mapping ID (isi manual ke kolom Video ID / Image Hash di XLSX):")
        for fname, mid in filename_to_id.items():
            print(f"    {fname}  ->  {mid}")
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
    print(f"  {updated} baris diupdate. '{XLSX_FILE}' siap diimport ke Meta!")


def verify_token(token, ad_account_id):
    """Check token is a valid User token with ads_management access."""
    r = requests.get(f"{META_GRAPH_URL}/me", params={'access_token': token}, timeout=15)
    d = r.json()
    if 'error' in d:
        msg = d['error'].get('message', str(d['error']))
        raise Exception(f"Token tidak valid: {msg}")
    user_name = d.get('name', 'unknown')

    r2 = requests.get(f"{META_GRAPH_URL}/{ad_account_id}", params={
        'access_token': token, 'fields': 'name,account_status'
    }, timeout=15)
    d2 = r2.json()
    if 'error' in d2:
        msg = d2['error'].get('message', str(d2['error']))
        raise Exception(
            f"Ad Account tidak bisa diakses: {msg}\\n"
            "  Pastikan Ad Account ID benar dan token punya izin ads_management."
        )
    acct_name = d2.get('name', ad_account_id)
    print(f"  Token OK  → user: {user_name}")
    print(f"  Ad Account → {acct_name} ({ad_account_id})")


def upload_all(token, ad_account_id):
    if not ad_account_id.startswith('act_'):
        ad_account_id = f"act_{ad_account_id}"

    print("\\nMemverifikasi token...")
    try:
        verify_token(token, ad_account_id)
    except Exception as e:
        print(f"  ERROR: {e}")
        print("\\n  Tips jika ada error 'pages_manage_posts':")
        print("  → Kamu memakai Page Token, bukan User Token.")
        print("  → Di Graph API Explorer, pastikan dropdown kanan atas")
        print("    menampilkan 'User Token', bukan nama halaman Facebook.")
        print("  → Generate ulang token dengan hanya centang: ads_management")
        return

    all_files = [fn for _, fns, _ in CREATIVE_LIST for fn in fns]
    filename_to_id = {}

    for filename in all_files:
        filepath = os.path.join(FOLDER, filename)
        if not os.path.exists(filepath):
            print(f"  File tidak ditemukan, skip: {filename}")
            continue
        ext = os.path.splitext(filename)[1].lower()
        print(f"\\n[{filename}]")
        try:
            if ext == '.mp4':
                meta_id = upload_video(filepath, filename, token, ad_account_id)
            else:
                meta_id = upload_image(filepath, filename, token, ad_account_id)
            filename_to_id[filename] = meta_id
            print(f"  ID: {meta_id}")
        except Exception as e:
            print(f"  GAGAL: {e}")

    if filename_to_id:
        print(f"\\nMengupdate {XLSX_FILE}...")
        update_xlsx(filename_to_id)


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
    print(f"  {total} file berhasil didownload ke folder '{FOLDER}'.")
print("=" * 55)

print("""
Step 2: Upload ke Meta & isi Video ID di XLSX otomatis
  Butuh: Access Token (User Token) + Ad Account ID dari Meta.

  Cara dapat Access Token:
    1. Buka https://developers.facebook.com/tools/explorer
    2. Di dropdown KANAN ATAS — pilih app kamu
    3. PENTING: pastikan di bawahnya tertulis "User Token"
       (bukan nama halaman Facebook — itu Page Token, tidak bisa dipakai)
    4. Klik "Generate Access Token"
    5. Centang HANYA: ads_management → klik Generate
    6. Copy token-nya

  Ad Account ID: buka Ads Manager -> lihat URL -> angka setelah ?act=
    Contoh: https://adsmanager.facebook.com/...?act=123456789 -> ID-nya 123456789

  (Tekan Enter untuk skip dan isi Video ID manual nanti.)
""")

token         = getpass.getpass("Meta Access Token  : ").strip()
ad_account_id = input("Ad Account ID      : ").strip()

if token and ad_account_id:
    upload_all(token, ad_account_id)
else:
    print("Step 2 dilewati.")
    print(f"Upload video dari folder '{FOLDER}' ke Meta secara manual,")
    print("lalu isi kolom Video ID di XLSX sebelum import.")

print("\\nSelesai!")
`;
}
