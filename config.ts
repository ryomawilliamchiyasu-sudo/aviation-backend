// Backend Configuration
// Toggle USE_LOCAL to true for localhost (local dev)
const USE_LOCAL = false;

// Production backend on Render
const PRODUCTION_URL = 'https://aviation-backend-ccw5.onrender.com';

// Localhost for iOS Simulator & Android Emulator
const LOCAL_URL = 'http://localhost:3000';

export const BACKEND_URL = USE_LOCAL ? LOCAL_URL : PRODUCTION_URL;

// Helper to log current backend being used (useful for debugging)
if (__DEV__) {
  console.log('🔌 Backend URL:', BACKEND_URL);
}
