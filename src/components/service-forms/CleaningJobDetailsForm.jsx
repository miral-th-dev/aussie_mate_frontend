import React from 'react';
import ServiceCommonSections from './common/ServiceCommonSections';

const CleaningJobDetailsForm = ({
  formData,
  onInputChange,
  selectedFiles = [],
  dragActive,
  onFileInputChange,
  onRemoveFile,
  isBondCleaning = false,
  onBondCleaningToggle
}) => {
  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Property Details Section */}
      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-primary-500 mb-2">
          Tell us about your property
        </h2>
        <p className="text-xs sm:text-sm lg:text-base text-primary-200 font-medium mb-4 sm:mb-6">
          Add property details to ensure the best cleaning plan for you.
        </p>

        {/* Bond Cleaning Toggle */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm font-medium text-primary-500 mr-4">Is this job for bond cleaning?</span>
          <button
            type="button"
            onClick={onBondCleaningToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
              isBondCleaning ? 'bg-primary-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isBondCleaning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Property Type - Text Field */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-primary-500 mb-2">
            Property Type
          </label>
          <input
            type="text"
            value={formData.propertyType || ''}
            onChange={(e) => onInputChange('propertyType', e.target.value)}
            placeholder="e.g., House, Apartment, Office"
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-lg focus:outline-none text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
          />
        </div>
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
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-primary-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs sm:text-sm lg:text-base bg-white text-primary-500 placeholder:text-primary-200"
        />
      </div>

      <ServiceCommonSections
        frequencyProps={{
          frequency: formData.frequency || 'One-time',
          preferredDays: formData.preferredDays || {},
          customDates: formData.customDates || [],
          repeatWeeks: formData.repeatWeeks || '',
          onFrequencyChange: (value) => onInputChange('frequency', value),
          onPreferredDaysChange: (value) => onInputChange('preferredDays', value),
          onCustomDatesChange: (value) => onInputChange('customDates', value),
          onRepeatWeeksChange: (value) => onInputChange('repeatWeeks', value)
        }}
        fileUploadProps={{
          fieldName: 'cleaning-photos',
          title: 'Upload Photos',
          description: 'Optional — add reference photos to help the cleaner prepare.',
          placeholder: dragActive ? 'Drop files here' : 'Select photos to upload',
          onFileSelect: (event) => {
            if (event?.target?.files?.length) {
              onFileInputChange(event);
            }
          },
          selectedFile: selectedFiles?.[0],
          accept: 'image/*',
          multiple: true
        }}
        selectedFiles={selectedFiles}
        onRemoveFile={onRemoveFile}
        instructionsHeader={(
          <h3 className="text-base font-medium text-primary-500 mb-3 sm:mb-4">
            Anything specific we should know? <span className="text-primary-200 font-medium text-xs sm:text-base"> (Optional)</span>
          </h3>
        )}
        instructionsValue={formData.instructions || ''}
        onInstructionsChange={(value) => onInputChange('instructions', value)}
        instructionsPlaceholder="Write your instructions here in any..."
      />
    </div>
  );
};

export default CleaningJobDetailsForm;

