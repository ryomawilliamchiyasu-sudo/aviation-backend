import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MetarData {
  icao: string;
  timestamp: string;
  rawText: string;
  wind: { direction: number; speed: number; gust: number | null; unit: string };
  visibility: { miles: number; meters: number | null; unit: string };
  temperature: { celsius: number; fahrenheit: number };
  dewpoint: { celsius: number; fahrenheit: number };
  altimeter: { inchesHg: number; hectopascals: number | null };
  flightCategory: string;
  clouds: Array<{ cover: string; base: number }>;
  station: { name: string; lat: number; lon: number; elev: number };
}

interface TafData {
  icao: string;
  timestamp: string;
  validPeriod: { start: number; end: number };
  rawText: string;
  forecastGroups: Array<any>;
}

interface WeatherResponse {
  status: string;
  data: {
    icao: string;
    metar: MetarData | null;
    taf: TafData | null;
    errors: { metar: string | null; taf: string | null };
  };
}

interface WeatherState {
  data: WeatherResponse['data'] | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  lastUpdate: Date | null;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useWeather = (icao: string, backendUrl: string) => {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
    fromCache: false,
    lastUpdate: null
  });

  const fetchWeather = async () => {
    if (!icao || icao.length !== 4) {
      setState(prev => ({ ...prev, error: 'Invalid ICAO code' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true }));

    try {
      // Try to fetch live data
      const response = await fetch(`${backendUrl}/api/weather/${icao}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const jsonData = await response.json();

      if (jsonData.data) {
        // Save to cache
        await AsyncStorage.setItem(
          `weather_${icao}`,
          JSON.stringify({
            data: jsonData.data,
            timestamp: Date.now()
          })
        );

        setState({
          data: jsonData.data,
          loading: false,
          error: null,
          fromCache: false,
          lastUpdate: new Date()
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      
      // Try to load from cache
      try {
        const cached = await AsyncStorage.getItem(`weather_${icao}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          const cacheAgeStr = cacheAge < 60000 
            ? `${Math.round(cacheAge / 1000)}s ago`
            : `${Math.round(cacheAge / 60000)}m ago`;

          setState({
            data,
            loading: false,
            error: `Using cached data (${cacheAgeStr})`,
            fromCache: true,
            lastUpdate: new Date(timestamp)
          });
        } else {
          setState(prev => ({
            ...prev,
            loading: false,
            error: `No data available: ${errorMsg}`
          }));
        }
      } catch {
        setState(prev => ({
          ...prev,
          loading: false,
          error: `Failed to fetch weather: ${errorMsg}`
        }));
      }
    }
  };

  const reset = () => {
    setState({
      data: null,
      loading: false,
      error: null,
      fromCache: false,
      lastUpdate: null
    });
  };

  return {
    ...state,
    fetchWeather,
    reset
  };
};
