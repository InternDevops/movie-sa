import { Tabs } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const NavLayout = () => {
  return (
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
  );
};

export default NavLayout;
