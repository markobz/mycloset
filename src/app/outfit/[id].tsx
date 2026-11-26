import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Field, Input, ItemThumb, PrimaryButton, SeasonChips } from '../../components/ui';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';
import { Season } from '../../types';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { outfits, items, updateOutfit, removeOutfit, markOutfitWorn } = useCloset();
  const outfit = useMemo(() => outfits.find((entry) => entry.id === id), [outfits, id]);

  const [name, setName] = useState(outfit?.name ?? '');
  const [seasons, setSeasons] = useState<Season[]>(outfit?.seasons ?? []);
  const [occasion, setOccasion] = useState<string | null>(outfit?.occasion ?? null);
  const [notes, setNotes] = useState(outfit?.notes ?? '');

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  if (!outfit) {
    return (
      <View style={[styles.fill, styles.center]}>
        <Text style={typography.muted}>This outfit is no longer saved.</Text>
      </View>
    );
  }

  const wornDates = outfit.wornDates ?? [];
  const lastWorn = wornDates.length
    ? new Date(Math.max(...wornDates)).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })
    : null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={[typography.heading, { flex: 1 }]}>{outfit.name}</Text>
          <Pressable
            hitSlop={10}
            onPress={() => void updateOutfit(outfit.id, { favorite: !outfit.favorite })}
          >
            <Ionicons
              name={outfit.favorite ? 'heart' : 'heart-outline'}
              size={24}
              color={outfit.favorite ? theme.gold : theme.muted}
            />
          </Pressable>
        </View>
        {outfit.explanation ? (
          <Text style={[typography.muted, { marginTop: 4, lineHeight: 19 }]}>{outfit.explanation}</Text>
        ) : null}
        <Text style={[typography.muted, { marginTop: 6 }]}>
          {wornDates.length > 0
            ? `Worn ${wornDates.length} ${wornDates.length === 1 ? 'time' : 'times'}${lastWorn ? ` · last on ${lastWorn}` : ''}`
            : 'Not worn yet'}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          {outfit.itemIds.map((itemId) => {
            const item = itemById.get(itemId);
            return (
              <Pressable key={itemId} onPress={() => item && router.push(`/item/${item.id}`)}>
                <ItemThumb uri={item?.uri} size={92} />
                <Text style={styles.itemName} numberOfLines={1}>
                  {item?.name ?? 'Removed piece'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: theme.spacing }}>
          <Field label="Name">
            <Input value={name} onChangeText={setName} />
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

          <Field label="Occasion">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="Everyday" active={occasion === 'Everyday'} onPress={() => setOccasion(occasion === 'Everyday' ? null : 'Everyday')} />
              <Chip label="Special" active={occasion === 'Special'} onPress={() => setOccasion(occasion === 'Special' ? null : 'Special')} />
            </View>
          </Field>

          <Field label="Notes">
            <Input value={notes} onChangeText={setNotes} multiline placeholder="Styling ideas, memories…" />
          </Field>

          <PrimaryButton
            label="Mark as worn today"
            tone="ink"
            onPress={() => void markOutfitWorn(outfit.id)}
          />

          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              label="Save changes"
              onPress={() => {
                void (async () => {
                  await updateOutfit(outfit.id, {
                    name: name.trim() || outfit.name,
                    seasons,
                    occasion: occasion ?? undefined,
                    notes: notes.trim() || undefined,
                  });
                  router.back();
                })();
              }}
            />
          </View>

          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert('Delete this outfit?', 'Your clothing pieces will not be touched.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      await removeOutfit(outfit.id);
                      router.back();
                    })();
                  },
                },
              ])
            }
          >
            <Text style={styles.deleteText}>Delete outfit</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 11,
    color: theme.muted,
    marginTop: 4,
    textAlign: 'center',
    width: 92,
  },
  deleteButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  deleteText: {
    color: theme.danger,
    fontSize: 14,
  },
});
