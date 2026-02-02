import React from 'react';

/**
 * Reusable Radio Button Group Component
 * 
 * @param {string} name - Name attribute for the radio group
 * @param {string} title - Title/heading for the radio group
 * @param {array} options - Array of options [{value: string, label: string}]
 * @param {string} selectedValue - Currently selected value
 * @param {function} onChange - Callback function when selection changes
 * @param {string} className - Additional CSS classes for the container
 * @param {string} gridCols - Grid columns class (default: "grid-cols-1 sm:grid-cols-2")
 */
const RadioButtonGroup = ({ 
  name,
  title,
  options = [],
  selectedValue,
  onChange,
  className = "",
  gridCols = "grid-cols-1 sm:grid-cols-2",
  disabled = false,
  optionClassName = "",
  optionLabelClassName = "text-gray-900 font-medium",
  getOptionClass,
  getOptionLabelClass
}) => {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-base font-semibold text-primary-500 mb-4">{title}</h3>
      )}
      <div className={`grid gap-6 sm:gap-4 ${gridCols}`}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          const baseClass = 'flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all flex-1';
          const defaultStateClass = isSelected
            ? 'border-[#1F6FEB] bg-blue-50'
            : 'border-gray-300 bg-white hover:bg-gray-50';
          const computedClass = getOptionClass
            ? `${baseClass} ${getOptionClass(option.value, isSelected)}`
            : `${baseClass} ${defaultStateClass} ${optionClassName}`;

          const labelBaseClass = optionLabelClassName;
          const computedLabelClass = getOptionLabelClass
            ? `${labelBaseClass} ${getOptionLabelClass(option.value, isSelected)}`
            : labelBaseClass;

          return (
            <label
              key={option.value}
              className={computedClass.trim()}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={onChange}
                disabled={disabled}
                className="w-5 h-5 flex-shrink-0 block accent-[#1F6FEB] cursor-pointer disabled:cursor-not-allowed"
              />
              <span className={`ml-3 ${computedLabelClass.trim()}`}>{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default RadioButtonGroup;

