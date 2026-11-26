# MyCloset

An e-closet app for iOS and Android built with [Expo](https://expo.dev) (React Native + Expo Router, TypeScript).

Photograph your clothes, organize them by category, and combine them into outfits — your whole wardrobe in your pocket.

## Features

- **Closet** — photo grid of every item; filter by category (Tops, Bottoms, Dresses, Outerwear, Shoes, Accessories)
- **Add items** — take a photo with the camera or pick one from the photo library; name it, tag the category and color
- **Favorites** — heart the pieces you love
- **Outfits** — combine closet items into named outfits with an optional occasion, and see which outfits use each item
- **Offline-first** — items and outfits persist on-device (AsyncStorage); photos are copied into the app's documents folder so they survive restarts

## Run locally

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator or `a` for the Android emulator, or scan the QR code with the Expo Go app on a physical device.

> `expo-image-picker` and `expo-file-system` are bundled with Expo Go, so you can try everything without a custom build.

## Build for iOS and Android

Install [EAS CLI](https://docs.expo.dev/build/introduction.md) (requires a free Expo account):

```bash
npx eas-cli@latest build --profile development --platform all   # dev builds
npx eas-cli@latest build --profile production --platform all    # store builds
```

## Project layout

```
src/
  app/            # Expo Router screens
    (tabs)/       # Closet + Outfits tab screens
    add-item.tsx  # Add item modal (camera / photo library)
    create-outfit.tsx
    item/[id].tsx
    outfit/[id].tsx
  context/        # Closet data layer + AsyncStorage persistence
  theme/          # Shared colors and typography
  utils/          # id generation, image persistence
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run ios` / `npm run android` | Start on a platform |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | Expo lint |
