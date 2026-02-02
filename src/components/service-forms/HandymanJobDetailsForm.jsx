import React, { useState, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Checkbox } from '../form-controls';
import AddTaskModal from './common/AddTaskModal';
import PlusIcon from '../../assets/plus2.svg';
import DeleteIcon from '../../assets/trash-red.svg';
import ServiceCommonSections from './common/ServiceCommonSections';

const createSelectionMap = (repairsArray = []) => {
  const map = {};
  repairsArray.forEach((repair) => {
    if (repair) {
      map[repair] = true;
    }
  });
  return map;
};

const HandymanJobDetailsForm = ({
  formData,
  onInputChange,
  selectedFiles = [],
  uploadError,
  onFileInputChange,
  onRemoveFile
}) => {
  const [customRequests, setCustomRequests] = useState(
    Array.isArray(formData.handymanCustomRequests) ? formData.handymanCustomRequests : []
  );
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestInput, setRequestInput] = useState('');
  const defaultServiceType = formData.handymanServiceType || 'Electrical Repairs';
  const [selectedServiceType, setSelectedServiceType] = useState(defaultServiceType);
  useEffect(() => {
    if (formData.handymanServiceType) {
      setSelectedServiceType(formData.handymanServiceType);
    }
  }, [formData.handymanServiceType]);

  useEffect(() => {
    if (!formData.handymanServiceType && defaultServiceType) {
      onInputChange('handymanServiceType', defaultServiceType);
    }
  }, [defaultServiceType, formData.handymanServiceType, onInputChange]);

  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);

  // Service types with their repair options
  const serviceTypes = {
    'Electrical Repairs': ['Switchboard Repair', 'Light / Fan Installation', 'Doorbell Fix', 'Minor Wiring Fix', 'Socket Replacement'],
    'Plumbing': ['Repair leaks', 'Taps replacement', 'Flush tank repair', 'Pipe fitting', 'Water pressure fix'],
    'Carpentry': ['Door repair', 'Furniture fixing', 'Shelf installation', 'Cabinet repair', 'Wooden structure fix'],
    'Wall & Painting Jobs': ['Wall touch-ups', 'Wall hanging', 'Paint fixing', 'Wall patch repair', 'Color matching'],
    'Appliance Mounting': ['TV mounting', 'AC installation', 'Geyser mounting', 'Fan installation', 'Security system installation'],
    'Miscellaneous Jobs': ['Minor fixes', 'General adjustments', 'Quick repairs', 'Assembly jobs', 'Other services']
  };

  const predefinedRepairs = serviceTypes[selectedServiceType] || [];

  useEffect(() => {
    if (!formData.handymanServiceType && defaultServiceType) {
      onInputChange('handymanServiceType', defaultServiceType);
    }
  }, [defaultServiceType, formData.handymanServiceType, onInputChange]);

  const [selectedRepairs, setSelectedRepairs] = useState(() =>
    createSelectionMap(Array.isArray(formData.handymanSelectedRepairs) ? formData.handymanSelectedRepairs : [])
  );

  useEffect(() => {
    if (Array.isArray(formData.handymanSelectedRepairs)) {
      setSelectedRepairs(createSelectionMap(formData.handymanSelectedRepairs));
    }
  }, [formData.handymanSelectedRepairs]);

  useEffect(() => {
    if (Array.isArray(formData.handymanCustomRequests)) {
      setCustomRequests(formData.handymanCustomRequests);
    }
  }, [formData.handymanCustomRequests]);

  const handleRepairToggle = (repair) => {
    setSelectedRepairs((prev) => {
      const next = {
        ...prev,
        [repair]: !prev[repair]
      };
      const selectedList = Object.keys(next).filter((key) => next[key]);
      onInputChange('handymanSelectedRepairs', selectedList);
      return next;
    });
  };

  const handleAddCustomRequest = () => {
    setShowRequestModal(true);
  };

  const handleCloseRequestModal = () => {
    setShowRequestModal(false);
    setRequestInput('');
  };

  const handleRequestInputChange = (e) => {
    const value = e.target.value;
    setRequestInput(value);

    if (value.includes(',')) {
      const requests = value.split(',').map(request => request.trim()).filter(request => request);
      if (requests.length > 0) {
        setCustomRequests((prev) => {
          const updated = [...prev, ...requests];
          onInputChange('handymanCustomRequests', updated);
          return updated;
        });
        const lastPart = value.split(',').pop().trim();
        setRequestInput(lastPart);
      }
    }
  };

  const handleSaveRequests = () => {
    if (requestInput.trim()) {
      setCustomRequests((prev) => {
        const updated = [...prev, requestInput.trim()];
        onInputChange('handymanCustomRequests', updated);
        return updated;
      });
      setRequestInput('');
      setShowRequestModal(false);
    } else {
      setShowRequestModal(false);
    }
  };

  const handleRemoveRequest = (index) => {
    setCustomRequests((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      onInputChange('handymanCustomRequests', updated);
      return updated;
    });
  };

  const handleServiceTypeSelect = (serviceType) => {
    setSelectedServiceType(serviceType);
    setIsServiceDropdownOpen(false);
    setSelectedRepairs({});
    onInputChange('handymanSelectedRepairs', []);
    onInputChange('handymanServiceType', serviceType);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.service-dropdown')) {
        setIsServiceDropdownOpen(false);
      }
    };

    if (isServiceDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServiceDropdownOpen]);

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Service Selection Section */}
      <div>
        <h2 className="text-base sm:text-lg font-medium text-primary-500 mb-2">
          What type of service do you need?
        </h2>
        <p className="text-xs sm:text-sm text-primary-200 font-medium mb-4">
          Any job. Any time. The right help, fast.
        </p>
        <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Services
        </label>
        <div className="relative service-dropdown">
          <button
            type="button"
            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 flex items-center justify-between cursor-pointer"
          >
            <span>{selectedServiceType}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {/* Dropdown */}
          {isServiceDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {Object.keys(serviceTypes).map((serviceType, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleServiceTypeSelect(serviceType)}
                  className="w-full px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm lg:text-base hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-primary-500">{serviceType}</span>
                  {selectedServiceType === serviceType && (
                    <Check className="w-4 h-4 text-primary-500" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Repairs Section */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-base font-medium text-primary-500">{selectedServiceType}</h2>
          <button
            type="button"
            onClick={handleAddCustomRequest}
            className="flex items-center gap-1 sm:gap-2 text-primary-600 font-medium cursor-pointer text-xs sm:text-sm"
          >
            <img src={PlusIcon} alt="Add" className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Add Custom Request</span>
            <span className="sm:hidden">Add Request</span>
          </button>
        </div>

        {/* Predefined Repairs Checkboxes */}
        <div className="space-y-3">
          {predefinedRepairs.map((repair, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              className="flex items-center cursor-pointer focus:outline-none"
              onClick={(e) => {
                if (e.target.closest('input') || e.target.closest('label')) return;
                handleRepairToggle(repair);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleRepairToggle(repair);
                }
              }}
            >
              <Checkbox
                name={`repair-${index}`}
                checked={selectedRepairs[repair] || false}
                onChange={() => handleRepairToggle(repair)}
                label={repair}
                className="items-center"
                labelClassName="ml-3 text-xs sm:text-sm lg:text-base text-primary-500 font-medium"
                checkboxSize="w-4 h-4 sm:w-5 sm:h-5"
              />
            </div>
          ))}
        </div>

        {/* Display Added Custom Requests */}
        {customRequests.length > 0 && (
          <div className="mt-4 space-y-2">
            {customRequests.map((request, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs sm:text-sm text-primary-500 font-medium pr-2 break-words flex-1">{request}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequest(index)}
                  className="text-red-500 hover:text-red-600 cursor-pointer flex-shrink-0"
                >
                  <img src={DeleteIcon} alt="Delete" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions Section */}
      <ServiceCommonSections
        fileUploadProps={{
          fieldName: 'handyman-files',
          title: 'Upload Photos',
          description: 'Optional — share reference photos or documents to help your handyman prepare.',
          placeholder: 'Select files to upload',
          onFileSelect: (event) => {
            if (event?.target?.files?.length) {
              onFileInputChange?.(event);
            }
          },
          selectedFile: selectedFiles?.[0],
          accept: 'image/*',
          multiple: true
        }}
        uploadError={uploadError}
        selectedFiles={selectedFiles}
        onRemoveFile={onRemoveFile}
        instructionsTitle="Task Instructions & Special Requirements"
        instructionsValue={formData.instructions || ''}
        onInstructionsChange={(value) => onInputChange('instructions', value)}
        instructionsPlaceholder="Write your instructions here...."
      />

      {/* Add Request Modal */}
      <AddTaskModal
        isOpen={showRequestModal}
        onClose={handleCloseRequestModal}
        onSave={handleSaveRequests}
        value={requestInput}
        onChange={handleRequestInputChange}
        title="Add Custom Request"
        description="List requests by using a comma (,) between each one. e.g. Request 1, Request 2, Request 3"
        placeholder="Enter Request"
        saveButtonText="Add"
      />
    </div>
  );
};

export default HandymanJobDetailsForm;

