import { Loader } from '@googlemaps/js-api-loader';

// You'll need to replace this with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

let geocoder = null;
let isLoaded = false;

/**
 * Initialize Google Maps API and geocoder
 */
export const initializeGoogleMaps = async () => {
  if (isLoaded && geocoder) {
    return geocoder;
  }

  try {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['geocoding']
    });

    await loader.load();
    geocoder = new window.google.maps.Geocoder();
    isLoaded = true;
    return geocoder;
  } catch (error) {
    console.error('Error loading Google Maps API:', error);
    throw new Error('Failed to load Google Maps API');
  }
};

/**
 * Convert location details to latitude and longitude coordinates
 * @param {Object} locationData - Object containing country, state, city
 * @returns {Promise<Object>} - Object with lat, lng coordinates
 */
export const geocodeLocation = async (locationData) => {
  try {
    // Ensure Google Maps is initialized
    if (!geocoder) {
      await initializeGoogleMaps();
    }

    // Build address string from location data
    const addressParts = [];
    if (locationData.city) addressParts.push(locationData.city);
    if (locationData.state) addressParts.push(locationData.state);
    if (locationData.country) addressParts.push(locationData.country);
    
    const address = addressParts.join(', ');
    
    if (!address.trim()) {
      throw new Error('No location data provided');
    }

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Fallback geocoding using a free service (for development/testing)
 * Note: This is less accurate and has rate limits
 */
export const geocodeLocationFallback = async (locationData) => {
  try {
    const addressParts = [];
    if (locationData.city) addressParts.push(locationData.city);
    if (locationData.state) addressParts.push(locationData.state);
    if (locationData.country) addressParts.push(locationData.country);
    
    const address = addressParts.join(', ');
    
    if (!address.trim()) {
      throw new Error('No location data provided');
    }

    // Using OpenStreetMap Nominatim API as fallback
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        formatted_address: data[0].display_name
      };
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    console.error('Fallback geocoding error:', error);
    throw error;
  }
};
