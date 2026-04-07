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
import {
  Link,
  Wifi,
  Contact,
  FileText,
  Pencil,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
} from 'lucide-react-native';
import { useStore } from '../store/useStore';
import { generateQRString, getQRCode } from '../utils/qrGenerator';
import DataModal from '../components/DataModal';

import { QRCanvas } from '../components/QRCanvas';
import ColorSelector from '../components/ColorSelector';
import ActionButtons from '../components/ActionButtons';
import IconSelector from '../components/IconSelector';
import { triggerHaptic } from '../utils/haptic';

export function GeneratorScreen({ route, navigation }: any) {
  const canvasRef = useRef<any>(null);

  const [logo, setLogo] = useState<string | null>(null);

  const [qrSize, setQrSize] = useState<number>(25);
  const [qrData, setQrData] = useState<Uint8Array | []>([]);
  const [qrSquareSize, setQrSquareSize] = useState<number>(0);

  // const [primaryColor, setPrimaryColor] = useState<string>('#000000');
  // const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  // const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [qrDesign, setQrDesign] = useState({
    primaryColor: '#000000',
    secondaryColor: '#000000',
    backgroundColor: '#FFFFFF',
    // İleride buraya gradient: false, dotShape: 'rounded' gibi şeyler de ekleyebilirsin
  });

  const [activeTab, setActiveTab] = useState<'data' | 'eye' | 'bg'>('data');

  const [savedPreview, setSavedPreview] = useState<string | null>(null);

  const [isDataModalVisible, setIsDataModalVisible] = useState(false);

  const addHistoryItem = useStore(state => state.addHistoryItem);

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
    emailTo: '',
    emailSubject: '',
    emailBody: '',
    // Phone
    phoneNum: '',
    // SMS
    smsNum: '',
    smsMsg: '',
    // Location
    geoLat: '',
    geoLng: '',
    // Event
    eventTitle: '',
    eventLocation: '',
    eventStart: '', // Format: YYYYMMDDTHHMMSSZ
    eventEnd: '', // Format: YYYYMMDDTHHMMSSZ
    eventNotes: '',
  });

  const { width } = Dimensions.get('window');
  const CANVAS_SIZE = width * 0.65;
  const LOGO_SIZE = CANVAS_SIZE * 0.2;
  const PADDING = 10;

  const EXPORT_SIZE = 1024;
  const EXPORT_LOGO_SIZE = EXPORT_SIZE * 0.2;
  const EXPORT_PADDING = 40;
  const exportQrSquareSize =
    qrSize > 0 ? (EXPORT_SIZE - EXPORT_PADDING * 2) / qrSize : 0;

  const exportCanvasRef = useRef<any>(null);

  const skiaLogo = useImage(logo);

  const saveToHistory = () => {
    const finalQrString = generateQRString(qrType, formData);
    if (!finalQrString.trim()) return;

    addHistoryItem({
      source: 'create',
      qrType: qrType,
      rawData: finalQrString,
      parsedData: formData,
    });
  };

  useEffect(() => {
    const finalQrString = generateQRString(qrType, formData);
    if (!finalQrString.trim()) return;

    const hasLogo = skiaLogo !== null;
    const qrObject = getQRCode(finalQrString, hasLogo);

    const { size, data } = qrObject.modules;
    setQrSize(size);
    setQrData(data);
    setQrSquareSize((CANVAS_SIZE - PADDING * 2) / size);
  }, [qrType, formData, CANVAS_SIZE, skiaLogo]);

  const getActiveColor = () => {
    if (activeTab === 'data') return qrDesign.primaryColor;
    if (activeTab === 'eye') return qrDesign.secondaryColor;
    return qrDesign.backgroundColor;
  };

  useEffect(() => {
    if (route.params?.editData && route.params?.qrType) {
      const { editData, qrType: incomingType } = route.params;

      setQrType(incomingType);
      setFormData(editData);

      navigation.setParams({ editData: undefined, qrType: undefined });
    }
  }, [route.params, navigation]);

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
        saveToHistory();
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
      saveToHistory();
      setSavedPreview(`file://${filePath}`);
      setTimeout(() => {
        setSavedPreview(null);
        RNFS.unlink(filePath).catch(() => {});
      }, 3000);
    } catch (e) {
      console.log(e);
    }
  };

  const getPreviewText = () => {
    switch (qrType) {
      case 'url':
        return formData.url || 'URL Missing';
      case 'text':
        return formData.text || 'Text Missing';
      case 'wifi':
        return formData.wifiName || 'Network Name Missing';
      case 'vcard':
        return formData.vcardName || 'Name Missing';
      case 'email':
        return formData.emailTo || 'Email Missing';
      case 'phone':
        return formData.phoneNum || 'Phone Missing';
      case 'sms':
        return formData.smsNum || 'Number Missing';
      case 'location':
        return formData.geoLat && formData.geoLng
          ? `${formData.geoLat}, ${formData.geoLng}`
          : 'Location Missing';
      case 'event':
        return formData.eventTitle || 'Event Title Missing';
      default:
        return 'Data Missing';
    }
  };

  const getPreviewIcon = () => {
    const props = { size: 20, color: '#6B7280' };
    switch (qrType) {
      case 'url':
        return <Link {...props} />;
      case 'wifi':
        return <Wifi {...props} />;
      case 'vcard':
        return <Contact {...props} />;
      case 'email':
        return <Mail {...props} />;
      case 'phone':
        return <Phone {...props} />;
      case 'sms':
        return <MessageSquare {...props} />;
      case 'location':
        return <MapPin {...props} />;
      case 'event':
        return <Calendar {...props} />;
      case 'text':
      default:
        return <FileText {...props} />;
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
      behavior={'padding'}
      className="flex-1 bg-gray-100 mt-5"
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
            paddingTop: 30,
          }}
        >
          <Text className="text-2xl mb-2 font-bold">QR Generator</Text>
          <QRCanvas
            ref={canvasRef}
            qrData={qrData}
            qrSize={qrSize}
            qrSquareSize={qrSquareSize}
            primaryColor={qrDesign.primaryColor}
            secondaryColor={qrDesign.secondaryColor}
            backgroundColor={qrDesign.backgroundColor}
            skiaLogo={skiaLogo}
            canvasSize={CANVAS_SIZE}
            logoSize={LOGO_SIZE}
            padding={PADDING}
          />
          {qrSize > 45 && (
            <View className="bg-yellow-50 px-3 py-2 rounded-lg mt-2 border border-yellow-200 flex-row items-center">
              <Text className="text-yellow-700 text-xs font-medium">
                Data is dense. Some old cameras might struggle to scan.
              </Text>
            </View>
          )}
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              triggerHaptic();
              setIsDataModalVisible(true);
            }}
            className="w-[90%] bg-white p-4 rounded-xl my-4 border border-gray-200 shadow-sm flex-row items-center"
          >
            {/* İKON KISMI */}
            <View className="bg-gray-50 p-2.5 rounded-full mr-3 border border-gray-100">
              <Text className="text-gray-500 text-xs font-bold uppercase mb-1">
                {getPreviewIcon()}
              </Text>
            </View>

            {/* METİN KISMI */}
            <View className="flex-1 justify-center">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                {qrType} Data
              </Text>
              <Text
                className="text-gray-800 font-bold text-base"
                numberOfLines={1}
              >
                {getPreviewText()}
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
              if (activeTab === 'data')
                setQrDesign(prev => ({ ...prev, primaryColor: color }));
              else if (activeTab === 'eye')
                setQrDesign(prev => ({ ...prev, secondaryColor: color }));
              else if (activeTab === 'bg')
                setQrDesign(prev => ({ ...prev, backgroundColor: color }));
            }}
          />
          <IconSelector
            triggerHaptic={triggerHaptic}
            activeIcon={logo}
            onGallerySelect={handleLogoSelect}
            onIconSelect={icon => setLogo(icon)}
          />
          <ActionButtons onShare={handleShare} onSave={handleSaveToGallery} />
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
          primaryColor={qrDesign.primaryColor}
          secondaryColor={qrDesign.secondaryColor}
          backgroundColor={qrDesign.backgroundColor}
          skiaLogo={skiaLogo}
          canvasSize={EXPORT_SIZE}
          logoSize={EXPORT_LOGO_SIZE}
          padding={EXPORT_PADDING}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
