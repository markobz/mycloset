import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { Card, Input, PageHeader, PrimaryButton, Screen } from '../../components/ui';
import { PreferencesEditor } from '../../components/PreferencesEditor';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';

interface BackupFile {
  app?: string;
  name?: string;
  categories?: unknown;
  items?: unknown;
  outfits?: unknown;
  preferences?: unknown;
}

export default function SettingsScreen() {
  const store = useCloset();
  const { name, setName, importData } = store;
  const [nameModal, setNameModal] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const exportBackup = async () => {
    setBusy(true);
    try {
      const payload = {
        app: 'mycloset',
        version: 2,
        exportedAt: new Date().toISOString(),
        name: store.name,
        categories: store.categories,
        items: store.items,
        outfits: store.outfits,
        preferences: store.preferences,
      };
      const file = new File(Paths.cache, `mycloset-backup-${new Date().toISOString().slice(0, 10)}.json`);
      await file.write(JSON.stringify(payload, null, 2));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: 'Save your mycloset backup',
        });
      } else {
        Alert.alert('Sharing unavailable', 'Sharing is not available on this device.');
      }
    } catch {
      Alert.alert('Backup failed', 'Something went wrong while creating your backup file.');
    } finally {
      setBusy(false);
    }
  };

  const importBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      const file = new File(asset.uri);
      const raw = await file.text();
      const parsed = JSON.parse(raw) as BackupFile;
      if (!parsed || !Array.isArray(parsed.items) || parsed.app !== 'mycloset') {
        Alert.alert('Not a mycloset backup', 'Please choose a backup file exported from mycloset.');
        return;
      }
      Alert.alert('Restore backup', 'This will replace your current closet with the backup. Continue?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await importData({
                name: typeof parsed.name === 'string' ? parsed.name : undefined,
                categories: parsed.categories as never,
                items: parsed.items as never,
                outfits: parsed.outfits as never,
                preferences: parsed.preferences as never,
              });
              Alert.alert('Restored', 'Your closet has been restored from the backup.');
            })();
          },
        },
      ]);
    } catch {
      Alert.alert('Import failed', 'That file could not be read as a mycloset backup.');
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <PageHeader title="Settings" subtitle="A few quiet controls. Everything stays on your device." />

        <Card style={{ marginBottom: 16 }}>
          <Pressable
            style={styles.row}
            onPress={() => {
              setNameDraft(name);
              setNameModal(true);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={typography.heading}>Your name</Text>
              <Text style={[typography.muted, { marginTop: 2 }]}>{name || 'Not set'}</Text>
            </View>
            <Ionicons name="pencil-outline" size={18} color={theme.gold} />
          </Pressable>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={[typography.heading, { marginBottom: 14 }]}>Styling preferences</Text>
          <PreferencesEditor />
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={[typography.heading, { marginBottom: 4 }]}>Backup</Text>
          <Text style={[typography.muted, { marginBottom: 14, lineHeight: 19 }]}>
            Save a copy of your whole closet — pieces, outfits, categories and settings — as a file
            you can keep anywhere, and restore it on any device.
          </Text>
          <View style={{ gap: 10 }}>
            <PrimaryButton label="Export backup file" busy={busy} onPress={() => void exportBackup()} />
            <PrimaryButton label="Restore from backup" tone="ink" onPress={() => void importBackup()} />
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={[typography.heading, { marginBottom: 8 }]}>About mycloset</Text>
          <Text style={[typography.body, { lineHeight: 22 }]}>
            Your wardrobe. Your style. Your seasons.
          </Text>
          <Text style={[typography.muted, { marginTop: 8, lineHeight: 20 }]}>
            Completely free. No accounts, no ads, no subscriptions. Your photos and outfits never
            leave your device — the stylist works entirely offline, on your phone.
          </Text>
          <Text style={[typography.muted, { marginTop: 12 }]}>Version {version}</Text>
        </Card>
      </ScrollView>

      <Modal visible={nameModal} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={typography.heading}>Change your name</Text>
            <View style={{ marginTop: 14 }}>
              <Input value={nameDraft} onChangeText={setNameDraft} placeholder="Your first name" autoFocus />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Cancel"
                  tone="ink"
                  onPress={() => setNameModal(false)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  label="Save"
                  disabled={!nameDraft.trim()}
                  onPress={() => {
                    void (async () => {
                      await setName(nameDraft.trim());
                      setNameModal(false);
                    })();
                  }}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43, 39, 36, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.background,
    borderRadius: theme.radius,
    padding: 20,
  },
});
