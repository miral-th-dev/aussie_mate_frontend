import React from 'react';
import { Button } from '../../form-controls';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "Alert",
  message,
  buttonText = "OK"
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg sm:rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base sm:text-xl font-semibold text-primary-500 mb-2">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="primary"
            onClick={onClose}
            className="bg-primary-500 text-white text-xs sm:text-sm px-4 py-2"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;

