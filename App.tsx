import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import './global.css';

import {
  Canvas,
  Rect,
  useImage,
  Image as SkiaImage,
} from '@shopify/react-native-skia';
import { launchImageLibrary } from 'react-native-image-picker';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Svg, { Path } from 'react-native-svg';
import {
  getQRCode,
  isFinderPattern,
  isLogoArea,
} from './src/utils/qrGenerator';

const SaveIcon = ({ color = 'white', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M19 9H15V3H9V9H5L12 16L19 9ZM5 18V20H19V18H5Z" fill={color} />
  </Svg>
);

const ShareIcon = ({ color = 'white', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z"
      fill={color}
    />
  </Svg>
);

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle={'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const canvasRef = useRef<any>(null);

  const [url, setUrl] = useState<string>('github.com/furkanyasinengin');
  const [logo, setLogo] = useState<string | null>(null);

  const [qrSize, setQrSize] = useState<number>(25);
  const [qrData, setQrData] = useState<Uint8Array | []>([]);
  const [qrSquareSize, setQrSquareSize] = useState<number>(0);

  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  const [activeTab, setActiveTab] = useState<'data' | 'eye' | 'bg'>('data');

  const [savedPreview, setSavedPreview] = useState<string | null>(null);

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

  const handleShare = async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (image) {
      const base64 = image.encodeToBase64();
      const filePath = `${RNFS.CachesDirectoryPath}/qr_${Date.now()}.png`;
      await RNFS.writeFile(filePath, base64, 'base64');
      try {
        await Share.open({
          title: 'Share QR Code',
          url: `file://${filePath}`,
          type: 'image/png',
          filename: 'qr',
          failOnCancel: false,
        });
      } catch (error) {
        console.log(error);
      } finally {
        RNFS.unlink(filePath).catch(() => {});
      }
    }
  };

  const handleSaveToGallery = async () => {
    const image = canvasRef.current?.makeImageSnapshot();
    if (!image) return;

    const base64 = image.encodeToBase64();
    const filePath = `${RNFS.CachesDirectoryPath}/qr_${Date.now()}.png`;
    await RNFS.writeFile(filePath, base64, 'base64');

    try {
      await CameraRoll.saveAsset(`file://${filePath}`, {
        type: 'photo',
        album: 'QR Generator',
      });
      setSavedPreview(`file://${filePath}`);
      setTimeout(() => {
        setSavedPreview(null);
        RNFS.unlink(filePath).catch(() => {});
      }, 3000);
    } catch (e) {
      console.log(e);
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
            <Canvas
              ref={canvasRef}
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            >
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
                <SkiaImage
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
          <View className="flex-row gap-4 my-5">
            <TouchableOpacity
              onPress={() => (logo ? setLogo(null) : handleLogoSelect())}
              className={`p-4 rounded-full items-center justify-center ${logo ? 'bg-red-500' : 'bg-emerald-500'}`}
            >
              <Text className="text-white text-lg font-bold">
                {logo ? 'Remove Logo' : 'Select Logo'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              className="p-4 rounded-full bg-blue-500 items-center justify-center"
            >
              <ShareIcon color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveToGallery}
              className="p-4 rounded-full bg-blue-500 items-center justify-center"
            >
              <SaveIcon color="white" size={24} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      {savedPreview && (
        <View className="absolute bg-gray-500/50 inset-0 items-center justify-center">
          <View className="bg-white p-4 rounded-2xl items-center">
            <Image
              source={{ uri: savedPreview }}
              width={220}
              height={220}
              resizeMode="contain"
            />
            <Text className="mt-3 text-green-600 font-bold text-lg">
              Saved To Gallery
            </Text>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

export default App;
