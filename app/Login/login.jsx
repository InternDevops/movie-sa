import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/nav/home'); // Navigate to home after login
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0d0d2b" barStyle="light-content" />
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('index/..')}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Login</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        value={email} 
        placeholderTextColor="white" 
        onChangeText={setEmail} 
        keyboardType="email-address" 
        autoCapitalize="none"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        placeholderTextColor="white" 
        onChangeText={setPassword} 
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      
      <View style={styles.linkContainer}>
        <Text style={styles.linkCon}>Don't have an account? </Text>
        <Link href="/Login/signup" style={styles.link}>Sign Up</Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d0d2b', padding: 20 },
  backButton: { position: 'absolute', top: 40, left: 20 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', color: 'white', padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  linkContainer: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  linkCon: { color: 'white' },
  link: { color: 'lightblue', textDecorationLine: 'underline' },
});

export default LoginScreen;
