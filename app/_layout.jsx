import { Stack } from 'expo-router';
import { enableScreens } from 'react-native-screens';

enableScreens(); // Optimize performance

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right', // Smooth slide transition
        headerShown: false, // Hide default headers
      }}
    />
  );
}
