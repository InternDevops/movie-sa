import { StyleSheet, Text, View, ImageBackground, TouchableOpacity } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

const Welcome = () => {
  return (
    <ImageBackground 
      source={{ uri: 'https://example.com/your-image.jpg' }} // Replace with actual image URL
      style={styles.background}
    >
      <Text style={styles.title}>Forever Night</Text>
      <Text style={styles.subtitle}>Presents</Text>
      <Text style={styles.eventName}>
        <Text style={styles.smallText}></Text> {'\n'}
        Night <Text style={styles.highlight}>Verse</Text>
      </Text>

      <Link href="Login/login" asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start now</Text>
        </TouchableOpacity>
      </Link>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    backgroundColor: '#1a1a2e', // Fallback background color
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '300',
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 10,
  },
  eventName: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    textTransform: 'uppercase',
  },
  smallText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#bbb',
    textTransform: 'uppercase',
  },
  highlight: {
    color: '#8ab4f8',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
