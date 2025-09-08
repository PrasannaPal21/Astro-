import { useState, useEffect } from 'react';
import { geocodeLocation, geocodeLocationFallback } from '../lib/geocoding';
import { calculateBirthChart, validateBirthData } from '../lib/jyotishCalculations';
import ChartDisplay from '../components/ChartDisplay';
import '../styles/BirthChart.css';

const BirthChartForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    day: '',
    month: '',
    year: '',
    hour: '',
    minute: '',
    ampm: 'AM',
    birthPlace: '',
    
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  const formatDateTimeFromForm = (data) => {
    const yyyy = String(data.year || '').padStart(4, '0');
    const mm = String(data.month || '').padStart(2, '0');
    const dd = String(data.day || '').padStart(2, '0');
    const hour12 = parseInt(data.hour || '0', 10);
    const minute = String(data.minute || '').padStart(2, '0');
    let hour24 = hour12 % 12;
    if ((data.ampm || 'AM') === 'PM') hour24 += 12;
    const timeStr = `${String(hour24).padStart(2, '0')}:${minute}`;
    const birthDateStr = `${yyyy}-${mm}-${dd}`;
    return { birthDateStr, timeStr };
  };

  useEffect(() => {}, []);

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
      if (!formData.name || !formData.day || !formData.month || !formData.year ||
          !formData.hour || !formData.minute || !formData.birthPlace) {
        throw new Error('Please fill in all required fields');
      }

      // Build date and time strings
      const { birthDateStr, timeStr } = formatDateTimeFromForm(formData);

      // Step 1: Geocode the location
      console.log('Geocoding location...');
      let locationCoords;

      try {
        // Try Google Maps first
        locationCoords = await geocodeLocation({
          city: formData.birthPlace
        });
      } catch (geocodeError) {
        console.warn('Google Maps geocoding failed, trying fallback:', geocodeError);
        // Fallback to OpenStreetMap
        locationCoords = await geocodeLocationFallback({
          city: formData.birthPlace
        });
      }

      console.log('Location coordinates:', locationCoords);
      setCoordinates(locationCoords);

      // Step 2: Prepare birth data for calculations
      const birthData = {
        date: birthDateStr,
        time: timeStr,
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

        <div className={`chart-layout ${chartData ? 'has-chart' : ''}`}>
        <form onSubmit={handleSubmit} className="birth-chart-form">
          <div className="form-row">
            <label className="field-label">Name & Gender</label>
            <div className="field-group">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-field"
              />
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-field small"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <label className="field-label">Date & Time of Birth</label>
            <div className="field-group date-time">
              <input type="number" name="day" placeholder="DD" value={formData.day} onChange={handleChange} required className="form-field tiny" min="1" max="31" />
              <input type="number" name="month" placeholder="MM" value={formData.month} onChange={handleChange} required className="form-field tiny" min="1" max="12" />
              <input type="number" name="year" placeholder="YYYY" value={formData.year} onChange={handleChange} required className="form-field small" min="1900" max="2100" />
              <input type="number" name="hour" placeholder="HH" value={formData.hour} onChange={handleChange} required className="form-field tiny" min="1" max="12" />
              <input type="number" name="minute" placeholder="MM" value={formData.minute} onChange={handleChange} required className="form-field tiny" min="0" max="59" />
              <div className="ampm-toggle">
                <label>
                  <input type="radio" name="ampm" value="AM" checked={formData.ampm === 'AM'} onChange={handleChange} />
                  <span>AM</span>
                </label>
                <label>
                  <input type="radio" name="ampm" value="PM" checked={formData.ampm === 'PM'} onChange={handleChange} />
                  <span>PM</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <label className="field-label">Birth Place</label>
            <div className="field-group">
              <input
                type="text"
                name="birthPlace"
                placeholder="City, State, Country"
                value={formData.birthPlace}
                onChange={handleChange}
                required
                className="form-field"
              />
            </div>
          </div>

          

          <div className="form-toolbar"></div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Generating...' : 'Show my horoscope'}
          </button>
        </form>

        {/* Chart Display Area */}
        {chartData && coordinates && (() => {
          const { birthDateStr, timeStr } = formatDateTimeFromForm(formData);
          return (
            <div className="chart-panel">
              <ChartDisplay
                chartData={chartData}
                birthInfo={{
                  name: formData.name,
                  date: birthDateStr,
                  time: timeStr,
                  location: coordinates.formatted_address,
                  coordinates: coordinates
                }}
              />
            </div>
          );
        })()}
        </div>
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