import { buildCreativeFilename, getLocalDateString } from './driveUtils';

export function generatePythonScript(ngoName, adRows) {
  const date = getLocalDateString();
  const folderName = `${ngoName}_creatives_${date}`;

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

try:
    import requests
except ImportError:
    print("Install dulu: pip install requests")
    sys.exit(1)

NGO_NAME = ${JSON.stringify(ngoName)}
DATE = ${JSON.stringify(date)}
FOLDER = f"{NGO_NAME}_creatives_{DATE}"

CREATIVE_LIST = [
${listItems}
]

def get_direct_url(drive_link):
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', drive_link)
    if not match:
        match = re.search(r'id=([a-zA-Z0-9_-]+)', drive_link)
    if not match:
        return drive_link
    file_id = match.group(1)
    return f"https://drive.google.com/uc?export=download&id={file_id}"

os.makedirs(FOLDER, exist_ok=True)

for drive_link, filename in CREATIVE_LIST:
    print(f"Mendownload {filename}...", end=" ")
    url = get_direct_url(drive_link)
    r = requests.get(url, stream=True)
    filepath = os.path.join(FOLDER, filename)
    with open(filepath, 'wb') as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
    print("Selesai")

print(f"\\nSemua {len(CREATIVE_LIST)} file berhasil didownload ke folder {FOLDER}.\\nZip folder ini lalu upload ke Meta Media Library.")
`;
}
