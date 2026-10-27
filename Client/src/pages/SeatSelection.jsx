import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [seatsRes, showRes] = await Promise.all([
          axiosClient.get(`/seats/${showId}`),
          axiosClient.get(`/shows/${showId}`).catch(() => null),
        ]);

        const fetchedSeats = seatsRes.data?.seats || seatsRes.data || [];
        setSeats(Array.isArray(fetchedSeats) ? fetchedSeats : []);

        if (showRes && showRes.data) {
          setShow(showRes.data);
        }
      } catch (err) {
        console.error('Error fetching seat map:', err);
        setError('Failed to load seats for this show. Please check back later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showId]);

  // Determine individual ticket price
  const ticketPrice = show?.price || (seats.length > 0 ? seats[0].price : 0) || 15;
  const totalPrice = (selectedSeats.length * ticketPrice).toFixed(2);

  // Toggle seat selection
  const handleSeatClick = (seat) => {
    const isBooked = seat.isBooked || seat.status === 'booked' || seat.status === 'locked';
    if (isBooked) return;

    const isSelected = selectedSeats.some((s) => s._id === seat._id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s._id !== seat._id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  // Submit booking
  const handleConfirmBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to book seats.');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat before confirming.');
      return;
    }

    try {
      setBookingLoading(true);
      const payload = {
        showId,
        seatIds: selectedSeats.map((s) => s._id),
        totalAmount: Number(totalPrice),
      };

      const response = await axiosClient.post('/bookings', payload);
      toast.success(response.data?.message || 'Booking confirmed successfully!');
      navigate('/my-bookings');
    } catch (err) {
      console.error('Error creating booking:', err);
      const msg = err.response?.data?.message || 'Failed to complete booking. Please try again.';
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Group seats by row letter for cleaner display
  const rowsMap = seats.reduce((acc, seat) => {
    const rowKey = seat.row || (seat.seatNumber ? seat.seatNumber[0] : 'A');
    if (!acc[rowKey]) acc[rowKey] = [];
    acc[rowKey].push(seat);
    return acc;
  }, {});

  // Sort each row's seats by seat number
  Object.keys(rowsMap).forEach((r) => {
    rowsMap[r].sort((a, b) => a.number - b.number);
  });

  const sortedRowKeys = Object.keys(rowsMap).sort();

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.stateText}>Loading seat layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <Link to="/" style={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header Info */}
      <div style={styles.header}>
        <Link to="/" style={styles.backLink}>
          ← Back to Movies
        </Link>
        <h1 style={styles.pageTitle}>Select Your Seats</h1>
        {show && (
          <p style={styles.showSubtitle}>
            <strong>{show.movie?.title || 'Movie'}</strong> at{' '}
            <span style={styles.theaterName}>{show.theater?.name || 'Cinema'}</span> •{' '}
            <span>{show.showTime || '18:00'}</span> •{' '}
            <span>Screen {show.screenNumber || 1}</span>
          </p>
        )}
      </div>

      {/* Screen Graphic */}
      <div style={styles.screenWrapper}>
        <div style={styles.screenCurve}></div>
        <p style={styles.screenText}>CINEMA SCREEN</p>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, ...styles.seatAvailable }}></div>
          <span>Available</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, ...styles.seatSelected }}></div>
          <span>Selected</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendBox, ...styles.seatBooked }}></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Seat Layout by Rows */}
      <div style={styles.seatContainer}>
        {sortedRowKeys.map((rowLetter) => (
          <div key={rowLetter} style={styles.rowWrapper}>
            <span style={styles.rowLabel}>{rowLetter}</span>
            <div style={styles.rowSeats}>
              {rowsMap[rowLetter].map((seat) => {
                const isBooked =
                  seat.isBooked || seat.status === 'booked' || seat.status === 'locked';
                const isSelected = selectedSeats.some((s) => s._id === seat._id);

                let seatStyle = styles.seatAvailable;
                if (isBooked) {
                  seatStyle = styles.seatBooked;
                } else if (isSelected) {
                  seatStyle = styles.seatSelected;
                }

                return (
                  <button
                    key={seat._id}
                    onClick={() => handleSeatClick(seat)}
                    disabled={isBooked}
                    style={{ ...styles.seatButton, ...seatStyle }}
                    title={`${seat.seatNumber} - $${seat.price || ticketPrice}`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span style={styles.rowLabel}>{rowLetter}</span>
          </div>
        ))}
      </div>

      {/* Booking Summary Footer */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryDetails}>
          <div>
            <p style={styles.summaryLabel}>Selected Seats</p>
            <p style={styles.summaryValue}>
              {selectedSeats.length > 0
                ? selectedSeats.map((s) => s.seatNumber).join(', ')
                : 'None selected'}
            </p>
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Tickets</p>
            <p style={styles.summaryValue}>{selectedSeats.length}</p>
          </div>
          <div>
            <p style={styles.summaryLabel}>Total Price</p>
            <p style={styles.summaryPrice}>${totalPrice}</p>
          </div>
        </div>

        <button
          onClick={handleConfirmBooking}
          disabled={selectedSeats.length === 0 || bookingLoading}
          style={{
            ...styles.confirmButton,
            opacity: selectedSeats.length === 0 || bookingLoading ? 0.6 : 1,
            cursor: selectedSeats.length === 0 || bookingLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {bookingLoading ? 'Processing...' : `Confirm Booking • $${totalPrice}`}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '30px 20px 80px',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  backLink: {
    display: 'inline-block',
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '12px',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 8px 0',
  },
  showSubtitle: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    margin: 0,
  },
  theaterName: {
    color: '#38bdf8',
  },
  screenWrapper: {
    width: '100%',
    maxWidth: '680px',
    margin: '0 auto 36px',
    textAlign: 'center',
  },
  screenCurve: {
    height: '14px',
    borderTop: '5px solid #38bdf8',
    borderRadius: '50%',
    boxShadow: '0 -6px 20px rgba(56, 189, 248, 0.45)',
    marginBottom: '8px',
  },
  screenText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '3px',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  legend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '36px',
    flexWrap: 'wrap',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    color: '#cbd5e1',
  },
  legendBox: {
    width: '24px',
    height: '24px',
    borderRadius: '6px',
  },
  seatContainer: {
    backgroundColor: '#1e293b',
    padding: '36px 24px',
    borderRadius: '16px',
    border: '1px solid #334155',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
    marginBottom: '36px',
    overflowX: 'auto',
  },
  rowWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    marginBottom: '12px',
  },
  rowLabel: {
    width: '24px',
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  rowSeats: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'nowrap',
  },
  seatButton: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  seatAvailable: {
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  },
  seatSelected: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    cursor: 'pointer',
    transform: 'scale(1.08)',
    boxShadow: '0 0 10px rgba(34, 197, 94, 0.6)',
  },
  seatBooked: {
    backgroundColor: '#334155',
    color: '#64748b',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  summaryCard: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px 32px',
    border: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
  },
  summaryDetails: {
    display: 'flex',
    gap: '36px',
    flexWrap: 'wrap',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    margin: '0 0 4px 0',
  },
  summaryValue: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: '1.05rem',
    margin: 0,
  },
  summaryPrice: {
    color: '#38bdf8',
    fontWeight: '800',
    fontSize: '1.4rem',
    margin: 0,
  },
  confirmButton: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '700',
    fontSize: '1.05rem',
    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
    transition: 'background-color 0.2s',
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
    padding: '24px',
    borderRadius: '10px',
    maxWidth: '500px',
    margin: '0 auto',
    color: '#fca5a5',
  },
  backButton: {
    display: 'inline-block',
    marginTop: '16px',
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '8px 16px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
  },
};

export default SeatSelection;
