import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { AirbnbRating } from 'react-native-ratings';

const db = getFirestore();

const MovieReview = ({ movieId }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    const reviewsRef = collection(db, 'movies', movieId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const submitReview = async () => {
    if (!reviewText || rating === 0) return;
    await addDoc(collection(db, 'movies', movieId, 'reviews'), {
      text: reviewText,
      rating,
      createdAt: new Date(),
    });
    setReviewText('');
    setRating(0);
    fetchReviews();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Reviews</Text>
      <AirbnbRating
        count={5}
        defaultRating={rating}
        size={20}
        onFinishRating={setRating}
      />
      <TextInput
        style={styles.input}
        placeholder="Write a review..."
        value={reviewText}
        onChangeText={setReviewText}
      />
      <Button title="Submit Review" onPress={submitReview} />

      {loading ? <Text>Loading reviews...</Text> : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.reviewItem}>
              <Text style={styles.reviewText}>{item.text}</Text>
              <Text>⭐ {item.rating}/5</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: 'white' },
  input: { backgroundColor: 'white', padding: 10, marginVertical: 10, borderRadius: 5 },
  reviewItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: 'gray' },
  reviewText: { color: 'white' },
});

export default MovieReview;
