import type { Tx } from '../i18n';
import { useLang } from '../i18n';

export type Option<V> = { v: V; label: Tx | string; disabled?: boolean };

/** A row of toggle buttons (single choice). */
export function Seg<V extends string | number>({
  value, options, onChange, className = 'seg', label,
}: { value: V; options: Option<V>[]; onChange: (v: V) => void; className?: string; label?: string }) {
  const { t } = useLang();
  return (
    <div className={className} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          className={o.v === value ? 'on' : undefined}
          aria-pressed={o.v === value}
          disabled={o.disabled}
          onClick={() => !o.disabled && onChange(o.v)}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}
