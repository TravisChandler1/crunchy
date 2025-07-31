"use client";
import { useState, useEffect } from "react";
import { useCart } from "./CartContext";

interface DeliverySelectorProps {
  onDeliveryChange: (hasDelivery: boolean, charge: number) => void;
}

interface AddressSuggestion {
  geometry: { lat: number; lng: number };
  formatted: string;
  components?: Record<string, string>;
}

export default function DeliverySelector({ onDeliveryChange }: DeliverySelectorProps) {
  const { deliveryInfo, setDeliveryInfo } = useCart();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showManualMap, setShowManualMap] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{ lat: number; lng: number } | null>(null);



  const handleDeliveryToggle = (isDelivery: boolean) => {
    setDeliveryInfo(prev => ({
      ...prev,
      isDelivery,
      address: isDelivery ? prev.address : "",
      coordinates: isDelivery ? prev.coordinates : null,
      distance: isDelivery ? prev.distance : null,
      deliveryCharge: isDelivery ? prev.deliveryCharge : 0,
    }));
    
    if (!isDelivery) {
      onDeliveryChange(false, 0);
      setLocationError("");
    }
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Try to get address using reverse geocoding
          let address = "Getting address...";
          
          try {
            // Try multiple geocoding services for better results
            let geocodeData = null;
            
            // First try OpenCage with a better API key setup
            try {
              const geocodeResponse = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}&language=en&pretty=1`
              );
              geocodeData = await geocodeResponse.json();
              console.log("Geocoding response:", geocodeData);
             } catch {
              console.log("OpenCage failed, trying alternative");
            }
            
            // If OpenCage fails or returns no results, try Nominatim (free alternative)
            if (!geocodeData?.results?.[0]) {
              try {
                const nominatimResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                );
                const nominatimData = await nominatimResponse.json();
                console.log("Nominatim response:", nominatimData);
                
                if (nominatimData?.display_name) {
                  address = nominatimData.display_name;
                } else if (nominatimData?.address) {
                  const addr = nominatimData.address;
                  const parts = [];
                  if (addr.house_number) parts.push(addr.house_number);
                  if (addr.road) parts.push(addr.road);
                  if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
                  if (addr.city || addr.town || addr.village) parts.push(addr.city || addr.town || addr.village);
                  if (addr.state) parts.push(addr.state);
                  if (addr.country) parts.push(addr.country);
                  
                  if (parts.length > 0) {
                    address = parts.join(', ');
                  }
                }
              } catch {
                console.log("Nominatim also failed");
              }
            } else if (geocodeData.results?.[0]) {
              const result = geocodeData.results[0];
              
              if (result.formatted) {
                address = result.formatted;
              } else if (result.components) {
                const components = result.components;
                const addressParts = [];
                
                if (components.house_number) addressParts.push(components.house_number);
                if (components.road) addressParts.push(components.road);
                if (components.neighbourhood) addressParts.push(components.neighbourhood);
                if (components.suburb) addressParts.push(components.suburb);
                if (components.city || components.town || components.village) {
                  addressParts.push(components.city || components.town || components.village);
                }
                if (components.state) addressParts.push(components.state);
                if (components.country) addressParts.push(components.country);
                
                if (addressParts.length > 0) {
                  address = addressParts.join(', ');
                }
              }
            }
            
            // Final fallback - at least show the area
            if (address === "Getting address...") {
              address = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
            
          } catch (geocodeError) {
            console.log("All geocoding failed:", geocodeError);
            address = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          // Store the location but don't calculate delivery yet - wait for user confirmation
          setDeliveryInfo(prev => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude },
            address,
            distance: null,
            deliveryCharge: 0,
          }));

          // Automatically show the map when location is detected
          setShowMap(true);

        } catch (error) {
          console.error("Error getting location:", error);
          setLocationError("Failed to get your location. Please try entering your address manually.");
        }

        setIsLoadingLocation(false);
      },
      () => {
        setLocationError("Unable to retrieve your location. Please enter your address manually.");
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const confirmLocation = async () => {
    if (!deliveryInfo.coordinates) return;

    try {
      // Use our API to calculate distance and charge
      const response = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: deliveryInfo.coordinates.lat, 
          lng: deliveryInfo.coordinates.lng 
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setDeliveryInfo(prev => ({
        ...prev,
        distance: data.distance,
        deliveryCharge: data.deliveryCharge,
      }));

      onDeliveryChange(true, data.deliveryCharge);
    } catch (error) {
      console.error("Error calculating distance:", error);
      setLocationError("Failed to calculate delivery charge. Please try again.");
    }
  };

  // Debounce function for address search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (deliveryInfo.address.length >= 3 && !deliveryInfo.coordinates) {
        searchAddresses(deliveryInfo.address);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [deliveryInfo.address, deliveryInfo.coordinates]);

  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearchingAddress(true);
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}&countrycode=ng&limit=5&no_annotations=1`
      );
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setAddressSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error searching addresses:", error);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }
    setIsSearchingAddress(false);
  };

  const handleAddressChange = async (address: string) => {
    setDeliveryInfo(prev => ({ ...prev, address }));
    
    // Clear previous delivery info when typing
    setDeliveryInfo(prev => ({
      ...prev,
      coordinates: null,
      distance: null,
      deliveryCharge: 0,
    }));
    onDeliveryChange(false, 0);

    // If address is long enough, try to geocode it and show map
    if (address.length >= 10) {
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}&countrycode=ng&limit=1`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const { lat, lng } = data.results[0].geometry;
          setMapCenter({ lat, lng });
          setShowManualMap(true);
          setSelectedMapLocation(null);
        }
      } catch (error) {
        console.error("Error geocoding address:", error);
      }
    } else {
      setShowManualMap(false);
      setMapCenter(null);
      setSelectedMapLocation(null);
    }
  };

  const confirmMapLocation = async () => {
    if (!selectedMapLocation) return;

    try {
      // Get address for the selected coordinates
      const geocodeResponse = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${selectedMapLocation.lat}+${selectedMapLocation.lng}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY || 'demo'}`
      );
      const geocodeData = await geocodeResponse.json();
      let address = deliveryInfo.address;
      if (geocodeData.results?.[0]?.formatted) {
        address = geocodeData.results[0].formatted;
      }

      // Calculate distance and charge
      const distanceResponse = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          lat: selectedMapLocation.lat, 
          lng: selectedMapLocation.lng 
        })
      });
      
      const distanceData = await distanceResponse.json();
      
      if (distanceData.error) {
        throw new Error(distanceData.error);
      }

      setDeliveryInfo(prev => ({
        ...prev,
        coordinates: selectedMapLocation,
        address,
        distance: distanceData.distance,
        deliveryCharge: distanceData.deliveryCharge,
      }));

      onDeliveryChange(true, distanceData.deliveryCharge);
      setShowManualMap(false);
      setLocationError("");
    } catch (error) {
      console.error("Error confirming map location:", error);
      setLocationError("Failed to confirm location. Please try again.");
    }
  };

  const selectAddress = async (suggestion: AddressSuggestion) => {
    const { lat, lng } = suggestion.geometry;
    const address = suggestion.formatted;
    
    setDeliveryInfo(prev => ({ ...prev, address }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
    
    try {
      // Use our API to calculate distance and charge
      const distanceResponse = await fetch('/api/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      });
      
      const distanceData = await distanceResponse.json();
      
      if (distanceData.error) {
        throw new Error(distanceData.error);
      }

      setDeliveryInfo(prev => ({
        ...prev,
        coordinates: { lat, lng },
        distance: distanceData.distance,
        deliveryCharge: distanceData.deliveryCharge,
      }));

      onDeliveryChange(true, distanceData.deliveryCharge);
      setLocationError("");
    } catch (error) {
      console.error("Error calculating delivery charge:", error);
      setLocationError("Failed to calculate delivery charge for this address.");
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

  return (
    <div className="mb-6 p-4 border border-[#7ed957] rounded-lg bg-black/20">
      <h3 className="text-lg font-bold text-[#7ed957] mb-3">Delivery Options</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="deliveryOption"
            checked={!deliveryInfo.isDelivery}
            onChange={() => handleDeliveryToggle(false)}
            className="text-[#7ed957]"
          />
          <span className="text-yellow-100">Pickup from store</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="deliveryOption"
            checked={deliveryInfo.isDelivery}
            onChange={() => handleDeliveryToggle(true)}
            className="text-[#7ed957]"
          />
          <span className="text-yellow-100">Home delivery</span>
        </label>
      </div>

      {deliveryInfo.isDelivery && (
        <div className="space-y-3">
          <div>
            <button
              onClick={getCurrentLocation}
              disabled={isLoadingLocation}
              className="w-full py-2 px-4 bg-[#7ed957] text-[#45523e] rounded-lg font-semibold hover:bg-[#45523e] hover:text-white transition disabled:opacity-50"
            >
              {isLoadingLocation ? "Getting location..." : "Use my current location"}
            </button>
          </div>

          <div className="text-center text-yellow-100">or</div>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter your delivery address"
              value={deliveryInfo.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              onFocus={() => deliveryInfo.address.length >= 3 && addressSuggestions.length > 0 && setShowSuggestions(true)}
              className="w-full px-3 py-2 rounded-lg border border-[#7ed957] text-[#45523e] bg-white focus:outline-none focus:ring-2 focus:ring-[#7ed957]"
            />
            
            {isSearchingAddress && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#7ed957]"></div>
              </div>
            )}

            {/* Address Suggestions Dropdown */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#7ed957] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectAddress(suggestion);
                    }}
                    className="px-4 py-3 hover:bg-[#7ed957]/10 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-[#7ed957]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {suggestion.components?.road || suggestion.components?.neighbourhood || suggestion.components?.suburb || 'Unknown Location'}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.formatted}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map for Manual Address Selection */}
          {showManualMap && mapCenter && (
            <div className="bg-[#7ed957]/10 p-3 rounded-lg">
              <div className="text-yellow-100 text-sm mb-3">
                <div className="font-semibold mb-1">Select Your Exact Location:</div>
                <div className="text-xs">Click on the map to select your precise delivery location</div>
              </div>
              
              <div className="w-full h-64 rounded-lg overflow-hidden border border-[#7ed957]/30 mb-3 relative">
                <iframe
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.01},${mapCenter.lng + 0.01},${mapCenter.lat + 0.01}&layer=mapnik${selectedMapLocation ? `&marker=${selectedMapLocation.lat},${selectedMapLocation.lng}` : ''}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  title="Select Location"
                />
                
                {/* Overlay for click detection */}
                <div 
                  className="absolute inset-0 cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    // Convert pixel coordinates to lat/lng (approximate)
                    const mapWidth = rect.width;
                    const mapHeight = rect.height;
                    
                    const lngRange = 0.02; // bbox range
                    const latRange = 0.02;
                    
                    const lng = mapCenter.lng - 0.01 + (x / mapWidth) * lngRange;
                    const lat = mapCenter.lat + 0.01 - (y / mapHeight) * latRange;
                    
                    setSelectedMapLocation({ lat, lng });
                  }}
                />
                
                {/* Instructions overlay */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  Click to select location
                </div>
                
                {/* Selected location indicator */}
                {selectedMapLocation && (
                  <div className="absolute top-2 right-2 bg-[#7ed957] text-black text-xs px-2 py-1 rounded font-semibold">
                    Location Selected ✓
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={confirmMapLocation}
                  disabled={!selectedMapLocation}
                  className="flex-1 py-2 px-3 bg-[#7ed957] text-[#45523e] rounded-lg font-semibold hover:bg-[#45523e] hover:text-white transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Selected Location
                </button>
                <button
                  onClick={() => {
                    setShowManualMap(false);
                    setMapCenter(null);
                    setSelectedMapLocation(null);
                  }}
                  className="flex-1 py-2 px-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {locationError && (
            <div className="text-red-400 text-sm">{locationError}</div>
          )}

          {/* Location confirmation step */}
          {deliveryInfo.coordinates && deliveryInfo.distance === null && (
            <div className="bg-[#7ed957]/10 p-3 rounded-lg">
              <div className="text-yellow-100 text-sm mb-3">
                <div className="font-semibold mb-1">Detected Location:</div>
                <div>{deliveryInfo.address}</div>
              </div>
              
              {/* Map Display */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-yellow-100 text-xs font-semibold">Location on Map:</span>
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className="text-[#7ed957] text-xs hover:text-white transition"
                  >
                    {showMap ? "Hide Map" : "Show Map"}
                  </button>
                </div>
                
                {showMap && (
                  <div className="w-full h-48 rounded-lg overflow-hidden border border-[#7ed957]/30">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${deliveryInfo.coordinates.lng - 0.01},${deliveryInfo.coordinates.lat - 0.01},${deliveryInfo.coordinates.lng + 0.01},${deliveryInfo.coordinates.lat + 0.01}&layer=mapnik&marker=${deliveryInfo.coordinates.lat},${deliveryInfo.coordinates.lng}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title="Your Location"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={confirmLocation}
                  className="flex-1 py-2 px-3 bg-[#7ed957] text-[#45523e] rounded-lg font-semibold hover:bg-[#45523e] hover:text-white transition text-sm"
                >
                  Confirm Location
                </button>
                <button
                  onClick={() => {
                    setDeliveryInfo(prev => ({ ...prev, coordinates: null, address: "" }));
                    setShowMap(false);
                  }}
                  className="flex-1 py-2 px-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition text-sm"
                >
                  Use Different Address
                </button>
              </div>
            </div>
          )}

          {/* Show delivery charge only (no distance) */}
          {deliveryInfo.deliveryCharge > 0 && (
            <div className="bg-[#7ed957]/10 p-3 rounded-lg">
              <div className="text-yellow-100 text-sm">
                <div className="font-bold text-[#7ed957]">
                  Delivery charge: ₦{deliveryInfo.deliveryCharge}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}