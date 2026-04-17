import React from "react";

const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required,
  placeholder,
  hint,
  ...rest
}) => {
  const isTextarea = type === "textarea";

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    text-slate-900 dark:text-white
    placeholder:text-slate-400 dark:placeholder:text-gray-600
    ${
      error
        ? "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-900/10"
        : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-[#0a0a0a] dark:hover:border-white/20"
    }`;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-slate-700 dark:text-gray-400"
        >
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      {isTextarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${inputClass} resize-none`}
          rows={3}
          {...rest}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          {...rest}
        />
      )}
      {hint && !error && (
        <p className="text-xs text-slate-400 dark:text-gray-600">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormField;
