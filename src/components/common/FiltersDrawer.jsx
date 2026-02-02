import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import Button from '../form-controls/Button';
import Calendar from '../form-controls/Calendar';
import Checkbox from '../form-controls/Checkbox';
import { X } from 'lucide-react';

const FiltersDrawer = ({
  open,
  onClose,
  categories,
  draftCategories,
  onToggleCategory,
  draftBondCleaning,
  onToggleBondCleaning,
  draftDate,
  onDateChange,
  onClear,
  onApply,
}) => {
  if (!open) return null;

  const handleDateChange = (value) => {
    if (!value) {
      onDateChange('');
      return;
    }

    const formatted = dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') : '';
    onDateChange(formatted);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/40 p-4 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white shadow-2xl rounded-2xl flex flex-col max-h-[calc(100vh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors rounded-full p-1"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Categories
            </p>
            <div className="mt-3 space-y-3">
              {categories.map((option) => (
                <div
                  key={option.id}
                  className="rounded-xl border border-transparent transition-colors cursor-pointer"
                  onClick={() => onToggleCategory(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleCategory(option.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center px-2 py-2">
                    <Checkbox
                      name={`filter-category-${option.id}`}
                      checked={draftCategories.includes(option.id)}
                      onChange={() => onToggleCategory(option.id)}
                      label={option.label}
                      className="items-center"
                      labelClassName="ml-3 text-sm text-gray-700 font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Bond Cleaning</p>
              <button
                type="button"
                onClick={onToggleBondCleaning}
                className={`relative inline-flex h-7 w-11 items-center rounded-full transition cursor-pointer ${
                  draftBondCleaning ? 'bg-[#1F6FEB]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    draftBondCleaning ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Date</p>
            <div className="rounded-2xl bg-gray-50 p-3">
              <Calendar
                value={draftDate}
                onChange={handleDateChange}
                disablePast={false}
                slotProps={{
                  textField: {
                    placeholder: 'Select date',
                    InputProps: {
                      className: 'rounded-xl bg-white',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            onClick={onClear}
            className="rounded-full bg-gray-100 text-sm font-semibold text-gray-600 py-2 hover:bg-gray-200"
          >
            Clear All
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            fullWidth
            onClick={onApply}
            className="rounded-full text-sm font-semibold hover:bg-[#1557c9] hover:shadow-md"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

FiltersDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  draftCategories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onToggleCategory: PropTypes.func.isRequired,
  draftBondCleaning: PropTypes.bool.isRequired,
  onToggleBondCleaning: PropTypes.func.isRequired,
  draftDate: PropTypes.string,
  onDateChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
};

FiltersDrawer.defaultProps = {
  draftDate: '',
};

export default FiltersDrawer;

