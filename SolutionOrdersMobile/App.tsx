import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Greeting from './src/components/Greeting';
import Counter from './src/components/Counter';
import FlatList from './src/components/FlatList';
import SimpleForm from './src/components/SimpleForm';

const {width} = Dimensions.get('window');

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Lista użytkowników</Text>
          <Text style={styles.subtitle}>
            React Native: StyleSheet, Flexbox i komponenty
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Użytkownicy</Text>

          <Greeting name="Anna" age={25} />
          <Counter />

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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FlatList</Text>
          <FlatList />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formularz</Text>
          <SimpleForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#60a0a5',
  },

  container: {
    flex: 1,
  },

  content: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  header: {
    width: width * 0.9,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#cfc485',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1d0624',
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b8f22',
  },

  subtitle: {
    fontSize: 14,
    color: '#152841',
    marginTop: 8,
    textAlign: 'center',
  },

  section: {
    width: width * 0.9,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
});

export default App;