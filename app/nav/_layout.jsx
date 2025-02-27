import { Tabs, Stack, useRouter, usePathname } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';

const StackNavigator = createStackNavigator();

const NavLayout = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current tab path

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true, // Enables swipe back
        animation: "slide_from_bottom", // Slide transition
        detachPreviousScreen: false, // Prevents unmounting, avoiding white flash
        cardStyle: { backgroundColor: 'black' }, // Prevents white screen flash
      }}
    >
      <StackNavigator.Screen name="TabsScreen" options={{ title: 'Tabs' }}>
        {() => (
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: false, 
              tabBarStyle: { backgroundColor: '#1a1a2e', borderTopWidth: 0 },
              tabBarActiveTintColor: '#007BFF',
              tabBarInactiveTintColor: '#8e8e8e',
              tabBarIconStyle: { marginTop: 4 },
              tabBarLabelStyle: { fontSize: 12 },
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                tabBarIcon: ({ color }) => <MaterialIcons name="home" size={30} color={color} />,
              }}
            />
            <Tabs.Screen
              name="search"
              options={{
                tabBarIcon: ({ color }) => <MaterialIcons name="search" size={30} color={color} />,
              }}
            />
            <Tabs.Screen
              name="favorites"
              options={{
                tabBarIcon: ({ color }) => <MaterialIcons name="watch-later" size={30} color={color} />,
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                tabBarIcon: ({ color }) => <MaterialIcons name="person" size={30} color={color} />,
              }}
            />
          </Tabs>
        )}
      </StackNavigator.Screen>
    </StackNavigator.Navigator>
  );
};

export default NavLayout;
