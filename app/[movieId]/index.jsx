import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { db, auth } from '../../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const MovieDetails = () => {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=aaf96c78ceffb8eb75d10677356165e9&language=en-US`);
        const data = await response.json();
        setMovie(data);
        if (auth.currentUser) {
          checkIfInWatchlist(data.id);
        }
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
        opacity.value = withTiming(1, { duration: 230 });
      }
    };

    if (movieId) fetchMovieDetails();
  }, [movieId]);

  const fadeInStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const checkIfInWatchlist = async (id) => {
    if (!auth.currentUser) return;
    try {
      const userWatchlistRef = doc(db, 'watchlists', auth.currentUser.uid);
      const docSnap = await getDoc(userWatchlistRef);
      if (docSnap.exists()) {
        const watchlist = docSnap.data().movies || [];
        setInWatchlist(watchlist.some((movie) => movie.id === id));
      }
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };

  const toggleWatchlist = async () => {
    if (!auth.currentUser) {
      console.error("User not logged in");
      return;
    }
  
    const userWatchlistRef = doc(db, "watchlists", auth.currentUser.uid);
  
    try {
      const docSnap = await getDoc(userWatchlistRef);
  
      if (!docSnap.exists()) {
        await setDoc(userWatchlistRef, { movies: [] }); // Ensure the document exists
      }
  
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
      };
  
      if (inWatchlist) {
        await updateDoc(userWatchlistRef, {
          movies: arrayRemove(movieData), // Ensure this format is accepted
        });
        setInWatchlist(false);
      } else {
        await updateDoc(userWatchlistRef, {
          movies: arrayUnion(movieData),
        });
        setInWatchlist(true);
      }
    } catch (error) {
      console.error("Error updating watchlist:", error);
    }
  };
  
  const formatCurrency = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, '0'); // Ensure two-digit day
    const month = months[dateObj.getMonth()]; // Get month abbreviation
    const year = dateObj.getFullYear(); // Get full year
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Animated.View style={[styles.container, fadeInStyle]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>

        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : movie ? (
          <>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.poster} />
            
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{movie.title}</Text>
              
              <View style={styles.releaseDateContainer}>
                <Text style={styles.movieInfoText}>
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </Text>
                <Text style={styles.releaseDate}>📅{formatDate(movie.release_date)}</Text>

                {/* Watchlist Button */}
                <TouchableOpacity
                  style={[styles.watchlistButton, inWatchlist && styles.watchlistButtonActive]}
                  onPress={toggleWatchlist}
                >
                  <Text style={styles.watchlistButtonText}>
                    {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  ⭐ {movie.vote_average.toFixed(1)}/10 ({movie.vote_count.toLocaleString()} votes)
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>

              <Text style={styles.sectionTitle}>Genres</Text>
              <Text style={styles.genre}>
                {movie.genres?.map((g) => g.name).join(', ') || 'N/A'}
              </Text>

              {/* Production Companies Section */}
              <Text style={styles.sectionTitle}>Production Companies</Text>
              <View style={styles.productionCompaniesContainer}>
                {movie.production_companies?.length > 0 ? (
                  <Text style={styles.productionCompany}>
                    {movie.production_companies.map((company) => company.name).join(' - ')}
                  </Text>
                ) : (
                  <Text style={styles.productionCompany}>N/A</Text>
                )}
              </View>

              {/* Budget and Revenue Section */}
              <View style={styles.budgetRevenueContainer}>
                <View style={styles.budgetBox}>
                  <Text style={styles.budgetTitle}>Budget</Text>
                  <Text style={styles.budgetText}>{formatCurrency(movie.budget)}</Text>
                </View>
                <View style={styles.revenueBox}>
                  <Text style={styles.revenueTitle}>Revenue</Text>
                  <Text style={styles.revenueText}>{formatCurrency(movie.revenue)}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.errorText}>Movie not found.</Text>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#0d0d2b',
  },
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    backgroundColor: '#0d0d2b', 
    paddingVertical: 8,  
    paddingHorizontal: 12, 
    borderRadius: 8, 
    top: 30, 
    left: 20, 
    zIndex: 10, 
    elevation: 5, 
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.4)',
  },
  poster: {
    width: '100%',
    height: 500,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  movieInfoText: { color: '#A8B5DB', fontSize: 14,alignItems: 'center', marginRight: 15 },
  releaseDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  releaseDate: {
    fontSize: 16,
    color: '#A8B5DB',
  },
  watchlistButton: {
    backgroundColor: '#FF6347', // Tomato color for the button
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  watchlistButtonActive: {
    backgroundColor: '#4CAF50', // Green color when movie is in the watchlist
  },
  watchlistButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: 'bold',
  },
  ratingContainer: {
    backgroundColor: '#292D3E', // Dark Blue Background
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: 'flex-start', // Only as wide as content
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF', 
  },
  voteCount: {
    fontSize: 14,
    color: 'white',
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4FC3F7',
    marginTop: 20,
  },
  overview: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
    lineHeight: 22,
  },
  genre: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  /* Production Companies Section */
  productionCompaniesContainer: {
    marginTop: 10,
  },
  productionCompany: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  /* Budget & Revenue Section */
  budgetRevenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: '#24243e',
    padding: 15,
    borderRadius: 10,
  },
  budgetBox: {
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  revenueBox: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 10,
  },
  budgetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFB74D', // Orange for budget
  },
  revenueTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#66BB6A', // Green for revenue
  },
  budgetText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default MovieDetails;
