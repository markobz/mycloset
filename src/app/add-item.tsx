import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCloset } from '../context/ClosetContext';
import { CATEGORIES, Category } from '../types';
import { persistImage } from '../utils/images';
import { theme, typography } from '../theme';

export default function AddItemScreen() {
  const { addItem } = useCloset();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Allow access to your photos to add clothing items.',
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Allow camera access to photograph your clothing.',
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const save = async () => {
    if (!imageUri) {
      Alert.alert('Add a photo', 'Take or choose a photo of the item first.');
      return;
    }
    if (!category) {
      Alert.alert('Pick a category', 'Choose what kind of item this is.');
      return;
    }
    setSaving(true);
    try {
      const storedUri = await persistImage(imageUri);
      await addItem({ name, category, color: color.trim(), uri: storedUri });
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.photoRow}>
          <Pressable style={styles.photoActions} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={22} color={theme.text} />
            <Text style={styles.photoActionText}>Take photo</Text>
          </Pressable>
          <Pressable style={styles.photoActions} onPress={pickFromLibrary}>
            <Ionicons name="images-outline" size={22} color={theme.text} />
            <Text style={styles.photoActionText}>Choose photo</Text>
          </Pressable>
        </View>

        <View style={styles.previewWrap}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={[styles.preview, styles.previewPlaceholder]}>
              <Ionicons name="shirt-outline" size={40} color={theme.border} />
            </View>
          )}
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Blue denim jacket"
          placeholderTextColor={theme.muted}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categories}>
          {CATEGORIES.map((option) => (
            <Pressable
              key={option}
              onPress={() => setCategory(option)}
              style={[styles.chip, category === option && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  category === option && styles.chipTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Color (optional)</Text>
        <TextInput
          style={styles.input}
          value={color}
          onChangeText={setColor}
          placeholder="e.g. Light blue"
          placeholderTextColor={theme.muted}
        />

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={save}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : 'Add to closet'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: theme.spacing,
    paddingBottom: 40,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoActions: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    paddingVertical: 12,
  },
  photoActionText: {
    ...typography.body,
    fontWeight: '500',
  },
  previewWrap: {
    marginTop: 14,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.radius,
    backgroundColor: theme.chip,
  },
  previewPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.border,
  },
  label: {
    ...typography.subtitle,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 8,
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
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.chip,
  },
  chipActive: {
    backgroundColor: theme.primary,
  },
  chipText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.onPrimary,
  },
  saveButton: {
    marginTop: 24,
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
