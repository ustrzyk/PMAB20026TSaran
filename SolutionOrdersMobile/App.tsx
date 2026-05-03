import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Greeting from './src/components/Greeting';

function App(): React.JSX.Element {
  return (
    <ScrollView style={styles.container}>
      <Greeting name="Anna" age={25} />
      <Greeting name="Piotr" isVip={true} />
      <Greeting name="Kasia" age={30} isVip={true} />
      <Greeting name="Jan" />
      <Greeting name="Marek" age={40} isVip={true} />
      <Greeting name="Ewa" age={22} />
      <Greeting name="Tomek" age={28} />
      <Greeting name="Zofia" isVip={true} />
      <Greeting name="Kamil" age={35} />
      <Greeting name="Agnieszka" age={27} isVip={true} />
      <Greeting name="Bartek" />
      <Greeting name="Olga" age={45} isVip={false} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#60a0a5',
  },
});

export default App;