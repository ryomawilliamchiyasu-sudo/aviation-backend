import { BACKEND_URL } from './config';

export const API_URL = BACKEND_URL;

// Helper function for API calls with error handling
export async function fetchAPI(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`API Error (${endpoint}):`, message);
    throw error;
  }
}

// Airports API
export const airportsAPI = {
  list: () => fetchAPI('/airports'),
  detail: (id: number) => fetchAPI(`/airports/${id}`),
};

// Weather API
export const weatherAPI = {
  metar: (station: string = 'CYYZ') => fetchAPI(`/weather?station=${station}`),
};

// Test API
export const testAPI = {
  ping: () => fetchAPI('/test'),
};
