import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'w-full px-4 py-2.5 text-sm font-sans text-ink bg-parchment',
          'border rounded-input outline-none transition-colors',
          error
            ? 'border-terracotta focus:border-terracotta'
            : 'border-cream-dark focus:border-ink',
          'placeholder:text-ink-light',
          className,
        ].join(' ')}
        {...props}
      />
      {error && (
        <p className="text-xs text-terracotta">{error}</p>
      )}
    </div>
  )
}
