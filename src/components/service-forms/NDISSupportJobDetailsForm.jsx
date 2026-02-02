import React, { useEffect, useRef, useState } from 'react';
import { FloatingLabelInput } from '../form-controls';
import ServiceCommonSections from './common/ServiceCommonSections';
import arrowDownIcon from '../../assets/down2.svg';

const NDISSupportJobDetailsForm = ({
    formData,
    onInputChange,
    selectedFiles = [],
    dragActive,
    onFileInputChange,
    onRemoveFile
}) => {
    const [ndisNumber, setNdisNumber] = useState(formData.ndisNumber ? formData.ndisNumber.replace(/(\d{3})(?=\d)/g, '$1 ') : '');
    const [supportType, setSupportType] = useState(formData.supportType || 'Cleaning');
    const [frequency, setFrequency] = useState(formData.frequency || 'One-time');
    const [preferredDays, setPreferredDays] = useState(formData.preferredDays || {});
    const [customDates, setCustomDates] = useState(formData.customDates || []);
    const [repeatWeeks, setRepeatWeeks] = useState(formData.repeatWeeks || '');
    const [isSupportTypeOpen, setIsSupportTypeOpen] = useState(false);

    const supportTypeRef = useRef(null);

    // Support Type Options
    const supportTypeOptions = [
        'Cleaning',
        'Daily Assistance',
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (supportTypeRef.current && !supportTypeRef.current.contains(event.target)) {
                setIsSupportTypeOpen(false);
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
        if (formData.ndisNumber) {
            const formatted = formData.ndisNumber.replace(/(\d{3})(?=\d)/g, '$1 ');
            setNdisNumber(formatted);
        }
    }, [formData.ndisNumber]);

    useEffect(() => {
        if (formData.supportType) {
            setSupportType(formData.supportType);
        }
    }, [formData.supportType]);

    // Handle NDIS Number input with formatting
    const handleNdisNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 9) {
            // Format as XXX XXX XXX
            const formatted = value.replace(/(\d{3})(?=\d)/g, '$1 ');
            setNdisNumber(formatted);
            onInputChange('ndisNumber', value);
        }
    };

    // Handle support type selection
    const handleSupportTypeSelect = (type) => {
        setSupportType(type);
        setIsSupportTypeOpen(false);
        onInputChange('supportType', type);
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
        <div className="space-y-6">
            {/* NDIS Support Section */}
            <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">NDIS Support</h2>
                <p className="text-sm sm:text-base text-primary-200 font-medium mb-4">
                    Reliable help for your home, health, and daily needs—NDIS-ready.
                </p>

                {/* NDIS Number */}
                <FloatingLabelInput
                    id="ndisNumber"
                    name="ndisNumber"
                    label="NDIS Number"
                    type="text"
                    value={ndisNumber}
                    onChange={handleNdisNumberChange}
                    required
                />
            </div>


            {/* Support Type Section */}
            <div>
                <h3 className="text-base font-medium text-primary-500 mb-3">Support Type</h3>
                <div className="relative" ref={supportTypeRef}>
                    <div
                        onClick={() => setIsSupportTypeOpen(!isSupportTypeOpen)}
                        className="flex items-center justify-between w-full px-4 py-3 border border-gray-300 rounded-full bg-white cursor-pointer hover:border-primary-500 transition-colors"
                    >
                        <span className="text-gray-900">{supportType}</span>
                        <img src={arrowDownIcon} alt="Dropdown" className={`w-5 h-5 transition-transform ${isSupportTypeOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isSupportTypeOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {supportTypeOptions.map((option) => (
                                <div
                                    key={option}
                                    onClick={() => handleSupportTypeSelect(option)}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                                >
                                    {option}
                                </div>
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
                    onFrequencyChange: handleFrequencyChange,
                    onPreferredDaysChange: handlePreferredDaysChange,
                    onCustomDatesChange: handleCustomDatesChange,
                    repeatWeeks,
                    onRepeatWeeksChange: handleRepeatWeeksChange
                }}
                fileUploadProps={{
                    fieldName: 'ndis-support-files',
                    title: 'Supporting Documents / Photos',
                    description: 'Optional — upload relevant photos or documents for your support worker.',
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

export default NDISSupportJobDetailsForm;

