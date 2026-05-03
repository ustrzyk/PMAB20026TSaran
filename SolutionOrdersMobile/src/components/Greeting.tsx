import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// TypeScript Interface dla Props
interface GreetingProps {
  name: string;
  age?: number;  // Opcjonalne (?)
  isVip?: boolean;
}

// Komponent funkcyjny z typowanymi Props
const Greeting: React.FC<GreetingProps> = ({ 
  name, 
  age, 
  isVip = false 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Cześć, {name}!
      </Text>
      
      {age && (
        <Text style={styles.age}>
          Masz {age} lat
        </Text>
      )}
      
      {isVip && (
        <Text style={styles.vip}>⭐ VIP</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  age: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  vip: {
    fontSize: 12,
    color: '#FFD700',
    marginTop: 4,
    fontWeight: '600',
  },
});

export default Greeting;