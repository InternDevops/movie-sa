import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const API_KEY = 'aaf96c78ceffb8eb75d10677356165e9';
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const ACTION_API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=28`;
const COMEDY_API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=35`;
const LATEST_API_URL = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`;
const GENRES_API_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`;

const MovieCard = ({ movie, onPress, genresMap, customStyles = {} }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Map genre IDs to names
  const movieGenres = movie.genre_ids
    .map((id) => genresMap[id])
    .filter(Boolean) // Remove undefined values
    .slice(0, 2) // Show up to 2 genres
    .join(", ");

  return (
    <TouchableOpacity onPress={onPress} style={[styles.movieCard, customStyles.movieCard]}>
      <Animated.View style={[styles.movieCardContent, animatedStyle]}>
        <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={[styles.movieImage, customStyles.movieImage]} />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={1}>{movie.title}</Text>
          <Text style={styles.movieGenres}>{movieGenres}</Text> 
          <Text style={styles.movieDetails}>⭐ {movie.vote_average.toFixed(1)}   {movie.release_date}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [genresMap, setGenresMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMovies = async () => {
    try {
      const [topRes, actionRes, comedyRes, latestRes, genresRes] = await Promise.all([
        fetch(API_URL),
        fetch(ACTION_API_URL),
        fetch(COMEDY_API_URL),
        fetch(LATEST_API_URL),
        fetch(GENRES_API_URL),
      ]);

      const topData = await topRes.json();
      const actionData = await actionRes.json();
      const comedyData = await comedyRes.json();
      const latestData = await latestRes.json();
      const genresData = await genresRes.json();

      // Map genre IDs to names
      const genreMap = {};
      genresData.genres.forEach((genre) => {
        genreMap[genre.id] = genre.name;
      });

      setTopMovies(topData.results.slice(0, 10));
      setActionMovies(actionData.results);
      setComedyMovies(comedyData.results);
      setLatestMovies(latestData.results);
      setGenresMap(genreMap);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMovies();
  }, []);

  const pairedMovies = [];
  for (let i = 0; i < latestMovies.length; i += 2) {
    pairedMovies.push({
      id: `pair-${i}`,
      movie1: latestMovies[i],
      movie2: latestMovies[i + 1] || null, // Handle odd number of movies
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventName}>
          <Text style={styles.smallText}></Text> {'\n'}
          Night <Text style={styles.highlight}>Verse</Text>
        </Text>
        <TouchableOpacity>
          <MaterialIcons name="notifications" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <LottieView source={require('../../assets/loading.json')} autoPlay loop style={styles.loader} />
      ) : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          
	        <Text style={styles.sectionTitle}>Top 10 Movies Today</Text>
          <FlatList
            horizontal
            data={topMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <View style={{ marginHorizontal: 8 }}>
                <View style={styles.movieCard}>
                  {/* Movie Poster */}
                  <MovieCard movie={item} genresMap={genresMap} onPress={() => router.push(`/${item.id}`)} 
                    customStyles={{ movieCard: styles.topMovieCard, movieImage: styles.topMovieImage }}
                  />
                  
                  {/* Numbering Exactly Like the Image */}
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
            
                {/* Movie Title */}
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />

          {/* Latest Release Movies */}
          <Text style={styles.sectionTitle}>Latest Movies</Text>
          <FlatList
            horizontal
            data={pairedMovies}
            keyExtractor={(item) => item.id.toString()} // ✅ Ensures key is a string
            renderItem={({ item }) => (
              <View style={{ flexDirection: 'column', marginHorizontal: 8 }}>
                {item.movie1 && (
                  <MovieCard movie={item.movie1} genresMap={genresMap} onPress={() => router.push(`/${item.movie1.id}`)} />
                )}
                {item.movie2 && (
                  <View style={{ marginTop: 20 }}>
                    <MovieCard movie={item.movie2} genresMap={genresMap} onPress={() => router.push(`/${item.movie2.id}`)} />
                  </View>
                )}
              </View>
            )}
            showsHorizontalScrollIndicator={false}
          />

          {/* Action Movies */}
          <Text style={styles.sectionTitle}>Action Movies</Text>
          <FlatList
            horizontal
            data={actionMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} genresMap={genresMap} onPress={() => router.push(`/${item.id}`)} />}
            showsHorizontalScrollIndicator={false}
          />

          {/* Comedy Movies */}
          <Text style={styles.sectionTitle}>Comedy Movies</Text>
          <FlatList
            horizontal
            data={comedyMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} genresMap={genresMap} onPress={() => router.push(`/${item.id}`)} />}
            showsHorizontalScrollIndicator={false}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d2b', paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
  sectionTitle: { fontSize: 18, color: 'white', fontWeight: 'bold', paddingHorizontal: 20, marginVertical: 25 },
  loader: { alignSelf: 'center', width: 200, height: 200 },
  eventName: { fontSize: 22, fontWeight: 'bold', marginTop: -30, paddingBottom: 10, color: '#fff', textTransform: 'uppercase' },
  highlight: { color: '#8ab4f8' },

  movieCard: { marginHorizontal: 10, borderRadius: 10, overflow: 'hidden', alignItems: 'center', width: 140 },
  movieCardContent: { alignItems: 'center' },
  movieImage: { width: 140, height: 200, borderRadius: 10 },
  movieInfo: { marginTop: 8, alignItems: 'center' },
  movieTitle: { fontSize: 14, fontWeight: 'medium', color: 'white', textAlign: 'center', width: 130 },
  movieGenres: { fontSize: 12, color: '#8ab4f8', textAlign: 'center' },
  movieDetails: { fontSize: 12, color: '#bbb', textAlign: 'center' },
  topMovieCard: { marginHorizontal: 1, borderRadius: 10, overflow: 'hidden', alignItems: 'center', width: 170 },
  topMovieImage: { width: 150, height: 225, borderRadius: 8 ,resizeMode: 'cover',},

  rankText: {
    position: 'absolute',
    bottom: 60, // Align at the bottom
    left: 10, // Align to the left
    fontSize: 40, // Bigger and bolder like the image
    fontWeight: '900',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.9)', // Strong text shadow for contrast
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
});

export default HomeScreen;
