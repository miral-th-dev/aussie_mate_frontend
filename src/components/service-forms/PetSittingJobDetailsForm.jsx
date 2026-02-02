import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { FloatingLabelInput } from '../form-controls';
import ServiceCommonSections from './common/ServiceCommonSections';

const PetSittingJobDetailsForm = ({
  formData,
  onInputChange,
  selectedFiles = [],
  dragActive,
  onFileInputChange,
  onRemoveFile
}) => {
  const [services] = useState([
    'House Sitting',
    'Walking',
    'Boarding',
    'Play Time',
    'Cleaning',
    'Grooming',
  ]);
  const [selectedService, setSelectedService] = useState(formData.service || '');
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [frequency, setFrequency] = useState(formData.frequency || 'One-time');
  const [preferredDays, setPreferredDays] = useState(formData.preferredDays || {});
  const [customDates, setCustomDates] = useState(formData.customDates || []);
  const [repeatWeeks, setRepeatWeeks] = useState(formData.repeatWeeks || '');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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

  useEffect(() => {
    const svc = formData.service || '';
    setSelectedService(svc);
    if (svc && (!formData.serviceDetail || formData.serviceDetail !== svc)) {
      onInputChange('serviceDetail', svc);
    }
  }, [formData.service]);

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
  const svc = formData.service || '';
  setSelectedService(svc);
  if (svc && formData.serviceDetail !== svc) {
    onInputChange('serviceDetail', svc);
  }
}, [formData.service, formData.serviceDetail, onInputChange]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setIsServiceDropdownOpen(false);
    onInputChange('service', service);
    onInputChange('serviceDetail', service);
  };
  const handleFrequencyChange = (value) => {
    setFrequency(value);
    onInputChange('frequency', value);
  };

  const handlePreferredDaysChange = (value) => {
    setPreferredDays(value);
    onInputChange('preferredDays', value);
  };

  const handleCustomDatesChange = (dates) => {
    setCustomDates(dates);
    onInputChange('customDates', dates);
  };

  const handleRepeatWeeksChange = (value) => {
    setRepeatWeeks(value);
    onInputChange('repeatWeeks', value);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pet Details Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-medium text-primary-500 mb-2">
          Which pet do you need care for?
        </h2>

        {/* Pet Type */}
        <div className="mb-4">
          <FloatingLabelInput
            id="petType"
            name="petType"
            label="Enter Your Pet Type"
            type="text"
            value={formData.petType || ''}
            onChange={(e) => onInputChange('petType', e.target.value)}
            placeholder=" "
          />
        </div>

        {/* Pet Breed */}
        <div className="mb-4">
          <FloatingLabelInput
            id="petBreed"
            name="petBreed"
            label="Enter Your Pet Breed"
            type="text"
            value={formData.petBreed || ''}
            onChange={(e) => onInputChange('petBreed', e.target.value)}
            placeholder=" "
          />
        </div>

        {/* Number of Pets */}
        <div className="mb-4">
          <FloatingLabelInput
            id="numberOfPets"
            name="numberOfPets"
            label="Number of Pets"
            type="number"
            value={formData.numberOfPets || ''}
            onChange={(e) => onInputChange('numberOfPets', e.target.value)}
            placeholder=" "
          />
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-4">
        <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Services
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 flex items-center justify-between cursor-pointer"
          >
            <span className={selectedService ? 'text-primary-500' : 'text-primary-200'}>
              {selectedService || 'Select Service'}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>

          {/* Dropdown */}
          {isServiceDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
              {services.map((service, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleServiceSelect(service)}
                  className="w-full px-4 py-2.5 sm:py-3 text-left text-xs sm:text-sm lg:text-base hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                >
                  <span className="text-primary-500">{service}</span>
                  {selectedService === service && (
                    <Check className="w-4 h-4 text-primary-500" strokeWidth={2} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
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
          fieldName: 'pet-sitting-files',
          title: 'Upload Photos',
          description: 'Optional — share photos of your pet or any instructions for their care.',
          placeholder: dragActive ? 'Drop files here' : 'Select files to upload',
          onFileSelect: (event) => {
            if (event?.target?.files?.length) {
              onFileInputChange?.(event);
            }
          },
          selectedFile: selectedFiles?.[0],
          accept: '.jpg,.jpeg,.png,.pdf',
          multiple: true
        }}
        selectedFiles={selectedFiles}
        onRemoveFile={onRemoveFile}
        instructionsTitle="Task Instructions & Special Requirements"
        instructionsValue={formData.instructions || ''}
        onInstructionsChange={(value) => onInputChange('instructions', value)}
        instructionsPlaceholder="Write your instructions here...."
      />

    </div>
  );
};

export default PetSittingJobDetailsForm;

