import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { airportsAPI } from '@/api';

type Airport = {
  id: number;
  code: string;
  name: string;
  lat: number;
  lon: number;
};

export default function Maps() {
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      setLoading(true);
      const data = await airportsAPI.list();
      setAirports(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to load airports: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Canadian Airports</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={airports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.airportCard}>
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.coords}>
              {item.lat.toFixed(4)}° N, {item.lon.toFixed(4)}° W
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A1624',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#2D1616',
    borderRadius: 6,
  },
  airportCard: {
    backgroundColor: '#1A2D3F',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  code: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  name: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  coords: {
    fontSize: 12,
    color: '#A3B4C5',
    marginTop: 4,
  },
});