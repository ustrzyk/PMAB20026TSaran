import {Platform} from 'react-native';

const getBaseUrl = (): string => {
  if (__DEV__) {
    // Android emulator używa 10.0.2.2 zamiast localhost
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5000/api';
    }

    // iOS simulator / komputer lokalny
    if (Platform.OS === 'ios') {
      return 'http://localhost:5000/api';
    }

    // Inne środowiska developerskie
    return 'http://localhost:5000/api';
  }

  // Produkcyjne API - na razie placeholder
  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseUrl();

console.log('API_BASE_URL:', API_BASE_URL);