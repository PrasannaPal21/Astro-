import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      console.log('Logged in:', data);
      navigate('/birth-chart'); // Redirect to birth chart form after login
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="auth-container">
      <div className="stars"></div>
      <div className="content">
        <h2>🌟 Welcome Back</h2>
        <p style={{ 
          color: 'var(--muted-text)', 
          marginBottom: '2rem',
          fontSize: '1rem'
        }}>
          Sign in to explore your cosmic destiny
        </p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? '✨ Signing In...' : '🔮 Sign In'}
          </button>
        </form>
        
        <div className="auth-links">
          <p style={{ color: 'var(--muted-text)', margin: 0 }}>
            Don't have an account? 
          </p>
          <Link to="/signup" className="auth-link">
            Create your cosmic profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;