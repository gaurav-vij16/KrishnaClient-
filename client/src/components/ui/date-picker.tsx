import { Input } from './input';
export function DatePicker({
  label,
  containerClassName = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  containerClassName?: string;
}) {
  return (
    <label
      className={`block text-sm font-semibold text-stone-700 ${containerClassName}`}
    >
      {label}
      <Input
        {...props}
        type={props.type ?? 'date'}
        className={`mt-1.5 ${props.className ?? ''}`}
      />
    </label>
  );
}
