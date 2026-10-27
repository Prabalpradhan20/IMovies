import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movie'); // 'movie' | 'theater' | 'show'
  const [loading, setLoading] = useState(false);

  // Lists for dropdowns in Create Show
  const [moviesList, setMoviesList] = useState([]);
  const [theatersList, setTheatersList] = useState([]);

  // Form States
  const [movieData, setMovieData] = useState({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    duration: '',
    posterUrl: '',
    rating: 8.5,
  });

  const [theaterData, setTheaterData] = useState({
    name: '',
    location: '',
    screens: 5,
  });

  const [showData, setShowData] = useState({
    movie: '',
    theater: '',
    showDate: '',
    showTime: '18:00',
    screenNumber: 1,
    price: 15.0,
  });

  // Fetch movies and theaters for the Create Show dropdowns
  const fetchMoviesAndTheaters = async () => {
    try {
      const [moviesRes, theatersRes] = await Promise.all([
        axiosClient.get('/movies'),
        axiosClient.get('/theaters'),
      ]);

      const movies = moviesRes.data?.movies || moviesRes.data || [];
      const theaters = theatersRes.data?.theaters || theatersRes.data || [];

      setMoviesList(movies);
      setTheatersList(theaters);

      // Set initial dropdown values if available
      if (movies.length > 0 && !showData.movie) {
        setShowData((prev) => ({ ...prev, movie: movies[0]._id }));
      }
      if (theaters.length > 0 && !showData.theater) {
        setShowData((prev) => ({ ...prev, theater: theaters[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching movies or theaters:', err);
      toast.error('Failed to load movies/theaters list for shows.');
    }
  };

  useEffect(() => {
    fetchMoviesAndTheaters();
  }, []);

  // Handlers for Add Movie
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...movieData,
        duration: Number(movieData.duration),
        rating: Number(movieData.rating || 0),
      };

      const res = await axiosClient.post('/movies', payload);
      toast.success(res.data?.message || 'Movie added successfully!');

      // Reset form
      setMovieData({
        title: '',
        description: '',
        genre: '',
        language: 'English',
        duration: '',
        posterUrl: '',
        rating: 8.5,
      });

      // Refresh movies list
      fetchMoviesAndTheaters();
    } catch (err) {
      console.error('Error adding movie:', err);
      toast.error(err.response?.data?.message || 'Failed to add movie.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Add Theater
  const handleTheaterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...theaterData,
        screens: Number(theaterData.screens),
      };

      const res = await axiosClient.post('/theaters', payload);
      toast.success(res.data?.message || 'Theater added successfully!');

      setTheaterData({
        name: '',
        location: '',
        screens: 5,
      });

      // Refresh theaters list
      fetchMoviesAndTheaters();
    } catch (err) {
      console.error('Error adding theater:', err);
      toast.error(err.response?.data?.message || 'Failed to add theater.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for Create Show
  const handleShowSubmit = async (e) => {
    e.preventDefault();

    if (!showData.movie || !showData.theater) {
      toast.warning('Please select both a movie and a theater.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        movie: showData.movie,
        theater: showData.theater,
        showDate: new Date(showData.showDate).toISOString(),
        showTime: showData.showTime,
        screenNumber: Number(showData.screenNumber),
        price: Number(showData.price),
      };

      const res = await axiosClient.post('/shows', payload);
      const newShowId = res.data?.show?._id;

      // Automatically generate 50 seats for this new show so users can book immediately
      if (newShowId) {
        try {
          await axiosClient.post(`/seats/generate/${newShowId}`, {
            rows: 5,
            columns: 10,
            price: Number(showData.price),
          });
        } catch (seatErr) {
          console.warn('Seat auto-generation note:', seatErr.message);
        }
      }

      toast.success(res.data?.message || 'Show created & seats initialized successfully!');

      setShowData((prev) => ({
        ...prev,
        showDate: '',
        showTime: '18:00',
        screenNumber: 1,
        price: 15.0,
      }));
    } catch (err) {
      console.error('Error creating show:', err);
      toast.error(err.response?.data?.message || 'Failed to create show.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>⚙️ Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Manage cinema catalog, theaters, and scheduling directly from the dashboard
        </p>
      </header>

      {/* Tabs Bar */}
      <div style={styles.tabBar}>
        <button
          onClick={() => setActiveTab('movie')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'movie' ? styles.activeTab : {}),
          }}
        >
          🎬 Add Movie
        </button>

        <button
          onClick={() => setActiveTab('theater')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'theater' ? styles.activeTab : {}),
          }}
        >
          🏛 Add Theater
        </button>

        <button
          onClick={() => setActiveTab('show')}
          style={{
            ...styles.tabButton,
            ...(activeTab === 'show' ? styles.activeTab : {}),
          }}
        >
          ⏰ Create Show
        </button>
      </div>

      {/* Tab Panels */}
      <div style={styles.panelCard}>
        {/* TAB 1: ADD MOVIE */}
        {activeTab === 'movie' && (
          <form onSubmit={handleMovieSubmit} style={styles.form}>
            <h2 style={styles.panelTitle}>Add New Movie</h2>
            <p style={styles.panelDesc}>Enter details to publish a new film to the catalog</p>

            <div style={styles.formGrid}>
              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Movie Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Interstellar"
                  value={movieData.title}
                  onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Description / Synopsis *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="A team of explorers travel through a wormhole in space..."
                  value={movieData.description}
                  onChange={(e) => setMovieData({ ...movieData, description: e.target.value })}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Genre *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sci-Fi, Adventure"
                  value={movieData.genre}
                  onChange={(e) => setMovieData({ ...movieData, genre: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Language *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. English"
                  value={movieData.language}
                  onChange={(e) => setMovieData({ ...movieData, language: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Duration (minutes) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="169"
                  value={movieData.duration}
                  onChange={(e) => setMovieData({ ...movieData, duration: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Rating (0 - 10)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  placeholder="8.7"
                  value={movieData.rating}
                  onChange={(e) => setMovieData({ ...movieData, rating: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Poster Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={movieData.posterUrl}
                  onChange={(e) => setMovieData({ ...movieData, posterUrl: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Publishing...' : 'Publish Movie'}
            </button>
          </form>
        )}

        {/* TAB 2: ADD THEATER */}
        {activeTab === 'theater' && (
          <form onSubmit={handleTheaterSubmit} style={styles.form}>
            <h2 style={styles.panelTitle}>Add New Cinema Theater</h2>
            <p style={styles.panelDesc}>Register a theater location with screen capacity</p>

            <div style={styles.formGrid}>
              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Theater Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cinepolis: Grand Mall"
                  value={theaterData.name}
                  onChange={(e) => setTheaterData({ ...theaterData, name: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Location / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Downtown"
                  value={theaterData.location}
                  onChange={(e) => setTheaterData({ ...theaterData, location: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Available Screens *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="6"
                  value={theaterData.screens}
                  onChange={(e) => setTheaterData({ ...theaterData, screens: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Adding Theater...' : 'Add Theater'}
            </button>
          </form>
        )}

        {/* TAB 3: CREATE SHOW */}
        {activeTab === 'show' && (
          <form onSubmit={handleShowSubmit} style={styles.form}>
            <h2 style={styles.panelTitle}>Schedule a Movie Showtime</h2>
            <p style={styles.panelDesc}>Assign a movie to a theater, date, screen, and ticket price</p>

            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Movie *</label>
                <select
                  required
                  value={showData.movie}
                  onChange={(e) => setShowData({ ...showData, movie: e.target.value })}
                  style={styles.select}
                >
                  <option value="">-- Choose Movie --</option>
                  {moviesList.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.duration}m)
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Select Theater *</label>
                <select
                  required
                  value={showData.theater}
                  onChange={(e) => setShowData({ ...showData, theater: e.target.value })}
                  style={styles.select}
                >
                  <option value="">-- Choose Theater --</option>
                  {theatersList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.location})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Show Date *</label>
                <input
                  type="date"
                  required
                  value={showData.showDate}
                  onChange={(e) => setShowData({ ...showData, showDate: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Show Time *</label>
                <input
                  type="time"
                  required
                  value={showData.showTime}
                  onChange={(e) => setShowData({ ...showData, showTime: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Screen Number *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="1"
                  value={showData.screenNumber}
                  onChange={(e) => setShowData({ ...showData, screenNumber: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Ticket Price ($) *</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min={1}
                  placeholder="15.00"
                  value={showData.price}
                  onChange={(e) => setShowData({ ...showData, price: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Scheduling Show...' : 'Create Showtime'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '36px 20px 80px',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f8fafc',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    margin: 0,
  },
  tabBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  tabButton: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '12px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    borderColor: '#38bdf8',
    boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
  },
  panelCard: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '36px',
    border: '1px solid #334155',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.35)',
  },
  panelTitle: {
    fontSize: '1.6rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 6px 0',
  },
  panelDesc: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputGroupFull: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

export default AdminDashboard;
