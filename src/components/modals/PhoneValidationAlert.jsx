import React, { useEffect } from 'react';
import InfoIcon from '../../assets/info.svg';
import CloseIcon from '../../assets/close.svg';

const PhoneValidationAlert = ({ error, onClose, isVisible }) => {
  // Prevent body scroll when alert is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  if (!isVisible || !error) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40"  
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      ></div>
      
      {/* Alert Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg mx-2 xs:mx-4">
        <div className="bg-white rounded-xl xs:rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3">
                <div>
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold text-primary-500 leading-tight">
                    Phone Number Detected
                  </h3>
                  <p className="text-primary-200 font-medium text-xs xs:text-xs sm:text-sm leading-tight">
                    Security Alert
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-500 transition-colors p-0.5 xs:p-1 cursor-pointer touch-manipulation"
              >
                <img src={CloseIcon} alt="Close" className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-3 xs:px-4 sm:px-6 py-3 xs:py-4 sm:py-6">
            <div className="flex items-start space-x-2 xs:space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="p-1 xs:p-1.5 sm:p-2">
                <img src={InfoIcon} alt="Info" className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-primary-500 text-xs xs:text-sm sm:text-base leading-relaxed mb-2 xs:mb-3 sm:mb-4">
                  {error}
                </p>
              </div>    
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 flex items-center justify-end">
            <button
              onClick={onClose}
              className="bg-red-500 px-3 xs:px-4 sm:px-6 py-1.5 xs:py-2 rounded-lg font-medium transition-colors focus:outline-none text-red-500 border border-red-500 cursor-pointer text-xs xs:text-sm sm:text-base touch-manipulation min-h-[36px] xs:min-h-[40px]"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhoneValidationAlert;
