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

try:
    import gdown
    import openpyxl
except ImportError:
    print("Install dulu: pip install gdown openpyxl")
    sys.exit(1)

NGO_NAME  = ${JSON.stringify(ngoName)}
DATE      = ${JSON.stringify(date)}
FOLDER    = f"{NGO_NAME}_creatives_{DATE}"
XLSX_FILE = ${JSON.stringify(xlsxFilename)}

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


# ── STEP 2: Kumpulkan Video ID / Image Hash & update XLSX ────────────────────

def collect_ids_and_update():
    all_files = [fn for _, fns, _ in CREATIVE_LIST for fn in fns]
    videos  = [f for f in all_files if f.lower().endswith('.mp4')]
    images  = [f for f in all_files if not f.lower().endswith('.mp4')]

    filename_to_id = {}

    if videos:
        print("\\nUPLOAD VIDEO ke Meta Media Library:")
        print("  Buka Ads Manager → hamburger menu → Media Library → Upload")
        print("  Upload semua file .mp4 dari folder berikut:")
        print(f"  📁 {os.path.abspath(FOLDER)}\\n")
        for filename in videos:
            filepath = os.path.join(FOLDER, filename)
            size_mb  = os.path.getsize(filepath) / 1024 / 1024 if os.path.exists(filepath) else 0
            print(f"  [{filename}]  ({size_mb:.1f} MB)")
            vid = input(f"    Paste Video ID (format v:XXXXXXXXX, Enter=skip): ").strip()
            if vid:
                if not vid.startswith('v:'):
                    vid = f"v:{vid}"
                filename_to_id[filename] = vid

    if images:
        print("\\nUPLOAD GAMBAR ke Meta Media Library:")
        for filename in images:
            filepath = os.path.join(FOLDER, filename)
            size_mb  = os.path.getsize(filepath) / 1024 / 1024 if os.path.exists(filepath) else 0
            print(f"  [{filename}]  ({size_mb:.1f} MB)")
            h = input(f"    Paste Image Hash (Enter=skip): ").strip()
            if h:
                filename_to_id[filename] = h

    if not filename_to_id:
        print("\\nTidak ada ID yang dimasukkan. XLSX tidak diupdate.")
        print(f"Isi kolom Video ID / Image Hash di '{XLSX_FILE}' secara manual.")
        return

    if not os.path.exists(XLSX_FILE):
        print(f"\\n'{XLSX_FILE}' tidak ditemukan di folder ini.")
        print("Pastikan file XLSX ada di folder yang sama dengan script ini.")
        print("\\nMapping ID yang sudah dikumpulkan:")
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

print("""
Step 2: Upload ke Meta Media Library & catat Video ID
  Script ini akan memandu kamu satu per satu.
  Setelah upload tiap video di Meta, paste Video ID-nya di sini.
  Video ID bisa dilihat di Media Library → klik video → detail panel.

  (Tekan Enter langsung untuk skip dan isi XLSX manual nanti.)
""")

ans = input("Lanjut ke Step 2? (y/Enter=skip): ").strip().lower()
if ans == 'y':
    print("\\nMembuka Meta Media Library di browser...")
    webbrowser.open("https://adsmanager.facebook.com/adsmanager/manage/images")
    print("Upload semua file .mp4 dari folder berikut:")
    print(f"  📁 {os.path.abspath(FOLDER)}")
    print("Setelah selesai upload, kembali ke sini dan masukkan Video ID-nya.\\n")
    input("Tekan Enter setelah semua video selesai diupload...")
    collect_ids_and_update()
else:
    print(f"\\nSkip. Upload file dari folder '{FOLDER}' ke Meta secara manual,")
    print(f"lalu isi kolom Video ID di '{XLSX_FILE}' sebelum import.")

print("\\nSelesai!")
`;
}
