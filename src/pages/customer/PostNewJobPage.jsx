import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  PageHeader,
  CleaningJobDetailsForm,
  PetSittingJobDetailsForm,
  CommercialCleaningJobDetailsForm,
  HandymanJobDetailsForm,
  NDISSupportJobDetailsForm,
  HousekeepingJobDetailsForm
} from '../../components';
import CardBG2 from '../../assets/CardBG2.png';
import CardBG3 from '../../assets/CardBG3.png';
import CardBG4 from '../../assets/CardBG4.png';
import CleaningImage from '../../assets/Cleaning.png';
import HandymanImage from '../../assets/Handyman.png';
import HousekeepingImage from '../../assets/Housekeeping.png';
import PetSittingImage from '../../assets/Pet Sitting.png';
import NDISSupportImage from '../../assets/NDIS Support.png';
import CommercialCleaningImage from '../../assets/commercialCleaning.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import { jobsAPI, userAPI } from '../../services/api';
import { format } from 'date-fns';
import Calendar from '../../components/form-controls/Calendar';

const PostNewJobPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Service selection
  const [selectedService, setSelectedService] = useState(null);

  // Job details form data
  const [formData, setFormData] = useState({
    serviceType: '',
    serviceDetail: '',
    propertyType: '',
    bedrooms: 1,
    bathrooms: 1,
    instructions: '',
    petType: '',
    petBreed: '',
    numberOfPets: '',
    service: '',
    housekeepingServiceType: [],
    handymanServiceType: '',
    handymanSelectedRepairs: [],
    handymanCustomRequests: [],
    ndisNumber: '',
    supportType: '',
    frequency: 'One-time',
    preferredDays: {},
    customDates: [],
    repeatWeeks: ''
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

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'supportServices',
      name: 'Support Services',
      image: NDISSupportImage,
      description: 'NDIS support services'
    },
    {
      id: 'commercialCleaning',
      name: 'Commercial Cleaning',
      image: CommercialCleaningImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
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

  // Service selection handler
  const handleServiceClick = (serviceId) => {
    setSelectedService(serviceId);
    setFormData(prev => ({ ...prev, serviceType: serviceId }));
    setCurrentStep(2);
  };

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
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Final job posting
  const handlePostJob = async () => {
    setIsLoading(true);
    setError('');
    setAddressError('');

    // Frontend validation
    if (!formData.serviceType) {
      setError('Please select a service type');
      setIsLoading(false);
      return;
    }

    const propertyRequiredServices = ['cleaning', 'commercialCleaning'];
    if (propertyRequiredServices.includes(formData.serviceType)) {
      if (!formData.propertyType || formData.propertyType.trim() === '') {
        setError('Please select a property type');
        setIsLoading(false);
        return;
      }
    }

    if (!selectedDate) {
      setError('Please select a date for the service');
      setIsLoading(false);
      return;
    }

    const serviceDetailRequiredServices = ['cleaning', 'commercialCleaning'];
    if (serviceDetailRequiredServices.includes(formData.serviceType)) {
      if (!formData.serviceDetail || formData.serviceDetail.trim() === '') {
        setError('Please specify the type of service you need');
        setIsLoading(false);
        return;
      }
    }

    switch (formData.serviceType) {
      case 'petsitting': {
        if (!formData.petType?.trim()) {
          setError('Please enter your pet type');
          setIsLoading(false);
          return;
        }
        if (!formData.numberOfPets || Number(formData.numberOfPets) <= 0) {
          setError('Please enter the number of pets');
          setIsLoading(false);
          return;
        }
        if (!formData.service) {
          setError('Please select a pet sitting service');
          setIsLoading(false);
          return;
        }
        break;
      }
      case 'housekeeping': {
        if (!Array.isArray(formData.housekeepingServiceType) || formData.housekeepingServiceType.length === 0) {
          setError('Please select at least one housekeeping service');
          setIsLoading(false);
          return;
        }
        break;
      }
      case 'handyman': {
        if (!formData.handymanServiceType) {
          setError('Please select a handyman service type');
          setIsLoading(false);
          return;
        }
        break;
      }
      case 'supportServices': {
        if (!formData.ndisNumber || !/^\d{9}$/.test(formData.ndisNumber)) {
          setError('NDIS number must be exactly 9 digits');
          setIsLoading(false);
          return;
        }
        if (!formData.supportType) {
          setError('Please select an NDIS support type');
          setIsLoading(false);
          return;
        }
        break;
      }
      default:
        break;
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

      const resolvedServiceDetail = (() => {
        const trimmed = formData.serviceDetail?.trim();
        if (trimmed) return trimmed;

        if (formData.serviceType === 'handyman') {
          const repairs = Array.isArray(formData.handymanSelectedRepairs) ? formData.handymanSelectedRepairs : [];
          const custom = Array.isArray(formData.handymanCustomRequests) ? formData.handymanCustomRequests : [];
          const parts = [formData.handymanServiceType, ...repairs, ...custom].filter(Boolean);
          return parts.join(', ');
        }

        if (formData.serviceType === 'petsitting') {
          return formData.service || '';
        }

        if (formData.serviceType === 'housekeeping' && Array.isArray(formData.housekeepingServiceType)) {
          const detail = formData.housekeepingServiceType.join(', ');
          return detail || formData.service || 'Housekeeping';
        }

        return formData.service || formData.serviceType || '';
      })();

      const propertyRequiredServices = ['cleaning', 'commercialCleaning'];
      const propertyTypeForPayload = propertyRequiredServices.includes(formData.serviceType)
        ? formData.propertyType
        : (formData.propertyType || 'house');

      const isCleaning = formData.serviceType === 'cleaning';
      const isHousekeeping = formData.serviceType === 'housekeeping';
      const isHandyman = formData.serviceType === 'handyman';
      const isPetSitting = formData.serviceType === 'petsitting';
      const isNdis = formData.serviceType === 'supportServices';

      const jobData = {
        serviceType: formData.serviceType,
        serviceDetail: resolvedServiceDetail,
        propertyType: propertyTypeForPayload,

        frequency: formData.frequency || 'One-time',
        preferredDays: formData.preferredDays || {},
        customDates: formData.customDates || [],
        repeatWeeks: formData.repeatWeeks || '',
        scheduledDate,
        instructions: finalInstructions || formData.instructions,
        isUrgent,
        location: {
          address: effectiveLocation.address,
          city: effectiveLocation.city,
          coordinates: effectiveLocation.coordinates,
        },
        customerId,
      };

      if (isCleaning) {
        jobData.bondCleaning = isBondCleaning;
      }

      if (isPetSitting) {
        jobData.petType = formData.petType || '';
        jobData.petBreed = formData.petBreed || '';
        jobData.numberOfPets = formData.numberOfPets ? Number(formData.numberOfPets) : null;
        jobData.petService = formData.service || '';
      }

      if (isHousekeeping) {
        jobData.housekeepingServiceType = Array.isArray(formData.housekeepingServiceType)
          ? formData.housekeepingServiceType
          : [];
      }

      if (isHandyman) {
        jobData.handymanServiceType = formData.handymanServiceType || '';
        jobData.handymanRepairs = Array.isArray(formData.handymanSelectedRepairs)
          ? formData.handymanSelectedRepairs
          : [];
        jobData.handymanCustomRequests = Array.isArray(formData.handymanCustomRequests)
          ? formData.handymanCustomRequests
          : [];
      }

      if (isNdis) {
        jobData.ndisNumber = formData.ndisNumber || '';
        jobData.supportType = formData.supportType || '';
      }

      const files = {
        photos: selectedFiles,
        videos: []
      };
      
      const response = await jobsAPI.createJobWithFiles(jobData, files);
      
      if (response.success) {
        localStorage.removeItem('postJobFormState');
        
        navigate('/job-success', { state: { jobId: response.data._id } });
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
        return renderServiceSelection();
      case 2:
        return renderJobDetails();
      case 3:
        return renderFinalDetails();
      default:
        return renderServiceSelection();
    }
  };

  const renderServiceSelection = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Post New Job"
        onBack={() => navigate('/customer-dashboard')}
        className="mb-6"
        titleClassName="text-xl sm:text-2xl font-semibold text-primary-500"
      />

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-3">
            What do you need help with today?
          </h2>
          <p className="text-primary-200 font-medium text-sm sm:text-base">
            Pick a service to get started with hassle-free cleaning today.
          </p>
        </div>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          {serviceCategories.map((service) => (
            <div
              key={service.id}
              onClick={() => handleServiceClick(service.id)}
              className="relative bg-white border border-gray-200 rounded-3xl p-3 sm:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
            >
              {/* Top-left background image */}
              <div className="absolute top-0 left-0 w-20 h-24 overflow-hidden rounded-tl-2xl">
                <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
              </div>

              {/* Top-right background image */}
              <div className="absolute top-0 right-0 w-20 h-24 overflow-hidden rounded-tr-2xl">
                <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
              </div>
              
              {/* Bottom-left background image */}
              <div className="absolute bottom-0 left-0 w-20 h-24 overflow-hidden rounded-bl-2xl">
                <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
              </div>

              {/* Service Image */}
              <div className="relative z-10 mb-2 flex justify-center">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-12 h-12 sm:w-20 sm:h-20 object-contain"
                />
              </div>

              {/* Service Name */}
              <div className="relative z-10 text-xs sm:text-lg font-medium text-primary-500">{service.name}</div>
            </div>
          ))}
        </div>

        {/* Select location */}
        <div className="mb-6">
          <h3 className="text-primary-500 text-lg font-medium mb-2">
            Select location you want to clean
          </h3>
          <p className="text-gray-400 text-sm font-medium mb-3">Your default location</p>

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
            <div className="flex-1">
              <div className={`font-medium text-sm ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
                  ? 'text-yellow-800'
                  : 'text-gray-900'
                }`}>
                {selectedLocation.fullAddress || selectedLocation.address}
              </div>
              <div className={`text-xs ${(!selectedLocation.address || selectedLocation.address === 'Location not set')
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
              className="rounded-[8px]"
            >
              {(!selectedLocation.address || selectedLocation.address === 'Location not set') ? 'Set Address' : 'Change'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobDetails = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <PageHeader
        title="Post New Job"
        onBack={handleBack}
        className="mb-6"
        titleClassName="text-xl sm:text-2xl font-semibold text-primary-500"
      />

      {/* Main Content */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          {/* Use CleaningJobDetailsForm for cleaning-related services */}
          {selectedService === 'cleaning' && (
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
            />
          )}

          {/* Use PetSittingJobDetailsForm for pet sitting services */}
          {selectedService === 'petsitting' && (
            <PetSittingJobDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              selectedFiles={selectedFiles}
              dragActive={dragActive}
              onFileInputChange={handleFileInputChange}
              onRemoveFile={removeFile}
            />
          )}

          {/* Use CommercialCleaningJobDetailsForm for retail/commercial cleaning services */}
          {selectedService === 'commercialCleaning' && (
            <CommercialCleaningJobDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              selectedFiles={selectedFiles}
              dragActive={dragActive}
              onFileInputChange={handleFileInputChange}
              onRemoveFile={removeFile}
            />
          )}

          {/* Use HandymanJobDetailsForm for handyman services */}
          {selectedService === 'handyman' && (
            <HandymanJobDetailsForm 
              formData={formData}
              onInputChange={handleInputChange}
              selectedFiles={selectedFiles}
              uploadError={uploadError}
              onFileInputChange={handleFileInputChange}
              onRemoveFile={removeFile}
            />
          )}

          {/* Use NDISSupportJobDetailsForm for NDIS support services */}
          {selectedService === 'supportServices' && (
            <NDISSupportJobDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              selectedFiles={selectedFiles}
              dragActive={dragActive}
              onFileInputChange={handleFileInputChange}
              onRemoveFile={removeFile}
            />
          )}

          {/* Use HousekeepingJobDetailsForm for housekeeping services */}
          {selectedService === 'housekeeping' && (
            <HousekeepingJobDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              selectedFiles={selectedFiles}
              onFileInputChange={handleFileInputChange}
              onRemoveFile={removeFile}
            />
          )}

          {/* Continue Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="md"
              className="px-6"
            >
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderFinalDetails = () => (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-2">
      <PageHeader
        title="Post New Job"
        onBack={handleBack}
        className="mb-6"
        titleClassName="text-xl font-semibold text-primary-500"
      />

      {/* Main Content */}
      <div className="space-y-6 bg-white rounded-2xl p-6 sm:p-8 shadow-custom">
        {/* Error Message */}
        {error && (
          <div className="text-red-500 font-medium px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Address Error Message */}
        {addressError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            <div className="flex items-center justify-between">
              <span>{addressError}</span>
              <Button
                onClick={handleGoToProfile}
                variant="warning"
                size="sm"
                className="ml-4"
              >
                Set Address
              </Button>
            </div>
          </div>
        )}

        {/* Selected Files Display */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-primary-500 text-lg font-medium mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      muted
                    />
                  )}
                  <p className="text-xs text-gray-500 mt-1 truncate" title={file.name}>
                    {file.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* When do you need the service? */}
        <div>
          <Calendar
            label="When do you need the service?"
            value={selectedDate ? new Date(`${selectedDate}T00:00:00`) : null}
            onChange={handleDateChange}
            minDate={new Date()}
            disablePast
            format="DD/MM/YYYY"
            textFieldProps={{
              required: true,
              sx: {
                '& .MuiInputBase-root': {
                  borderRadius: '16px',
                },
              },
            }}
          />
          {selectedDate && (
            <p className="mt-2 text-sm text-primary-200 font-medium">
              Selected Date:{' '}
              {format(new Date(`${selectedDate}T00:00:00`), 'dd/MM/yyyy')}
            </p>
          )}
        </div>

        {/* Anything specific we should know? */}
        <div className="mb-6">
          <label className="block text-primary-500 text-sm font-medium mb-3">
            Anything specific we should know?
          </label>
          <textarea
            value={finalInstructions}
            onChange={handleFinalInstructionsChange}
            placeholder="Write your instructions here in any..."
            className="w-full bg-white rounded-[8px]! px-4 py-3 text-gray-900 placeholder-primary-200 focus:outline-none border border-gray-300 resize-none"
            rows={4}
          />
        </div>

        {/* Urgency Toggle */}
        <div className="flex items-center justify-between pb-6 mb-6">
          <span className="text-primary-500 text-sm font-medium">
            This is urgent (Extra Fee may apply)
          </span>
          <button
            onClick={handleUrgencyToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${isUrgent ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            type="button"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Post Job Button */}
        <div className="flex justify-end">
          <Button
            onClick={handlePostJob}
            disabled={isLoading || (!selectedLocation.address || selectedLocation.address === 'Location not set')}
            loading={isLoading}
            size="md"
            className="px-6"
          >
            {(!selectedLocation.address || selectedLocation.address === 'Location not set')
                ? 'Set Address First' : 'Post Job'}
          </Button>
        </div>
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
