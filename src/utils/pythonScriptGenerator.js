import { buildCreativeFilename, getLocalDateString } from './driveUtils';

export function generatePythonScript(ngoName, adRows) {
  const date = getLocalDateString();

  const creativeList = [];
  adRows.forEach(row => {
    const filledCreatives = row.creatives.filter(c => c.link.trim());
    filledCreatives.forEach((creative, ci) => {
      const filename = buildCreativeFilename(row.adName, ci, filledCreatives.length, creative.type);
      creativeList.push([creative.link.trim(), filename]);
    });
  });

  const listItems = creativeList
    .map(([link, name]) => `    (${JSON.stringify(link)}, ${JSON.stringify(name)}),`)
    .join('\n');

  return `import os
import sys
import re
import shutil

try:
    import gdown
except ImportError:
    print("Install dulu: pip install gdown")
    sys.exit(1)

NGO_NAME = ${JSON.stringify(ngoName)}
DATE = ${JSON.stringify(date)}
FOLDER = f"{NGO_NAME}_creatives_{DATE}"

CREATIVE_LIST = [
${listItems}
]

def is_folder_link(link):
    return '/folders/' in link

os.makedirs(FOLDER, exist_ok=True)

errors = []

for drive_link, filename in CREATIVE_LIST:
    filepath = os.path.join(FOLDER, filename)

    if is_folder_link(drive_link):
        # --- Folder link: download all files inside the folder ---
        print(f"\\nLink folder terdeteksi untuk '{filename}'.")
        print("Mendownload semua file di dalam folder...")

        temp_dir = os.path.join(FOLDER, f"_tmp_{os.path.splitext(filename)[0]}")
        os.makedirs(temp_dir, exist_ok=True)

        try:
            gdown.download_folder(
                drive_link, output=temp_dir, quiet=False, remaining_ok=True
            )
        except Exception as e:
            print(f"  ERROR: {e}")
            errors.append(filename)
            shutil.rmtree(temp_dir, ignore_errors=True)
            continue

        files = sorted([
            f for f in os.listdir(temp_dir)
            if os.path.isfile(os.path.join(temp_dir, f)) and not f.startswith('.')
        ])

        if not files:
            print(f"  Tidak ada file yang berhasil didownload dari folder.")
            errors.append(filename)
        elif len(files) == 1:
            # Single file — rename to expected filename
            src = os.path.join(temp_dir, files[0])
            os.replace(src, filepath)
            print(f"  Disimpan sebagai '{filename}'")
        else:
            # Multiple files — rename sequentially using the base filename
            # e.g. Zakat.mp4 -> Zakat 1.mp4, Zakat 2.mp4, Zakat 3.mp4
            base, ext = os.path.splitext(filename)
            for i, f in enumerate(files, start=1):
                new_name = f"{base} {i}{ext}"
                dest = os.path.join(FOLDER, new_name)
                os.replace(os.path.join(temp_dir, f), dest)
                print(f"  Disimpan sebagai '{new_name}'")
            print(f"  {len(files)} file didownload dari folder.")

        shutil.rmtree(temp_dir, ignore_errors=True)

    else:
        # --- File link: download directly with expected filename ---
        print(f"Mendownload {filename}...", end=" ", flush=True)
        try:
            result = gdown.download(drive_link, filepath, quiet=False, fuzzy=True)
            if result:
                print(f"Selesai")
            else:
                print(f"GAGAL (cek apakah link sudah di-set 'Anyone with the link can view')")
                errors.append(filename)
        except Exception as e:
            print(f"ERROR: {e}")
            errors.append(filename)

print(f"\\n{'='*50}")
if errors:
    print(f"{len(errors)} file gagal didownload: {', '.join(errors)}")
    print("Pastikan semua link Google Drive sudah di-set ke 'Anyone with the link can view'.")
else:
    print(f"Semua file berhasil didownload ke folder '{FOLDER}'.")
    print("Zip folder ini lalu upload ke Meta Media Library.")
`;
}
