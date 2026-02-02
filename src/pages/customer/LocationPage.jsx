import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { userAPI } from '../../services/api';
import { Button, Loader } from '../../components';
import CurrentLocationIcon from "../../assets/currentLocation.svg";

  
// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '12px'
};

// Default center
const defaultCenter = {
  lat: -33.839,
  lng: 151.207
};

// Google Maps libraries - static array to prevent reloading
const libraries = ['places'];

const LocationPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [map, setMap] = useState(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Google Maps API key
  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY ;

  // Check if user is logged in when page loads
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

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

  // Search function
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Map is already shown, just update location
      setSelectedLocation({
        fullAddress: "1 Denison Street, North Sydney NSW 2060, Australia",
        lat: -33.839,
        lng: 151.207,
        coordinates: "-33.839, 151.207",
      });
    }
  };

  // Get current location with Google Maps API
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          const data = await response.json();
          
          if (data.status === "OK") {
            const fullAddress = data.results[0].formatted_address;

            const location = {
              fullAddress: fullAddress,
              lat: latitude,
              lng: longitude,
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
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
          
          const location = {
            fullAddress: `Current Location (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
            lat: latitude,
            lng: longitude,
            coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
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
        setError("Unable to access your location. Please allow GPS.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleManualAddressSubmit = (e) => {
    e.preventDefault();
    if (manualAddress.trim()) {
      // Get current GPS coordinates even when manually entering address
      if (!navigator.geolocation) {
        // Fallback to default coordinates if geolocation not available
        setSelectedLocation({
          fullAddress: manualAddress.trim(),
          lat: -33.839, 
          lng: 151.207,
          coordinates: "-33.839, 151.207",
        });
        setShowManualInput(false);
        setManualAddress("");
        return;
      }

      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({
            fullAddress: manualAddress.trim(),
            lat: latitude,
            lng: longitude,
            coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
          setShowManualInput(false);
          setManualAddress("");
          setIsLoading(false);
        },
        (err) => {
          console.error("Location error:", err);
          // Fallback to default coordinates if GPS fails
          setSelectedLocation({
            fullAddress: manualAddress.trim(),
            lat: -33.839, 
            lng: 151.207,
            coordinates: "-33.839, 151.207",
          });
          setShowManualInput(false);
          setManualAddress("");
          setIsLoading(false);
          setError("GPS access failed. Using default coordinates.");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  };

  const handleChangeLocation = () => {
    setShowManualInput(true);
    setManualAddress(selectedLocation?.fullAddress || "");
  };

  const handleCancelManual = () => {
    setShowManualInput(false);
    setManualAddress("");
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) return;
  
    const fullAddress = selectedLocation.fullAddress || '';
    const addressParts = fullAddress.split(',');
    const city = addressParts.length > 1 
      ? addressParts[addressParts.length - 2]?.trim() 
      : "Unknown";
  
    const locationData = {
      address: selectedLocation.address || selectedLocation.fullAddress,
      city: city,
      fullAddress: selectedLocation.fullAddress,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      coordinates: {
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      }
    };
  
    try {
      // BACKEND API CALL
      await userAPI.updateLocation(locationData);
  
      //  STORE IN LOCAL STORAGE
      localStorage.setItem("userLocation", JSON.stringify(locationData));
  
      // FIRE FRONTEND EVENT
      window.dispatchEvent(new CustomEvent("locationUpdated"));
  
    } catch (error) {
      console.error("Location update failed:", error);
    }
  
    // REDIRECT LOGIC
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
  
    if (!user) return navigate("/login");
  
    const userType = user?.userType || user?.role;
    const existingLocation = localStorage.getItem("userLocation");
  
    // First time user → Always go to customer dashboard
    if (!existingLocation) return navigate("/customer-dashboard");
  
    if (["Customer", "customer"].includes(userType)) {
      return navigate("/customer-dashboard");
    }
  
    return navigate("/cleaner-dashboard");
  };
  

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary-500 mb-2">
              Pick your location
            </h2>
            <p className="text-primary-200 font-medium">
              Add your location so we can match you with the closest cleaners.
            </p>
          </div>

          {/* Search and Location Controls */}
          <div className="mb-4 space-y-3">
            <form onSubmit={handleSearch} className="space-y-3">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for area, street name..."
                className="w-full pl-4 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none"
              />

              {/* Get Current Location */}
              <Button
                type="button"
                onClick={handleGetCurrentLocation}
                loading={isLoading}
                variant="secondary"
                size="md"
                icon={CurrentLocationIcon}
                fullWidth
              >
                Get current location
              </Button>
            </form>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}
          </div>

          {/* Google Map */}
          <div className="rounded-xl overflow-hidden mb-4 border h-72">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  selectedLocation
                    ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                    : defaultCenter
                }
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

          {/* Manual Address Input Form */}
          {showManualInput && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
              <h3 className="font-medium text-primary-500 mb-3">Enter Address Manually</h3>
              <form onSubmit={handleManualAddressSubmit} className="space-y-3">
                <textarea
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Enter your full address..."
                  className="w-full p-3 border border-gray-300 rounded-lg! focus:outline-none resize-none text-primary-500 font-medium"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                  >
                    Save Address
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelManual}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Selected Location Card */}
          {selectedLocation && !showManualInput && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-primary-500 mb-2">
                    {selectedLocation.fullAddress}
                  </div>
                  <div className="text-xs text-primary-200 font-medium">
                    Coordinates: {selectedLocation.coordinates}
                  </div>
                </div>
                <Button
                  onClick={handleChangeLocation}
                  variant="link"
                  size="sm"
                >
                  Change
                </Button>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <Button
            onClick={handleConfirmLocation}
            fullWidth
            size="lg"
          >
            Confirm Location
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
