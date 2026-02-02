import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import CurrentLocationIcon from '../../assets/currentLocation.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import { userAPI } from '../../services/api';
import { Button, FloatingLabelInput, Loader } from '../../components';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

// Default center
const defaultCenter = {
  lat: -37.8136,
  lng: 144.9631
};

// Google Maps libraries
const libraries = ['places'];

const SetCleanerLocationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(25);
  const [customRadius, setCustomRadius] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  // Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries
  });

  // Map options
  const mapOptions = {
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false
  };

  // Map callbacks
  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Load saved location and search radius from backend on mount
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const res = await userAPI.getProfile();
        const userData = res?.data?.user || res?.data || null;
        if (!userData) return;

        const savedRadius = typeof userData.searchRadius === 'number'
          ? userData.searchRadius
          : (typeof userData.location?.searchRadius === 'number' ? userData.location.searchRadius : null);
        if (typeof savedRadius === 'number') {
          setSearchRadius(savedRadius);
        }

        const lat = userData.location?.coordinates?.lat;
        const lng = userData.location?.coordinates?.lng;
        const addr = userData.address || userData.location?.address || userData.location?.fullAddress;
        
        
        // Check for valid coordinates (not null, not undefined, and not 0,0)
        const hasValidCoordinates = lat != null && lng != null && 
                                   lat !== 0 && lng !== 0 && 
                                   !isNaN(lat) && !isNaN(lng);
        
        if (hasValidCoordinates && addr) {
          setSelectedLocation({
            address: addr,
            fullAddress: addr,
            lat,
            lng,
          });
        }
      } catch (_) {
        // ignore profile load errors; fall back to defaults
      }
    };
    loadUserLocation();
  }, []);

  // Get current location with Google Maps API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

      setIsLoading(true);
    setError("");

      navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          
          if (data.status === "OK") {
            const fullAddress = data.results[0].formatted_address;

            const location = {
              address: fullAddress,
              fullAddress: fullAddress,
              lat: latitude,
              lng: longitude,
            };


            setSelectedLocation(location);
          } else {
            console.error("Geocoding error:", data.status, data.error_message);
            
            let errorMessage = "Unable to get address details. ";
            switch (data.status) {
              case "REQUEST_DENIED":
                errorMessage += "Geocoding API is not enabled. Please enable it in Google Cloud Console.";
                break;
              case "OVER_QUERY_LIMIT":
                errorMessage += "API quota exceeded. Please try again later.";
                break;
              case "ZERO_RESULTS":
                errorMessage += "No results found for this location.";
                break;
              default:
                errorMessage += "Please try again.";
                break;
            }
            setError(errorMessage);
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          
          // Fallback: Use coordinates only if geocoding fails
          const location = {
            address: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            fullAddress: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            lat: latitude,
            lng: longitude,
          };


          setSelectedLocation(location);
          setError("Address lookup failed, but location coordinates are available.");
        } finally {
          setIsLoading(false);
        }
        },
      (err) => {
        console.error("Location error:", err);
          setIsLoading(false);
        
        let errorMessage = "Unable to access your location. ";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings and try again.";
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your GPS settings.";
            break;
          case err.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "Please check your GPS settings and try again.";
            break;
        }
        setError(errorMessage);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleRadiusChange = (value) => {
    setSearchRadius(value);
    setCustomRadius("");
  };

  const handleCustomRadiusChange = (e) => {
    const inputValue = e.target.value;
    setCustomRadius(inputValue);
    
    // Only update searchRadius if the input is a valid number within range
    if (inputValue === "") {
      // Allow clearing the input
      return;
    }
    
    const value = parseInt(inputValue);
    if (!isNaN(value) && value >= 0 && value <= 50) {
      setSearchRadius(value);
    }
  };

  // Handle manual address input
  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      setError("Please enter an address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Update only the address, keep the current coordinates
      const location = {
        address: manualAddress.trim(),
        fullAddress: manualAddress.trim(),
        lat: selectedLocation?.lat || null, // Keep current coordinates
        lng: selectedLocation?.lng || null, // Keep current coordinates
      };

      setSelectedLocation(location);
      setShowManualInput(false);
      setManualAddress("");
    } catch (err) {
      console.error("Error saving manual address:", err);
      setError("Failed to save address. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedLocation) {
      setError('Please select a location first.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Prepare location data for API
      const locationData = {
        address: selectedLocation.fullAddress || selectedLocation.address,
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        }
      };

      // Save location via API
      const response = await userAPI.updateLocation(locationData);
      
      if (response.success) {
        // Persist search radius separately to avoid backend defaulting
        try {
          await userAPI.updateSearchRadius(searchRadius);
        } catch (radiusError) {
          // Don't fail the whole process if radius save fails
        }
        
        // Dispatch location update event
        window.dispatchEvent(new CustomEvent('locationUpdated', {
          detail: {
            address: selectedLocation.address,
            city: selectedLocation.address?.split(',')[0] || 'Location not set',
            coordinates: [selectedLocation.lng, selectedLocation.lat]
          }
        }));
        
        // Check if user came from Cleaner Jobs page
        const fromCleanerJobs = location.state?.from === 'cleaner-jobs';
        
        if (fromCleanerJobs) {
          // Navigate back to Cleaner Jobs page
          navigate('/cleaner-jobs');
        } else {
          // Default navigation to cleaner dashboard
          navigate('/cleaner-dashboard');
        }
      } else {
        setError(response.message || 'Failed to save location. Please try again.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setError('Failed to save location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Google Map Section */}
        <div className="h-80 rounded-t-2xl overflow-hidden border">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={15}
              onLoad={onLoad}
              onUnmount={onUnmount}
              options={mapOptions}
            >
              {selectedLocation && (
                <Marker
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  title={selectedLocation.fullAddress}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100">
              <Loader message="Loading map..." />
            </div>
          )}
        </div>

        {/* Location Details Section */}
        <div className="bg-white rounded-b-2xl p-6 space-y-6">
          {/* Address Display */}
          {selectedLocation ? (
          <div className="flex items-start justify-between space-x-3">
            <div className="flex items-start space-x-3 flex-1">
              <img src={MapPinIcon} alt="Location" className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-semibold text-primary-500 text-sm">
                    {selectedLocation.fullAddress || selectedLocation.address}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setManualAddress(selectedLocation.fullAddress || selectedLocation.address || "");
                setShowManualInput(true);
              }}
              variant="link"
              size="sm"
              className="text-sm text-primary-600 font-semibold hover:text-blue-700"
            >
              Change
            </Button>
          </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                No location selected. Use the button below to get your current location or click on the map to select an area.
              </p>
            </div>
          )}

          {/* Manual Address Input */}
          {showManualInput && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-primary-500 mb-2">
                  Enter Address Manually
                </label>
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter your address..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none text-primary-200 font-medium "
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleManualAddressSubmit}
                  disabled={isLoading || !manualAddress.trim()}
                  loading={isLoading}
                  size="sm"
                  className="flex-1"
                >
                  Save Address
                </Button>
                <Button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualAddress("");
                    setError("");
                  }}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="mb-2">{error}</div>
              <div className="text-xs text-gray-600 mt-2">
                <strong>How to fix:</strong>
                <br />• Click the location icon in your browser's address bar
                <br />• Select "Allow" for location access
                <br />• Refresh the page and try again
              </div>
              <Button
                onClick={() => {
                  setError("");
                  handleUseCurrentLocation();
                }}
                size="xs"
                className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Use Current Location Button */}
          <Button
            onClick={handleUseCurrentLocation}
            disabled={isLoading}
            loading={isLoading}
            variant="secondary"
            size="md"
            icon={CurrentLocationIcon}
            fullWidth
            className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
          >
            Use Current Location
          </Button>

          {/* Alternative: Manual Location Entry */}
          <div className="text-center">
            <p className="text-xs text-primary-200 font-medium mb-2">
              Can't access location? You can also search for your area on the map above.
            </p>
          </div>

          {/* Distance Slider */}
          <div className="">
            <div className="flex justify-between text-base">
              <span className="text-primary-200 font-medium">0 km</span>
              <span className="font-semibold text-primary-500">{searchRadius} km</span>
              <span className="text-primary-500 font-bold">50 km</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max="50"
                value={searchRadius}
                onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1F6FEB] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1F6FEB] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm"
                style={{
                  background: `linear-gradient(to right, #1F6FEB 0%, #1F6FEB ${(searchRadius / 50) * 100}%, #E5E7EB ${(searchRadius / 50) * 100}%, #E5E7EB 100%)`
                }}
              />
            </div>
          </div>

          {/* Custom Value Input */}
          <div>
            <FloatingLabelInput
              id="customRadius"
              name="customRadius"
              label="Enter Custom Value (km)"
              type="number"
              value={customRadius}
              onChange={handleCustomRadiusChange}
              min="0"
              max="50"
              placeholder=""
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-5">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
            size="md"
          >
            Save Preferences
          </Button>
        </div>
      </div>
      </div>
    </>
  );
};

export default SetCleanerLocationPage;
