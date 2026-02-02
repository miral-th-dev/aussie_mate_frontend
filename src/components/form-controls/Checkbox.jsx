import React from 'react';
import checkboxIcon from '../../assets/checkbox.svg';

/**
 * Reusable Custom Checkbox Component
 * 
 * @param {string} name - Name attribute for the checkbox
 * @param {string} label - Label text for the checkbox (supports JSX)
 * @param {boolean} checked - Checked state
 * @param {function} onChange - Callback function when checkbox changes
 * @param {string} className - Additional CSS classes for the container
 * @param {string} checkboxSize - Size of checkbox (default: "w-5 h-5")
 * @param {string} labelClassName - Additional CSS classes for the label
 */
const Checkbox = ({ 
  name,
  label,
  checked = false,
  onChange,
  className = "",
  checkboxSize = "w-5 h-5",
  labelClassName = "text-sm text-[#374151] font-medium",
  required = false
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="relative flex-shrink-0 mt-1">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          required={required}
          className="sr-only peer"
          id={`checkbox-${name}`}
        />
        <label
          htmlFor={`checkbox-${name}`}
          className={`${checkboxSize} border-2 border-gray-300 rounded cursor-pointer flex items-center justify-center transition-all peer-checked:bg-[#1F6FEB] peer-checked:border-[#1F6FEB]`}
        >
          {checked && (
            <img src={checkboxIcon} alt="checked" className="w-3 h-3" />
          )}
        </label>
      </div>
      <label htmlFor={`checkbox-${name}`} className={`ml-3 cursor-pointer ${labelClassName}`}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;

