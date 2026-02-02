import React from 'react';
import FrequencySelect from './FrequencySelect';
import { FileUploadArea, Button } from '../../form-controls';

const ServiceCommonSections = ({
  frequencyProps,
  fileUploadProps,
  uploadError,
  selectedFiles = [],
  onRemoveFile,
  instructionsHeader,
  instructionsTitle = 'Task Instructions & Special Requirements',
  instructionsSubtitle,
  instructionsValue = '',
  onInstructionsChange,
  instructionsPlaceholder = 'Write your instructions here....',
  showInstructions = true
}) => {
  return (
    <>
      {frequencyProps && (
        <FrequencySelect {...frequencyProps} />
      )}

      {showInstructions && (
        <div>
          {instructionsHeader ? (
            instructionsHeader
          ) : (
            <h3 className="text-base font-medium text-primary-500 mb-3 sm:mb-4">
              {instructionsTitle}
              {instructionsSubtitle && (
                <span className="text-primary-200 font-medium text-xs sm:text-base"> {instructionsSubtitle}</span>
              )}
            </h3>
          )}
          <div className="relative">
            <textarea
              value={instructionsValue}
              onChange={(e) => onInstructionsChange?.(e.target.value)}
              placeholder={instructionsPlaceholder}
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-primary-200 rounded-xl! focus:outline-none text-xs sm:text-sm lg:text-base resize-none"
            />
          </div>
        </div>
      )}

      {fileUploadProps && (
        <div>
          {uploadError && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-xs sm:text-sm">
              {uploadError}
            </div>
          )}

          <FileUploadArea {...fileUploadProps} />

          {selectedFiles.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs sm:text-sm font-medium text-primary-500 text-left mb-2 sm:mb-3">
                Selected Files ({selectedFiles.length}/10)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 sm:h-24 object-cover rounded-lg border border-gray-200"
                    />
                    {onRemoveFile && (
                      <Button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        variant="danger"
                        size="xs"
                        className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </Button>
                    )}
                    <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServiceCommonSections;


