import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import Greeting from './src/components/Greeting';
import Counter from './src/components/Counter';

function App(): React.JSX.Element {
  return (
    <ScrollView style={styles.container}>
      <Greeting name="Anna" age={25} />
      <Counter />
      <Greeting name="Piotr" isVip={true} />
      <Greeting name="Piotr" isVip={true} />
      <Greeting name="Kasia" age={30} isVip={true} />
      <Greeting name="Jan" />
      <Counter />
      <Greeting name="Marek" age={40} isVip={true} />
      <Greeting name="Ewa" age={22} />
      <Greeting name="Tomek" age={28} />
      <Greeting name="Zofia" isVip={true} />
      <Greeting name="Kamil" age={35} />
      <Counter />
      <Greeting name="Agnieszka" age={27} isVip={true} />
      <Greeting name="Bartek" />
      <Greeting name="Olga" age={45} isVip={false} />
      <Greeting name="Monika" age={31} />
      <Greeting name="Dawid" isVip={true} />
      <Greeting name="Patrycja" age={29} />
      <Greeting name="Michal" age={33} />
      <Counter />
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