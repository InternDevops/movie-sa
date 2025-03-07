import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const CATEGORY_NAMES = {
  28: 'Action', 35: 'Comedy', 18: 'Drama', 27: 'Horror',
  878: 'Sci-Fi', 12: 'Adventure', 10749: 'Romance', 
  16: 'Animation', 99: 'Documentary', 53: 'Thriller',
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CategoryScreen = () => {
  const { id } = useLocalSearchParams();
  const categoryId = parseInt(id, 10);
  const router = useRouter();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    fetchMoviesByCategory(1, true);
  }, [categoryId, selectedLetter]);

  const fetchMoviesByCategory = async (pageNumber, reset = false) => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=aaf96c78ceffb8eb75d10677356165e9&with_genres=${categoryId}&page=${pageNumber}`;

      if (selectedLetter) {
        url += `&sort_by=original_title.asc`;
      }

      const response = await fetch(url);
      const data = await response.json();

      const filteredMovies = selectedLetter
        ? data.results.filter((movie) =>
            movie.title.toUpperCase().startsWith(selectedLetter)
          )
        : data.results;

      if (reset) {
        setMovies(filteredMovies || []);
      } else {
        setMovies((prevMovies) => [...prevMovies, ...filteredMovies]);
      }
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching category movies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      {/* Category Title */}
      <Text style={styles.title}>{CATEGORY_NAMES[categoryId] || 'Movies'}</Text>

      {/* Alphabet Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.alphabetContainer}>
        {ALPHABET.map((letter) => (
          <TouchableOpacity
            key={letter}
            style={[styles.letterButton, selectedLetter === letter && styles.selectedLetter]}
            onPress={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
          >
            <Text style={styles.letterText}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading Indicator for First Fetch */}
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.movieCard} onPress={() => router.push(`/${item.id}`)}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
              <Text style={styles.movieTitle}>{item.title}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={() => fetchMoviesByCategory(page + 1)}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color="white" /> : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d0d2b' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },

  // Alphabet List Styles
  alphabetContainer: { flexDirection: 'row', marginBottom: 15, paddingVertical: 30, paddingHorizontal: 5 },
  letterButton: { 
    padding: 15, marginHorizontal: 5, backgroundColor: '#222', 
    borderRadius: 15, alignItems: 'center', justifyContent: 'center' 
  },
  selectedLetter: { backgroundColor: '#ff4757' },
  letterText: { fontSize: 16, color: 'white', fontWeight: 'bold' },

  // Movie List Styles
  movieCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 10, padding: 10, marginBottom: 10 },
  movieImage: { width: 60, height: 90, borderRadius: 5, marginRight: 15 },
  movieTitle: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});

export default CategoryScreen;






