import { useState, useEffect } from 'react';
import { Country, State, City } from 'country-state-city';
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitted data:', formData);
  };

  return (
    <div className="birth-chart-container">
      <div className="stars"></div>
      <div className="content">
        <h1>Get Your Birth Chart</h1>
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

          <button type="submit" className="submit-btn">
            Generate Birth Chart
          </button>
        </form>
      </div>
    </div>
  );
};

export default BirthChartForm;