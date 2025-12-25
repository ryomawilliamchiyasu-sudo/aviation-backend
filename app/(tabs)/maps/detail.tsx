import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { airportsAPI } from '@/api';

type Airport = {
  id: number;
  code: string;
  name: string;
  lat: number;
  lon: number;
};

export default function AirportDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [airport, setAirport] = useState<Airport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAirportDetail();
    }
  }, [id]);

  const fetchAirportDetail = async () => {
    try {
      setLoading(true);
      const airportId = typeof id === 'string' ? parseInt(id, 10) : id;
      const data = await airportsAPI.getById(airportId);
      setAirport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Failed to load airport: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Save to backend/storage
  };

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#007AFF" />;

  if (!airport || error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error || 'Airport not found'}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.code}>{airport.code}</Text>
          <Text style={styles.name}>{airport.name}</Text>
        </View>
        <Pressable
          style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
          onPress={handleToggleFavorite}
        >
          <Text style={styles.favoriteButtonText}>{isFavorite ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Latitude:</Text>
          <Text style={styles.infoValue}>{airport.lat.toFixed(4)}° N</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Longitude:</Text>
          <Text style={styles.infoValue}>{airport.lon.toFixed(4)}° W</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Runway Information</Text>
        <Text style={styles.placeholder}>Coming soon</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequencies</Text>
        <Text style={styles.placeholder}>Coming soon</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weather</Text>
        <Text style={styles.placeholder}>Coming soon</Text>
      </View>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>← Back to Airports</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1624',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A5067',
  },
  code: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  name: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
  },
  favoriteButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: '#1A2D3F',
    borderWidth: 1,
    borderColor: '#3A5067',
  },
  favoriteButtonActive: {
    borderColor: '#FFD700',
    backgroundColor: '#2D3E4F',
  },
  favoriteButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#1A2D3F',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#A3B4C5',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  placeholder: {
    fontSize: 14,
    color: '#A3B4C5',
    fontStyle: 'italic',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#2D1616',
    borderRadius: 6,
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A2D3F',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A5067',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
