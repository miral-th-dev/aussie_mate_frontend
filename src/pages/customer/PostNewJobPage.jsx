import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  PageHeader,
  CleaningJobDetailsForm
} from '../../components';
import MapPinIcon from '../../assets/map-pin 1.png';
import { jobsAPI, userAPI } from '../../services/api';
import { format } from 'date-fns';
import Calendar from '../../components/form-controls/Calendar';
import CalendarIcon from '../../assets/Calendar.svg';
import JobLiveAnimation from '../../assets/joblive.gif';

const PostNewJobPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Step management (Step 1: Job Details, Step 2: Final Details, Step 3: Success)
  const [currentStep, setCurrentStep] = useState(1);
  const [createdJobId, setCreatedJobId] = useState(null);

  // Service selection (Defaults to cleaning)
  const [selectedService, setSelectedService] = useState('cleaning');

  // Job details form data
  const [formData, setFormData] = useState({
    serviceType: 'cleaning',
    serviceDetail: '',
    propertyType: '',
    instructions: '',
    frequency: 'One-time',
    categoryId: '',
    serviceTypeId: '',
  });

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Final details
  const [selectedDate, setSelectedDate] = useState('');
  const [finalInstructions, setFinalInstructions] = useState('');
  const [isUrgent, setIsUrgent] = useState(true);
  
  const [selectedLocation, setSelectedLocation] = useState({
    address: 'Location not set',
    city: 'Please set your location'
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressError, setAddressError] = useState('');

  // UI states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBondCleaning, setIsBondCleaning] = useState(false);
  const dropdownRef = useRef(null);

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'office', label: 'Office' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Restore step and form data when returning from location page
  useEffect(() => {
    // Check if we have a step from navigation state
    if (location.state?.step) {
      setCurrentStep(location.state.step);
    }
    
    // Always check for saved form state on component mount
    const savedFormState = localStorage.getItem('postJobFormState');
    if (savedFormState) {
      try {
        const formState = JSON.parse(savedFormState);
        
        // Restore form data
        if (formState.formData) {
          setFormData(formState.formData);
        }
        
        // Restore selected service
        if (formState.selectedService) {
          setSelectedService(formState.selectedService);
        }
        
        // Restore final details
        if (formState.selectedDate) {
          const storedDate = formState.selectedDate;
          if (/^\d{4}-\d{2}-\d{2}$/.test(storedDate)) {
            setSelectedDate(storedDate);
          } else {
            const parsed = new Date(storedDate);
            if (!isNaN(parsed.getTime())) {
              setSelectedDate(format(parsed, 'yyyy-MM-dd'));
            }
          }
        }
        if (formState.finalInstructions) {
          setFinalInstructions(formState.finalInstructions);
        }
        if (formState.isUrgent !== undefined) {
          setIsUrgent(formState.isUrgent);
        }
        
      } catch (error) {
        console.error('Error restoring form state:', error);
      }
    }
  }, [location.state]);

  // Separate effect for cleanup - only clear when navigating away from post-new-job
  useEffect(() => {
    return () => {
      const isNavigatingToLocation = localStorage.getItem('navigatingToLocation') === 'true';
      if (!window.location.pathname.includes('/post-new-job') && !isNavigatingToLocation) {
        localStorage.removeItem('postJobFormState');
      }
      localStorage.removeItem('navigatingToLocation');
    };
  }, []);

  // Load user location from profile (same as Header)
  useEffect(() => {
    const updateLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        
        // Check different possible locations for user data (same as Header)
        const userData = userProfile.data?.user || userProfile.data || userProfile;
        const location = userData?.location;
        
        if (location) {
          const fullAddress = location.fullAddress || location.address || '';
          const addressParts = fullAddress.split(',');
          const address = addressParts[0]?.trim() || 'Location not set';
          const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : (location.city || 'Please set your location');
          
          setSelectedLocation({
            address: address,
            city: city,
            fullAddress: fullAddress,
            coordinates: location.coordinates
          });
        }
      } catch (error) {
        console.error('Error fetching location from profile:', error);
      }
    };

    // Initial load
    updateLocation();

    // Listen for location updates
    const handleLocationUpdate = () => {
      updateLocation();
    };

    window.addEventListener('locationUpdated', handleLocationUpdate);

    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
    };
  }, []);



  // Form handlers
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePropertyTypeSelect = (value) => {
    handleInputChange('propertyType', value);
    setIsDropdownOpen(false);
  };

  const getSelectedPropertyType = () => {
    const selected = propertyTypes.find(type => type.value === formData.propertyType);
    return selected ? selected.label : 'Select property type';
  };

  // File validation
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const supportedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: `File ${file.name} is too large. Maximum size is 50MB.` };
    }

    if (!supportedTypes.includes(file.type)) {
      return { valid: false, error: `File ${file.name} is not a supported format.` };
    }

    return { valid: true };
  };

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = [];
    const errors = [];

    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(validation.error);
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    } else {
      setUploadError('');
    }

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles];
      return newFiles.slice(0, 10);
    });
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files);
    }
  };

  // Final details handlers
  const handleDateChange = (newValue) => {
    if (newValue instanceof Date && !isNaN(newValue.getTime())) {
      setSelectedDate(format(newValue, 'yyyy-MM-dd'));
    } else {
      setSelectedDate('');
    }
  };

  const handleFinalInstructionsChange = (e) => {
    setFinalInstructions(e.target.value);
  };

  const handleUrgencyToggle = () => {
    setIsUrgent(!isUrgent);
  };

  const handleBondCleaningToggle = () => {
    setIsBondCleaning(!isBondCleaning);
  };

  const handleChangeLocation = () => {
    // Save current form data to localStorage before navigating
    const formState = {
      formData,
      selectedFiles: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })),
      selectedDate,
      finalInstructions,
      isUrgent,
      selectedService
    };
    
    localStorage.setItem('postJobFormState', JSON.stringify(formState));
    
    // Add a flag to indicate we're going to location page
    localStorage.setItem('navigatingToLocation', 'true');
    
    navigate('/location', { state: { from: '/post-new-job', step: currentStep } });
  };

  const handleGoToProfile = () => {
    // Save current form data to localStorage before navigating
    const formState = {
      formData,
      selectedFiles: selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })),
      selectedDate,
      finalInstructions,
      isUrgent,
      selectedService
    };
    
    localStorage.setItem('postJobFormState', JSON.stringify(formState));
    
    // Add a flag to indicate we're going to location page
    localStorage.setItem('navigatingToLocation', 'true');
    
    navigate('/location', { state: { from: '/post-new-job', step: currentStep } });
  };

  // Navigation handlers
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleContinue = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Final job posting
  const handlePostJob = async () => {
    setIsLoading(true);
    setError('');
    setAddressError('');

    // Frontend validation
    // Unified flow defaults to cleaning
    const currentServiceType = formData.serviceType || 'cleaning';

    const propertyRequiredServices = ['cleaning'];
    // Removed strict propertyType validation here as it defaults to 'house'


    if (!selectedDate) {
      setError('Please select a date for the service');
      setIsLoading(false);
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a cleaning category');
      setIsLoading(false);
      return;
    }

    if (!formData.serviceTypeId) {
      setError('Please specify the type of service you need');
      setIsLoading(false);
      return;
    }


    let effectiveLocation = selectedLocation;
    try {
      const storedLocationStr = localStorage.getItem('userLocation');
      if (storedLocationStr) {
        const storedLocation = JSON.parse(storedLocationStr);

        const shouldUseStored =
          !effectiveLocation?.address ||
          effectiveLocation.address === 'Location not set' ||
          (effectiveLocation.address && effectiveLocation.address.length < 10); 

        if (shouldUseStored) {
          let parsedCoordinates = undefined;
          if (typeof storedLocation.coordinates === 'string') {
            const parts = storedLocation.coordinates.split(',').map((s) => s.trim());
            if (parts.length === 2) {
              const lat = Number(parts[0]);
              const lng = Number(parts[1]);
              if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                parsedCoordinates = [lng, lat];
              }
            }
          } else if (Array.isArray(storedLocation.coordinates)) {
            parsedCoordinates = storedLocation.coordinates;
          }

          effectiveLocation = {
            address: storedLocation.fullAddress || storedLocation.address || 'Location not set',
            city: storedLocation.city || 'Location',
            coordinates: parsedCoordinates,
          };
        }
      }
    } catch (_) {
    }

    if (!effectiveLocation?.address || effectiveLocation.address === 'Location not set') {
      setAddressError('Please set your address in profile before posting jobs');
      setIsLoading(false);
      return;
    }

    try { 
      const scheduledDate = selectedDate
        ? new Date(`${selectedDate}T00:00:00`).toISOString()
        : null;

      const userStr = localStorage.getItem('user');

      const user = userStr ? JSON.parse(userStr) : null;
      const customerId = user?.id || user?._id;

      const resolvedServiceDetail = formData.serviceDetail || 'cleaning';

      const jobData = {
        categoryId: formData.categoryId,
        serviceTypeId: formData.serviceTypeId,
        instructions: finalInstructions || formData.instructions,
        scheduledDate,
        isUrgent,
        bondCleaning: isBondCleaning,
        location: {
          address: effectiveLocation.address,
          city: effectiveLocation.city,
          coordinates: effectiveLocation.coordinates || [0, 0], // Default if not found
        },
        customerId,
      };

      const files = {
        photos: selectedFiles,
        videos: []
      };
      
      const response = await jobsAPI.createJobWithFiles(jobData, files);
      
      if (response.success) {
        localStorage.removeItem('postJobFormState');
        
        setCreatedJobId(response.data._id);
        setCurrentStep(3);
      } else {  
        setError(response.message || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      
      let errorMessage = 'Failed to post job';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => 
          typeof err === 'string' ? err : err.msg || err.message
        ).join(', ');
        errorMessage = validationErrors;
      }
      
      setError(errorMessage);
    } finally {
      
      setIsLoading(false);
    }
  };

  // Render different steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderJobDetails();
      case 2:
        return renderFinalDetails();
      case 3:
        return renderSuccessScreen();
      default:
        return renderJobDetails();
    }
  };



  const renderJobDetails = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8 lg:py-12">
      <PageHeader
        title="Post New Job"
        onBack={() => currentStep === 1 ? navigate('/customer-dashboard') : handleBack()}
        className="mb-8"
        titleClassName="text-2xl sm:text-3xl font-semibold text-[#111827]"
      />

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          {/* Using CleaningJobDetailsForm as the unified form */}
          <CleaningJobDetailsForm 
            formData={formData}
            onInputChange={handleInputChange}
            onPropertyTypeSelect={handlePropertyTypeSelect}
            selectedPropertyTypeLabel={getSelectedPropertyType()}
            selectedFiles={selectedFiles}
            onDrag={handleDrag}
            onDrop={handleDrop}
            dragActive={dragActive}
            uploadError={uploadError}
            onFileInputChange={handleFileInputChange}
            onRemoveFile={removeFile}
            isDropdownOpen={isDropdownOpen}
            propertyTypes={propertyTypes}
            dropdownRef={dropdownRef}
            isBondCleaning={isBondCleaning}
            onBondCleaningToggle={handleBondCleaningToggle}
            prefilledCategory={location.state?.categoryName}
          />

          {/* Continue Button */}
          <div className="mt-8 sm:mt-12 flex justify-end">
            <Button
              type="submit"
              className="rounded-full sm:rounded-full text-base sm:text-lg bg-[#1A73E8]"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFinalDetails = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8 lg:py-12">
      <PageHeader
        title="Post New Job"
        onBack={handleBack}
        className="mb-8"
        titleClassName="text-2xl sm:text-3xl font-semibold text-[#111827]"
        backButtonClassName="cursor-pointer"
      />

      <div className="space-y-4 bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
        {/* Error Messaging */}
        {error && <div className="text-red-500 font-medium px-4 py-3 bg-red-50 rounded-xl">{error}</div>}
        {addressError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl flex items-center justify-between">
            <span>{addressError}</span>
            <Button onClick={handleGoToProfile} variant="warning" size="sm">Set Address</Button>
          </div>
        )}

        {/* When do you need the service? */}
        <div className="space-y-4">
          <h2 className="text-[20px] font-semibold text-[#111827]">When do you need the service?</h2>
          <div className="bg-[#F9FAFB] rounded-4xl p-1 relative">
            <Calendar
              value={selectedDate ? new Date(`${selectedDate}T00:00:00`) : null}
              onChange={handleDateChange}
              minDate={new Date()}
              disablePast
              format="MMM DD, YYYY"
              textFieldProps={{
                fullWidth: true,
                sx: { 
                  '& .MuiInputBase-root': { 
                    borderRadius: '24px', 
                    border: 'none', 
                    backgroundColor: '#F9FAFB',
                    paddingRight: '16px'
                  },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }
              }}
              slots={{
                openPickerIcon: () => <img src={CalendarIcon} alt="Calendar" className="w-6 h-6" />
              }}
            />
          </div>
        </div>

        {/* Urgency Toggle */}
        <div className="flex items-center justify-between py-2">
          <span className="text-base font-medium text-[#111827]">This is urgent</span>
          <button
            onClick={handleUrgencyToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isUrgent ? 'bg-primary-500' : 'bg-gray-200'}`}
            type="button"
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <hr className="border-gray-100" />

        {/* Select location */}
        <div className="space-y-4">
          {/* <h3 className="text-primary-500 text-lg font-medium mb-1">
            Select location you want to clean
          </h3> */}
          <p className="text-gray-400 text-sm font-medium">Your default location</p>

          {/* Location Warning */}
          {(!selectedLocation.address || selectedLocation.address === 'Location not set') && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                ⚠️ Please set your address in profile before posting jobs
              </p>
            </div>
          )}

          <div className={`rounded-lg py-2 flex items-center ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-white'
            }`}>
            <div className={`mr-3 rounded-[8px] p-3 border ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                ? 'border-yellow-300 bg-yellow-100'
                : 'border-primary-200 bg-white'
              }`}>
              <img
                src={MapPinIcon}
                alt="Location"
                className="w-6 h-6"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium text-sm truncate ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-800'
                  : 'text-gray-900'
                }`}>
                {selectedLocation.fullAddress || selectedLocation.address}
              </div>
              <div className={`text-xs truncate ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-600'
                  : 'text-gray-600'
                }`}>
                {selectedLocation.city}
              </div>
            </div>
            <Button
              onClick={handleChangeLocation}
              variant={(!selectedLocation.address || selectedLocation.address === 'Location not set') ? 'warning' : 'outline'}
              size="sm"
              className="rounded-[8px] border-gray-200 text-[#111827] font-bold"
            >
              {(!selectedLocation.address || selectedLocation.address === 'Location not set') ? 'Set Address' : 'Change'}
            </Button>
          </div>
        </div>

        {/* Post Job Action */}
        <div className="pt-8 flex justify-end">
          <Button
            onClick={handlePostJob}
            disabled={isLoading || !formData.categoryId || !formData.serviceTypeId || (!selectedLocation.address || selectedLocation.address === 'Location not set')}
            loading={isLoading}
            className="rounded-full text-lg font-medium bg-[#1A73E8]"
          >
            Post Job
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuccessScreen = () => (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center animate-in fade-in duration-900">
      <div className="relative mb-8">
        <div className="flex items-center justify-center overflow-hidden">
          <img src={JobLiveAnimation} alt="Job Live" className="w-full h-full object-cover" />
        </div>
      </div>
      
      <h1 className="text-3xl font-semibold text-[#111827] mb-4">Your job request is live!</h1>
      <p className="text-gray-500 text-lg mb-12 max-w-sm">
        Nearby cleaners will start sending quotes shortly. You'll be notified.
      </p>

      <div className="w-full max-w-sm space-y-4">
        <Button
          onClick={() => navigate(`/customer-job-details/${createdJobId}`)}
          size="lg"
          className="w-full bg-[#1A73E8]"
        >
          View My Job
        </Button>
        <button
          onClick={() => navigate('/customer-dashboard')}
          className="w-full py-4 text-lg font-semibold text-[#111827] flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Return Home
        </button>
      </div>
    </div>
  );

  return (
    <>
      {renderStepContent()}
    </>
  );
};

export default PostNewJobPage;
