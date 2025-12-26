import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAirports } from '../hooks/useAirports';

interface MapViewComponentProps {
  backendUrl: string;
  selectedIcao?: string;
  onAirportSelect?: (icao: string) => void;
  showClusters?: boolean;
}

export const AirportMapView: React.FC<MapViewComponentProps> = ({
  backendUrl,
  selectedIcao,
  onAirportSelect,
  showClusters = true
}) => {
  const { airports, loading } = useAirports(backendUrl);
  const [region, setRegion] = useState<Region>({
    latitude: 43.77,
    longitude: -79.63,
    latitudeDelta: 2,
    longitudeDelta: 2
  });

  // Zoom to selected airport
  useEffect(() => {
    if (selectedIcao) {
      const airport = airports.find(a => a.icao === selectedIcao.toUpperCase());
      if (airport && airport.lat && airport.lon) {
        setRegion({
          latitude: airport.lat,
          longitude: airport.lon,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5
        });
      }
    }
  }, [selectedIcao, airports]);

  // Filter airports based on zoom level
  const getVisibleAirports = () => {
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLon = region.longitude - region.longitudeDelta / 2;
    const maxLon = region.longitude + region.longitudeDelta / 2;

    return airports.filter(airport => {
      if (!airport.lat || !airport.lon) return false;
      return (
        airport.lat >= minLat &&
        airport.lat <= maxLat &&
        airport.lon >= minLon &&
        airport.lon <= maxLon
      );
    });
  };

  const visibleAirports = getVisibleAirports();
  const isSelected = (icao: string) => icao === selectedIcao?.toUpperCase();

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading airports...</Text>
        </View>
      )}

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChange={setRegion}
        showsUserLocation
        showsMyLocationButton
        zoomEnabled
        scrollEnabled
      >
        {visibleAirports.map(airport => (
          <Marker
            key={airport.icao}
            coordinate={{
              latitude: airport.lat!,
              longitude: airport.lon!
            }}
            title={airport.name}
            description={airport.icao}
            pinColor={isSelected(airport.icao) ? '#0ea5e9' : '#ef4444'}
            onPress={() => onAirportSelect?.(airport.icao)}
          />
        ))}
      </MapView>

      <View style={styles.infoBar}>
        <Text style={styles.infoText}>
          {visibleAirports.length} airport{visibleAirports.length !== 1 ? 's' : ''} visible
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  map: {
    flex: 1
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  infoBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500'
  }
});
