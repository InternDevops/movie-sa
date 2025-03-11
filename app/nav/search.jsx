import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

const CATEGORY_DATA = [
  { id: 28, name: 'Action', color: '#ff4757' },
  { id: 35, name: 'Comedy', color: '#ffa502' },
  { id: 18, name: 'Drama', color: '#3742fa' },
  { id: 27, name: 'Horror', color: '#2f3542' },
  { id: 878, name: 'Sci-Fi', color: '#1e90ff' },
  { id: 12, name: 'Adventure', color: '#2ed573' },
  { id: 10749, name: 'Romance', color: '#ff6b81' },
  { id: 16, name: 'Animation', color: '#70a1ff' },
  { id: 99, name: 'Documentary', color: '#ff9f43' },
  { id: 53, name: 'Thriller', color: '#5352ed' },
];

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const router = useRouter();

  const searchMovies = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=aaf96c78ceffb8eb75d10677356165e9&query=${text}`
        );
        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
    } else {
      setMovies([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={30} color="gray" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor="gray"
          onChangeText={searchMovies}
          value={query}
        />
      </View>

      {/* Categories Grid (Hidden when searching) */}
      {query.length === 0 && (
        <FlatList
          data={CATEGORY_DATA}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: item.color }]}
              onPress={() => router.push(`/category/${item.id}`)}
            >
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Search Results */}
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0d0d2b' },
  title: { fontSize: 24, fontWeight: 'bold', padding: 10, backgroundColor: '#1a1a2e', color: '#fff', textAlign: 'center', marginBottom: 20, borderRadius: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#191932',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 20,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: 'white' },

  // Category Grid Styles
  categoryCard: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: { fontSize: 18, fontWeight: 'bold', color: 'white' },

  // Movie List Styles
  movieCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111', borderRadius: 10, padding: 10, marginBottom: 10 },
  movieImage: { width: 60, height: 90, borderRadius: 5, marginRight: 15 },
  movieTitle: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});

export default SearchScreen;
