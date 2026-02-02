import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  DirectionsRenderer,
  Polyline,
} from "@react-google-maps/api";
import { Clock, MapPin } from "lucide-react";
import Marker1Icon from "../../assets/marker1.svg";
import Marker2Icon from "../../assets/marker2.svg";
import Loader from "../common/Loader";

// Define libraries outside component to prevent re-creation
const GOOGLE_MAPS_LIBRARIES = ["places"];
const containerStyle = { width: "100%", height: "100%", borderRadius: "1rem" };

const MapWithRealtimeTracking = ({ customerLocation, cleanerLocation: externalCleanerLocation, onRouteInfo }) => {
  const [cleanerLocation, setCleanerLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [polylinePath, setPolylinePath] = useState([]);
  const mapRef = useRef(null);
  const initialCleanerLocationRef = useRef(null);
  const lastApiCallRef = useRef(null);
  const lastCleanerLocationRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isCalculatingRouteRef = useRef(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAP_API_KEY;

  // Memoize loader options to prevent re-initialization
  const loaderOptions = useMemo(() => ({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  }), [apiKey]);

  const { isLoaded } = useJsApiLoader(loaderOptions);

  // Use external cleaner location if provided, otherwise track internally
  useEffect(() => {
    if (externalCleanerLocation) {
      setCleanerLocation(externalCleanerLocation);
      initialCleanerLocationRef.current = externalCleanerLocation; 
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    // Get initial location first
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCleanerLocation(newLocation);
        initialCleanerLocationRef.current = newLocation; 
      },
      (error) => {
        console.error("❌ Error getting initial location:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        
        // Show user-friendly error
        if (error.code === 1) {
          alert("Location permission denied. Please enable location access in your browser settings.");
        } else if (error.code === 2) {
          alert("Location unavailable. Please check your GPS/network connection.");
        } else if (error.code === 3) {
          alert("Location request timed out. Please try again.");
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );

    // Then watch for updates with less frequent updates
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCleanerLocation(newLocation);
      },
      (error) => {
        console.error("❌ Error watching location:", error);
        console.error("Watch error code:", error.code);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 }
    );

    // Polling interval for testing with Chrome Sensors
    // This helps when using Chrome DevTools Sensors
    const pollingInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCleanerLocation(newLocation);
        },
        (error) => {
          // Silently ignore timeout errors in polling (they're expected)
          if (error.code !== 3) {
            console.error("❌ Polling error:", error.code, error.message);
          }
        },
        { enableHighAccuracy: false, maximumAge: 1000, timeout: 10000 }
      );
    }, 10000); // Poll every 10 seconds

    return () => {
      navigator.geolocation.clearWatch(watcher);
      clearInterval(pollingInterval);
    };
  }, [externalCleanerLocation]);

  // Helper function to calculate distance between two coordinates (in meters)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Fetch directions with debouncing and throttling
  const fetchDirections = useCallback(() => {
    if (!isLoaded || !customerLocation || !cleanerLocation || isCalculatingRouteRef.current) {
      return;
    }

    const now = Date.now();
    const lastCall = lastApiCallRef.current;
    const lastLocation = lastCleanerLocationRef.current;

    // Check if we should skip this API call
    if (lastLocation && lastCall) {
      // Calculate distance moved since last API call
      const distanceMoved = calculateDistance(
        lastLocation.lat,
        lastLocation.lng,
        cleanerLocation.lat,
        cleanerLocation.lng
      );

      // Skip if:
      // 1. Less than 30 seconds since last call AND moved less than 50 meters
      // 2. Less than 5 seconds since last call (hard throttle)
      const timeSinceLastCall = now - lastCall;
      
      if (timeSinceLastCall < 5000) {
        // Hard throttle: minimum 5 seconds between calls
        return;
      }

      if (timeSinceLastCall < 30000 && distanceMoved < 50) {
        // Soft throttle: if moved less than 50m and less than 30s, skip
        return;
      }
    }

    // Mark as calculating to prevent concurrent calls
    isCalculatingRouteRef.current = true;
    lastApiCallRef.current = now;
    lastCleanerLocationRef.current = { ...cleanerLocation };

    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route({
        origin: cleanerLocation,
        destination: customerLocation,
        travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
        isCalculatingRouteRef.current = false;
        
        if (status === 'OK' && result) {
            setDirections(result);

            const route = result.routes[0].legs[0];
            const newRouteInfo = {
                distance: route.distance.text,
                duration: route.duration.text,
                distanceValue: route.distance.value,
                durationValue: route.duration.value,
            };
            setRouteInfo(newRouteInfo);

            // Extract polyline path from directions and extend to exact marker positions
            const path = [];
            
            // Start with exact cleaner location
            path.push({
                lat: cleanerLocation.lat,
                lng: cleanerLocation.lng
            });
            
            // Add route points
            result.routes[0].overview_path.forEach(point => {
                path.push({
                    lat: point.lat(),
                    lng: point.lng()
                });
            });
            
            // End with exact customer location
            path.push({
                lat: customerLocation.lat,
                lng: customerLocation.lng
            });
            
            setPolylinePath(path);

            // Send route info to parent
            if (onRouteInfo) {
                onRouteInfo(newRouteInfo);
            }
        } else {
            console.error('❌ Directions failed:', status);
            isCalculatingRouteRef.current = false;
        }
    });
  }, [cleanerLocation, customerLocation, isLoaded, onRouteInfo]);

  // Debounced effect to fetch directions
  useEffect(() => {
    if (!isLoaded || !customerLocation || !cleanerLocation) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: wait 1 second before calling API
    debounceTimerRef.current = setTimeout(() => {
      fetchDirections();
    }, 1000);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [cleanerLocation, customerLocation, isLoaded, fetchDirections]);


  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (!isLoaded) return <Loader message="Loading Google Maps..." />;
  if (!customerLocation) return <div>Customer location not available</div>;
  if (!cleanerLocation) return <div>Fetching your location...</div>;

  return (
    <div className="w-full h-96 rounded-2xl relative">
      {/* Route Information Overlay */}
      {routeInfo && (
        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <MapPin className="h-4 w-4 text-blue-600" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Distance</div>
                <div className="text-sm font-semibold text-gray-900">{routeInfo.distance}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                <Clock className="h-4 w-4 text-green-600" strokeWidth={2} />
              </div>
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-900">{routeInfo.duration}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cleaner Location Info */}
      <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <div>
            <div className="text-xs text-gray-500">Cleaner Location</div>
            <div className="text-sm font-medium text-gray-900">Live tracking active</div>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={cleanerLocation}
        zoom={15}
        onLoad={onMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          gestureHandling: "greedy",
        }}
      >
        {/* Cleaner Marker */}
        <Marker
          position={cleanerLocation}
          title="You (Cleaner)"
          icon={{
            url: Marker1Icon,
            scaledSize: new window.google.maps.Size(48, 48),
            anchor: new window.google.maps.Point(20, 20), 
          }}
        />

        {/* Customer Marker */}
        <Marker
          position={customerLocation}
          title="Customer"
          icon={{
            url: Marker2Icon,
            scaledSize: new window.google.maps.Size(58, 58),
            anchor: new window.google.maps.Point(20, 20), 
          }}
        />

        {/* Custom Polyline */}
        {polylinePath.length > 0 && (
          <Polyline
            path={polylinePath}
            options={{
              strokeColor: "#1F6FEB",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};

export default MapWithRealtimeTracking;
