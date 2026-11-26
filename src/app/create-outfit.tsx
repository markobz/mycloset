import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Field, Input, PrimaryButton, SeasonChips } from '../components/ui';
import { theme, typography } from '../theme';
import { useCloset } from '../store/ClosetStore';
import { Season } from '../types';

export default function CreateOutfitScreen() {
  const params = useLocalSearchParams<{ fromDraft?: string }>();
  const { items, categories, addOutfit } = useCloset();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string[]>(() =>
    params.fromDraft ? params.fromDraft.split(',').filter(Boolean) : [],
  );
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [occasion, setOccasion] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const topLevel = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories],
  );
  const itemsByCategory = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const item of items) {
      const key = item.categoryId ?? 'none';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return map;
  }, [items]);

  const toggle = (id: string) =>
    setSelected((previous) =>
      previous.includes(id) ? previous.filter((entry) => entry !== id) : [...previous, id],
    );

  const save = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await addOutfit({
        name,
        itemIds: selected,
        seasons,
        occasion: occasion ?? undefined,
        notes: notes.trim() || undefined,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <FlatList
        data={topLevel.filter((category) => (itemsByCategory.get(category.id) ?? []).length > 0)}
        keyExtractor={(category) => category.id}
        contentContainerStyle={{ padding: theme.spacing, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Field label="Outfit name">
              <Input value={name} onChangeText={setName} placeholder="e.g. Saturday brunch" />
            </Field>
            <Field label="Seasons">
              <SeasonChips
                selected={seasons}
                onToggle={(value) =>
                  setSeasons((previous) =>
                    previous.includes(value)
                      ? previous.filter((entry) => entry !== value)
                      : [...previous, value],
                  )
                }
              />
            </Field>
            <Field label="Occasion (optional)">
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Chip label="Everyday" active={occasion === 'Everyday'} onPress={() => setOccasion(occasion === 'Everyday' ? null : 'Everyday')} />
                <Chip label="Special" active={occasion === 'Special'} onPress={() => setOccasion(occasion === 'Special' ? null : 'Special')} />
              </View>
            </Field>
            <Text style={[typography.muted, { marginBottom: 12 }]}>
              Tap the pieces that belong to this outfit.
            </Text>
          </View>
        }
        ListFooterComponent={
          <View>
            {items.length === 0 ? (
              <Text style={[typography.muted, { textAlign: 'center', paddingVertical: 24 }]}>
                Add pieces to your wardrobe first.
              </Text>
            ) : null}
            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                label={selected.length > 0 ? `Save outfit (${selected.length} pieces)` : 'Select pieces first'}
                disabled={selected.length === 0}
                busy={saving}
                onPress={() => void save()}
              />
            </View>
            <Field label="Notes (optional)">
              <Input value={notes} onChangeText={setNotes} multiline placeholder="Where to wear it, styling ideas…" />
            </Field>
          </View>
        }
        renderItem={({ item: category }) => {
          const groupItems = itemsByCategory.get(category.id) ?? [];
          return (
            <View style={{ marginBottom: 18 }}>
              <Text style={[typography.muted, { marginBottom: 8, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.6 }]}>
                {category.name}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {groupItems.map((item) => {
                  const isSelected = selected.includes(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      style={[styles.pickTile, isSelected && styles.pickTileSelected]}
                      onPress={() => toggle(item.id)}
                    >
                      {item.uri ? (
                        <Image source={{ uri: item.uri }} style={styles.pickImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.pickImage, styles.pickPlaceholder]}>
                          <Ionicons name="image-outline" size={20} color={theme.beige} />
                        </View>
                      )}
                      {isSelected ? (
                        <View style={styles.pickCheck}>
                          <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                        </View>
                      ) : null}
                      <Text style={styles.pickName} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: theme.background,
  },
  pickTile: {
    width: 96,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.card,
    position: 'relative',
  },
  pickTileSelected: {
    borderColor: theme.gold,
  },
  pickImage: {
    width: '100%',
    height: 110,
    backgroundColor: theme.cream,
  },
  pickPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickName: {
    fontSize: 12,
    color: theme.ink,
    padding: 6,
  },
});
