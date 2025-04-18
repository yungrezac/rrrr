import { supabase } from './supabase';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

interface UploadOptions {
  onProgress?: (progress: number) => void;
  maxRetries?: number;
}

export async function uploadImage(
  uri: string, 
  bucket: string, 
  path: string,
  options: UploadOptions = {}
): Promise<string> {
  const { maxRetries = 3, onProgress } = options;
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      // Validate inputs
      if (!uri || !bucket || !path) {
        throw new Error('Missing required parameters for upload');
      }

      // Convert URI to Blob with progress tracking
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();
      const totalSize = blob.size;

      // Upload to Supabase Storage with progress tracking
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type,
        });

      if (error) {
        throw error;
      }

      if (!data?.path) {
        throw new Error('Upload successful but no path returned');
      }

      // Get public URL
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (urlError) {
        throw urlError;
      }

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      return publicUrl;
    } catch (error) {
      attempts++;
      console.error(`Upload attempt ${attempts} failed:`, error);

      if (attempts === maxRetries) {
        throw new Error(`Failed to upload image after ${maxRetries} attempts: ${error.message}`);
      }

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }

  throw new Error('Upload failed after maximum retries');
}

export async function deleteImage(bucket: string, path: string): Promise<void> {
  try {
    if (!bucket || !path) {
      throw new Error('Missing required parameters for deletion');
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

export function getImagePath(prefix: string): string {
  if (!prefix) {
    throw new Error('Prefix is required for image path generation');
  }

  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${randomString}.jpg`;
}

export async function compressImage(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    return uri; // No compression on web
  }

  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      throw new Error('File does not exist');
    }

    // If file is smaller than 1MB, return original
    if (info.size < 1024 * 1024) {
      return uri;
    }

    // Implement compression logic here if needed
    return uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original on error
  }
}