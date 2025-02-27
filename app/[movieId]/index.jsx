import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const MovieDetails = () => {
  const { movieId } = useLocalSearchParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=aaf96c78ceffb8eb75d10677356165e9&language=en-US`);
        const data = await response.json();
        setMovie(data);
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

  return (
    <Animated.View style={[styles.container, fadeInStyle]}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>
    
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : movie ? (
        <>
          <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.poster} />
          <Text style={styles.title}>{movie.title}</Text>
          <Text style={styles.rating}>⭐ {movie.vote_average}/10</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </>
      ) : (
        <Text style={styles.errorText}>Movie not found.</Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 20 },
  backButton: { position: 'absolute', top: 30, left: 20 },
  poster: { width: '100%', height: 500, borderRadius: 10, marginTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 20 },
  overview: { fontSize: 16, color: 'white', marginTop: 10 },
  rating: { fontSize: 18, fontWeight: 'bold', color: '#FFD700', marginTop: 10 },
  loadingText: { color: 'white', textAlign: 'center', marginTop: 20 },
  errorText: { color: 'red', textAlign: 'center', marginTop: 20 },
});

export default MovieDetails;
