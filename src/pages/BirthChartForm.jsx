import { useState, useEffect } from 'react';
import { geocodeLocation, geocodeLocationFallback } from '../lib/geocoding';
import { calculateBirthChart, validateBirthData } from '../lib/jyotishCalculations';
import { analyzeBirthChart } from '../lib/geminiService';
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
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

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

  const handleAnalyzeChart = async () => {
    if (!chartData || !coordinates) {
      setAnalysisError('Please generate a birth chart first');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');
    setAiAnalysis('');

    try {
      const { birthDateStr, timeStr } = formatDateTimeFromForm(formData);
      const birthInfo = {
        name: formData.name,
        date: birthDateStr,
        time: timeStr,
        location: coordinates.formatted_address,
        coordinates: coordinates
      };
      
      const analysis = await analyzeBirthChart(chartData, birthInfo);
      setAiAnalysis(analysis);
    } catch (error) {
      setAnalysisError(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatAnalysisText = (text) => {
    if (!text) return null;

    // Split by double newlines to get sections
    const sections = text.split('\n\n').filter(section => section.trim());
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      // Check if it's a numbered section (1., 2., etc.)
      const numberedMatch = trimmedSection.match(/^(\d+)\.\s*(.+)/);
      if (numberedMatch) {
        const [, number, content] = numberedMatch;
        return (
          <div key={index} className="analysis-section">
            <h5 className="section-title">
              <span className="section-number">{number}.</span>
              {formatMarkdownText(content.split('\n')[0])}
            </h5>
            <div className="section-content">
              {content.split('\n').slice(1).map((line, lineIndex) => (
                line.trim() && (
                  <p key={lineIndex} className="section-paragraph">
                    {formatMarkdownText(line.trim())}
                  </p>
                )
              ))}
            </div>
          </div>
        );
      }
      
      // Check if it's a title (starts with capital letters and ends with colon)
      if (trimmedSection.match(/^[A-Z][^:]*:$/)) {
        return (
          <div key={index} className="analysis-section">
            <h5 className="section-title">{formatMarkdownText(trimmedSection.replace(':', ''))}</h5>
          </div>
        );
      }
      
      // Regular paragraph
      return (
        <div key={index} className="analysis-section">
          <div className="section-content">
            {trimmedSection.split('\n').map((line, lineIndex) => (
              line.trim() && (
                <p key={lineIndex} className="section-paragraph">
                  {formatMarkdownText(line.trim())}
                </p>
              )
            ))}
          </div>
        </div>
      );
    });
  };

  const formatMarkdownText = (text) => {
    if (!text) return text;

    // Split text into parts to handle markdown formatting
    const parts = [];
    let currentIndex = 0;
    
    // Find all markdown patterns
    const patterns = [
      { regex: /\*\*(.*?)\*\*/g, type: 'bold' },
      { regex: /\*(.*?)\*/g, type: 'italic' },
      { regex: /`(.*?)`/g, type: 'code' }
    ];
    
    const matches = [];
    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          content: match[1],
          type: pattern.type
        });
      }
    });
    
    // Sort matches by start position
    matches.sort((a, b) => a.start - b.start);
    
    // Remove overlapping matches (keep the first one)
    const filteredMatches = [];
    let lastEnd = 0;
    matches.forEach(match => {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    });
    
    // Build the formatted text
    filteredMatches.forEach((match, index) => {
      // Add text before the match
      if (match.start > currentIndex) {
        parts.push(text.slice(currentIndex, match.start));
      }
      
      // Add the formatted match
      if (match.type === 'bold') {
        parts.push(<strong key={`bold-${index}`}>{match.content}</strong>);
      } else if (match.type === 'italic') {
        parts.push(<em key={`italic-${index}`}>{match.content}</em>);
      } else if (match.type === 'code') {
        parts.push(<code key={`code-${index}`}>{match.content}</code>);
      }
      
      currentIndex = match.end;
    });
    
    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
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
              
              {/* AI Analysis Section */}
              <div className="ai-analysis-section">
                <h3>AI Astrological Analysis</h3>
                
                <div className="analysis-controls">
                  <button
                    onClick={handleAnalyzeChart}
                    disabled={isAnalyzing}
                    className="analyze-btn"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Birth Chart'}
                  </button>
                </div>

                {analysisError && (
                  <div className="analysis-error">
                    <p>⚠️ {analysisError}</p>
                  </div>
                )}

                {aiAnalysis && (
                  <div className="analysis-result">
                    <h4>✨ Astrological Insights</h4>
                    <div className="analysis-content">
                      {formatAnalysisText(aiAnalysis)}
                    </div>
                  </div>
                )}
              </div>
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

        .ai-analysis-section {
          background: rgba(250, 251, 252, 0.8);
          padding: 1.5rem;
          border-radius: 12px;
          margin-top: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid var(--accent-gold);
        }

        .ai-analysis-section h3 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.4rem;
          text-align: center;
        }

        .analysis-controls {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .analyze-btn {
          padding: 0.8rem 1.5rem;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-orange));
          border: 2px solid var(--accent-gold);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
        }

        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(230, 126, 34, 0.5);
        }

        .analyze-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .analysis-error {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #dc3545;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .analysis-result {
          background: rgba(250, 251, 252, 0.9);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--accent-gold);
          margin-top: 1rem;
        }

        .analysis-result h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.2rem;
          text-align: center;
        }

        .analysis-content {
          line-height: 1.6;
          color: var(--text-primary);
        }

        .analysis-section {
          margin-bottom: 2rem;
          padding: 1rem;
          background: rgba(250, 251, 252, 0.5);
          border-radius: 8px;
          border-left: 4px solid var(--accent-gold);
        }

        .analysis-section:last-child {
          margin-bottom: 0;
        }

        .section-title {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .section-number {
          background: linear-gradient(135deg, var(--primary-color), var(--accent-orange));
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .section-content {
          margin-left: 0.5rem;
        }

        .section-paragraph {
          margin-bottom: 0.8rem;
          text-align: justify;
          color: var(--text-primary);
          line-height: 1.7;
        }

        .section-paragraph:last-child {
          margin-bottom: 0;
        }

        .section-paragraph strong {
          color: var(--accent-orange);
          font-weight: 600;
        }

        .section-paragraph em {
          color: var(--primary-color);
          font-style: italic;
        }

        .section-paragraph code {
          background: rgba(230, 126, 34, 0.1);
          color: var(--accent-orange);
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.9em;
        }

        @media (max-width: 768px) {
          .ai-analysis-section {
            padding: 1rem;
            margin-top: 1.5rem;
          }

          .analysis-section {
            padding: 0.8rem;
            margin-bottom: 1.5rem;
          }

          .section-title {
            font-size: 1rem;
          }

          .section-paragraph {
            font-size: 0.9rem;
            line-height: 1.6;
          }
        }
      `}</style>
    </div>
  );
};

export default BirthChartForm;