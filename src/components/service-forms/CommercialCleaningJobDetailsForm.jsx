import React, { useEffect, useState } from 'react';
import ServiceCommonSections from './common/ServiceCommonSections';

const CommercialCleaningJobDetailsForm = ({
  formData,
  onInputChange,
  selectedFiles = [],
  dragActive,
  onFileInputChange,
  onRemoveFile
}) => {
  const [frequency, setFrequency] = useState(formData.frequency || 'One-time');
  const [preferredDays, setPreferredDays] = useState(formData.preferredDays || {});
  const [customDates, setCustomDates] = useState(formData.customDates || []);

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

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Property Type Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-500 mb-2">
          Commercial Cleaning
        </h2>
        <p className="text-xs sm:text-sm text-primary-500 font-medium mb-4">
          What type of property needs cleaning?
        </p>
        <input
          type="text"
          value={formData.propertyType || ''}
          onChange={(e) => onInputChange('propertyType', e.target.value)}
          placeholder="Property Type"
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
        />
      </div>
      {/* Type of Service Section */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
          Type of Service
        </label>
        <input
          type="text"
          value={formData.serviceDetail || ''}
          onChange={(e) => onInputChange('serviceDetail', e.target.value)}
          placeholder='e.g. "Floor Cleaning"'
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-full focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
        />
      </div>

      <ServiceCommonSections
        frequencyProps={{
          frequency,
          preferredDays,
          customDates,
          onFrequencyChange: handleFrequencyChange,
          onPreferredDaysChange: handlePreferredDaysChange,
          onCustomDatesChange: handleCustomDatesChange
        }}
        fileUploadProps={{
          fieldName: 'commercial-cleaning-files',
          title: 'Upload Photos or Documents',
          description: 'Optional — share pictures of the site or important documents for the cleaning team.',
          placeholder: dragActive ? 'Drop files here' : 'Select files to upload',
          onFileSelect: (event) => {
            if (event?.target?.files?.length) {
              onFileInputChange?.(event);
            }
          },
          selectedFile: selectedFiles?.[0],
          accept: '.pdf,.jpg,.jpeg,.png',
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

export default CommercialCleaningJobDetailsForm;

