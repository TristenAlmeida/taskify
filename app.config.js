import "dotenv/config"

export default {

  "expo": {
    "name": "app",
    "slug": "app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "DOWNLOAD_WITHOUT_NOTIFICATION",
        "ACCESS_NETWORK_STATE",
        "MEDIA_LIBRARY",
        "INTERNET"
      ],
      "requestLegacyExternalStorage": true,
      "package": "com.tristen23.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-router",
      "@config-plugins/react-native-blob-util",
      "@config-plugins/react-native-pdf",
      "expo-document-picker"
    ],
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": process.env.EAS_PROJECT_ID,
      },
      "API_KEY": process.env.API_KEY,
      "AUTH_DOMAIN": process.env.AUTH_DOMAIN,
      "PROJECT_ID": process.env.PROJECT_ID,
      "STORAGE_BUCKET": process.env.STORAGE_BUCKET,
      "MESSAGING_SENDER_ID": process.env.MESSAGING_SENDER_ID,
      "APP_ID": process.env.APP_ID
    }
  }
}