import { RefreshCw, Shield, Zap, ZapOff } from 'lucide-react-native';
import { useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import Animated, {
  useSharedValue,
  useAnimatedProps,
} from 'react-native-reanimated';

import ScannerModal from '../components/ScannerModal';

const VIBRATITON_PATTERN = [0, 70, 80, 70];

const ReanimatedCamera = Animated.createAnimatedComponent(Camera);

export default function ScannerScreen() {
  const isFocused = useIsFocused();
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const zoom = useSharedValue(device?.neutralZoom ?? 1);

  const animatedProps = useAnimatedProps(
    () => ({ zoom: zoom.value }),
    [zoom, device],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length === 0) {
        return;
      }
      const code = codes[0];
      if (code.value) {
        setScannedData(code.value);
        setIsTorchOn(false);
        Vibration.vibrate(VIBRATITON_PATTERN);
      }
    },
  });

  // useEffect(() => {
  //   if (!hasPermission) {
  //     requestPermission();
  //   }
  // }, [requestPermission, hasPermission]);

  // const handleUrlButtonPress = async (url: string) => {
  //   const supported = await Linking.canOpenURL(url);

  //   if (supported) {
  //     await Linking.openURL(url);
  //   } else {
  //     setAlertConfig({
  //       ...alertConfig,
  //       visible: true,
  //       title: 'Invalid URL',
  //       message: `Don't know how to open this URL: ${url}`,
  //       confirmText: 'OK',
  //       onConfirm: () => setAlertConfig({ ...alertConfig, visible: false }),
  //       closeText: '',
  //       onClose: () => {},
  //     });
  //   }
  // };

  // const handleWifiConnect = async (data: string) => {
  //   try {
  //     const { ssid, password } = parseWifiData(data);

  //     Clipboard.setString(password);

  //     setAlertConfig({
  //       visible: true,
  //       title: 'Password Copied',
  //       message: `Now we will take you to the Wi-Fi settings. You can find the network named ${ssid} in the network list and then find the password.`,
  //       confirmText: 'Settings',
  //       onConfirm: () => {
  //         if (Platform.OS === 'android') {
  //           Linking.sendIntent('android.settings.WIFI_SETTINGS');
  //         } else {
  //           Linking.openURL('App-Prefs:WIFI');
  //         }
  //       },
  //       closeText: 'Cancel',
  //       onClose: () => setAlertConfig({ ...alertConfig, visible: false }),
  //     });
  //   } catch {
  //     setAlertConfig({
  //       visible: true,
  //       title: 'Connection Error',
  //       message: `Failed to connect.`,
  //       confirmText: 'OK',
  //       onConfirm: () => setAlertConfig({ ...alertConfig, visible: false }),
  //       closeText: '',
  //       onClose: () => {},
  //     });
  //   }
  // };

  // const handleVcard = async (data: string) => {
  //   try {
  //     const contact = parseVcardData(data);
  //     ContactModule.openContactForm(
  //       contact.fn || '',
  //       contact.tel || '',
  //       contact.email || '',
  //       contact.title || '',
  //       contact.org || '',
  //       contact.url || '',
  //     );
  //   } catch {
  //     setAlertConfig({
  //       visible: true,
  //       title: 'Contact Error',
  //       message: `Failed to add contact.`,
  //       confirmText: 'OK',
  //       onConfirm: () => setAlertConfig({ ...alertConfig, visible: false }),
  //       closeText: '',
  //       onClose: () => {},
  //     });
  //   }
  // };

  // const handleEmail = async (data: string) => {
  //   let email = '';
  //   let subject = '';
  //   let body = '';

  //   if (data.startsWith('MATMSG:')) {
  //     const toMatch = data.match(/TO:([^;]+)/i);
  //     const subMatch = data.match(/SUB:([^;]+)/i);
  //     const bodyMatch = data.match(/BODY:([^;]+)/i);
  //     email = toMatch ? toMatch[1] : '';
  //     subject = subMatch ? subMatch[1] : '';
  //     body = bodyMatch ? bodyMatch[1] : '';
  //   } else if (data.startsWith('mailto:')) {
  //     email = data.replace('mailto:', '');
  //   }

  //   const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  //   Linking.openURL(url).catch(() => console.log('Email app not found'));
  // };

  // const handlePhone = async (data: string) => {
  //   Linking.openURL(data).catch(() => console.log('Phone app not found'));
  // };

  // const handleSMS = async (data: string) => {
  //   const parts = data.replace(/smsto:/i, '').split(':');
  //   const num = parts[0] || '';
  //   const msg = parts.slice(1).join(':') || '';

  //   const separator = Platform.OS === 'ios' ? '&' : '?';
  //   const url = `sms:${num}${separator}body=${encodeURIComponent(msg)}`;
  //   Linking.openURL(url).catch(() => console.log('SMS app not found'));
  // };

  // const handleLocation = async (data: string) => {
  //   const coords = data.replace(/geo:/i, '');
  //   const url =
  //     Platform.OS === 'ios'
  //       ? `http://maps.apple.com/?ll=${coords}`
  //       : `geo:${coords}?q=${coords}`;

  //   Linking.openURL(url).catch(() => console.log('Map app not found'));
  // };

  // const handleEvent = (data: string) => {
  //   try {
  //     const event = parseEventData(data);

  //     const end = event.end || event.start;

  //     ContactModule.openEventForm(
  //       event.title || 'Event',
  //       event.location || '',
  //       event.start || '',
  //       end,
  //       event.notes || '',
  //     );
  //   } catch {
  //     setAlertConfig({
  //       visible: true,
  //       title: 'Event Error',
  //       message: `Failed to add event.`,
  //       confirmText: 'OK',
  //       onConfirm: () => setAlertConfig({ ...alertConfig, visible: false }),
  //       closeText: '',
  //       onClose: () => {},
  //     });
  //   }
  // };

  // const getQrButton = (data: string) => {
  //   switch (getQrType(data)) {
  //     case 'url':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleUrlButtonPress(data)}
  //           className="items-center  bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Open Link</Text>
  //         </TouchableOpacity>
  //       );

  //     case 'wifi':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleWifiConnect(data)}
  //           className="items-center  bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Join Wi-Fi</Text>
  //         </TouchableOpacity>
  //       );
  //     case 'vcard':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleVcard(data)}
  //           className="items-center  bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Save Contact</Text>
  //         </TouchableOpacity>
  //       );

  //     case 'email':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleEmail(data)}
  //           className="items-center bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Send Email</Text>
  //         </TouchableOpacity>
  //       );
  //     case 'phone':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handlePhone(data)}
  //           className="items-center bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Call Number</Text>
  //         </TouchableOpacity>
  //       );
  //     case 'sms':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleSMS(data)}
  //           className="items-center bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Send SMS</Text>
  //         </TouchableOpacity>
  //       );
  //     case 'location':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleLocation(data)}
  //           className="items-center bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">Open Map</Text>
  //         </TouchableOpacity>
  //       );
  //     case 'event':
  //       return (
  //         <TouchableOpacity
  //           onPress={() => handleEvent(data)}
  //           className="items-center bg-[#3B82F6] rounded-xl mr-2"
  //         >
  //           <Text className="text-white m-3 mx-5 font-bold">View Event</Text>
  //         </TouchableOpacity>
  //       );
  //     default:
  //       return null;
  //   }
  // };

  if (!hasPermission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 p-5">
        <Text className="text-2xl mb-2 font-bold">QR Scanner</Text>
        <View className="bg-white w-full p-8 rounded-3xl shadow-sm items-center">
          <Text className="text-xl font-bold text-gray-800 mb-2 text-center">
            Camera Access Required
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            You need to grant camera permission in your settings to read QR
            codes.
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="w-full bg-blue-500 py-4 rounded-xl items-center"
          >
            <Text className="text-white font-semibold text-lg">
              Request Permission
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (device == null) {
    return (
      <View className="absolute z-10 w-full h-full items-center justify-center bg-white/50 rounded-xl">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-400 mt-4 font-medium text-base">
          Starting Camera...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 mt-2">
      <Text className="text-2xl font-bold mb-5">QR Scanner</Text>
      <View className="h-[80%] w-[90%] overflow-hidden rounded-3xl bg-black ">
        {/* <Camera
          style={{ flex: 1 }}
          device={device}
          isActive={!scannedData}
          codeScanner={codeScanner}
          torch={isTorchOn && !scannedData ? 'on' : 'off'}
        /> */}

        <ReanimatedCamera
          style={{ flex: 1 }}
          device={device}
          isActive={isFocused && !scannedData}
          codeScanner={codeScanner}
          torch={isTorchOn && !scannedData ? 'on' : 'off'}
          animatedProps={animatedProps}
        />

        {!scannedData ? (
          <View className="absolute inset-0 items-center justify-center">
            <View className="w-64 h-64 relative">
              <View className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-2xl" />
            </View>
            {device.hasTorch && (
              <View className="absolute bg-white top-0 left-0 ml-5 mt-5 rounded-full z-[11]">
                <TouchableOpacity
                  className="p-2"
                  onPress={() => setIsTorchOn(!isTorchOn)}
                >
                  {isTorchOn ? <Zap size={25} /> : <ZapOff size={25} />}
                </TouchableOpacity>
              </View>
            )}
            {device && (
              <View className="absolute right-0 top-0 bottom-0 justify-center items-center w-12 z-10 bg-black/20 rounded-r-3xl">
                <Slider
                  style={{
                    width: 250,
                    height: 40,
                    transform: [{ rotate: '-90deg' }],
                  }}
                  minimumValue={device.minZoom}
                  maximumValue={device.maxZoom}
                  minimumTrackTintColor="#3B82F6"
                  maximumTrackTintColor="#FFFFFF80"
                  thumbTintColor="#FFFFFF"
                  value={device.neutralZoom}
                  onValueChange={val => {
                    zoom.value = val;
                  }}
                />
              </View>
            )}
            <View className="flex-row items-center absolute bottom-0 left-0 ml-5 mb-5 bg-white/90 px-3 py-1.5 rounded-full z-10">
              <Shield color="#16A34A" size={16} />
              <Text className=" text-gray-800 text-xs font-bold ml-1.5 uppercase tracking-wider">
                OFFLINE & SECURE
              </Text>
            </View>
            <Text className="text-white text-sm font-medium mt-6 bg-black/50 px-4 py-2 rounded-full">
              Align QR code within the frame
            </Text>
          </View>
        ) : (
          <View className="absolute inset-0 items-center justify-center bg-white/50">
            <TouchableOpacity onPress={() => setScannedData(null)}>
              <RefreshCw size={50} color={'#3B82F6'} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ScannerModal
        isVisible={!!scannedData}
        scannedData={scannedData}
        onClose={() => setScannedData(null)}
      />
    </View>
  );
}
