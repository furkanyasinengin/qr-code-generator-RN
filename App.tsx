import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useState } from 'react';
import { StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

import { Canvas, Rect, useImage, Image } from '@shopify/react-native-skia';
import { launchImageLibrary } from 'react-native-image-picker';
import {
  getQRCode,
  isFinderPattern,
  isLogoArea,
} from './src/utils/qrGenerator';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [url, setUrl] = useState<string>('github.com/furkanyasinengin');
  const [logo, setLogo] = useState<string | null>(null);

  const [qrSize, setQrSize] = useState<number>(25);
  const [qrData, setQrData] = useState<Uint8Array | []>([]);
  const [qrSquareSize, setQrSquareSize] = useState<number>(0);

  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  const [activeTab, setActiveTab] = useState<'data' | 'eye' | 'bg'>('data');

  const colorPalette = [
    '#000000',
    '#FFFFFF',
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
  ];

  const { width } = Dimensions.get('window');
  const CANVAS_SIZE = width - 50;
  const LOGO_SIZE = width * 0.2;
  const PADDING = 10;

  const skiaLogo = useImage(logo);

  useEffect(() => {
    if (!url) return;
    const qrObject = getQRCode(url);
    const { size, data } = qrObject.modules;
    setQrSize(size);
    setQrData(data);
    setQrSquareSize((CANVAS_SIZE - PADDING * 2) / size);
  }, [url, CANVAS_SIZE]);

  const getActiveColor = () => {
    if (activeTab === 'data') return primaryColor;
    if (activeTab === 'eye') return secondaryColor;
    return backgroundColor;
  };

  const handleLogoSelect = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    });
    if (result.didCancel) {
      return;
    }
    if (result.errorMessage) {
      return;
    }
    if (result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLogo(uri || null);
    }
  };
  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      behavior={'padding'}
      className="flex-1 bg-gray-100"
    >
      <View className="flex-1 w-full">
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            paddingVertical: 50,
          }}
        >
          <Text className="text-2xl mb-2 font-bold mt-10">QR Generator</Text>
          <View className="items-center bg-white p-4 rounded-2xl shadow-sm">
            <Canvas style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}>
              <Rect
                x={0}
                y={0}
                width={width}
                height={width}
                color={backgroundColor}
              />
              {Array.from(qrData).map((value, index) => {
                const colIndex = index % qrSize;
                const rowIndex = Math.floor(index / qrSize);
                if (logo && isLogoArea(rowIndex, colIndex, qrSize)) {
                  return null;
                }
                if (value) {
                  return (
                    <Rect
                      key={index}
                      x={colIndex * qrSquareSize + PADDING}
                      y={rowIndex * qrSquareSize + PADDING}
                      width={qrSquareSize}
                      height={qrSquareSize}
                      color={
                        isFinderPattern(rowIndex, colIndex, qrSize)
                          ? secondaryColor
                          : primaryColor
                      }
                    />
                  );
                }
              })}
              {skiaLogo && (
                <Image
                  image={skiaLogo}
                  x={PADDING + (qrSize * qrSquareSize - LOGO_SIZE) / 2 + 5}
                  y={PADDING + (qrSize * qrSquareSize - LOGO_SIZE) / 2 + 5}
                  width={LOGO_SIZE}
                  height={LOGO_SIZE}
                  fit="contain"
                />
              )}
            </Canvas>
          </View>
          <TextInput
            className="text-black text-center w-3/4 bg-white p-4 rounded-xl my-4 border border-gray-300"
            value={url}
            placeholder={'github.com'}
            placeholderTextColor={'gray'}
            onChangeText={setUrl}
          />
          <View className="flex-row bg-gray-200 p-1 rounded-xl mb-10 mx-2">
            <TouchableOpacity
              onPress={() => setActiveTab('data')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'data' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text
                className={`font-semibold ${activeTab === 'data' ? 'text-black' : 'text-gray-500'}`}
              >
                Data
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('eye')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'eye' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text
                className={`font-semibold ${activeTab === 'eye' ? 'text-black' : 'text-gray-500'}`}
              >
                Eye
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('bg')}
              className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'bg' ? 'bg-white' : 'bg-transparent'}`}
            >
              <Text
                className={`font-semibold ${activeTab === 'bg' ? 'text-black' : 'text-gray-500'}`}
              >
                Background
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            className="flex-grow-0 mx-5 p-2 bg-gray-200 rounded-xl"
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {colorPalette.map(color => (
              <TouchableOpacity
                key={color}
                style={{ backgroundColor: color }}
                className={`w-12 h-12 rounded-full mr-4 border-4 ${
                  color === getActiveColor()
                    ? 'border-gray-300'
                    : 'border-transparent'
                }`}
                onPress={() => {
                  if (activeTab === 'data') setPrimaryColor(color);
                  else if (activeTab === 'eye') setSecondaryColor(color);
                  else if (activeTab === 'bg') setBackgroundColor(color);
                }}
              />
            ))}
          </ScrollView>
          <TouchableOpacity
            onPress={() => (logo ? setLogo(null) : handleLogoSelect())}
            className={`m-5 p-4 rounded-full ${logo ? 'bg-red-500' : 'bg-emerald-500'}`}
          >
            <Text className="text-white text-lg font-bold">
              {logo ? 'Remove Logo' : 'Select Logo'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

export default App;
