import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

interface FieldWrapProps {
  label?: string;
  children: ReactNode;
  hint?: string;
}

function FieldWrap({ label, children, hint }: FieldWrapProps) {
  return (
    <label className="block mb-4">
      {label && (
        <span className="block text-ios-footnote font-medium text-surface-muted mb-2 px-1">
          {label}
        </span>
      )}
      {children}
      {hint && (
        <span className="block text-ios-caption text-surface-muted mt-2 px-1">
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * Input modern: permukaan bersih dengan border halus, bukan inset shadow.
 * Fokus ditandai dengan border accent + ring lembut — jelas tapi tidak berat.
 */
const baseInputClasses =
  "w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-card px-4 text-[16px] text-surface-text placeholder:text-surface-muted/70 shadow-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 hover:border-surface-border/80";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}
export function Input({ label, hint, className = "", ...rest }: InputProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <input className={`${baseInputClasses} ${className}`} {...rest} />
    </FieldWrap>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}
export function Select({
  label,
  hint,
  className = "",
  children,
  ...rest
}: SelectProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <select
        className={`${baseInputClasses} appearance-none cursor-pointer ${className}`}
        {...rest}
      >
        {children}
      </select>
    </FieldWrap>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}
export function Textarea({
  label,
  hint,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <FieldWrap label={label} hint={hint}>
      <textarea
        className={`${baseInputClasses} py-3.5 min-h-[112px] resize-none ${className}`}
        {...rest}
      />
    </FieldWrap>
  );
}
