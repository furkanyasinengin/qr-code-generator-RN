import { useRef, useState, useEffect } from 'react';
import { useImage } from '@shopify/react-native-skia';
import { launchImageLibrary } from 'react-native-image-picker';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, View, ActivityIndicator } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Link, Wifi, Contact, FileText, Pencil } from 'lucide-react-native';
import { getQRCode } from '../utils/qrGenerator';
import DataModal from '../components/DataModal';

import { QRCanvas } from '../components/QRCanvas';
import ColorSelector from '../components/ColorSelector';
import ActionButtons from '../components/ActionButtons';
import IconSelector from '../components/IconSelector';

export function GeneratorScreen() {
  const canvasRef = useRef<any>(null);

  const [logo, setLogo] = useState<string | null>(null);

  const [qrSize, setQrSize] = useState<number>(25);
  const [qrData, setQrData] = useState<Uint8Array | []>([]);
  const [qrSquareSize, setQrSquareSize] = useState<number>(0);

  const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');

  const [activeTab, setActiveTab] = useState<'data' | 'eye' | 'bg'>('data');

  const [savedPreview, setSavedPreview] = useState<string | null>(null);

  const [isDataModalVisible, setIsDataModalVisible] = useState(false);

  const [qrType, setQrType] = useState('url');

  const [formData, setFormData] = useState({
    url: 'https://www.example-site.com',
    text: '',
    wifiName: '',
    wifiIsHidden: false,
    wifiEncryption: 'WPA/WPA2',
    wifiPassword: '',
    vcardName: '',
    vcardPhone: '',
    vcardEmail: '',
    vcardCompany: '',
    vcardWorkTitle: '',
    // vcardWorkPhone: '',
    // vcardFax: '',
    // vcardStreet: '',
    // vcardCity: '',
    // vcardRegion: '',
    // vcardPostCode: '',
    vcardWebsite: '',
  });

  const { width } = Dimensions.get('window');
  const CANVAS_SIZE = width * 0.65;
  const LOGO_SIZE = CANVAS_SIZE * 0.25;
  const PADDING = 10;

  const EXPORT_SIZE = 1024;
  const EXPORT_LOGO_SIZE = EXPORT_SIZE * 0.25;
  const EXPORT_PADDING = 40;
  const exportQrSquareSize =
    qrSize > 0 ? (EXPORT_SIZE - EXPORT_PADDING * 2) / qrSize : 0;

  const exportCanvasRef = useRef<any>(null);

  const skiaLogo = useImage(logo);

  useEffect(() => {
    const generateQRString = () => {
      switch (qrType) {
        case 'wifi': {
          const wifiArray = [];
          wifiArray.push(`S:${formData.wifiName}`);
          if (formData.wifiEncryption === 'None') {
            wifiArray.push(`T:nopass`);
          } else {
            wifiArray.push(`T:${formData.wifiEncryption}`);
            wifiArray.push(`P:${formData.wifiPassword}`);
          }
          if (formData.wifiIsHidden) {
            wifiArray.push(`H:true`);
          }
          return `WIFI:${wifiArray.join(';')};;`;
        }
        case 'vcard': {
          const vcardArray = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${formData.vcardName}`,
            `TEL:${formData.vcardPhone}`,
          ];
          if (formData.vcardEmail) {
            vcardArray.push(`EMAIL:${formData.vcardEmail}`);
          }
          if (formData.vcardCompany) {
            vcardArray.push(`ORG:${formData.vcardCompany}`);
          }
          if (formData.vcardWorkTitle) {
            vcardArray.push(`TITLE:${formData.vcardWorkTitle}`);
          }
          if (formData.vcardWebsite) {
            vcardArray.push(`URL:${formData.vcardWebsite}`);
          }
          vcardArray.push('END:VCARD');
          return vcardArray.join('\n');
        }
        case 'text':
          return formData.text || ' ';
        case 'url':
        default:
          return formData.url || ' ';
      }
    };

    const finalQrString = generateQRString();
    if (!finalQrString.trim()) return;

    const qrObject = getQRCode(finalQrString);

    const { size, data } = qrObject.modules;
    setQrSize(size);
    setQrData(data);
    setQrSquareSize((CANVAS_SIZE - PADDING * 2) / size);
  }, [qrType, formData, CANVAS_SIZE]);

  const getActiveColor = () => {
    if (activeTab === 'data') return primaryColor;
    if (activeTab === 'eye') return secondaryColor;
    return backgroundColor;
  };

  const triggerHaptic = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  };

  const handleLogoSelect = async () => {
    triggerHaptic();
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
    triggerHaptic();
    // const image = canvasRef.current?.makeImageSnapshot();
    const image = exportCanvasRef.current?.makeImageSnapshot();
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
    triggerHaptic();
    // const image = canvasRef.current?.makeImageSnapshot();
    const image = exportCanvasRef.current?.makeImageSnapshot();
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

  const handleLogoToggle = () => {
    if (logo) {
      setLogo(null);
    } else {
      handleLogoSelect();
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      behavior={'padding'}
      className="flex-1 bg-gray-100"
    >
      <View className="flex-1 w-full">
        {logo && !skiaLogo && (
          <View className="absolute z-10 w-full h-full items-center justify-center bg-white/50 rounded-xl">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        )}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            // paddingVertical: 50,
            paddingTop: 50,
          }}
        >
          <Text className="text-2xl mb-2 font-bold mt-10">QR Generator</Text>
          <QRCanvas
            ref={canvasRef}
            qrData={qrData}
            qrSize={qrSize}
            qrSquareSize={qrSquareSize}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            backgroundColor={backgroundColor}
            skiaLogo={skiaLogo}
            canvasSize={CANVAS_SIZE}
            logoSize={LOGO_SIZE}
            padding={PADDING}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic();
              setIsDataModalVisible(true);
            }}
            className="w-[90%] bg-white p-4 rounded-xl my-4 border border-gray-200 shadow-sm flex-row items-center"
          >
            <View className="bg-gray-50 p-2.5 rounded-full mr-3 border border-gray-100">
              <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                {qrType === 'url' ? (
                  <Link size={20} color="#6B7280" />
                ) : qrType === 'wifi' ? (
                  <Wifi size={20} color="#6B7280" />
                ) : qrType === 'vcard' ? (
                  <Contact size={20} color="#6B7280" />
                ) : (
                  <FileText size={20} color="#6B7280" />
                )}
              </Text>
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {qrType} Data
              </Text>
              <Text
                className="text-gray-800 font-bold text-base"
                numberOfLines={1}
              >
                {qrType === 'url'
                  ? formData.url
                  : qrType === 'wifi'
                    ? formData.wifiName || 'Network Name Missing'
                    : qrType === 'vcard'
                      ? formData.vcardName || 'Name Missing'
                      : formData.text || 'Text Missing'}
              </Text>
            </View>
            <View className="bg-blue-50 p-2 rounded-full ml-3">
              <Pencil size={18} color="#3B82F6" />
            </View>
          </TouchableOpacity>
          <ColorSelector
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            activeColor={getActiveColor()}
            triggerHaptic={triggerHaptic}
            onColorSelect={color => {
              if (activeTab === 'data') setPrimaryColor(color);
              else if (activeTab === 'eye') setSecondaryColor(color);
              else if (activeTab === 'bg') setBackgroundColor(color);
            }}
          />
          <IconSelector
            triggerHaptic={triggerHaptic}
            activeIcon={logo}
            onGallerySelect={handleLogoSelect}
            onIconSelect={icon => setLogo(icon)}
          />
          <ActionButtons
            hasLogo={!!logo}
            onLogoSelect={handleLogoToggle}
            onShare={handleShare}
            onSave={handleSaveToGallery}
          />
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
      <DataModal
        isVisible={isDataModalVisible}
        onClose={() => setIsDataModalVisible(false)}
        qrType={qrType}
        setQrType={setQrType}
        formData={formData}
        setFormData={setFormData}
      />
      {/* YÜKSEK ÇÖZÜNÜRLÜKLÜ GİZLİ EXPORT CANVAS'I */}
      <View
        className="absolute opacity-0 pointer-events-none"
        style={{ left: -10000 }}
      >
        <QRCanvas
          ref={exportCanvasRef}
          qrData={qrData}
          qrSize={qrSize}
          qrSquareSize={exportQrSquareSize}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          backgroundColor={backgroundColor}
          skiaLogo={skiaLogo}
          canvasSize={EXPORT_SIZE}
          logoSize={EXPORT_LOGO_SIZE}
          padding={EXPORT_PADDING}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
