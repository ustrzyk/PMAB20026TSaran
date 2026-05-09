import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

function HeaderComponent(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>3D PRINT STORE</Text>
      <Text style={styles.title}>Sklep z drukarkami 3D</Text>
      <Text style={styles.subtitle}>
        Drukarki, filamenty, części zamienne i akcesoria do druku 3D.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },

  logo: {
    fontSize: 12,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: 1.5,
    marginBottom: 6,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
  },
});

export default HeaderComponent;