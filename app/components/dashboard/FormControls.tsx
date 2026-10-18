export function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  hint,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
      />
      {hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  );
}

export function FormActions({
  saving,
  onCancel,
  label,
}: {
  saving: boolean;
  onCancel: () => void;
  label: string;
}) {
  return (
    <div className="form-actions">
      <button type="button" onClick={onCancel} className="secondary-button">
        Cancelar
      </button>
      <button type="submit" disabled={saving} className="primary-button">
        {saving ? "Salvando…" : label}
      </button>
    </div>
  );
}
