import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Dimensions } from 'react-native';

import './global.css';
import { Canvas, Rect, Group } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
import { getQRCode } from './src/utils/qrGenerator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'light-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [url, setUrl] = useState<string>('github.com');
  const [qrSize, setQrSize] = useState<number>(25);
  const [qrData, setQrData] = useState<Uint8Array | []>([]);
  const [qrSquareSize, setQrSquareSize] = useState<number>(0);

  const { width } = Dimensions.get('window');

  // const qrObject = getQRCode(url);
  // const { size, data } = qrObject.modules;
  // const squareSize = (width - 50) / size;

  useEffect(() => {
    if (!url) return;
    const qrObject = getQRCode(url);
    const { size, data } = qrObject.modules;
    setQrSize(size);
    setQrData(data);
    setQrSquareSize((width - 50) / size);
  }, [url, width]);

  return (
    <View
      className="flex-1 bg-gray-500 items-center justify-center"
      style={styles.container}
    >
      <Text>QR Code Generator</Text>
      <Text>{url}</Text>

      <View className="bg-red-500">
        <Canvas style={{ width: width - 50, height: width - 50 }}>
          {Array.from(qrData).map((value, index) => {
            if (value)
              return (
                <Rect
                  key={index}
                  x={(index % qrSize) * qrSquareSize}
                  y={Math.floor(index / qrSize) * qrSquareSize}
                  width={qrSquareSize}
                  height={qrSquareSize}
                  color="black"
                />
              );
          })}
        </Canvas>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
