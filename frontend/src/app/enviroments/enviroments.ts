// Dynamic environment configuration
// Loaded from config.json at runtime or from window object

declare global {
  interface Window {
    appConfig?: {
      apiUrl?: string;
      production?: boolean;
      [key: string]: any;
    };
  }
}

const getConfig = () => {
  // Check if config is available in window object (set by config.js)
  if (typeof window !== 'undefined' && window.appConfig) {
    return window.appConfig;
  }

  // Fallback to default values
  return {
    production: false,
    apiUrl: 'http://localhost:3000'
  };
};

export const environment = getConfig();
