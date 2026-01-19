
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import './global.css';
import { Canvas } from '@shopify/react-native-skia';

function App() {

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'light-content' } />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {

  return (
    <View
      className="flex-1 bg-gray-500 items-center justify-center"
      style={styles.container}
    >
      <Text>QR Code Generator</Text>
      <Canvas style={{ width: 200, height: 200 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
