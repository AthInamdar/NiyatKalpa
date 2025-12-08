import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'NiyatKalpa',
  slug: 'niyatkalpa',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
      }
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA'
    ]
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    'expo-location',
    'expo-camera',
    [
      'expo-image-picker',
      {
        photosPermission: 'The app accesses your photos to let you upload medicine labels.',
        cameraPermission: 'The app accesses your camera to let you take photos of medicine labels.'
      }
    ]
  ],
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    useOnDeviceOcr: process.env.EXPO_PUBLIC_USE_ON_DEVICE_OCR === 'true',
    vedWebhookUrl: process.env.EXPO_PUBLIC_VEDAI_WEBHOOK_URL,
    chatbotUrl: process.env.EXPO_PUBLIC_CHATBOT_URL || process.env.EXPO_PUBLIC_VEDAI_WEBHOOK_URL,
  }
});
