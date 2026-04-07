import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  NativeModules,
} from 'react-native';
import {
  X,
  Copy,
  Link,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { triggerHaptic } from '../utils/haptic';
import {
  getQrType,
  parseWifiData,
  parseVcardData,
  parseEmailData,
  parseEventData,
  parseSmsData,
} from '../utils/qrParser';
import CustomAlert from './CustomAlert';

const { ContactModule } = NativeModules;

interface ScannerModalProps {
  isVisible: boolean;
  scannedData: string | null;
  onClose: () => void;
}

export default function ScannerModal({
  isVisible,
  scannedData,
  onClose,
}: ScannerModalProps) {
  const [showRaw, setShowRaw] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    closeText: '',
    onClose: () => {},
    onConfirm: () => {},
  });

  if (!scannedData) return;

  const type = getQrType(scannedData);

  const copyToClipboard = (text: string) => {
    triggerHaptic();
    Clipboard.setString(text);
  };

  const handleAction = async () => {
    triggerHaptic();

    try {
      switch (type) {
        case 'url': {
          const supported = await Linking.canOpenURL(scannedData);

          if (supported) {
            await Linking.openURL(scannedData);
          } else {
            setAlertConfig({
              ...alertConfig,
              visible: true,
              title: 'Invalid URL',
              message: `Don't know how to open this URL: ${scannedData}`,
              confirmText: 'OK',
              onConfirm: () =>
                setAlertConfig({ ...alertConfig, visible: false }),
              closeText: '',
              onClose: () => {},
            });
          }
          break;
        }
        case 'wifi': {
          const wifi = parseWifiData(scannedData);
          Clipboard.setString(wifi.password);
          setAlertConfig({
            visible: true,
            title: 'Password Copied',
            message: `Now we will take you to the Wi-Fi settings. You can find the network named ${wifi.ssid} in the network list and then find the password.`,
            confirmText: 'Settings',
            onConfirm: () => {
              if (Platform.OS === 'android') {
                Linking.sendIntent('android.settings.WIFI_SETTINGS');
              } else {
                Linking.openURL('App-Prefs:WIFI');
              }
            },
            closeText: 'Cancel',
            onClose: () => setAlertConfig({ ...alertConfig, visible: false }),
          });
          break;
        }

        case 'vcard':
          const vcard = parseVcardData(scannedData);
          ContactModule.openContactForm(
            vcard.fn,
            vcard.tel,
            vcard.email,
            vcard.title,
            vcard.org,
            vcard.url,
          );
          break;
        case 'email': {
          const mail = parseEmailData(scannedData);
          Linking.openURL(
            `mailto:${mail.email}?subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`,
          );
          break;
        }
        case 'phone':
          Linking.openURL(scannedData);
          break;
        case 'sms': {
          const sms = parseSmsData(scannedData);
          const sep = Platform.OS === 'ios' ? '&' : '?';
          Linking.openURL(
            `sms:${sms.phone}${sep}body=${encodeURIComponent(sms.message)}`,
          );
          break;
        }
        case 'location': {
          const coords = scannedData.replace(/geo:/i, '');
          const mapUrl =
            Platform.OS === 'ios'
              ? `http://maps.apple.com/?ll=${coords}`
              : `geo:${coords}?q=${coords}`;
          Linking.openURL(mapUrl);
          break;
        }
        case 'event': {
          const event = parseEventData(scannedData);
          const end = event.end || event.start;
          ContactModule.openEventForm(
            event.title,
            event.location || '',
            event.start || '',
            end,
            event.notes || '',
          );
          break;
        }
        case 'text':
      }
    } catch {
      setAlertConfig({
        visible: true,
        title: 'Action Failed',
        message: `Failed to process.`,
        confirmText: 'OK',
        onConfirm: () => setAlertConfig({ ...alertConfig, visible: false }),
        closeText: '',
        onClose: () => {},
      });
    }
  };

  const getHeaderInfo = () => {
    const props = { size: 24, color: '#3B82F6' };
    switch (type) {
      case 'url':
        return { icon: <Link {...props} />, title: 'Website URL' };
      case 'wifi':
        return { icon: <Wifi {...props} />, title: 'Wi-Fi Network' };
      case 'vcard':
        return { icon: <Contact {...props} />, title: 'Contact (vCard)' };
      case 'email':
        return { icon: <Mail {...props} />, title: 'Email Address' };
      case 'phone':
        return { icon: <Phone {...props} />, title: 'Phone Number' };
      case 'sms':
        return { icon: <MessageSquare {...props} />, title: 'SMS Message' };
      case 'location':
        return { icon: <MapPin {...props} />, title: 'Location Coordinates' };
      case 'event':
        return { icon: <Calendar {...props} />, title: 'Calendar Event' };
      default:
        return { icon: <FileText {...props} />, title: 'Plain Text' };
    }
  };

  const getActionText = () => {
    switch (type) {
      case 'url':
        return 'Open Website';
      case 'wifi':
        return 'Join Network';
      case 'vcard':
        return 'Save Contact';
      case 'email':
        return 'Send Email';
      case 'phone':
        return 'Call Number';
      case 'sms':
        return 'Send Message';
      case 'location':
        return 'Open in Maps'; // Düzeltilen İngilizce
      case 'event':
        return 'Add to Calendar';
      default:
        return `Action (${type})`;
    }
  };

  const getCopyString = () => {
    if (type === 'wifi') {
      const w = parseWifiData(scannedData);
      return `SSID: ${w.ssid}\nPassword: ${w.password || 'None'}`;
    }
    if (type === 'vcard') {
      const v = parseVcardData(scannedData);
      return `${v.fn}\n${v.tel}`;
    }
    if (type === 'email') {
      const e = parseEmailData(scannedData);
      return `To: ${e.email}${e.subject ? `\nSubject: ${e.subject}` : ''}`;
    }
    if (type === 'event') {
      const ev = parseEventData(scannedData);
      return ev.title;
    }
    if (type === 'sms') {
      return parseSmsData(scannedData).phone;
    }
    return scannedData.replace(/^(tel:|mailto:|geo:)/i, '');
  };

  const renderParsedData = () => {
    if (type === 'wifi') {
      const w = parseWifiData(scannedData);
      return (
        <Text className="text-gray-700 text-base">
          SSID: <Text className="font-bold">{w.ssid}</Text>
          {'\n'}Password:{' '}
          <Text className="font-bold">{w.password || 'None'}</Text>
        </Text>
      );
    }
    if (type === 'vcard') {
      const v = parseVcardData(scannedData);
      return (
        <Text className="text-gray-700 text-base">
          <Text className="font-bold">{v.fn}</Text>
          {'\n'}
          {v.tel}
        </Text>
      );
    }
    if (type === 'email') {
      const e = parseEmailData(scannedData);
      return (
        <Text className="text-gray-700 text-base">
          To: <Text className="font-bold">{e.email}</Text>
          {e.subject ? `\nSubject: ${e.subject}` : ''}
        </Text>
      );
    }
    if (type === 'event') {
      const ev = parseEventData(scannedData);
      return (
        <Text className="text-gray-700 text-base font-bold">{ev.title}</Text>
      );
    }
    return (
      <Text className="text-gray-700 text-base font-medium">
        {type === 'sms'
          ? parseSmsData(scannedData).phone
          : scannedData.replace(/^(tel:|mailto:|geo:)/i, '')}
      </Text>
    );
  };

  const header = getHeaderInfo();

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white p-6 rounded-t-3xl max-h-[90%]">
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center space-x-3">
              <View className="bg-blue-50 p-3 rounded-full">{header.icon}</View>
              <Text className="text-gray-800 text-xl font-bold ml-3">
                {header.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setShowRaw(false);
                onClose();
              }}
              className="bg-gray-100 p-2 rounded-full"
            >
              <X size={20} color={'gray'} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="bg-gray-50 border border-gray-200 p-4 rounded-2xl mb-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1 mr-3 justify-center">
                  {renderParsedData()}
                </View>
                <TouchableOpacity
                  onPress={() => copyToClipboard(getCopyString())}
                  className="p-2 bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <Copy size={18} color={'gray'} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setShowRaw(!showRaw)}
              className="flex-row items-center justify-center py-2 mb-2"
            >
              <Text className="text-gray-400 font-medium mr-1">
                {showRaw ? 'Hide Raw Data' : 'Show Raw Data'}
              </Text>
              {showRaw ? (
                <ChevronUp size={16} color="gray" />
              ) : (
                <ChevronDown size={16} color="gray" />
              )}
            </TouchableOpacity>
            {showRaw && (
              <View className="bg-gray-800 p-4 rounded-xl mb-4">
                <ScrollView style={{ maxHeight: 120 }}>
                  <Text className="text-green-400 font-mono text-xs">
                    {scannedData}
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  onPress={() => copyToClipboard(scannedData)}
                  className="absolute top-2 right-2 p-2 bg-gray-700 rounded-lg"
                >
                  <Copy size={16} color={'white'} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
          {type !== 'text' && (
            <TouchableOpacity
              onPress={handleAction}
              className="w-full bg-blue-500 rounded-xl py-4 items-center mt-2 shadow-sm"
            >
              <Text className="text-white font-bold text-lg">
                {getActionText()}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        closeText={alertConfig.closeText}
        onClose={alertConfig.onClose}
      />
    </Modal>
  );
}
