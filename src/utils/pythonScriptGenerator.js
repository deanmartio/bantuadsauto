import { getExpandedCreatives, getLocalDateString } from './driveUtils';

export function generatePythonScript(ngoName, adRows) {
  const date = getLocalDateString();

  // Build a grouped list: folder links are grouped so the same folder isn't downloaded twice.
  // Each entry: { link, filenames: [], isFolder }
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

try:
    import gdown
except ImportError:
    print("Install dulu: pip install gdown")
    sys.exit(1)

NGO_NAME = ${JSON.stringify(ngoName)}
DATE = ${JSON.stringify(date)}
FOLDER = f"{NGO_NAME}_creatives_{DATE}"

# Each entry: (drive_link, [expected_filenames], is_folder)
CREATIVE_LIST = [
${listItems}
]

os.makedirs(FOLDER, exist_ok=True)

errors = []

for drive_link, filenames, is_folder in CREATIVE_LIST:

    if is_folder:
        print(f"\\nLink folder terdeteksi. Mendownload {len(filenames)} file dari folder...")

        temp_dir = os.path.join(FOLDER, f"_tmp_{filenames[0].replace('.', '_')}")
        os.makedirs(temp_dir, exist_ok=True)

        try:
            gdown.download_folder(
                drive_link, output=temp_dir, quiet=False, remaining_ok=True
            )
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
            print(f"  Tidak ada file yang berhasil didownload.")
            errors.extend(filenames)
        else:
            for i, expected_name in enumerate(filenames):
                if i < len(downloaded):
                    src = os.path.join(temp_dir, downloaded[i])
                    dest = os.path.join(FOLDER, expected_name)
                    os.replace(src, dest)
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
                print("GAGAL (cek apakah link sudah di-set 'Anyone with the link can view')")
                errors.append(filename)
        except Exception as e:
            print(f"ERROR: {e}")
            errors.append(filename)

print(f"\\n{'='*50}")
if errors:
    print(f"{len(errors)} file gagal: {', '.join(errors)}")
    print("Pastikan semua link Google Drive sudah di-set ke 'Anyone with the link can view'.")
else:
    total = sum(len(item[1]) for item in CREATIVE_LIST)
    print(f"Semua {total} file berhasil didownload ke folder '{FOLDER}'.")
    print("Zip folder ini lalu upload ke Meta Media Library.")
`;
}
