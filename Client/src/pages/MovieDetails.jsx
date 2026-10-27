import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const DEFAULT_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieAndShows = async () => {
      try {
        setLoading(true);

        // Fetch Movie Details and All Shows in parallel
        const [movieRes, showsRes] = await Promise.all([
          axiosClient.get(`/movies/${id}`),
          axiosClient.get('/shows'),
        ]);

        setMovie(movieRes.data);

        // Extract and filter shows matching this movie
        const allShows = showsRes.data?.shows || showsRes.data || [];
        const matchingShows = allShows.filter((s) => {
          const movieId = typeof s.movie === 'object' ? s.movie?._id : s.movie;
          return movieId === id;
        });

        setShows(matchingShows);
      } catch (err) {
        console.error('Error fetching movie details:', err);
        setError('Failed to load movie details or showtimes.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShows();
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.stateText}>Loading movie details & showtimes...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorBox}>
          <p>{error || 'Movie not found.'}</p>
          <Link to="/" style={styles.backButton}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <Link to="/" style={styles.backLink}>
        ← Back to Movies
      </Link>

      {/* Top Section: Movie Details */}
      <section style={styles.movieHeader}>
        <div style={styles.posterWrapper}>
          <img
            src={movie.posterUrl || DEFAULT_POSTER}
            alt={movie.title}
            style={styles.poster}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_POSTER;
            }}
          />
        </div>

        <div style={styles.movieInfo}>
          <h1 style={styles.title}>{movie.title}</h1>

          <div style={styles.metaRow}>
            <span style={styles.genreTag}>{movie.genre}</span>
            <span style={styles.metaItem}>⏱ {movie.duration} mins</span>
            {movie.language && (
              <span style={styles.metaItem}>🗣 {movie.language}</span>
            )}
            {movie.rating > 0 && (
              <span style={styles.ratingTag}>★ {movie.rating} / 10</span>
            )}
          </div>

          {movie.releaseDate && (
            <p style={styles.releaseText}>
              <strong>Release Date:</strong>{' '}
              {new Date(movie.releaseDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          <p style={styles.descriptionLabel}>Overview</p>
          <p style={styles.description}>{movie.description}</p>
        </div>
      </section>

      {/* Bottom Section: Available Showtimes */}
      <section style={styles.showsSection}>
        <h2 style={styles.showsHeading}>Available Showtimes</h2>

        {shows.length === 0 ? (
          <div style={styles.noShowsCard}>
            <p style={styles.noShowsText}>
              No showtimes scheduled for this movie yet. Please check back soon!
            </p>
          </div>
        ) : (
          <div style={styles.showsList}>
            {shows.map((show) => {
              const theaterName =
                typeof show.theater === 'object' && show.theater?.name
                  ? show.theater.name
                  : 'Cinema Theater';

              const formattedDate = show.showDate
                ? new Date(show.showDate).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Today';

              return (
                <div key={show._id} style={styles.showCard}>
                  <div style={styles.showDetails}>
                    <h3 style={styles.theaterTitle}>🏛 {theaterName}</h3>
                    <div style={styles.showMeta}>
                      <span style={styles.showDateBadge}>📅 {formattedDate}</span>
                      <span style={styles.showTimeBadge}>⏰ {show.showTime}</span>
                      {show.screenNumber && (
                        <span style={styles.screenBadge}>Screen {show.screenNumber}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.showAction}>
                    <span style={styles.priceTag}>
                      ${Number(show.price || 0).toFixed(2)}
                    </span>
                    <Link
                      to={`/booking/${show._id}`}
                      style={styles.selectSeatsBtn}
                    >
                      Select Seats
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  pageContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 24px 80px',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  backLink: {
    display: 'inline-block',
    color: '#38bdf8',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '24px',
  },
  movieHeader: {
    display: 'flex',
    gap: '36px',
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '32px',
    border: '1px solid #334155',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
    flexWrap: 'wrap',
  },
  posterWrapper: {
    flex: '0 0 280px',
    maxWidth: '300px',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  },
  poster: {
    width: '100%',
    height: '100%',
    display: 'block',
    objectFit: 'cover',
    aspectRatio: '2/3',
  },
  movieInfo: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 16px 0',
    color: '#f8fafc',
  },
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  genreTag: {
    backgroundColor: '#0284c7',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaItem: {
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  ratingTag: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    color: '#facc15',
    border: '1px solid rgba(250, 204, 21, 0.4)',
    padding: '4px 10px',
    borderRadius: '20px',
    fontWeight: '700',
    fontSize: '0.85rem',
  },
  releaseText: {
    color: '#94a3b8',
    fontSize: '0.95rem',
    margin: '0 0 20px 0',
  },
  descriptionLabel: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#38bdf8',
    margin: '0 0 8px 0',
  },
  description: {
    fontSize: '1rem',
    lineHeight: '1.7',
    color: '#cbd5e1',
    margin: 0,
  },
  showsSection: {
    marginTop: '48px',
  },
  showsHeading: {
    fontSize: '1.8rem',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#f8fafc',
    borderBottom: '2px solid #334155',
    paddingBottom: '12px',
  },
  showsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  showCard: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '20px 24px',
    border: '1px solid #334155',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
  },
  showDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  theaterTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#f8fafc',
    margin: 0,
  },
  showMeta: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  showDateBadge: {
    backgroundColor: '#0f172a',
    color: '#cbd5e1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  showTimeBadge: {
    backgroundColor: '#0f766e',
    color: '#ccfbf1',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  screenBadge: {
    backgroundColor: '#334155',
    color: '#94a3b8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.85rem',
  },
  showAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  priceTag: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#38bdf8',
  },
  selectSeatsBtn: {
    backgroundColor: '#38bdf8',
    color: '#0f172a',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '0.95rem',
    transition: 'background-color 0.2s',
  },
  noShowsCard: {
    backgroundColor: '#1e293b',
    padding: '40px 24px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid #334155',
  },
  noShowsText: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    margin: 0,
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

export default MovieDetails;
