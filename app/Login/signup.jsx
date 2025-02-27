import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import app from '../../firebaseConfig';

const auth = getAuth(app);

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Success', 'Account created! You can now log in.');
      router.replace('/Login/login'); // Redirect to login page
    } catch (error) {
      Alert.alert('Sign-Up Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>

      <Text style={styles.title}>Sign Up</Text>
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
      <TextInput 
        style={styles.input} 
        placeholder="Confirm Password" 
        value={confirmPassword} 
        placeholderTextColor="white" 
        onChangeText={setConfirmPassword} 
        secureTextEntry 
      />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e', padding: 20 },
  backButton: { position: 'absolute', top: 40, left: 20 },
  title: { fontSize: 24, color: 'white', fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', color: 'white', padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
});

export default SignUpScreen;
