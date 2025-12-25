import { View, StyleSheet } from 'react-native';

type CardProps = {
  children: React.ReactNode;
};

export default function Card({ children }: CardProps) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0B1C2D',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
  },
});