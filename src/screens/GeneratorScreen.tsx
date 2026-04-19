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
  Switch,
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
  const [designTab, setDesignTab] = useState<
    'data' | 'colors' | 'shapes' | 'logo'
  >('data');

  const [qrDesign, setQrDesign] = useState({
    primaryColor: '#000000',
    secondaryColor: '#000000',
    backgroundColor: '#FFFFFF',
    isGradient: false,
    gradientColor: '#3B82F6',
    gradientDirection: 'horizontal',
    dotShape: 'square',
    eyeShape: 'square',
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
            // primaryColor={qrDesign.primaryColor}
            // secondaryColor={qrDesign.secondaryColor}
            // backgroundColor={qrDesign.backgroundColor}
            design={qrDesign}
            skiaLogo={skiaLogo}
            canvasSize={CANVAS_SIZE}
            logoSize={LOGO_SIZE}
            padding={PADDING}
          />
          <View className="px-3 py-2 mt-2  flex-row items-center">
            {qrSize > 45 && (
              <Text className="px-3 py-2 bg-yellow-50 text-yellow-700 text-xs font-medium border border-yellow-200 rounded-lg">
                Data is dense. Some old cameras might struggle to scan.
              </Text>
            )}
          </View>

          <View className="flex-row bg-gray-200 p-1 rounded-2xl mx-5 my-4">
            {['data', 'colors', 'shapes', 'logo'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => {
                  triggerHaptic();
                  setDesignTab(tab as any);
                }}
                className={`flex-1 py-2 rounded-xl items-center ${
                  designTab === tab ? 'bg-white' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-sm font-bold capitalize ${
                    designTab === tab ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {designTab === 'data' && (
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
          )}

          {designTab === 'colors' && (
            <View className="w-[90%] bg-white py-3 px-2 my-4 rounded-xl border border-gray-200">
              <View className="flex-row items-center justify-between mb-4 px-2">
                <Text className="font-bold text-gray-700 text-base">
                  Enable Gradient
                </Text>
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                  thumbColor={qrDesign.isGradient ? '#3b82f6' : '#f3f4f6'}
                  value={qrDesign.isGradient}
                  onValueChange={val => {
                    triggerHaptic();
                    setQrDesign(prev => ({ ...prev, isGradient: val }));
                    if (val && activeTab === 'eye') {
                      setActiveTab('data');
                    }
                  }}
                />
              </View>

              <ColorSelector
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeColor={getActiveColor()}
                triggerHaptic={triggerHaptic}
                isGradient={qrDesign.isGradient}
                gradientColor={qrDesign.gradientColor}
                onColorSelect={color => {
                  if (activeTab === 'data') {
                    setQrDesign(prev => ({
                      ...prev,
                      primaryColor: color,
                      ...(prev.isGradient ? { secondaryColor: color } : {}),
                    }));
                  } else if (activeTab === 'eye') {
                    setQrDesign(prev => ({ ...prev, secondaryColor: color }));
                  } else if (activeTab === 'bg') {
                    setQrDesign(prev => ({ ...prev, backgroundColor: color }));
                  }
                }}
                onGradientColorSelect={color => {
                  setQrDesign(prev => ({ ...prev, gradientColor: color }));
                }}
              />
              {qrDesign.isGradient && activeTab === 'data' && (
                <View className="px-2 mt-4">
                  <Text className="text-gray-500 font-bold text-xs mb-2">
                    GRADIENT DIRECTION
                  </Text>
                  <View className="flex-row justify-between">
                    {['horizontal', 'vertical', 'diagonal'].map(dir => (
                      <TouchableOpacity
                        key={dir}
                        onPress={() => {
                          triggerHaptic();
                          setQrDesign(prev => ({
                            ...prev,
                            gradientDirection: dir,
                          }));
                        }}
                        className={`flex-1 mx-1 py-2 items-center rounded-lg border ${
                          qrDesign.gradientDirection === dir
                            ? 'bg-blue-50 border-blue-400'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Text
                          className={`capitalize font-semibold text-sm ${
                            qrDesign.gradientDirection === dir
                              ? 'text-blue-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {dir}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {designTab === 'shapes' && (
            <View className="w-[90%] bg-white p-4 my-4 rounded-xl border border-gray-200">
              <Text className="text-gray-700 font-bold mb-3">
                Pattern Style
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {[
                  { id: 'square', label: 'Classic' },
                  { id: 'rounded', label: 'Rounded' },
                  { id: 'dots', label: 'Dots' },
                  { id: 'vertical', label: 'Vertical' },
                  { id: 'horizontal', label: 'Horizontal' },
                  { id: 'squircle', label: 'Squircle' },
                ].map(shape => (
                  <TouchableOpacity
                    key={shape.id}
                    onPress={() => {
                      triggerHaptic();
                      setQrDesign(prev => ({ ...prev, dotShape: shape.id }));
                    }}
                    className={`w-[31%] py-3 items-center rounded-lg border ${
                      qrDesign.dotShape === shape.id
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        qrDesign.dotShape === shape.id
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {shape.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text className="text-gray-700 font-bold mb-3">
                Eye Style (Corners)
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { id: 'square', label: 'Square' },
                  { id: 'rounded', label: 'Rounded' },

                  { id: 'dots', label: 'Dots' },
                  { id: 'diamond', label: 'Diamond' },
                ].map(shape => (
                  <TouchableOpacity
                    key={shape.id}
                    onPress={() => {
                      triggerHaptic();
                      setQrDesign(prev => ({ ...prev, eyeShape: shape.id }));
                    }}
                    className={`w-[31%] py-3 items-center rounded-lg border ${
                      qrDesign.eyeShape === shape.id
                        ? 'bg-blue-50 border-blue-400'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        qrDesign.eyeShape === shape.id
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {shape.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {designTab === 'logo' && (
            <IconSelector
              triggerHaptic={triggerHaptic}
              activeIcon={logo}
              onGallerySelect={handleLogoSelect}
              onIconSelect={icon => setLogo(icon)}
            />
          )}

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
          design={qrDesign}
          // primaryColor={qrDesign.primaryColor}
          // secondaryColor={qrDesign.secondaryColor}
          // backgroundColor={qrDesign.backgroundColor}
          skiaLogo={skiaLogo}
          canvasSize={EXPORT_SIZE}
          logoSize={EXPORT_LOGO_SIZE}
          padding={EXPORT_PADDING}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
