import { Tabs } from 'expo-router';
import { Chrome as Home, Map, Users as Users2, MessageSquare, User } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: true,
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        height: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: Platform.OS === 'ios' ? 24 : 8,
        paddingTop: 8,
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Лента',
          tabBarIcon: ({ color, size }) => (
            <Home size={size - 2} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Карта',
          tabBarIcon: ({ color, size }) => (
            <Map size={size - 2} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="rollers"
        options={{
          title: 'Роллеры',
          tabBarIcon: ({ color, size }) => (
            <Users2 size={size - 2} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Чаты',
          tabBarIcon: ({ color, size }) => (
            <MessageSquare size={size - 2} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <User size={size - 2} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}