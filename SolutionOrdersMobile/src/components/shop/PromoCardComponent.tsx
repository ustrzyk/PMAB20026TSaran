import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

interface PromoCardComponentProps {
  smallText: string;
  title: string;
  description: string;
}

const PromoCardComponent: React.FC<PromoCardComponentProps> = ({
  smallText,
  title,
  description,
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.smallText}>{smallText}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f97316',
    borderRadius: 18,
    padding: 20,
    marginBottom: 22,
  },
  smallText: {
    color: '#431407',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  description: {
    color: '#fff7ed',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PromoCardComponent;
