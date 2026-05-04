import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import GreetingComponent from './src/components/Greeting';
import CounterComponent from './src/components/Counter';
import FlatListComponent from './src/components/FlatList';
import SimpleFormComponent from './src/components/SimpleForm';

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

          <GreetingComponent name="Anna" age={25} />
          <CounterComponent />

          <GreetingComponent name="Piotr" isVip={true} />
          <GreetingComponent name="Kasia" age={30} isVip={true} />
          <GreetingComponent name="Jan" />
          <CounterComponent />

          <GreetingComponent name="Marek" age={40} isVip={true} />
          <GreetingComponent name="Ewa" age={22} />
          <GreetingComponent name="Tomek" age={28} />
          <GreetingComponent name="Zofia" isVip={true} />
          <GreetingComponent name="Kamil" age={35} />
          <CounterComponent />

          <GreetingComponent name="Agnieszka" age={27} isVip={true} />
          <GreetingComponent name="Bartek" />
          <GreetingComponent name="Olga" age={45} isVip={false} />
          <GreetingComponent name="Monika" age={31} />
          <GreetingComponent name="Dawid" isVip={true} />
          <GreetingComponent name="Patrycja" age={29} />
          <GreetingComponent name="Michal" age={33} />
          <CounterComponent />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FlatList</Text>
          <FlatListComponent />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formularz</Text>
          <SimpleFormComponent />
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
    width: '90%',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#c4b65b',
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
    width: '90%',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d69fc6',
    marginBottom: 8,
  },
});

export default App;