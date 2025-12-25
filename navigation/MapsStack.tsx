import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapsScreen from '../screens/MapsScreen';
import AirportDetailScreen from '../screens/AirportDetailScreen';

type Airport = {
  id: number;
  code: string;
  name: string;
  lat: number;
  lon: number;
};

export type MapsStackParamList = {
  Map: undefined;
  AirportDetail: { airport: Airport };
};

const Stack = createNativeStackNavigator<MapsStackParamList>();

export default function MapsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapsScreen} />
      <Stack.Screen name="AirportDetail" component={AirportDetailScreen} />
    </Stack.Navigator>
  );
}