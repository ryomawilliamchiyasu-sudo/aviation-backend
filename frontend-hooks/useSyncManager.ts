import { useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SyncConfig {
  weatherSyncInterval?: number; // minutes, default 10
  airportSyncInterval?: number; // hours, default 24
  onSyncStart?: () => void;
  onSyncComplete?: () => void;
  onSyncError?: (error: string) => void;
}

/**
 * Background sync manager for offline-first data strategy
 * Automatically syncs weather and airports when online
 */
export const useSyncManager = (backendUrl: string, config: SyncConfig = {}) => {
  const {
    weatherSyncInterval = 10,
    airportSyncInterval = 24,
    onSyncStart,
    onSyncComplete,
    onSyncError
  } = config;

  // Sync weather for recently viewed airports
  const syncWeather = useCallback(async () => {
    try {
      onSyncStart?.();

      const viewedAirports = await AsyncStorage.getItem('viewed_airports');
      if (!viewedAirports) {
        onSyncComplete?.();
        return;
      }

      const airports = JSON.parse(viewedAirports).slice(0, 5); // Sync last 5 viewed
      const results = await Promise.allSettled(
        airports.map(async (icao: string) => {
          const response = await fetch(`${backendUrl}/api/weather/${icao}`);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const data = await response.json();
          await AsyncStorage.setItem(
            `weather_${icao}`,
            JSON.stringify({
              data: data.data,
              timestamp: Date.now()
            })
          );
        })
      );

      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed === 0) {
        console.log(`✓ Synced ${airports.length} weather updates`);
      }

      onSyncComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Weather sync failed:', msg);
      onSyncError?.(msg);
    }
  }, [backendUrl, onSyncStart, onSyncComplete, onSyncError]);

  // Sync airports
  const syncAirports = useCallback(async () => {
    try {
      onSyncStart?.();

      const response = await fetch(`${backendUrl}/api/airports`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const airports = data.data || data.results || [];

      await AsyncStorage.setItem('airports_cache', JSON.stringify(airports));
      await AsyncStorage.setItem('airports_sync_time', Date.now().toString());

      console.log(`✓ Synced ${airports.length} airports`);
      onSyncComplete?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Airport sync failed:', msg);
      onSyncError?.(msg);
    }
  }, [backendUrl, onSyncStart, onSyncComplete, onSyncError]);

  // Track viewed airports for syncing
  const trackAirportView = useCallback(async (icao: string) => {
    try {
      const viewed = await AsyncStorage.getItem('viewed_airports');
      const list = viewed ? JSON.parse(viewed) : [];
      
      // Remove if exists, then add to front
      const filtered = list.filter((code: string) => code !== icao.toUpperCase());
      filtered.unshift(icao.toUpperCase());
      
      // Keep only last 20 viewed
      await AsyncStorage.setItem(
        'viewed_airports',
        JSON.stringify(filtered.slice(0, 20))
      );
    } catch (err) {
      console.error('Failed to track airport view:', err);
    }
  }, []);

  // Setup periodic sync
  useEffect(() => {
    // Initial sync
    syncWeather();
    syncAirports();

    // Setup intervals
    const weatherInterval = setInterval(
      syncWeather,
      weatherSyncInterval * 60 * 1000
    );

    const airportInterval = setInterval(
      syncAirports,
      airportSyncInterval * 60 * 60 * 1000
    );

    return () => {
      clearInterval(weatherInterval);
      clearInterval(airportInterval);
    };
  }, [syncWeather, syncAirports, weatherSyncInterval, airportSyncInterval]);

  // Listen for app state changes
  useEffect(() => {
    const unsubscribe = AppState?.addEventListener?.('change', (nextAppState) => {
      // Sync when app comes to foreground
      if (nextAppState === 'active') {
        syncWeather();
      }
    });

    return () => unsubscribe?.remove?.();
  }, [syncWeather]);

  return {
    syncWeather,
    syncAirports,
    trackAirportView
  };
};
