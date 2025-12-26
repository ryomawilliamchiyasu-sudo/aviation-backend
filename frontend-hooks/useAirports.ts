import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Airport {
  icao: string;
  iata: string;
  name: string;
  city: string;
  province: string;
  country?: string;
  lat?: number;
  lon?: number;
  elev?: number;
  runways?: Array<{ number: string; length: number; surface: string }>;
  frequencies?: Array<{ type: string; freq: string }>;
}

interface AirportState {
  airports: Airport[];
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  lastSync: Date | null;
  totalCount: number;
}

const CACHE_KEY = 'airports_cache';
const SYNC_KEY = 'airports_sync_time';
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export const useAirports = (backendUrl: string) => {
  const [state, setState] = useState<AirportState>({
    airports: [],
    loading: true,
    error: null,
    fromCache: false,
    lastSync: null,
    totalCount: 0
  });

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Auto-sync if cache is stale
  useEffect(() => {
    checkAndSync();
  }, [backendUrl]);

  const loadCachedData = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const airports = JSON.parse(cached);
        const syncTime = await AsyncStorage.getItem(SYNC_KEY);
        setState(prev => ({
          ...prev,
          airports,
          fromCache: true,
          lastSync: syncTime ? new Date(parseInt(syncTime)) : null,
          totalCount: airports.length,
          loading: false
        }));
      }
    } catch (err) {
      console.error('Failed to load cached airports:', err);
    }
  };

  const checkAndSync = async () => {
    try {
      const lastSync = await AsyncStorage.getItem(SYNC_KEY);
      const lastSyncTime = lastSync ? parseInt(lastSync) : 0;
      const now = Date.now();

      // Sync if never synced or cache is stale
      if (now - lastSyncTime > SYNC_INTERVAL) {
        await syncAirports();
      }
    } catch (err) {
      console.error('Sync check failed:', err);
    }
  };

  const syncAirports = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const response = await fetch(`${backendUrl}/api/airports`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const jsonData = await response.json();
      const airports = jsonData.data || jsonData.results || [];

      // Save to cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(airports));
      await AsyncStorage.setItem(SYNC_KEY, Date.now().toString());

      setState(prev => ({
        ...prev,
        airports,
        loading: false,
        error: null,
        fromCache: false,
        lastSync: new Date(),
        totalCount: airports.length
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({
        ...prev,
        loading: false,
        error: `Sync failed: ${errorMsg}. Using cached data.`,
        fromCache: true
      }));
    }
  };

  const search = (query: string): Airport[] => {
    if (!query || query.length === 0) return state.airports;

    const q = query.toUpperCase();
    return state.airports.filter(airport =>
      airport.icao.includes(q) ||
      airport.iata.includes(q) ||
      airport.name.toUpperCase().includes(q) ||
      airport.city.toUpperCase().includes(q)
    );
  };

  const getByIcao = (icao: string): Airport | undefined => {
    return state.airports.find(a => a.icao === icao.toUpperCase());
  };

  const getByProvince = (province: string): Airport[] => {
    return state.airports.filter(a => a.province === province.toUpperCase());
  };

  return {
    ...state,
    search,
    getByIcao,
    getByProvince,
    syncAirports,
    reload: loadCachedData
  };
};
