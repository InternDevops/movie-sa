import React, { useState } from 'react';
import { View, TextInput, FlatList, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

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

  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  movieImage: { width: 60, height: 90, borderRadius: 5, marginRight: 15 },
  movieTitle: { fontSize: 16, color: 'white', fontWeight: 'bold' },
});

export default SearchScreen;
