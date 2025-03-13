import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../../firebaseConfig";
import { signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("https://via.placeholder.com/100");
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // Load user data from Firebase on mount
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setName(user.displayName || user.email.split("@")[0]);

        // Fetch profile picture
        const userRef = doc(db, "users", user.uid);
        const unsubscribeProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setPhotoURL(userData.photoURL || "https://via.placeholder.com/100");
          }
        });

        // Watchlist count listener (real-time updates)
        const watchlistRef = doc(db, "watchlists", user.uid);
        const unsubscribeWatchlist = onSnapshot(watchlistRef, (docSnap) => {
          if (docSnap.exists()) {
            const watchlistData = docSnap.data();
            setWatchlistCount(watchlistData.movies ? watchlistData.movies.length : 0);
          } else {
            setWatchlistCount(0);
          }
        });

        // Cleanup listeners on unmount
        return () => {
          unsubscribeProfile();
          unsubscribeWatchlist();
        };
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Pick Image from Gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setPhotoURL(base64String);
      await saveImageToFirestore(base64String);
    } else {
      Alert.alert("Image selection canceled");
    }
  };

  // Save Image to Firestore
  const saveImageToFirestore = async (base64String) => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { photoURL: base64String }, { merge: true });

      console.log("Profile image saved to Firestore!");
      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  // Update User Name
  const handleUpdateName = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      setUser({ ...auth.currentUser, displayName: name });
      setIsEditing(false);
      Alert.alert("Success", "Name updated successfully!");
    } catch (error) {
      Alert.alert("Update Failed", error.message);
    }
  };

  // Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged out", "You have been logged out successfully");
      router.replace("/Login/login");
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Profile</Text>
      {user ? (
        <>
          <TouchableOpacity onPress={pickImage}>
            <Image source={{ uri: photoURL }} style={styles.avatar} />
            <Ionicons name="camera" size={24} color="white" style={styles.cameraIcon} />
          </TouchableOpacity>

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
            <Text style={styles.statsText}>Watchlist Movies: {watchlistCount}</Text>
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d0d2b", padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: 'bold', paddingHorizontal: 119, padding: 10, backgroundColor: '#1a1a2e', color: '#fff', textAlign: 'center', marginBottom: 20, borderRadius: 10 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", padding: 5, borderRadius: 20 },
  name: { fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  email: { fontSize: 14, color: "#888", marginBottom: 20 },
  stats: { backgroundColor: '#111', padding: 15, borderRadius: 10, width: '100%', marginBottom: 20 },
  statsText: { fontSize: 16, color: '#fff', textAlign: 'center' },
  button: { flexDirection: "row", alignItems: "center", backgroundColor: "#222", padding: 15, borderRadius: 10, width: "100%", justifyContent: "center", marginBottom: 10 },
  logoutButton: { backgroundColor: "red" },
  buttonText: { color: "#fff", fontSize: 18, marginLeft: 10 },
  loadingText: { color: "white", fontSize: 16, marginTop: 20 },
  editIcon: { marginTop: 5 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#fff", marginBottom: 10 },
  input: { flex: 1, color: "white", fontSize: 18, paddingVertical: 5 },
  saveButton: { marginLeft: 10 },
});

export default Profile;
