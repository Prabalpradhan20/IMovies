import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

// Fallback poster when none provided
const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get('/movies');
        // Handle both { movies: [...] } and array responses
        const data = response.data?.movies || response.data || [];
        setMovies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please check your server connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return (
    <div style={styles.container}>
      {/* Hero Header */}
      <header style={styles.heroSection}>
        <h1 style={styles.heroTitle}>
          Now Showing in <span style={styles.highlight}>Cinemas</span>
        </h1>
        <p style={styles.heroSubtitle}>
          Discover the latest blockbusters, check available showtimes, and book your seats in advance.
        </p>
      </header>

      {/* Loading & Error States */}
      {loading && (
        <div style={styles.centerMessage}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading movies...</p>
        </div>
      )}

      {error && !loading && (
        <div style={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <div style={styles.centerMessage}>
          <p style={styles.emptyText}>No movies currently available. Please check back later!</p>
        </div>
      )}

      {/* Movies Responsive Grid */}
      {!loading && !error && movies.length > 0 && (
        <div style={styles.grid}>
          {movies.map((movie) => (
            <div key={movie._id} style={styles.card} className="movie-card">
              <div style={styles.posterContainer}>
                <img
                  src={movie.posterUrl || DEFAULT_POSTER}
                  alt={movie.title}
                  style={styles.poster}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_POSTER;
                  }}
                />
                {movie.rating > 0 && (
                  <span style={styles.ratingBadge}>★ {movie.rating}</span>
                )}
              </div>

              <div style={styles.cardBody}>
                <h3 style={styles.movieTitle} title={movie.title}>
                  {movie.title}
                </h3>

                <div style={styles.metaRow}>
                  <span style={styles.genreBadge}>{movie.genre}</span>
                  <span style={styles.durationText}>⏱ {movie.duration}m</span>
                </div>

                {movie.language && (
                  <p style={styles.languageText}>Language: {movie.language}</p>
                )}

                <Link to={`/movie/${movie._id}`} style={styles.bookButton}>
                  Book Tickets
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '36px 24px 60px',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  heroSection: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#f8fafc',
    letterSpacing: '-0.5px',
  },
  highlight: {
    color: '#38bdf8',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    color: '#94a3b8',
    maxWidth: '650px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '28px',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.35)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    border: '1px solid #334155',
  },
  posterContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '135%', // ~3:4 aspect ratio
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  poster: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  ratingBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(4px)',
    color: '#facc15',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  movieTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: '0 0 10px 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  genreBadge: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '0.78rem',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  durationText: {
    color: '#94a3b8',
    fontSize: '0.88rem',
    fontWeight: '500',
  },
  languageText: {
    color: '#64748b',
    fontSize: '0.85rem',
    margin: '0 0 18px 0',
  },
  bookButton: {
    marginTop: 'auto',
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    textAlign: 'center',
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
  },
  centerMessage: {
    textAlign: 'center',
    padding: '80px 20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #334155',
    borderTop: '4px solid #38bdf8',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '1.1rem',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    color: '#fca5a5',
    padding: '16px 20px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '30px auto',
    textAlign: 'center',
  },
};

export default Home;
