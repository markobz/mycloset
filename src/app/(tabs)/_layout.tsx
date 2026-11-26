import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '600', color: theme.text },
        headerStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Closet',
          tabBarLabel: 'Closet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shirt-outline" size={size} color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'Outfits',
          tabBarLabel: 'Outfits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
