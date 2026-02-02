import React from 'react';

/**
 * Reusable Radio Card Component
 * Large card-style radio button with icon, title, and subtitle
 * 
 * @param {string} id - Unique identifier for the radio option
 * @param {string} title - Main title text
 * @param {string} subtitle - Subtitle/description text
 * @param {string} icon - Icon image source
 * @param {boolean} selected - Whether this option is selected
 * @param {function} onSelect - Callback function when card is selected
 * @param {string} className - Additional CSS classes for the card
 */
const RadioCard = ({ 
  id,
  title,
  subtitle,
  icon,
  selected = false,
  onSelect,
  className = ""
}) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`w-full bg-[#EDEFF5] rounded-2xl p-4 sm:p-6 cursor-pointer transition-all duration-200 shadow-custom ${
        selected
          ? 'border-2 border-blue-200'
          : 'border-2 border-transparent hover:border-gray-200'
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <img
            src={icon}
            alt={title}
            className="w-20 h-20 sm:w-24 sm:h-24 object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {title}
              </h3>
              <p className="text-primary-200 text-sm sm:text-base mt-1 font-medium">
                {subtitle}
              </p>
            </div>
            {/* Custom Radio Button */}
            <div className="flex-shrink-0">
              <div
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selected
                    ? 'border-[#1F6FEB] bg-[#1F6FEB]'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {selected && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadioCard;

