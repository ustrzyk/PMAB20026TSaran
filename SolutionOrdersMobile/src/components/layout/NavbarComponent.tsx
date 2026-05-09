import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

export type TabKey = 'home' | 'products' | 'cart' | 'details';

interface NavbarComponentProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

function NavbarComponent({
  activeTab,
  onTabChange,
}: NavbarComponentProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, activeTab === 'home' && styles.activeButton]}
        onPress={() => onTabChange('home')}>
        <Text
          style={[styles.buttonText, activeTab === 'home' && styles.activeText]}>
          Start
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          activeTab === 'products' && styles.activeButton,
        ]}
        onPress={() => onTabChange('products')}>
        <Text
          style={[
            styles.buttonText,
            activeTab === 'products' && styles.activeText,
          ]}>
          Produkty
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, activeTab === 'cart' && styles.activeButton]}
        onPress={() => onTabChange('cart')}>
        <Text
          style={[styles.buttonText, activeTab === 'cart' && styles.activeText]}>
          Koszyk
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    padding: 12,
  },

  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    alignItems: 'center',
  },

  activeButton: {
    backgroundColor: '#f97316',
  },

  buttonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 14,
  },

  activeText: {
    color: '#ffffff',
  },
});

export default NavbarComponent;