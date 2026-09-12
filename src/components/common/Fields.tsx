import { useState } from "react";
import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock } from "@fortawesome/free-solid-svg-icons";

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

const baseInputClasses =
  "w-full min-h-[48px] rounded-2xl border border-surface-border bg-surface-card px-4 text-[16px] text-surface-text placeholder:text-surface-muted/50 shadow-sm transition-all duration-200 focus:outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 hover:border-surface-border/80";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export function Input({
  label,
  hint,
  className = "",
  type,
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <FieldWrap label={label} hint={hint}>
      <div className="relative">
        {isPassword && (
          <FontAwesomeIcon
            icon={faLock}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-muted pointer-events-none text-[16px] z-[1]"
          />
        )}

        <input
          {...rest}
          type={inputType}
          className={`${baseInputClasses} ${
            isPassword ? "pl-10 pr-12" : ""
          } ${className}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={
              showPassword ? "Sembunyikan password" : "Tampilkan password"
            }
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-surface-muted transition-colors hover:bg-surface-card2 hover:text-surface-text"
          >
            <FontAwesomeIcon
              icon={showPassword ? faEyeSlash : faEye}
              className="text-[16px]"
            />
          </button>
        )}
      </div>
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
