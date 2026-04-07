import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { History, QrCode, ScanLine } from 'lucide-react-native';

import './global.css';
import { GeneratorScreen } from './src/screens/GeneratorScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import { triggerHaptic } from './src/utils/haptic';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="History"
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
              height: 80,
              paddingBottom: 10,
              paddingTop: 5,
            },
          }}
          screenListeners={{
            tabPress: () => {
              triggerHaptic();
            },
          }}
        >
          <Tab.Screen
            name="Create"
            component={GeneratorScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <QrCode color={color} size={size} />
              ),
              tabBarLabel: 'Create',
            }}
          />
          <Tab.Screen
            name="Scan"
            component={ScannerScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <ScanLine color={color} size={size} />
              ),
              tabBarLabel: 'Scan',
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <History color={color} size={size} />
              ),
              tabBarLabel: 'History',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
