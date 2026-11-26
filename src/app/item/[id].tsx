import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Field, Input, PrimaryButton, SeasonChips } from '../../components/ui';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';
import { processImage } from '../../utils/images';
import { Season } from '../../types';

const COLOR_CHIPS = [
  'Ivory',
  'Cream',
  'Beige',
  'Camel',
  'White',
  'Black',
  'Grey',
  'Navy',
  'Blue',
  'Emerald',
  'Burgundy',
  'Blush',
  'Gold',
];

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, categories, updateItem, removeItem } = useCloset();
  const item = useMemo(() => items.find((entry) => entry.id === id), [items, id]);

  const [name, setName] = useState(item?.name ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(item?.categoryId ?? null);
  const [color, setColor] = useState(item?.color ?? '');
  const [seasons, setSeasons] = useState<Season[]>(item?.seasons ?? []);
  const [brand, setBrand] = useState(item?.brand ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const topLevel = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories],
  );
  const subsFor = (parentId: string) => categories.filter((category) => category.parentId === parentId);

  if (!item) {
    return (
      <View style={[styles.fill, styles.center]}>
        <Text style={typography.muted}>This piece is no longer in your wardrobe.</Text>
      </View>
    );
  }

  const replaceImage = async (fromCamera: boolean) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.9,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [3, 4],
          quality: 0.9,
        });
    if (!result.canceled && result.assets[0]) {
      const processed = await processImage(result.assets[0].uri);
      await updateItem(item.id, {
        uri: processed,
        originalUri: result.assets[0].uri,
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageArea}>
          {item.uri ? (
            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          ) : null}
          <Pressable
            style={styles.photoOverlay}
            onPress={() =>
              Alert.alert('Replace photo', 'Choose a source', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Take photo', onPress: () => void replaceImage(true) },
                { text: 'Photo library', onPress: () => void replaceImage(false) },
              ])
            }
          >
            <Ionicons name="camera-outline" size={18} color={theme.gold} />
            <Text style={styles.photoOverlayText}>Replace photo</Text>
          </Pressable>
          <Pressable
            style={styles.favoriteButton}
            onPress={() => void updateItem(item.id, { favorite: !item.favorite })}
          >
            <Ionicons
              name={item.favorite ? 'heart' : 'heart-outline'}
              size={20}
              color={item.favorite ? theme.gold : theme.muted}
            />
          </Pressable>
        </View>

        <View style={{ marginTop: theme.spacing }}>
          <Field label="Name">
            <Input value={name} onChangeText={setName} placeholder="Item name" />
          </Field>

          <Field label="Category">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {topLevel.map((category) => (
                <View key={category.id} style={{ gap: 8 }}>
                  <Chip
                    label={category.name}
                    active={categoryId === category.id}
                    onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
                  />
                  {subsFor(category.id).length > 0 &&
                  categoryId !== null &&
                  (categoryId === category.id ||
                    subsFor(category.id).some((sub) => sub.id === categoryId)) ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 10 }}>
                      {subsFor(category.id).map((sub) => (
                        <Chip
                          key={sub.id}
                          label={sub.name}
                          small
                          active={categoryId === sub.id}
                          onPress={() => setCategoryId(sub.id)}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </Field>

          <Field label="Colour">
            <Input value={color} onChangeText={setColor} placeholder="e.g. Ivory" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {COLOR_CHIPS.map((option) => (
                <Chip
                  key={option}
                  label={option}
                  active={color.toLowerCase() === option.toLowerCase()}
                  onPress={() => setColor(option)}
                />
              ))}
            </View>
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

          <Field label="Brand (optional)">
            <Input value={brand} onChangeText={setBrand} />
          </Field>

          <Field label="Notes (optional)">
            <Input value={notes} onChangeText={setNotes} multiline />
          </Field>

          <PrimaryButton
            label="Save changes"
            busy={saving}
            onPress={() => {
              void (async () => {
                setSaving(true);
                await updateItem(item.id, {
                  name: name.trim() || item.name,
                  categoryId,
                  color: color.trim(),
                  seasons,
                  brand: brand.trim() || undefined,
                  notes: notes.trim() || undefined,
                });
                setSaving(false);
                router.back();
              })();
            }}
          />

          <Pressable
            style={styles.deleteButton}
            onPress={() =>
              Alert.alert('Remove this piece?', 'It will also be removed from your outfits.', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove',
                  style: 'destructive',
                  onPress: () => {
                    void (async () => {
                      await removeItem(item.id);
                      router.back();
                    })();
                  },
                },
              ])
            }
          >
            <Text style={styles.deleteText}>Remove from wardrobe</Text>
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageArea: {
    borderRadius: theme.radius,
    overflow: 'hidden',
    backgroundColor: theme.cream,
    aspectRatio: 3 / 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.goldSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  photoOverlayText: {
    color: theme.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
