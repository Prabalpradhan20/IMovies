import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/bookings/my-bookings');
        const data = response.data?.bookings || response.data || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError('Failed to fetch your bookings. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.stateText}>Loading your ticket reservations...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1 style={styles.pageTitle}>🎟 My Bookings</h1>
        <p style={styles.pageSubtitle}>View all your confirmed cinema reservations</p>
      </header>

      {error && (
        <div style={styles.errorBox}>
          <p>{error}</p>
        </div>
      )}

      {!error && bookings.length === 0 && (
        <div style={styles.emptyCard}>
          <p style={styles.emptyIcon}>🎬</p>
          <h3 style={styles.emptyTitle}>No Bookings Found</h3>
          <p style={styles.emptySubtitle}>You haven't reserved any movie tickets yet.</p>
          <Link to="/" style={styles.exploreBtn}>
            Explore Movies
          </Link>
        </div>
      )}

      {!error && bookings.length > 0 && (
        <div style={styles.bookingsList}>
          {bookings.map((booking) => {
            const movie = booking.show?.movie || {};
            const theater = booking.show?.theater || {};
            const showDate = booking.show?.showDate
              ? new Date(booking.show.showDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A';

            const seatList =
              booking.seats && booking.seats.length > 0
                ? booking.seats.map((s) => (typeof s === 'object' ? s.seatNumber : s)).join(', ')
                : 'Seats assigned';

            return (
              <div key={booking._id} style={styles.ticketCard}>
                <div style={styles.ticketHeader}>
                  <div>
                    <h2 style={styles.movieTitle}>{movie.title || 'Movie Title'}</h2>
                    <p style={styles.theaterText}>
                      🏛 {theater.name || 'Cinema'} {theater.location ? `• ${theater.location}` : ''}
                    </p>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        booking.bookingStatus === 'confirmed'
                          ? 'rgba(34, 197, 94, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                      color: booking.bookingStatus === 'confirmed' ? '#22c55e' : '#ef4444',
                      border: `1px solid ${
                        booking.bookingStatus === 'confirmed' ? '#22c55e' : '#ef4444'
                      }`,
                    }}
                  >
                    ● {booking.bookingStatus?.toUpperCase() || 'CONFIRMED'}
                  </span>
                </div>

                <div style={styles.ticketGrid}>
                  <div style={styles.ticketMetaBlock}>
                    <span style={styles.metaLabel}>Date</span>
                    <span style={styles.metaValue}>{showDate}</span>
                  </div>

                  <div style={styles.ticketMetaBlock}>
                    <span style={styles.metaLabel}>Show Time</span>
                    <span style={styles.metaValue}>⏰ {booking.show?.showTime || 'N/A'}</span>
                  </div>

                  <div style={styles.ticketMetaBlock}>
                    <span style={styles.metaLabel}>Screen</span>
                    <span style={styles.metaValue}>
                      Screen {booking.show?.screenNumber || 1}
                    </span>
                  </div>

                  <div style={styles.ticketMetaBlock}>
                    <span style={styles.metaLabel}>Reserved Seats ({booking.seats?.length || 0})</span>
                    <span style={styles.seatsValue}>{seatList}</span>
                  </div>
                </div>

                <div style={styles.ticketFooter}>
                  <span style={styles.bookingId}>Booking ID: #{booking._id.slice(-8)}</span>
                  <div style={styles.totalBlock}>
                    <span style={styles.totalLabel}>Total Paid:</span>
                    <span style={styles.totalAmount}>${Number(booking.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '36px 20px 80px',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '36px',
  },
  pageTitle: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 8px 0',
  },
  pageSubtitle: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    margin: 0,
  },
  bookingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  ticketCard: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '28px',
    border: '1px solid #334155',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px dashed #334155',
    paddingBottom: '18px',
  },
  movieTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 6px 0',
  },
  theaterText: {
    color: '#38bdf8',
    fontSize: '0.95rem',
    fontWeight: '500',
    margin: 0,
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
  },
  ticketGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '18px',
  },
  ticketMetaBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metaLabel: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  metaValue: {
    color: '#f8fafc',
    fontWeight: '600',
    fontSize: '1rem',
  },
  seatsValue: {
    color: '#22c55e',
    fontWeight: '700',
    fontSize: '1.1rem',
  },
  ticketFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderTop: '1px solid #334155',
    paddingTop: '16px',
  },
  bookingId: {
    color: '#64748b',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  },
  totalBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  totalAmount: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '1.3rem',
  },
  emptyCard: {
    backgroundColor: '#1e293b',
    padding: '60px 24px',
    borderRadius: '16px',
    textAlign: 'center',
    border: '1px solid #334155',
    maxWidth: '540px',
    margin: '40px auto',
  },
  emptyIcon: {
    fontSize: '3rem',
    margin: '0 0 16px 0',
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    color: '#94a3b8',
    marginBottom: '24px',
    fontSize: '1rem',
  },
  exploreBtn: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
  },
  centerContainer: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#f8fafc',
  },
  spinner: {
    width: '44px',
    height: '44px',
    border: '4px solid #334155',
    borderTop: '4px solid #38bdf8',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite',
  },
  stateText: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    padding: '18px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '20px auto',
    textAlign: 'center',
    color: '#fca5a5',
  },
};

export default MyBookings;
