import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window'); // Get screen width

const TMDB_API_KEY = 'aaf96c78ceffb8eb75d10677356165e9'; // Replace with your TMDb API key

const WatchlistScreen = () => {
  const [watchlist, setWatchlist] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const fetchWatchlist = async () => {
        try {
          const storedWatchlist = await AsyncStorage.getItem('watchlist');
          let movies = storedWatchlist ? JSON.parse(storedWatchlist) : [];

          // Fetch movie details from API
          const updatedMovies = await Promise.all(
            movies.map(async (movie) => {
              if (!movie.genre || !movie.rating || !movie.release_date) {
                const response = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`);
                const data = await response.json();
                return {
                  ...movie,
                  genre: data.genres?.map(g => g.name).join(', ') || 'Unknown Genre',
                  rating: data.vote_average ? data.vote_average.toFixed(1) : 'N/A', // Rounded to 1 decimal
                  release_date: data.release_date || 'N/A',
                };
              }
              return movie;
            })
          );

          setWatchlist(updatedMovies);
          await AsyncStorage.setItem('watchlist', JSON.stringify(updatedMovies)); // Store updated data
        } catch (error) {
          console.error('Error fetching watchlist:', error);
        }
      };
      fetchWatchlist();
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
    const day = String(dateObj.getDate()).padStart(2, '0'); // Ensure two-digit day
    const month = months[dateObj.getMonth()]; // Get month abbreviation
    const year = dateObj.getFullYear(); // Get full year
    return `${day}-${month}-${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Watchlist</Text>
      <FlatList
        data={formatMovies(watchlist)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((movie, idx) => (
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
                    {movie.genre}
                  </Text>
                  <View style={styles.infoRow}>
                    <Text style={styles.rating}>⭐ {movie.rating}</Text>
                    <Text style={styles.date}>{formatDate(movie.release_date)}</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <View key={idx} style={styles.emptyCard} /> // Empty space if odd number
              )
            ))}
          </View>
        )}
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
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 10 
  },
  card: { marginHorizontal: 10, borderRadius: 10, overflow: 'hidden', alignItems: 'center', width: 140 },
  poster: { width: 140, height: 200, borderRadius: 10 },
  title: {
    fontSize: 14, // Ensure title fits in one line
    fontWeight: 'medium',
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  genre: {
    fontSize: 12, // Ensure genre fits in one line
    color: '#8ab4f8',
    textAlign: 'center',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row', // Align items in a row
    justifyContent: 'center', // Center them
    alignItems: 'center', // Vertical alignment
    marginTop: 5, // Space from genre
  },
  rating: {
    fontSize: 12,
    fontWeight: 'light', // Make rating bold
    color: '#FFFFFF', // Yellow color for rating
    marginRight: 10, // Space between rating & date
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