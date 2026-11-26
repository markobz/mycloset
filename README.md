# mycloset

Your wardrobe. Your style. Your seasons.

A completely free digital e-closet for iOS and Android, built with [Expo](https://expo.dev) (React Native + Expo Router, TypeScript). No accounts, no ads, no subscriptions — everything stays on your device.

## Features

- **Wardrobe** — a photo grid of every piece, with search, season filters, favourites and fully customisable categories (create, rename, delete, reorder, optional subcategories)
- **Adding pieces** — photograph an item with the camera or import from your photo library; photos are automatically resized and optimised for a clean, studio-like look; each item stores name, custom category, colour, seasons, brand and notes
- **Style** — an on-device personal stylist. Tap **Create outfits for me** and it combines only the pieces you already own into complete looks (with shoes, bags, jewellery and outerwear), scoring colour harmony, season fit and your saved preferences. Tap any piece in a suggestion to swap it for something similar
- **Preferences** — favourite colours, styles and seasons, casual vs elegant, everyday vs special occasion
- **My Outfits** — a gallery of saved looks with season filters, favourites, notes, "mark as worn" history, and a manual outfit builder
- **Settings** — change your name, edit preferences, export/restore a full JSON backup of your closet, and about
- **Private & offline** — all data lives on-device (AsyncStorage + app documents folder); the stylist runs entirely offline with no network calls or API keys
- **First launch** — a quiet welcome asks your name, then greets you by name

## Run locally

```bash
npm install
npx expo start
```

Then press `i` for the iOS simulator or `a` for the Android emulator, or scan the QR code with the Expo Go app on a physical device.

## Build for iOS and Android

Install [EAS CLI](https://docs.expo.dev/build/introduction.md) (requires a free Expo account):

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

## Notes

- OTA updates are published via `eas update` (Expo Updates); the app checks for new versions on launch
- The AI stylist is a rule-based engine in pure TypeScript (colour harmony, season logic, role detection from your categories) — genuinely free, offline and private
- Background removal uses Expo's image pipeline (crop + optimise); true transparent cutouts would require a custom native build with Apple's Vision framework
