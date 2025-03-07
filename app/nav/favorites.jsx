import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockFavorites = [
  { id: '1', title: 'Black Phone', image: require('../../assets/images/black.jpg') },
  { id: '2', title: 'Joker', image: require('../../assets/images/Joker.jpg') },
  { id: '3', title: 'Avatar', image: require('../../assets/images/avatar.jpg') },
  { id: '4', title: 'Hellboy', image: require('../../assets/images/hell.jpg') },
  { id: '5', title: 'Edge', image: require('../../assets/images/edge.jpg') },
];

const FavoritesScreen = () => {
  const [favorites, setFavorites] = useState(mockFavorites);

  const removeFavorite = (id) => {
    setFavorites(favorites.filter(movie => movie.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Watchlist</Text>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.movieCard}>
              <Image source={item.image} style={styles.movieImage} />
              <Text style={styles.movieTitle}>{item.title}</Text>
              <TouchableOpacity onPress={() => removeFavorite(item.id)}>
                <Ionicons name="trash" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}>No favorites added yet.</Text>
      )}
    </View>
  );
};

export default FavoritesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d2b', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 20 ,padding : 10,backgroundColor: '#1a1a2e', color: '#fff', textAlign: 'center', marginBottom: 20, borderRadius : 200},
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  movieImage: { width: 50, height: 75, borderRadius: 5, marginRight: 10 },
  movieTitle: { flex: 1, color: '#fff', fontSize: 16 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20, fontSize: 18 },
});
