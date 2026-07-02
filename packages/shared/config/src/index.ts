export const config = {
  apiBaseUrl: process.env.API_BASE_URL || 'https://api.example.com',
  appName: 'Puff',
  version: '1.0.0',
};

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
