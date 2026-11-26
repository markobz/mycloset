import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chip, Field, Input, PrimaryButton, SeasonChips } from '../components/ui';
import { theme, typography } from '../theme';
import { useCloset } from '../store/ClosetStore';
import { processImage } from '../utils/images';
import { Season } from '../types';

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

export default function AddItemScreen() {
  const { categories, addItem } = useCloset();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalUri, setOriginalUri] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [color, setColor] = useState('');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [brand, setBrand] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const topLevel = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories],
  );
  const subsFor = (id: string) => categories.filter((category) => category.parentId === id);

  const pick = async (fromCamera: boolean) => {
    const permission =
      fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        fromCamera
          ? 'Please allow mycloset to use your camera to photograph your pieces.'
          : 'Please allow mycloset to see your photo library to import pictures.',
      );
      return;
    }
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
    if (result.canceled || result.assets.length === 0) return;
    const picked = result.assets[0].uri;
    setOriginalUri(picked);
    setProcessing(true);
    try {
      const processed = await processImage(picked);
      setImageUri(processed);
    } catch {
      setImageUri(picked);
    } finally {
      setProcessing(false);
    }
  };

  const save = async () => {
    if (!imageUri) return;
    setSaving(true);
    try {
      await addItem({
        name,
        categoryId,
        color: color.trim(),
        seasons,
        brand: brand.trim() || undefined,
        notes: notes.trim() || undefined,
        uri: imageUri,
        originalUri: originalUri ?? undefined,
      });
      router.back();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.fill}
    >
      <ScrollView
        contentContainerStyle={{ padding: theme.spacing, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.imageArea}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="camera-outline" size={34} color={theme.beige} />
              <Text style={[typography.muted, { marginTop: 10 }]}>
                Photograph your piece on a plain background
              </Text>
            </View>
          )}
          {processing ? (
            <View style={styles.processingOverlay}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.processingText}>Preparing your photo…</Text>
            </View>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable style={styles.photoButton} onPress={() => void pick(true)}>
              <Ionicons name="camera-outline" size={18} color={theme.gold} />
              <Text style={styles.photoButtonText}>Take photo</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }}>
            <Pressable style={styles.photoButton} onPress={() => void pick(false)}>
              <Ionicons name="image-outline" size={18} color={theme.gold} />
              <Text style={styles.photoButtonText}>Library</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: theme.spacing }}>
          <Field label="Name">
            <Input value={name} onChangeText={setName} placeholder="e.g. Silk white blouse" />
          </Field>

          <Field label="Category">
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {topLevel.map((category) => (
                <View key={category.id} style={{ gap: 8 }}>
                  <Chip
                    label={category.name}
                    active={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
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
            <Input value={color} onChangeText={setColor} placeholder="e.g. Ivory, navy, blush…" />
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
            <Input value={brand} onChangeText={setBrand} placeholder="e.g. Zara, COS, vintage" />
          </Field>

          <Field label="Notes (optional)">
            <Input value={notes} onChangeText={setNotes} multiline placeholder="Fit, fabric, memories…" />
          </Field>

          <PrimaryButton
            label="Save to my wardrobe"
            disabled={!imageUri}
            busy={saving}
            onPress={() => void save()}
          />
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
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(43, 39, 36, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.gold,
    backgroundColor: theme.goldSoft,
  },
  photoButtonText: {
    color: theme.gold,
    fontSize: 14,
    fontWeight: '600',
  },
});
