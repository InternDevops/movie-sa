import React, { useEffect, useState, memo } from 'react';
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

  const [allMovies, setAllMovies] = useState([]); // Store all fetched movies
  const [filteredMovies, setFilteredMovies] = useState([]); // Store only filtered movies
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState(null);

  useEffect(() => {
    fetchMoviesByCategory();
  }, [categoryId]);

  useEffect(() => {
    applyFilter();
  }, [selectedLetter, allMovies]);

  const fetchMoviesByCategory = async () => {
    setLoading(true);
    setAllMovies([]); 
    setFilteredMovies([]);

    try {
      let allResults = [];
      
      for (let i = 1; i <= 30; i++) {  // Fetch multiple pages
        const url = `https://api.themoviedb.org/3/discover/movie?api_key=aaf96c78ceffb8eb75d10677356165e9&with_genres=${categoryId}&page=${i}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.results) {
          allResults = [...allResults, ...data.results];
        }

        if (data.results.length < 20) break; // Stop early if fewer results
      }

      setAllMovies(allResults);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!selectedLetter) {
      setFilteredMovies(allMovies); // Show all movies when no letter is selected
    } else {
      const filtered = allMovies.filter(movie => 
        movie.title && movie.title.toUpperCase().startsWith(selectedLetter)
      );
      setFilteredMovies(filtered);
    }
  };

  const MovieCard = memo(({ item, onPress }) => (
    <TouchableOpacity style={styles.movieCard} onPress={onPress}>
      <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.movieImage} />
      <Text style={styles.movieTitle}>{item.title}</Text>
    </TouchableOpacity>
  ));

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="white" />
      </TouchableOpacity>

      {/* Category Title */}
      <Text style={styles.title}>{CATEGORY_NAMES[categoryId] || 'Movies'}</Text>

      {/* Alphabet Filter */}
      <View style={styles.alphabetWrapper}>
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
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <FlatList
          data={filteredMovies}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item }) => <MovieCard item={item} onPress={() => router.push(`/${item.id}`)} />}
          initialNumToRender={10}   // Render only 10 items initially
          maxToRenderPerBatch={10}  // Load items in batches of 10
          windowSize={5}            // Keep a small buffer
          getItemLayout={(data, index) => ({ length: 120, offset: 120 * index, index })} // Optimize scrolling
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d0d2b' },
  backButton: { position: 'absolute', top: 30, left: 25, zIndex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', padding: 10, backgroundColor: '#1a1a2e', color: '#fff',left: '50%', transform: [{ translateX: -100 }], maxWidth: '60%', textAlign: 'center', marginBottom: 20, borderRadius: 10 },

  // Alphabet List Styles
  alphabetWrapper: { height: 50, marginBottom: 15 },
  alphabetContainer: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 5 },
  letterButton: { 
    padding: 10, marginHorizontal: 5, backgroundColor: '#222', 
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', 
    minWidth: 30,
  },
  letterText: { fontSize: 16, color: 'white', fontWeight: 'bold' },
  selectedLetter: { backgroundColor: '#ff4757' },
  
  // Movie List Styles
  movieCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 10, padding: 10, marginBottom: 10 },
  movieImage: { width: 60, height: 90, borderRadius: 5, marginRight: 15 },
  movieTitle: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});

export default CategoryScreen;
