import { ReactNode, useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../theme';
import { ClosetStoreProvider, useCloset } from '../store/ClosetStore';

function NameGate({ children }: { children: ReactNode }) {
  const { name, ready } = useCloset();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && name === '' && pathname !== '/welcome') {
      router.replace('/welcome');
    }
  }, [ready, name, pathname, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ClosetStoreProvider>
      <NameGate>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.background },
            headerTintColor: theme.ink,
            headerTitleStyle: {
              fontFamily: theme.serif,
              fontWeight: Platform.select({ ios: '600', default: '500' }),
            },
            headerShadowVisible: false,
            headerBackTitle: 'Back',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen
            name="add-item"
            options={{ title: 'Add a piece', presentation: 'modal' }}
          />
          <Stack.Screen name="item/[id]" options={{ title: 'Piece' }} />
          <Stack.Screen
            name="categories"
            options={{ title: 'Categories', presentation: 'modal' }}
          />
          <Stack.Screen
            name="create-outfit"
            options={{ title: 'New outfit', presentation: 'modal' }}
          />
          <Stack.Screen name="outfit/[id]" options={{ title: 'Outfit' }} />
        </Stack>
      </NameGate>
    </ClosetStoreProvider>
  );
}
