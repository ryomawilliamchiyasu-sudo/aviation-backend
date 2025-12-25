import { View, Text, StyleSheet } from 'react-native';
import { type NativeStackScreenProps } from '@react-navigation/native-stack';

type Airport = {
  id: number;
  code: string;
  name: string;
  lat: number;
  lon: number;
};

type MapsStackParamList = {
  Map: undefined;
  AirportDetail: { airport: Airport };
};

type AirportDetailProps = NativeStackScreenProps<MapsStackParamList, 'AirportDetail'>;

export default function AirportDetailScreen({ route }: AirportDetailProps) {
  const { airport } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.code}>{airport.code}</Text>
      <Text>{airport.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  code: { fontSize: 28, fontWeight: 'bold' },
});