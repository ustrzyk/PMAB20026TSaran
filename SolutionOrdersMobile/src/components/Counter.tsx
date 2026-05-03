import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Komponent bez Props - tylko State
const Counter: React.FC = () => {
  // useState z TypeScript - type inference
  const [count, setCount] = useState<number>(0);

  // Funkcje obsługi
  const handleIncrement = (): void => {
    setCount(count + 1);
  };

  const handleDecrement = (): void => {
    setCount(count - 1);
  };

  const handleReset = (): void => {
    setCount(0);
  };

  return (
    <View style={styles.container}>
      {/* Wyświetlanie state'u */}
      <Text style={styles.count}>{count}</Text>

      {/* Przyciski */}
      <View style={styles.buttons}>
        <Button title="+" onPress={handleIncrement} />
        <Button title="-" onPress={handleDecrement} />
        <Button title="Reset" onPress={handleReset} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
  },
  count: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    columnGap: 10,  // gap wspierany od RN 0.71+, użyj columnGap lub marginRight
    justifyContent: 'center',
  },
});

export default Counter;