import { useEffect, useRef, useState } from 'react';
import { renderResponsiveChart } from '../lib/chartRenderer';

const ChartDisplay = ({ chartData, birthInfo, className = '' }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartError, setChartError] = useState('');

  useEffect(() => {
    if (chartData && chartContainerRef.current) {
      try {
        setChartError('');
        
        // Clear any existing chart
        if (chartInstanceRef.current && chartInstanceRef.current.destroy) {
          chartInstanceRef.current.destroy();
        }
        
        // Generate unique ID for this chart container
        const containerId = `chart-${Date.now()}`;
        chartContainerRef.current.id = containerId;
        
        // Render the chart
        console.log('Rendering chart with data:', chartData);
        chartInstanceRef.current = renderResponsiveChart(containerId, chartData);
        
      } catch (error) {
        console.error('Error rendering chart:', error);
        setChartError(`Failed to render chart: ${error.message}`);
      }
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current && chartInstanceRef.current.destroy) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData]);

  if (!chartData) {
    return null;
  }

  return (
    <div className={`chart-display ${className}`}>
      <div className="chart-header">
        <h2>Your Vedic Birth Chart</h2>
      </div>

      {chartError ? (
        <div className="chart-error">
          <p>⚠️ {chartError}</p>
          <p>Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      ) : (
        <div className="chart-container">
          <div
            ref={chartContainerRef}
            className="chart-canvas"
          />
        </div>
      )}

      {chartData && !chartError && (
        <div className="chart-details">
          <h3>Chart Information</h3>
          <div className="details-grid">
            {chartData.ascendant && (
              <div className="detail-item">
                <label>Ascendant (Lagna):</label>
                <span>{Math.floor(chartData.ascendant.longitude / 30) + 1} - {(chartData.ascendant.longitude % 30).toFixed(2)}°</span>
              </div>
            )}
            
            {chartData.planetaryPositions && (
              <div className="planets-summary">
                <h4>Planetary Positions</h4>
                <div className="planets-list">
                  {Object.entries(chartData.planetaryPositions).map(([planet, data]) => (
                    <div key={planet} className="planet-item">
                      <span className="planet-name">{planet}:</span>
                      <span className="planet-position">
                        Sign {Math.floor(data.longitude / 30) + 1}, {(data.longitude % 30).toFixed(2)}°
                        {data.retrograde && ' (R)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Birth info moved below charts per UI request */}
      {birthInfo && (
        <div className="birth-info">
          <div className="info-grid">
            <div className="info-item">
              <label>Name:</label>
              <span>{birthInfo.name}</span>
            </div>
            <div className="info-item">
              <label>Date:</label>
              <span>{new Date(birthInfo.date).toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <label>Time:</label>
              <span>{birthInfo.time}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{birthInfo.location}</span>
            </div>
            <div className="info-item">
              <label>Coordinates:</label>
              <span>{birthInfo.coordinates?.lat.toFixed(4)}°, {birthInfo.coordinates?.lng.toFixed(4)}°</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .chart-display {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, 
            rgba(250, 251, 252, 0.9), 
            rgba(253, 246, 227, 0.9)
          );
          backdrop-filter: blur(15px);
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(243, 156, 18, 0.12), 
                      0 0 20px rgba(230, 126, 34, 0.08);
          border: 2px solid var(--accent-gold);
          color: var(--text-primary);
        }

        .chart-header h2 {
          margin: 0 0 1rem 0;
          text-align: left;
          font-size: 1.8rem;
          text-shadow: 0 1px 3px rgba(243, 156, 18, 0.2);
          color: var(--text-primary);
        }

        .birth-info {
          background: rgba(250, 251, 252, 0.8);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid var(--accent-gold);
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.5rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
        }

        .info-item label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0 2rem 0;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .chart-canvas {
          width: 100%;
          min-height: 700px;
          max-width: 100%;
          overflow: hidden;
          box-sizing: border-box;
        }

        .chart-error {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #dc3545;
          padding: 1rem;
          border-radius: 8px;
          text-align: center;
        }

        .chart-details {
          background: rgba(250, 251, 252, 0.8);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 2rem;
          backdrop-filter: blur(10px);
          border: 1px solid var(--accent-gold);
          clear: both;
        }

        .chart-details h3, .chart-details h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .details-grid {
          display: grid;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--accent-gold);
        }

        .planets-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 0.5rem;
        }

        .planet-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0.5rem;
          background: rgba(250, 251, 252, 0.6);
          border-radius: 4px;
          border: 1px solid var(--accent-gold);
        }

        .planet-name {
          font-weight: 600;
        }

        .planet-position {
          font-family: monospace;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .chart-display {
            padding: 1rem;
          }

          .chart-container {
            padding: 0.5rem;
            margin: 0.5rem 0 1rem 0;
          }

          .chart-canvas {
            min-height: 600px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .planets-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .chart-canvas {
            min-height: 500px;
          }

          .chart-container {
            padding: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChartDisplay;
