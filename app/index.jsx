import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView 
} from 'react-native';
import { Link } from 'expo-router';
import { registerForPushNotificationsAsync } from './services/notification';
 // Import function

const Welcome = () => {
  
  useEffect(() => {
    registerForPushNotificationsAsync(); // Call push notification registration
  }, []);

  return (
    <ImageBackground 
      source={{ uri: 'https://example.com/your-image.jpg' }} // Replace with actual image URL
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#0d0d2b" barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Forever Night</Text>
        <Text style={styles.subtitle}>Presents</Text>
        <Text style={styles.eventName}>
          <Text style={styles.smallText}></Text> {'\n'}
          Night <Text style={styles.highlight}>Verse</Text>
        </Text>

        <Link href="/Login/login" asChild>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Start now</Text>
          </TouchableOpacity>
        </Link>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0d0d2b', // Fallback color
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});
