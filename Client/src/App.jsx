import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const role = String(localStorage.getItem('role') || user?.role || '').toLowerCase().trim();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    toast.info('Logged out successfully');
    navigate('/login');
  };

  return (
    <div style={styles.appContainer}>
      {/* Navigation Bar */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <Link to="/" style={styles.brandLink}>
            🎬 <span style={styles.brandHighlight}>IMovies</span>
          </Link>
        </div>

        <div style={styles.navLinks}>
          <Link to="/" style={styles.navLink}>
            Home
          </Link>

          {!token ? (
            <>
              <Link to="/login" style={styles.navLink}>
                Login
              </Link>
              <Link to="/register" style={styles.navLinkButton}>
                Register
              </Link>
            </>
          ) : (
            <div style={styles.userSection}>
              {role === 'admin' && (
                <Link to="/admin" style={styles.adminNavLink}>
                  ⚙️ Admin Dashboard
                </Link>
              )}

              <Link to="/my-bookings" style={styles.navLink}>
                🎟 My Bookings
              </Link>

              <span style={styles.userName}>
                👤 {user?.name || 'User'}
                {role === 'admin' && <span style={styles.adminBadge}>Admin</span>}
              </span>

              <button onClick={handleLogout} style={styles.logoutButton}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content & Routes */}
      <main style={styles.mainContent}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/booking/:showId" element={<SeatSelection />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  appContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  navbar: {
    height: '70px',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    borderBottom: '1px solid #334155',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
  navBrand: {
    fontSize: '1.4rem',
    fontWeight: '700',
  },
  brandLink: {
    color: '#f8fafc',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandHighlight: {
    color: '#38bdf8',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  navLink: {
    color: '#cbd5e1',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  },
  adminNavLink: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: '1px solid rgba(56, 189, 248, 0.4)',
    padding: '6px 14px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
  },
  navLinkButton: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '8px 18px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  userName: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminBadge: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    fontSize: '0.7rem',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    padding: '7px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  mainContent: {
    flex: 1,
  },
};

export default App;
