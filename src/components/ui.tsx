import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SEASONS, Season } from '../types';
import { theme, typography } from '../theme';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 96 }, style]}>
      {children}
    </View>
  );
}

export function BrandHeader({ greeting }: { greeting?: string }) {
  return (
    <View style={{ marginBottom: theme.spacing }}>
      <Text style={[typography.title, { fontSize: 34 }]}>mycloset</Text>
      <Text style={[typography.muted, { marginTop: 4, letterSpacing: 0.4 }]}>
        {greeting ?? 'Your wardrobe. Your style. Your seasons.'}
      </Text>
    </View>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: theme.spacing }}>
      <Text style={typography.title}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.muted, { marginTop: 4, letterSpacing: 0.4 }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  gold,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  gold?: boolean;
  small?: boolean;
}) {
  const isActive = active === true;
  const isGold = gold === true;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        small ? styles.chipSmall : null,
        isActive
          ? isGold
            ? styles.chipGold
            : styles.chipActive
          : styles.chipIdle,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          small ? { fontSize: 12, paddingHorizontal: 0 } : null,
          { color: isActive ? (isGold ? theme.gold : theme.ink) : theme.muted },
          isActive ? { fontWeight: '600' } : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  busy,
  tone,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  busy?: boolean;
  tone?: 'gold' | 'ink' | 'danger';
}) {
  const background = tone === 'danger' ? theme.danger : tone === 'ink' ? theme.ink : theme.gold;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      style={[styles.button, { backgroundColor: background, opacity: disabled ? 0.4 : 1 }]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[typography.button, { color: '#FFFFFF' }]}>{label}</Text>
      )}
    </Pressable>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[typography.muted, { marginBottom: 8, letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 11 }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

export function Input(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={theme.muted}
      {...props}
      style={[
        styles.input,
        props.multiline ? { minHeight: 80, textAlignVertical: 'top' } : null,
        props.style,
      ]}
    />
  );
}

export function SeasonChips({
  selected,
  onToggle,
}: {
  selected: Season[];
  onToggle: (season: Season) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {SEASONS.map((season) => (
        <Chip
          key={season}
          label={season}
          active={selected.includes(season)}
          gold
          onPress={() => onToggle(season)}
        />
      ))}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={40} color={theme.beige} />
      <Text style={[typography.heading, { marginTop: 12 }]}>{title}</Text>
      <Text style={[typography.muted, { marginTop: 6, textAlign: 'center', lineHeight: 20 }]}>
        {subtitle}
      </Text>
    </View>
  );
}

export function ItemThumb({ uri, size = 72 }: { uri?: string | ImageSourcePropType; size?: number }) {
  const source = typeof uri === 'string' ? { uri } : uri;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: theme.cream,
      }}
    >
      {source ? (
        <Image source={source as ImageSourcePropType} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: theme.spacing,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipIdle: {
    backgroundColor: theme.background,
    borderColor: theme.border,
  },
  chipActive: {
    backgroundColor: theme.goldSoft,
    borderColor: theme.gold,
  },
  chipGold: {
    backgroundColor: theme.gold,
    borderColor: theme.gold,
  },
  chipText: {
    fontSize: 13,
  },
  button: {
    height: 52,
    borderRadius: theme.radius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: theme.ivory,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.ink,
  },
  card: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
});
