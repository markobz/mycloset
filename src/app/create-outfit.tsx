import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCloset } from '../context/ClosetContext';
import { theme, typography } from '../theme';

export default function CreateOutfitScreen() {
  const { items, addOutfit } = useCloset();
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const canSave = useMemo(() => selected.size > 0, [selected]);

  const save = async () => {
    if (!canSave) {
      Alert.alert('Pick items', 'Select at least one piece for this outfit.');
      return;
    }
    setSaving(true);
    try {
      await addOutfit({
        name,
        occasion: occasion.trim(),
        itemIds: items
          .filter((item) => selected.has(item.id))
          .map((item) => item.id),
      });
      router.back();
    } catch {
      Alert.alert('Could not save', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Outfit name (e.g. Friday dinner)"
          placeholderTextColor={theme.muted}
        />
        <TextInput
          style={styles.input}
          value={occasion}
          onChangeText={setOccasion}
          placeholder="Occasion (optional)"
          placeholderTextColor={theme.muted}
        />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Add items to your closet first, then come back to build outfits.
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          numColumns={3}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                style={styles.cell}
                onPress={() => toggle(item.id)}
              >
                <Image source={{ uri: item.uri }} style={styles.image} />
                {isSelected && (
                  <View style={styles.check}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={[styles.saveButton, (!canSave || saving) && styles.saveButtonDisabled]}
        onPress={save}
        disabled={!canSave || saving}
      >
        <Text style={styles.saveButtonText}>
          {saving
            ? 'Saving…'
            : canSave
              ? `Save outfit (${selected.size} item${selected.size === 1 ? '' : 's'})`
              : 'Select items to save'}
        </Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  form: {
    paddingHorizontal: theme.spacing,
    paddingTop: theme.spacing,
    gap: 10,
  },
  input: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
    color: theme.text,
  },
  grid: {
    paddingHorizontal: theme.spacing,
    paddingBottom: 24,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  cell: {
    flex: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: theme.chip,
  },
  check: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(28, 27, 26, 0.55)',
  },
  checkText: {
    color: theme.onPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
    color: theme.muted,
  },
  saveButton: {
    margin: theme.spacing,
    backgroundColor: theme.primary,
    borderRadius: 28,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...typography.button,
    color: theme.onPrimary,
  },
});
