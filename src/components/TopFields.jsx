export default function TopFields({ ngoName, onChange }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
      <h2 className="text-lg font-bold text-[#2B2033] mb-4">Informasi Kampanye</h2>
      <div className="max-w-sm">
        <label className="block text-sm font-semibold text-[#2B2033] mb-1">
          Nama NGO <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={ngoName}
          onChange={e => onChange('ngoName', e.target.value)}
          placeholder="Contoh: Yayasan Peduli Anak"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2A9E99] focus:border-transparent"
        />
      </div>
    </div>
  );
}
