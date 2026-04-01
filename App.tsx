import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';
import { GeneratorScreen } from './src/screens/GeneratorScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <GeneratorScreen />
    </SafeAreaProvider>
  );
}

export default App;
