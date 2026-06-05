export default function DriveGuideModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(43,32,51,0.55)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Panduan: Upload Link Google Drive</h2>
              <p className="text-white/75 text-xs mt-1">
                Pastikan file atau folder kamu sudah diatur dengan benar sebelum mengisi form.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/70 hover:text-white ml-4 mt-0.5 shrink-0 text-xl leading-none font-light"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5">

          {/* Rule 0: Share setting */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-bold text-blue-700 mb-1.5 uppercase tracking-wide">Sebelum Mulai — Wajib</p>
            <p className="text-sm text-blue-800 font-semibold mb-1">
              Pastikan setiap file & folder sudah di-share ke "Anyone with the link"
            </p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Klik kanan file/folder di Google Drive → <span className="font-semibold">Share</span> →
              klik <span className="font-semibold">"Change to Anyone with the link"</span> → Copy link.
              Tanpa ini, script tidak bisa mendownload file.
            </p>
          </div>

          {/* Option 1: Single file */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#2A9E99] text-white text-xs font-bold flex items-center justify-center shrink-0">1</span>
              <p className="text-sm font-bold text-[#2B2033]">Link ke satu file langsung</p>
              <span className="text-[10px] font-bold text-[#2A9E99] border border-[#2A9E99] rounded-full px-2 py-0.5">Paling Simpel</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 ml-8">
              <p className="text-xs text-gray-600 mb-2 leading-relaxed">
                Gunakan ini jika satu iklan hanya punya <span className="font-semibold">satu video atau satu gambar</span>.
                Share file-nya langsung dan copy linknya.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-md">✓ drive.google.com/file/d/…</span>
              </div>
              <p className="text-[10.5px] text-gray-400 mt-2">Pilih tipe "Video" atau "Gambar" sesuai isi file.</p>
            </div>
          </div>

          {/* Option 2: Folder */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-[#8A59B3] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <p className="text-sm font-bold text-[#2B2033]">Link ke folder berisi beberapa file</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 ml-8 space-y-2.5">
              <p className="text-xs text-gray-600 leading-relaxed">
                Gunakan ini jika satu iklan punya <span className="font-semibold">beberapa video/gambar sekaligus</span> —
                misalnya 3 versi video berbeda.
              </p>

              {/* Do */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
                <p className="text-[10.5px] font-bold text-green-700 mb-1">✓ Cara yang benar:</p>
                <ul className="text-[10.5px] text-green-700 space-y-0.5 leading-relaxed">
                  <li>• Buat <span className="font-semibold">satu folder khusus</span> untuk iklan ini</li>
                  <li>• Isi folder hanya dengan file video/gambar yang siap tayang</li>
                  <li>• <span className="font-semibold">Tidak ada sub-folder di dalamnya</span></li>
                  <li>• Share folder tersebut dan copy linknya</li>
                  <li>• Isi "Jumlah file" sesuai berapa file yang ada di dalam folder</li>
                </ul>
              </div>

              {/* Don't */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-2.5">
                <p className="text-[10.5px] font-bold text-red-600 mb-1">✗ Jangan lakukan ini:</p>
                <ul className="text-[10.5px] text-red-600 space-y-0.5 leading-relaxed">
                  <li>• Folder yang berisi <span className="font-semibold">shortcut</span> ke file (bukan file aslinya)</li>
                  <li>• Folder yang berisi folder lain di dalamnya</li>
                  <li>• Folder "master" yang isinya campuran banyak iklan/kampanye</li>
                  <li>• File yang masih draft atau belum final</li>
                  <li>• Folder kosong atau berisi file yang tidak relevan</li>
                </ul>
              </div>

              {/* Shortcut warning */}
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-2.5">
                <p className="text-[10.5px] font-bold text-amber-700 mb-1">⚠️ Perhatian khusus: Shortcut Google Drive</p>
                <p className="text-[10.5px] text-amber-700 leading-relaxed">
                  Shortcut adalah "alias" yang menunjuk ke file di tempat lain — tampilannya mirip file biasa tapi <span className="font-semibold">tidak bisa didownload oleh script</span>.
                  Pastikan file yang ada di folder adalah <span className="font-semibold">file asli</span>, bukan shortcut.
                  Cara cek: klik kanan file di Google Drive → jika ada opsi "Show original location", berarti itu shortcut.
                </p>
              </div>

              <p className="text-[10.5px] text-gray-500 leading-relaxed">
                📌 Script akan mendownload file <span className="font-semibold">sesuai urutan nama</span> di Google Drive.
                Pastikan urutan nama file sudah benar sebelum submit.
              </p>
            </div>
          </div>

          {/* Visual diagram */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Contoh Struktur Folder yang Benar</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-green-700 mb-2">✓ BENAR</p>
                <div className="font-mono text-[10px] text-green-800 space-y-1 leading-relaxed">
                  <p>📁 Adek_Rara/</p>
                  <p className="pl-4">🎬 video_1.mp4</p>
                  <p className="pl-4">🎬 video_2.mp4</p>
                  <p className="pl-4">🎬 video_3.mp4</p>
                </div>
                <p className="text-[9.5px] text-green-600 mt-2">Folder isinya langsung file → isi "3 file"</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-[10px] font-bold text-red-600 mb-2">✗ SALAH</p>
                <div className="font-mono text-[10px] text-red-700 space-y-1 leading-relaxed">
                  <p>📁 Semua_Iklan/</p>
                  <p className="pl-4">📁 Adek_Rara/</p>
                  <p className="pl-8">🎬 video_1.mp4</p>
                  <p className="pl-4">📁 Pak_Sani/</p>
                  <p className="pl-8">🎬 video_1.mp4</p>
                </div>
                <p className="text-[9.5px] text-red-600 mt-2">Folder berisi folder lain → tidak bisa diproses</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full font-bold rounded-xl py-2.5 text-sm text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #2A9E99, #8A59B3)' }}
          >
            Mengerti, Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
}
