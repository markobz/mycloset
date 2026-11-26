import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ClosetProvider } from '../context/ClosetContext';
import { theme } from '../theme';

export default function RootLayout() {
  return (
    <ClosetProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: theme.background },
          headerTitleStyle: { fontWeight: '600', color: theme.text },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-item"
          options={{ presentation: 'modal', title: 'Add Item' }}
        />
        <Stack.Screen
          name="create-outfit"
          options={{ presentation: 'modal', title: 'New Outfit' }}
        />
        <Stack.Screen name="item/[id]" options={{ title: 'Item' }} />
        <Stack.Screen name="outfit/[id]" options={{ title: 'Outfit' }} />
      </Stack>
    </ClosetProvider>
  );
}
