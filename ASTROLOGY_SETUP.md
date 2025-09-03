# Astrology Application Setup Guide

This guide will help you set up and run the enhanced astrology application with Google Maps geocoding, Jyotish calculations, and chart rendering.

## Features

✨ **Complete Astrology Workflow:**
- User input form for birth details and location
- Google Maps geocoding to convert location to coordinates
- Vedic astrology calculations using jyotish-calculations
- Interactive chart rendering with astrochart.js
- Responsive design with error handling and loading states

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Google Maps API key (optional, fallback geocoding available)

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your Google Maps API key:
   ```
   REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   REACT_APP_USE_FALLBACK_GEOCODING=true
   ```

## Google Maps API Setup (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Geocoding API**
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Add the API key to your `.env` file

**Note:** If you don't have a Google Maps API key, the application will automatically use OpenStreetMap's Nominatim service as a fallback.

## Running the Application

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser and navigate to:**
   ```
   http://localhost:5173
   ```

3. **Navigate to the Birth Chart page:**
   - Click on "Sign Up" or go directly to `/birth-chart`

## How to Use

1. **Fill in the Birth Chart Form:**
   - Enter your full name
   - Select birth date and time
   - Choose country, state, and city

2. **Generate Chart:**
   - Click "Generate Birth Chart"
   - Wait for the geocoding and calculations to complete
   - View your personalized Vedic birth chart

## Libraries Used

- **@googlemaps/js-api-loader**: Google Maps JavaScript API integration
- **astronomy-engine**: Accurate astronomical calculations for planetary positions
- **Custom SVG chart renderer**: Browser-compatible Vedic astrology chart visualization
- **country-state-city**: Location data for form dropdowns

## Accurate Astronomical Calculations

This application now uses **astronomy-engine** for precise astronomical calculations, providing:

✅ **Accurate planetary positions** using proper ephemeris data
✅ **Sidereal calculations** for Vedic astrology (Lahiri Ayanamsa)
✅ **Retrograde motion detection** for all planets
✅ **Precise ascendant calculation** based on sidereal time
✅ **Lunar nodes (Rahu/Ketu)** positioning
✅ **Nakshatra and sign calculations** with proper names

### Calculation Features:

- **Tropical to Sidereal conversion** using Lahiri Ayanamsa
- **Real-time retrograde detection** by comparing planetary motion
- **Accurate lunar nodes** (Rahu and Ketu) calculation
- **27 Nakshatras** with pada divisions
- **12 Rashis** (zodiac signs) with degree precision
- **House system** using Placidus method

## Troubleshooting

### Common Issues

1. **"Failed to load Google Maps API"**
   - Check your API key in the `.env` file
   - Ensure Geocoding API is enabled in Google Cloud Console
   - The app will automatically fall back to OpenStreetMap

2. **"Location not found"**
   - Try selecting a different city or state
   - Check if the location name is spelled correctly
   - Some small towns might not be available in the geocoding service

3. **"Birth chart calculation failed"**
   - Ensure all form fields are filled correctly
   - Check that the date and time are in valid formats
   - Try refreshing the page and submitting again

4. **Chart not displaying**
   - Check browser console for JavaScript errors
   - Ensure the container element is properly sized
   - Try refreshing the page

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development

### Project Structure

```
src/
├── components/
│   └── ChartDisplay.jsx          # Chart display component
├── lib/
│   ├── geocoding.js              # Google Maps & fallback geocoding
│   ├── jyotishCalculations.js    # Vedic astrology calculations
│   └── chartRenderer.js          # Chart rendering utilities
├── pages/
│   └── BirthChartForm.jsx        # Main form component
└── styles/
    └── BirthChart.css            # Styling
```

### Adding New Features

1. **Custom Chart Types**: Modify `chartRenderer.js` to add new chart configurations
2. **Additional Calculations**: Extend `jyotishCalculations.js` for more astrological data
3. **Enhanced UI**: Update `ChartDisplay.jsx` for better visualization

## API Rate Limits

- **Google Maps Geocoding**: 50 requests per second, 40,000 requests per month (free tier)
- **OpenStreetMap Nominatim**: 1 request per second (please be respectful)

## Security Notes

- Never commit your `.env` file with real API keys
- Restrict your Google Maps API key to specific domains in production
- Consider implementing server-side geocoding for production applications

## Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify all dependencies are installed correctly
3. Ensure your API keys are valid and properly configured
4. Try the fallback geocoding service if Google Maps fails

## License

This project is for educational and personal use. Please respect the terms of service for all integrated APIs and libraries.
