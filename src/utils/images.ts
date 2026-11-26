import { Directory, File, Paths } from 'expo-file-system';

export async function persistImage(uri: string): Promise<string> {
  try {
    const dir = new Directory(Paths.document, 'closet-images');
    if (!dir.exists) dir.create();
    const source = new File(uri);
    const name = `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}${source.extension || '.jpg'}`;
    const destination = new File(dir, name);
    await source.copy(destination);
    return destination.uri;
  } catch {
    return uri;
  }
}
