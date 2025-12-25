import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AIAssistScreen from '../screens/AIAssistScreen';
import MapsStack from './MapsStack';
import WeatherScreen from '../screens/WeatherScreen';
import AirportPlanScreen from '../screens/AirportPlanScreen';
import OtherScreen from '../screens/OtherScreen';
import { Colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: Colors.background, height: 70 },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'help-outline';

          switch (route.name) {
            case 'AI Assist': iconName = 'mic-outline'; break;
            case 'Maps': iconName = 'map-outline'; break;
            case 'Weather': iconName = 'cloud-outline'; break;
            case 'Airport Plan': iconName = 'airplane-outline'; break;
            case 'Other': iconName = 'settings-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: { paddingBottom: 5, fontSize: 12 },
      })}
    >
      <Tab.Screen name="AI Assist" component={AIAssistScreen} />
      <Tab.Screen name="Maps" component={MapsStack} />
      <Tab.Screen name="Weather" component={WeatherScreen} />
      <Tab.Screen name="Airport Plan" component={AirportPlanScreen} />
      <Tab.Screen name="Other" component={OtherScreen} />
    </Tab.Navigator>
  );
}