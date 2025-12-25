import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { airportsAPI } from '@/api';

type Airport = {
  id: number;
  code: string;
  name: string;
  lat: number;
  lon: number;
};

export default function AirportSearch() {
  const router = useRouter();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAirports();
  }, []);

  useEffect(() => {
    // Filter airports by code or name
    const filtered = airports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        airport.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAirports(filtered);
  }, [searchQuery, airports]);

  const fetchAirports = async () => {
    try {
      setLoading(true);
      const data = await airportsAPI.list();
      setAirports(data);
      setFilteredAirports(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to load airports: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAirportPress = (airportId: number) => {
    router.push({
      pathname: '/(tabs)/maps/detail',
      params: { id: airportId },
    });
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#007AFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Airports</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by code or name..."
        placeholderTextColor="#A3B4C5"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      {filteredAirports.length === 0 && !error && (
        <Text style={styles.noResults}>No airports found</Text>
      )}

      <FlatList
        data={filteredAirports}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            style={styles.airportCard}
            onPress={() => handleAirportPress(item.id)}
          >
            <Text style={styles.code}>{item.code}</Text>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.coords}>
              {item.lat.toFixed(4)}° N, {item.lon.toFixed(4)}° W
            </Text>
            <Text style={styles.tapHint}>→ Tap for details</Text>
          </Pressable>
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#3A5067',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#FFFFFF',
    backgroundColor: '#1A2D3F',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#2D1616',
    borderRadius: 6,
  },
  noResults: {
    color: '#A3B4C5',
    textAlign: 'center',
    marginTop: 20,
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
  tapHint: {
    fontSize: 11,
    color: '#007AFF',
    marginTop: 6,
    fontStyle: 'italic',
  },
});
