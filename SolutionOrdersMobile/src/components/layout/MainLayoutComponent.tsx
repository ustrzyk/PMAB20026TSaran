import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import HeaderComponent from './HeaderComponent';
import NavbarComponent, {TabKey} from './NavbarComponent';

interface MainLayoutComponentProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  children: React.ReactNode;
}

function MainLayoutComponent({
  activeTab,
  onTabChange,
  children,
}: MainLayoutComponentProps): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderComponent />

      <View style={styles.content}>{children}</View>

      <NavbarComponent activeTab={activeTab} onTabChange={onTabChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },

  content: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

export default MainLayoutComponent;