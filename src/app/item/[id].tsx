import { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCloset } from '../../context/ClosetContext';
import { theme, typography } from '../../theme';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, outfits, removeItem, toggleFavorite } = useCloset();

  const item = items.find((candidate) => candidate.id === id);
  const usedIn = useMemo(
    () => outfits.filter((outfit) => outfit.itemIds.includes(id)),
    [outfits, id],
  );

  if (!item) {
    return <View style={styles.container} />;
  }

  const confirmDelete = () => {
    Alert.alert('Delete item', `Remove "${item.name}" from your closet?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void removeItem(item.id).then(() => {
            if (router.canDismiss()) {
              router.dismiss();
            } else {
              router.back();
            }
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: item.uri }} style={styles.image} />
      <View style={styles.titleRow}>
        <View style={styles.titleText}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.meta}>
            {item.category}
            {item.color ? ` · ${item.color}` : ''}
          </Text>
        </View>
        <Pressable hitSlop={8} onPress={() => void toggleFavorite(item.id)}>
          <Ionicons
            name={item.favorite ? 'heart' : 'heart-outline'}
            size={26}
            color={item.favorite ? '#E0574F' : theme.muted}
          />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>Worn in outfits</Text>
      {usedIn.length === 0 ? (
        <Text style={styles.sectionEmpty}>
          Not part of any outfit yet. Create one from the Outfits tab.
        </Text>
      ) : (
        <FlatList
          horizontal
          data={usedIn}
          keyExtractor={(outfit) => outfit.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: outfit }) => (
            <Pressable
              style={styles.outfitCard}
              onPress={() => router.push(`/outfit/${outfit.id}`)}
            >
              <Text style={styles.outfitName}>{outfit.name}</Text>
            </Pressable>
          )}
        />
      )}

      <Pressable style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Delete item</Text>
      </Pressable>
    </ScrollView>
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
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: theme.radius,
    backgroundColor: theme.chip,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  titleText: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    ...typography.title,
    fontSize: 22,
  },
  meta: {
    ...typography.subtitle,
    marginTop: 4,
  },
  sectionLabel: {
    ...typography.subtitle,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 24,
    marginBottom: 10,
  },
  sectionEmpty: {
    ...typography.body,
    color: theme.muted,
  },
  outfitCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  outfitName: {
    ...typography.body,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 28,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.danger,
  },
  deleteText: {
    ...typography.button,
    color: theme.danger,
  },
});
