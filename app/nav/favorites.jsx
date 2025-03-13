import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { db, auth } from '../../firebaseConfig'; // Ensure firebaseConfig is set up correctly
import { doc, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window'); // Get screen width

const TMDB_API_KEY = 'aaf96c78ceffb8eb75d10677356165e9'; // Replace with your TMDb API key

const WatchlistScreen = () => {
  const [watchlist, setWatchlist] = useState([]);

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
              if (!movie.title || !movie.genre || !movie.release_date) {
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
        } else {
          setWatchlist([]);
        }
      });

      return () => unsubscribe();
    }, [])
  );
  
  // Function to format movies in rows of 2
  const formatMovies = (data) => {
    const formatted = [];
    for (let i = 0; i < data.length; i += 2) {
      formatted.push([data[i], data[i + 1] || null]); // Pair movies in twos
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
      <Text style={styles.header}>My Watchlist</Text>
      {watchlist.length === 0 ? (
        <Text style={styles.emptyText}>Your watchlist is empty.</Text>
      ) : (
        <FlatList
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
        />
      )}
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
