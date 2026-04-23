import AdRow from './AdRow';
import { getDuplicateAdNames } from '../utils/validation';

export default function AdTable({ adRows, onUpdate, onDelete, onAdd }) {
  const duplicateNames = getDuplicateAdNames(adRows);

  return (
    <div>
      {adRows.map((row, i) => (
        <AdRow
          key={row.id}
          row={row}
          index={i}
          totalRows={adRows.length}
          isDuplicate={duplicateNames.has(row.adName.trim().toLowerCase())}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="w-full border-2 border-dashed border-[#2A9E99] text-[#2A9E99] font-semibold rounded-2xl py-3 text-sm hover:bg-teal-50 transition-colors"
      >
        + Tambah Iklan
      </button>
    </div>
  );
}
