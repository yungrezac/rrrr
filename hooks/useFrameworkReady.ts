import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.frameworkReady?.();
      }
    } catch (error) {
      console.error('Framework ready error:', error);
    }
  }, []);
}