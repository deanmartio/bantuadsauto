import AdRow from './AdRow';
import { Icon } from './ui';
import { getDuplicateAdNames } from '../utils/validation';

export default function AdTable({ adRows, ngoName, issues, showIssues, collapsedIds, onToggleCollapse, onUpdate, onDelete, onAdd }) {
  const duplicateNames = getDuplicateAdNames(adRows);

  return (
    <div className="flex flex-col gap-4">
      {adRows.map((row, i) => (
        <AdRow
          key={row.id}
          row={row}
          index={i}
          totalRows={adRows.length}
          ngoName={ngoName}
          isDuplicate={duplicateNames.has(row.adName.trim().toLowerCase())}
          issues={issues.filter(x => x.rowId === row.id)}
          showIssues={showIssues}
          collapsed={collapsedIds.has(row.id)}
          onToggleCollapse={() => onToggleCollapse(row.id)}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-brand/50 text-brand-deep font-semibold py-4 text-sm hover:bg-brand-tint hover:border-brand transition-colors duration-150"
      >
        <Icon name="plus" /> Tambah iklan
      </button>
    </div>
  );
}
