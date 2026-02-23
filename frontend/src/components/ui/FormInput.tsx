import { forwardRef } from 'react';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  rows?: number;
}

export const FormInput = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormInputProps>(
  ({ label, name, type = 'text', value, onChange, required = false, placeholder = '', error, rows }, ref) => {
    const isTextarea = rows !== undefined;
    const borderClass = error ? 'border-red-500' : 'border-gray-300';
    const inputClassName = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ' + borderClass;
    
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isTextarea ? (
          <textarea
            ref={ref as any}
            name={name}
            className={inputClassName}
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        ) : (
          <input
            ref={ref as any}
            name={name}
            type={type}
            className={inputClassName}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
