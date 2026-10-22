import type { ConversionOptions, ConverterOption } from '../types/converter';

interface OptionsFormProps {
  options: ConverterOption[];
  values: ConversionOptions;
  onChange: (values: ConversionOptions) => void;
}

export function OptionsForm({ options, values, onChange }: OptionsFormProps) {
  return (
    <div className="options">
      {options.map(({ id, label, input, min, max, step, unit }) => {
        const value = values[id];
        return (
          <label key={id} className="option">
            <span>
              {label}
              {unit ? ` (${unit})` : ''}
            </span>
            <input
              type={input}
              min={min}
              max={max}
              step={step}
              value={Number.isNaN(value) ? '' : value}
              onChange={(event) => onChange({ ...values, [id]: event.target.valueAsNumber })}
            />
            {input === 'range' && <output>{value}</output>}
          </label>
        );
      })}
    </div>
  );
}
