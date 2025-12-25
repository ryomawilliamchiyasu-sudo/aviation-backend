import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../theme/colors';
import Card from '../components/Card';

// Only import react-native-maps on iOS/Android
let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
}

export default function MapsScreen() {
  const initialRegion = {
    latitude: 43.6777,
    longitude: -79.6248,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Maps</Text>
      <Card>
        <Text style={styles.text}>
          {Platform.OS === 'web'
            ? 'Map preview not supported on web. Use iOS/Android for native map.'
            : 'Select source or upload your own charts.'}
        </Text>
      </Card>

      {Platform.OS !== 'web' && MapView && Marker && (
        <MapView style={styles.map} initialRegion={initialRegion} mapType="standard">
          <Marker
            coordinate={{ latitude: 43.6777, longitude: -79.6248 }}
            title="Toronto Pearson Airport"
            description="Example airport marker"
          />
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
  title: { color: Colors.primaryText, fontSize: 24, fontWeight: '600', marginBottom: 10 },
  text: { color: Colors.secondaryText, fontSize: 14 },
  map: { width: Dimensions.get('window').width - 20, height: 400, marginTop: 10, borderRadius: 10 },
});