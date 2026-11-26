import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
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

export async function processImage(uri: string): Promise<string> {
  try {
    const context = ImageManipulator.manipulate(uri).resize({ width: 1080 });
    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.85 });
    return result.uri;
  } catch {
    return uri;
  }
}
