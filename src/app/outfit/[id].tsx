import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCloset } from '../../context/ClosetContext';
import { theme, typography } from '../../theme';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { outfits, items, removeOutfit } = useCloset();

  const outfit = outfits.find((candidate) => candidate.id === id);

  if (!outfit) {
    return <View style={styles.container} />;
  }

  const outfitItems = outfit.itemIds
    .map((itemId) => items.find((item) => item.id === itemId))
    .filter(Boolean);

  const confirmDelete = () => {
    Alert.alert('Delete outfit', `Remove "${outfit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void removeOutfit(outfit.id).then(() => {
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
    <View style={styles.container}>
      <FlatList
        data={outfitItems}
        keyExtractor={(item) => item!.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.name}>{outfit.name}</Text>
            <Text style={styles.meta}>
              {outfit.occasion
                ? `${outfit.occasion} · ${outfitItems.length} items`
                : `${outfitItems.length} items`}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            The items in this outfit are no longer in your closet.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item!.uri }} style={styles.image} />
            <Text style={styles.cardName} numberOfLines={1}>
              {item!.name}
            </Text>
          </View>
        )}
      />
      <Pressable style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Delete outfit</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: theme.spacing,
    paddingTop: 8,
    paddingBottom: 12,
  },
  name: {
    ...typography.title,
    fontSize: 24,
  },
  meta: {
    ...typography.subtitle,
    marginTop: 4,
  },
  grid: {
    paddingHorizontal: theme.spacing,
    paddingBottom: 24,
  },
  row: {
    gap: 10,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 10,
    backgroundColor: theme.chip,
  },
  cardName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  empty: {
    ...typography.body,
    color: theme.muted,
    paddingVertical: 24,
  },
  deleteButton: {
    margin: theme.spacing,
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
