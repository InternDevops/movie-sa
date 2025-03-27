import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { db, auth } from '../../firebaseConfig'; // Ensure firebaseConfig is set up correctly
import { doc, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window'); // Get screen width

const TMDB_API_KEY = 'aaf96c78ceffb8eb75d10677356165e9'; // Replace with your TMDb API key

const WatchlistScreen = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const [genreBreakdown, setGenreBreakdown] = useState({});
  const progressAnimations = {};

  useFocusEffect(
    useCallback(() => {
      if (!auth.currentUser) return;

      const userWatchlistRef = doc(db, "watchlists", auth.currentUser.uid);

      const unsubscribe = onSnapshot(userWatchlistRef, async (docSnap) => {
        if (docSnap.exists()) {
          let movies = docSnap.data().movies || [];

          // Fetch missing movie details
          const updatedMovies = await Promise.all(
            movies.map(async (movie) => {
              if (!movie.title || !movie.genre || !movie.release_date || !movie.runtime) {
                try {
                  const response = await fetch(
                    `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`
                  );
                  const data = await response.json();
                  return {
                    ...movie,
                    title: data.title || "Unknown Title",
                    genre: data.genres?.map(g => g.name).join(', ') || "Unknown Genre",
                    rating: data.vote_average ? data.vote_average.toFixed(1) : "N/A",
                    release_date: data.release_date || "N/A",
                    runtime: data.runtime || 0,
                  };
                } catch (error) {
                  console.error("Error fetching movie details:", error);
                  return movie; // Return original if fetch fails
                }
              }
              return movie;
            })
          );

          setWatchlist(updatedMovies);

          // Calculate Total Watch Time
          const totalRuntime = updatedMovies.reduce((sum, movie) => sum + (Number(movie.runtime) || 0), 0);
          setTotalWatchTime(totalRuntime);

          // Calculate Genre Breakdown
          const genreCounts = {};
          updatedMovies.forEach(movie => {
            const genres = movie.genre ? movie.genre.split(', ') : [];
            genres.forEach(genre => {
              genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            });
          });
          setGenreBreakdown(genreCounts);
        } else {
          setWatchlist([]);
          setTotalWatchTime(0);
          setGenreBreakdown({});
        }
      });

      return () => unsubscribe();
    }, [])
  );

  const formatMovies = (data) => {
    const formatted = [];
    for (let i = 0; i < data.length; i += 2) {
      formatted.push([data[i], data[i + 1] || null]);
    }
    return formatted;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
      <View style={styles.container}>
        {/* ✅ Move these inside ListHeaderComponent */}
        <FlatList
          ListHeaderComponent={ // ✅ Added ListHeaderComponent here
            <View>
              <Text style={styles.header}>My Watchlist</Text>
              <View style={{ alignItems: 'center', marginBottom: 10 }}>
                <Text style={styles.watchTime}>Total Watch Time:</Text>
                <Text style={[styles.watchTime, { fontSize: 16, fontWeight: 'bold', marginTop: 4 }]}>
                  ({Math.floor(totalWatchTime / 60)} hrs {totalWatchTime % 60} mins {Math.floor((totalWatchTime % 1) * 60)} sec)
                </Text>
              </View>
              <View style={styles.genreContainer}>
                <Text style={styles.genreHeader}>Genre Breakdown:</Text>
                {Object.entries(genreBreakdown).map(([genre, count]) => {
                  if (!progressAnimations[genre]) {
                    progressAnimations[genre] = new Animated.Value(0);
                  }
  
                  // Animate progress bar
                  Animated.timing(progressAnimations[genre], {
                    toValue: count,
                    duration: 800,
                    useNativeDriver: false,
                  }).start();
  
                  const maxCount = Math.max(...Object.values(genreBreakdown));
  
                  return (
                    <View key={genre} style={styles.genreRow}>
                      <Text style={styles.genreText}>{genre}:</Text>
                      <View style={styles.progressBar}>
                        <Animated.View
                          style={[
                            styles.progressFill,
                            { width: progressAnimations[genre].interpolate({
                                inputRange: [0, maxCount],
                                outputRange: ["0%", "100%"],
                              }),
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.countText}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          } // ✅ End of ListHeaderComponent
  
          data={formatMovies(watchlist)}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.map((movie, idx) =>
                movie ? (
                  <TouchableOpacity 
                    key={movie.id} 
                    onPress={() => router.push(`/${movie.id}`)} 
                    style={styles.card}
                  >
                    <Image 
                      source={{ uri: `https://image.tmdb.org/t/p/w200${movie.poster_path}` }} 
                      style={styles.poster} 
                    />
                    <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                      {movie.title}
                    </Text>
                    <Text style={styles.genre} numberOfLines={1} ellipsizeMode="tail">
                      {movie.genre || 'Unknown Genre'}
                    </Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.rating}>⭐ {movie.rating || 'N/A'}</Text>
                      <Text style={styles.date}>{formatDate(movie.release_date)}</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View key={idx} style={styles.emptyCard} />
                )
              )}
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>Your watchlist is empty.</Text>} // ✅ Optional: Show this when the list is empty
        />
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d2b', padding: 20 },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    padding: 10, 
    backgroundColor: '#1a1a2e', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: 20, 
    borderRadius: 10 
  },
  watchTime: { fontSize: 26, color: 'lightgray', textAlign: 'center', marginBottom: 10 },
  genreContainer: { marginBottom: 15, paddingHorizontal: 10 },
  genreHeader: { fontSize: 20, color: 'white', textAlign: 'center', marginBottom: 10 },
  genreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  genreText: { fontSize: 14, color: '#A8B5DB', flex: 1 },
  progressBar: { flex: 3, height: 10, backgroundColor: '#333', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#8ab4f8' },
  countText: { fontSize: 14, color: '#A8B5DB', marginLeft: 5 },
  emptyText: {
    color: '#A8B5DB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  card: { marginHorizontal: 10, borderRadius: 10, overflow: 'hidden', alignItems: 'center', width: 140 },
  poster: { width: 140, height: 200, borderRadius: 10 },
  title: {
    fontSize: 14,
    fontWeight: 'medium',
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  genre: {
    fontSize: 12,
    color: '#8ab4f8',
    textAlign: 'center',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'light',
    color: '#FFFFFF',
    marginRight: 10,
  },
  date: {
    fontSize: 12,
    color: '#aaa',
  },
  emptyCard: { 
    width: width / 2 - 25, 
  },  
});

export default WatchlistScreen;
