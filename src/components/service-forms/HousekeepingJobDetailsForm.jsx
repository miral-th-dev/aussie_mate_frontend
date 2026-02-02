import React, { useEffect, useRef, useState } from 'react';
import AddTaskModal from './common/AddTaskModal';
import { Checkbox } from '../form-controls';
import ServiceCommonSections from './common/ServiceCommonSections';
import plusIcon from '../../assets/plus2.svg';
import arrowDownIcon from '../../assets/down2.svg';

const HousekeepingJobDetailsForm = ({
  formData,
  onInputChange,
  selectedFiles = [],
  onFileInputChange,
  onRemoveFile
}) => {
  const [selectedServices, setSelectedServices] = useState(formData.housekeepingServiceType || []);
  const [customServices, setCustomServices] = useState([]);
  const [frequency, setFrequency] = useState(formData.frequency || 'One-time');
  const [preferredDays, setPreferredDays] = useState(formData.preferredDays || {});
  const [customDates, setCustomDates] = useState(formData.customDates || []);
  const [repeatWeeks, setRepeatWeeks] = useState(formData.repeatWeeks || '');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(false);

  const serviceTypeRef = useRef(null);

  // Housekeeping Service Type Options
  const housekeepingServiceOptions = [
    'Vacuuming',
    'Mopping',
    'Dusting',
    'Wiping Down',
    'Rubbish Disposal',
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceTypeRef.current && !serviceTypeRef.current.contains(event.target)) {
        setIsServiceTypeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData.frequency) {
      setFrequency(formData.frequency);
    }
  }, [formData.frequency]);

  useEffect(() => {
    if (formData.preferredDays) {
      setPreferredDays(formData.preferredDays);
    }
  }, [formData.preferredDays]);

  useEffect(() => {
    if (formData.customDates) {
      setCustomDates(formData.customDates);
    }
  }, [formData.customDates]);

  useEffect(() => {
    if (formData.repeatWeeks) {
      setRepeatWeeks(formData.repeatWeeks);
    }
  }, [formData.repeatWeeks]);

  useEffect(() => {
    if (Array.isArray(formData.housekeepingServiceType)) {
      setSelectedServices(formData.housekeepingServiceType);
    }
  }, [formData.housekeepingServiceType]);

  // Handle housekeeping service type toggle (multi-select)
  const handleServiceTypeToggle = (option) => {
    let updatedServices;
    if (selectedServices.includes(option)) {
      updatedServices = selectedServices.filter(service => service !== option);
    } else {
      updatedServices = [...selectedServices, option];
    }
    setSelectedServices(updatedServices);
    onInputChange('housekeepingServiceType', updatedServices);
  };

  // Handle custom service addition
  const handleOpenServiceModal = () => {
    setIsServiceTypeOpen(false);
    setShowServiceModal(true);
  };

  const handleCloseServiceModal = () => {
    setShowServiceModal(false);
    setNewServiceInput('');
  };

  const handleNewServiceInputChange = (e) => {
    setNewServiceInput(e.target.value);
  };

  const handleSaveNewService = () => {
    if (newServiceInput.trim()) {
      const serviceList = newServiceInput.split(',').map(s => s.trim()).filter(s => s);
      const newServices = [...serviceList];

      // Add to custom services and selected services
      const updatedCustomServices = [
        ...customServices,
        ...newServices.filter(
          s => !housekeepingServiceOptions.includes(s) && !customServices.includes(s)
        )
      ];
      setCustomServices(updatedCustomServices);

      const updatedSelectedServices = [...selectedServices, ...newServices];
      setSelectedServices(updatedSelectedServices);
      onInputChange('housekeepingServiceType', updatedSelectedServices);

      setNewServiceInput('');
      setShowServiceModal(false);
    } else {
      setShowServiceModal(false);
    }
  };

  // Handle remove selected service
  const handleRemoveService = (serviceToRemove) => {
    const updatedServices = selectedServices.filter(service => service !== serviceToRemove);
    setSelectedServices(updatedServices);
    onInputChange('housekeepingServiceType', updatedServices);
  };

  // Handle frequency change
  const handleFrequencyChange = (option) => {
    setFrequency(option);
    onInputChange('frequency', option);
  };

  // Handle preferred days change
  const handlePreferredDaysChange = (days) => {
    setPreferredDays(days);
    onInputChange('preferredDays', days);
  };

  // Handle custom dates change
  const handleCustomDatesChange = (dates) => {
    setCustomDates(dates);
    onInputChange('customDates', dates);
  };

  const handleRepeatWeeksChange = (value) => {
    setRepeatWeeks(value);
    onInputChange('repeatWeeks', value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Housekeeping Service Section */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Housekeeping
        </h2>
        <p className="text-sm sm:text-base text-primary-200 font-medium mb-4 sm:mb-6">
          Select the housekeeping service you need.
        </p>
        {/* Housekeeping Service Type Dropdown */}
        <div className="relative" ref={serviceTypeRef}>
          <div
            onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
            className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer hover:border-primary-500 transition-colors mb-4"
          >
            <span className={selectedServices.length > 0 ? 'text-primary-500' : 'text-gray-400'}>
              {selectedServices.length > 0
                ? `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} selected`
                : 'Housekeeping service type'}
            </span>
            <img
              src={arrowDownIcon}
              alt="Dropdown"
              className={`w-5 h-5 transition-transform ${isServiceTypeOpen ? 'rotate-180' : ''}`}
            />
          </div>
          {isServiceTypeOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {/* Default Service Options with Checkboxes */}
              {housekeepingServiceOptions.map((option) => (
                <div
                  key={option}
                  role="button"
                  tabIndex={0}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary-200 text-sm sm:text-base font-medium focus:outline-none focus:bg-gray-100"
                  onClick={(e) => {
                    if (e.target.closest('input') || e.target.closest('label')) return;
                    handleServiceTypeToggle(option);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleServiceTypeToggle(option);
                    }
                  }}
                >
                  <Checkbox
                    name={`housekeeping-option-${option}`}
                    checked={selectedServices.includes(option)}
                    onChange={() => handleServiceTypeToggle(option)}
                    label={option}
                    className="items-center"
                    labelClassName="ml-3 text-sm sm:text-base text-primary-500 font-medium"
                    checkboxSize="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>
              ))}

              {/* Custom Services with Checkboxes */}
              {customServices.map((service) => (
                <div
                  key={service}
                  role="button"
                  tabIndex={0}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary-200 text-sm sm:text-base font-medium focus:outline-none focus:bg-gray-100"
                  onClick={(e) => {
                    if (e.target.closest('input') || e.target.closest('label')) return;
                    handleServiceTypeToggle(service);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleServiceTypeToggle(service);
                    }
                  }}
                >
                  <Checkbox
                    name={`housekeeping-custom-${service}`}
                    checked={selectedServices.includes(service)}
                    onChange={() => handleServiceTypeToggle(service)}
                    label={service}
                    className="items-center"
                    labelClassName="ml-3 text-sm sm:text-base text-primary-500 font-medium"
                    checkboxSize="w-4 h-4 sm:w-5 sm:h-5"
                  />
                </div>
              ))}

              {/* Add New Service Option */}
              <div
                onClick={handleOpenServiceModal}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-primary-600 font-medium text-sm sm:text-base border-t border-gray-200"
              >
                <img src={plusIcon} alt="Add" className="w-4 h-4 mr-2" />
                <span >Add New Service</span>
              </div>
            </div>
          )}
        </div>

        {/* Selected Services Display */}
        {selectedServices.length > 0 && (
          <div className="🎗️ flex flex-wrap gap-2">
            {selectedServices.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5  bg-blue-50 border border-blue-200 rounded-lg text-primary-600"
              >
                <span className="text-sm text-primary-700 font-medium experimentation">{service}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(service)}
                  className="text-primary-600 hover:text-primary-800 cursor-pointer"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ServiceCommonSections
        frequencyProps={{
          frequency,
          preferredDays,
          customDates,
          repeatWeeks,
          onFrequencyChange: handleFrequencyChange,
          onPreferredDaysChange: handlePreferredDaysChange,
          onCustomDatesChange: handleCustomDatesChange,
          onRepeatWeeksChange: handleRepeatWeeksChange
        }}
        fileUploadProps={{
          fieldName: 'housekeeping-photos',
          title: 'Upload Photos',
          description: 'Optional — add reference photos to help the cleaner prepare.',
          placeholder: 'Select photos to upload',
          onFileSelect: (event) => {
            if (event?.target?.files?.length) {
              onFileInputChange?.(event);
            }
          },
          selectedFile: selectedFiles?.[0],
          accept: 'image/*',
          multiple: true
        }}
        selectedFiles={selectedFiles}
        onRemoveFile={onRemoveFile}
        instructionsTitle="Task Instructions & Special Requirements"
        instructionsValue={formData.instructions || ''}
        onInstructionsChange={(value) => onInputChange('instructions', value)}
        instructionsPlaceholder="Write your instructions here...."
      />

      {/* Add New Service Modal */}
      <AddTaskModal
        isOpen={showServiceModal}
        onClose={handleCloseServiceModal}
        onSave={handleSaveNewService}
        value={newServiceInput}
        onChange={handleNewServiceInputChange}
        title="Add New Service"
        description="List services by using a comma (,) between each one. e.g. Service 1, Service 2, Service 3"
        placeholder="Enter Service Name"
        saveButtonText="Add"
      />
    </div>
  );
};

export default HousekeepingJobDetailsForm;
