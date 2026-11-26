import { Platform } from 'react-native';

export const theme = {
  background: '#FFFFFF',
  ivory: '#FBF8F3',
  cream: '#F5F0E8',
  beige: '#EDE4D6',
  border: '#ECE6DC',
  card: '#FFFFFF',
  ink: '#2B2724',
  muted: '#8E8578',
  gold: '#B08D57',
  goldSoft: '#F0E6D4',
  danger: '#B3564C',
  radius: 16,
  spacing: 20,
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: undefined }),
} as const;

export const typography = {
  title: { fontFamily: theme.serif, fontSize: 30, color: theme.ink },
  heading: { fontFamily: theme.serif, fontSize: 21, color: theme.ink },
  body: { fontSize: 15, color: theme.ink },
  muted: { fontSize: 13, color: theme.muted },
  button: { fontSize: 15, fontWeight: '600' as const },
};
