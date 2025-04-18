import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Implement a web-compatible storage adapter with better error handling
const webStorageAdapter = {
  getItem: (key: string) => {
    try {
      return Promise.resolve(localStorage.getItem(key));
    } catch (e) {
      console.error('Error getting item from localStorage:', e);
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      return Promise.resolve(undefined);
    } catch (e) {
      console.error('Error setting item in localStorage:', e);
      return Promise.resolve(undefined);
    }
  },
  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return Promise.resolve(undefined);
    } catch (e) {
      console.error('Error removing item from localStorage:', e);
      return Promise.resolve(undefined);
    }
  },
};

// Use platform-specific storage adapter with better error handling
const storageAdapter = Platform.OS === 'web' ? webStorageAdapter : {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (e) {
      console.error('Error getting item from SecureStore:', e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
      return undefined;
    } catch (e) {
      console.error('Error setting item in SecureStore:', e);
      return undefined;
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
      return undefined;
    } catch (e) {
      console.error('Error removing item from SecureStore:', e);
      return undefined;
    }
  },
};

// Validate environment variables with fallbacks for build process
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using fallback empty strings for build process.');
}

// Create Supabase client with enhanced error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-router',
    },
  },
});

// Enhanced fetch error handling
const originalFetch = global.fetch;
global.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    if (!response.ok) {
      console.error('Fetch error:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }
    
    return response;
  } catch (error) {
    console.error('Network error:', error);
    throw error;
  }
};

// Add global unhandled rejection handler for web
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the error from being swallowed
    event.preventDefault();
  });
}

// Add Node.js unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize Supabase with proper error handling
const initializeSupabase = async () => {
  try {
    // Test the connection with proper error handling
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // This is an expected error when no data is found
        console.log('Supabase connection test successful (no data)');
      } else {
        console.warn('Supabase connection test warning:', error);
      }
    } else {
      console.log('Supabase connection test successful');
    }
  } catch (error) {
    // Log error but don't throw to prevent build failures
    console.error('Supabase initialization error:', error);
  }
};

// Initialize Supabase with proper promise handling
initializeSupabase().catch(error => {
  console.error('Failed to initialize Supabase:', error);
});

// Export a wrapped version of removeChannel that includes error handling
export const safeRemoveChannel = async (channel: any) => {
  try {
    if (channel) {
      await supabase.removeChannel(channel);
    }
  } catch (error) {
    console.error('Error removing Supabase channel:', error);
  }
};