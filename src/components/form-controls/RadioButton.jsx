import React from 'react';

/**
 * Reusable Radio Button Component
 * 
 * @param {string} name - Name attribute for the radio button
 * @param {string} value - Value attribute for the radio button
 * @param {string} label - Label text for the radio button
 * @param {boolean} checked - Checked state
 * @param {function} onChange - Callback function when selection changes
 * @param {string} className - Additional CSS classes for the container
 * @param {string} labelClassName - Additional CSS classes for the label
 */
const RadioButton = ({ 
  name, 
  value, 
  label, 
  checked = false, 
  onChange, 
  className = "", 
  labelClassName = "",
  disabled = false
}) => {
  const id = `radio-${name}-${value}`;

  return (
    <label 
      htmlFor={id} 
      className={`flex items-center gap-2 cursor-pointer group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className={`w-5 h-5 border-2 rounded-full transition-all flex items-center justify-center
          ${checked 
            ? 'border-[#1F6FEB] bg-[#1F6FEB]' 
            : 'border-gray-300 bg-white group-hover:border-[#1F6FEB]'
          }`}
        >
          {checked && (
            <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
          )}
        </div>
      </div>
      <span className={`text-sm font-medium transition-colors 
        ${checked ? 'text-primary-600' : 'text-gray-500'} 
        ${labelClassName}`}
      >
        {label}
      </span>
    </label>
  );
};

export default RadioButton;
