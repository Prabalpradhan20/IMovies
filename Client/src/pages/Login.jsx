import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosClient.post('/auth/login', formData);

      // Save token, user details, and role to localStorage
      if (response.data.token) {
        const extractedRole = String(
          response.data.role || response.data.user?.role || 'user'
        ).toLowerCase().trim();

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', extractedRole);
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: response.data.id || response.data.user?.id,
            name: response.data.name || response.data.user?.name,
            email: response.data.email || response.data.user?.email,
            role: extractedRole,
          })
        );
      }

      // Success toast notification
      toast.success(response.data.message || 'Login successful!');

      // Redirect to Home page
      navigate('/');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.subtitle}>Welcome back! Please login to your account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="admin@imovies.com"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account yet?{' '}
          <Link to="/register" style={styles.link}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 70px)',
    backgroundColor: '#0f172a',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '36px',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    width: '100%',
    maxWidth: '420px',
    color: '#f8fafc',
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '1.75rem',
    textAlign: 'center',
    color: '#38bdf8',
  },
  subtitle: {
    margin: '0 0 24px 0',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#cbd5e1',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
  },
  button: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    fontWeight: '600',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  footerText: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  link: {
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Login;
