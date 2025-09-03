import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
import { geocodeLocation, geocodeLocationFallback } from '../lib/geocoding';
import { calculateBirthChart, validateBirthData } from '../lib/jyotishCalculations';
import ChartDisplay from '../components/ChartDisplay';
import '../styles/BirthChart.css';

const BirthChartForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    birthTime: '',
    country: '',
    state: '',
    city: ''
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (formData.country) {
      setStates(State.getStatesOfCountry(formData.country));
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    } else {
      setStates([]);
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.country && formData.state) {
      setCities(City.getCitiesOfState(formData.country, formData.state));
      setFormData(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [formData.country, formData.state]);

  // Clear error when form data changes
  useEffect(() => {
    if (error) {
      setError('');
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setChartData(null);

    try {
      // Validate form data
      if (!formData.name || !formData.birthDate || !formData.birthTime ||
          !formData.country || !formData.state || !formData.city) {
        throw new Error('Please fill in all required fields');
      }

      // Step 1: Geocode the location
      console.log('Geocoding location...');
      let locationCoords;

      try {
        // Try Google Maps first
        locationCoords = await geocodeLocation({
          country: countries.find(c => c.isoCode === formData.country)?.name,
          state: states.find(s => s.isoCode === formData.state)?.name,
          city: formData.city
        });
      } catch (geocodeError) {
        console.warn('Google Maps geocoding failed, trying fallback:', geocodeError);
        // Fallback to OpenStreetMap
        locationCoords = await geocodeLocationFallback({
          country: countries.find(c => c.isoCode === formData.country)?.name,
          state: states.find(s => s.isoCode === formData.state)?.name,
          city: formData.city
        });
      }

      console.log('Location coordinates:', locationCoords);
      setCoordinates(locationCoords);

      // Step 2: Prepare birth data for calculations
      const birthData = {
        date: formData.birthDate,
        time: formData.birthTime,
        lat: locationCoords.lat,
        lng: locationCoords.lng,
        timezone: 0 // You might want to calculate this based on location
      };

      // Validate birth data
      validateBirthData(birthData);

      // Step 3: Calculate birth chart
      console.log('Calculating birth chart...');
      const calculatedChart = await calculateBirthChart(birthData);
      console.log('Birth chart calculated:', calculatedChart);

      setChartData(calculatedChart);

      // Step 4: Render the chart (will be done in useEffect)

    } catch (error) {
      console.error('Error generating birth chart:', error);
      setError(error.message || 'Failed to generate birth chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="birth-chart-container">
      <div className="stars"></div>
      <div className="content">
        <h1>Get Your Birth Chart</h1>

        {error && (
          <div className="error-message" style={{
            background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
            color: '#c33',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fcc',
            boxShadow: '0 2px 8px rgba(204, 51, 51, 0.1)',
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message" style={{
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            color: '#1976d2',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #90caf9',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)',
            fontSize: '14px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}>
            <div className="spinner" style={{
              width: '20px',
              height: '20px',
              border: '2px solid #90caf9',
              borderTop: '2px solid #1976d2',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span>Generating your birth chart... This may take a few moments.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="birth-chart-form">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-field"
          />

          <input
            type="date"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            required
            className="form-field"
          />

          <input
            type="time"
            name="birthTime"
            value={formData.birthTime}
            onChange={handleChange}
            required
            className="form-field"
          />

          <select name="country" value={formData.country} onChange={handleChange} className="form-field" required>
            <option value="">Select Country...</option>
            {countries.map(country => (
              <option key={country.isoCode} value={country.isoCode}>{country.name}</option>
            ))}
          </select>

          <select name="state" value={formData.state} onChange={handleChange} className="form-field" required disabled={!formData.country}>
            <option value="">Select State...</option>
            {states.map(state => (
              <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
            ))}
          </select>

          <select name="city" value={formData.city} onChange={handleChange} className="form-field" required disabled={!formData.state}>
            <option value="">Select City...</option>
            {cities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating Chart...' : 'Generate Birth Chart'}
          </button>
        </form>

        {/* Chart Display Area */}
        {chartData && coordinates && (
          <ChartDisplay
            chartData={chartData}
            birthInfo={{
              name: formData.name,
              date: formData.birthDate,
              time: formData.birthTime,
              location: coordinates.formatted_address,
              coordinates: coordinates
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default BirthChartForm;