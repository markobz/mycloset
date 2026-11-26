export const theme = {
  background: '#FAF8F5',
  card: '#FFFFFF',
  border: '#ECE7E1',
  text: '#1C1B1A',
  muted: '#8B8680',
  primary: '#1C1B1A',
  onPrimary: '#FFFFFF',
  chip: '#F1EDE8',
  danger: '#C0392B',
  radius: 14,
  spacing: 16,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700', color: theme.text },
  subtitle: { fontSize: 13, color: theme.muted },
  body: { fontSize: 15, color: theme.text },
  button: { fontSize: 16, fontWeight: '600' },
} as const;
