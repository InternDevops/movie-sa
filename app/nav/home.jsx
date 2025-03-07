import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const API_URL = 'https://api.themoviedb.org/3/movie/popular?api_key=aaf96c78ceffb8eb75d10677356165e9&language=en-US&page=1';
const ACTION_API_URL = 'https://api.themoviedb.org/3/discover/movie?api_key=aaf96c78ceffb8eb75d10677356165e9&with_genres=28';
const COMEDY_API_URL = 'https://api.themoviedb.org/3/discover/movie?api_key=aaf96c78ceffb8eb75d10677356165e9&with_genres=35';

const MovieCard = ({ movie, onPress }) => {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withSpring(1);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View style={[styles.movieCard, animatedStyle]}>
        <Image source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }} style={styles.movieImage} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchMovies = async () => {
    try {
      const [topRes, actionRes, comedyRes] = await Promise.all([
        fetch(API_URL),
        fetch(ACTION_API_URL),
        fetch(COMEDY_API_URL)
      ]);

      const topData = await topRes.json();
      const actionData = await actionRes.json();
      const comedyData = await comedyRes.json();

      setTopMovies(topData.results);
      setActionMovies(actionData.results);
      setComedyMovies(comedyData.results);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop the refresh indicator
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMovies();
  }, []);

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
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.sectionTitle}>Top 10 Movies Today</Text>
          <FlatList
            horizontal
            data={topMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} onPress={() => router.push(`/${item.id}`)} />}
            showsHorizontalScrollIndicator={false}
          />

          <Text style={styles.sectionTitle}>Action Movies</Text>
          <FlatList
            horizontal
            data={actionMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} onPress={() => router.push(`/${item.id}`)} />}
            showsHorizontalScrollIndicator={false}
          />

          <Text style={styles.sectionTitle}>Comedy Movies</Text>
          <FlatList
            horizontal
            data={comedyMovies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <MovieCard movie={item} onPress={() => router.push(`/${item.id}`)} />}
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
  movieCard: { marginHorizontal: 10, borderRadius: 10, overflow: 'hidden' },
  movieImage: { width: 140, height: 200, borderRadius: 10 },
  loader: { alignSelf: 'center', width: 200, height: 200 },
  eventName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: -30,
    paddingBottom : 10,
    color: '#fff',
    textTransform: 'uppercase',
  },
  smallText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#bbb',
    textTransform: 'uppercase',
  },
  highlight: {
    color: '#8ab4f8',
  },
});

export default HomeScreen;
