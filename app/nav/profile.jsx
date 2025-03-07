import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../../firebaseConfig';
import { signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName || user.email.split('@')[0]); // Use email prefix if no name is set
      }
    });
    return unsubscribe;
  }, []);

  // Function to update user name in Firebase
  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser, displayName: name });
      setIsEditing(false);
      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      Alert.alert('Update Failed', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged out', 'You have been logged out successfully');
      router.replace('/Login/login');
    } catch (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>

      {user ? (
        <>
          <Image source={require('../../assets/images/edge.jpg')} style={styles.avatar} />

          {/* Editable Name Section */}
          {isEditing ? (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                autoFocus
                placeholder="Enter your name"
                placeholderTextColor="#ccc"
              />
              <TouchableOpacity onPress={handleUpdateName} style={styles.saveButton}>
                <Ionicons name="checkmark-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={styles.name}>{name}</Text>
              <Ionicons name="pencil" size={20} color="white" style={styles.editIcon} />
            </TouchableOpacity>
          )}

          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.stats}>
            <Text style={styles.statsText}>Favorite Movies: 5</Text>
          </View>

          <TouchableOpacity style={styles.button}>
            <Ionicons name="settings-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.loadingText}>Loading user info...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d2b', padding: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 109, padding: 10, backgroundColor: '#1a1a2e', color: '#fff', textAlign: 'center', marginBottom: 20, borderRadius: 200 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  email: { fontSize: 14, color: '#888', marginBottom: 20 },
  stats: { backgroundColor: '#111', padding: 15, borderRadius: 10, width: '100%', marginBottom: 20 },
  statsText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', padding: 15, borderRadius: 10, width: '100%', justifyContent: 'center', marginBottom: 10 },
  logoutButton: { backgroundColor: 'red' },
  buttonText: { color: '#fff', fontSize: 18, marginLeft: 10 },
  loadingText: { color: 'white', fontSize: 16, marginTop: 20 },
  editIcon: { marginTop: 5, textAlign: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#fff', marginBottom: 10 },
  input: { flex: 1, color: 'white', fontSize: 18, paddingVertical: 5, textAlign: 'center' },
  saveButton: { marginLeft: 10 },
});

export default Profile;
