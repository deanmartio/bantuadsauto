import { Label, FieldError } from './ui';
import { fieldId } from '../utils/validation';

export default function TopFields({ ngoName, onChange, error }) {
  return (
    <section className="card p-4 sm:p-5">
      <div className="max-w-md">
        <Label htmlFor={fieldId.ngoName()} required>Nama NGO</Label>
        <input
          id={fieldId.ngoName()}
          type="text"
          value={ngoName}
          onChange={e => onChange('ngoName', e.target.value)}
          placeholder="Contoh: Yayasan Peduli Anak"
          aria-invalid={Boolean(error) || undefined}
          className="field"
        />
        <FieldError>{error}</FieldError>
      </div>
    </section>
  );
}
