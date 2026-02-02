import React from 'react';
import { Button } from '../../form-controls';

const AddTaskModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  value, 
  onChange, 
  title = "Add Custom Task",
  description = "List tasks by using a comma (,) between each one. e.g. Task 1, Task 2, Task 3",
  placeholder = "Enter Task",
  saveButtonText = "Add"
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    if (value.trim()) {
      onSave();
    } else {
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

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
        <p className="text-xs sm:text-sm text-primary-200 font-medium mb-4">
          {description}
        </p>
        
        <textarea
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          rows={1}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-full focus:outline-none text-xs sm:text-sm resize-none mb-4 sm:mb-6"
          autoFocus
        />
        
        <div className="flex gap-2 sm:gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="flex-1 text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            className="flex-1 bg-primary-500 text-white text-xs sm:text-sm"
          >
            {saveButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;

