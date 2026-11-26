import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Input, PrimaryButton } from '../components/ui';
import { theme, typography } from '../theme';
import { useCloset } from '../store/ClosetStore';

export default function WelcomeScreen() {
  const { name, ready, setName } = useCloset();
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [greeted, setGreeted] = useState(false);

  if (!ready) return <View style={styles.fill} />;

  const displayName = name || draft.trim();

  if (greeted && displayName) {
    return (
      <View style={styles.center}>
        <Text style={styles.logo}>mycloset</Text>
        <Text style={[typography.title, { textAlign: 'center', marginTop: 32 }]}>
          Welcome to your closet, {displayName}.
        </Text>
        <Text style={[typography.muted, { textAlign: 'center', marginTop: 12, lineHeight: 21, maxWidth: 300 }]}>
          A little space for your style, your favourite pieces and endless outfit possibilities.
        </Text>
        <View style={{ marginTop: 40, width: '100%' }}>
          <PrimaryButton label="Explore mycloset" onPress={() => router.replace('/(tabs)')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.center, styles.fill]}
    >
      <Text style={styles.logo}>mycloset</Text>
      <Text style={[typography.title, { textAlign: 'center', marginTop: 32 }]}>
        Welcome to mycloset.{'\n'}What should we call you?
      </Text>
      <View style={{ marginTop: 32, width: '100%' }}>
        <Input
          value={draft}
          onChangeText={setDraft}
          placeholder="Your first name"
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => {
            if (!draft.trim()) return;
            setName(draft.trim());
            setGreeted(true);
          }}
        />
      </View>
      <View style={{ marginTop: 16, width: '100%' }}>
        <PrimaryButton
          label="Continue"
          disabled={!draft.trim()}
          onPress={() => {
            setName(draft.trim());
            setGreeted(true);
          }}
        />
      </View>
      <Text style={[typography.muted, { textAlign: 'center', marginTop: 24, lineHeight: 19 }]}>
        No account. No email. Your closet stays on your device.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: theme.background,
  },
  center: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  logo: {
    fontFamily: theme.serif,
    fontSize: 20,
    letterSpacing: 3,
    color: theme.gold,
    textTransform: 'uppercase',
  },
});
