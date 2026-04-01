import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useEffect, useState } from 'react';
import UrlForm from './forms/UrlForm';
import TextForm from './forms/TextForm';
import WifiForm from './forms/WifiForm';
import VCardForm from './forms/VCardForm';
import CustomAlert from './CustomAlert';

export interface FormDataState {
  url: string;
  text: string;
  wifiName: string;
  wifiIsHidden: boolean;
  wifiEncryption: string;
  wifiPassword: string;
  vcardName: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardCompany: string;
  vcardWorkTitle: string;
  // vcardWorkPhone: string;
  // vcardFax: string;
  // vcardStreet: string;
  // vcardCity: string;
  // vcardRegion: string;
  // vcardPostCode: string;
  vcardWebsite: string;
}

interface DataModalProps {
  isVisible: boolean;
  onClose: () => void;
  qrType: string;
  setQrType: (type: string) => void;
  formData: FormDataState;
  setFormData: (data: FormDataState) => void;
}
export default function DataModal({
  isVisible,
  onClose,
  qrType,
  setQrType,
  formData,
  setFormData,
}: DataModalProps) {
  const [localQrType, setLocalQrType] = useState(qrType);
  const [localFormData, setLocalFormData] = useState(formData);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    // onConfirm: () => {},
  });

  useEffect(() => {
    if (isVisible) {
      setLocalQrType(qrType);
      setLocalFormData(formData);
    }
  }, [isVisible, qrType, formData]);

  const triggerHaptic = () => {
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  };

  const qrTypeOptions = [
    { id: 'url', label: 'URL' },
    { id: 'text', label: 'Text' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'vcard', label: 'Contact' },
  ];

  const handleSave = () => {
    triggerHaptic();

    if (localQrType === 'url') {
      if (!localFormData.url.trim()) {
        setAlertConfig({
          visible: true,
          title: 'Validation Error',
          message: 'Website URL cannot be empty.',
          // onConfirm:
          confirmText: 'OK',
        });
        return;
      }
    }

    if (localQrType === 'text') {
      if (!localFormData.text.trim()) {
        setAlertConfig({
          visible: true,
          title: 'Validation Error',
          message: 'Plain text cannot be empty.',
          // onConfirm:
          confirmText: 'OK',
        });
        return;
      }
    }

    if (localQrType === 'wifi') {
      if (!localFormData.wifiName.trim()) {
        setAlertConfig({
          visible: true,
          title: 'Validation Error',
          message: 'Network Name (SSID) cannot be empty.',
          // onConfirm:
          confirmText: 'OK',
        });
        return;
      }

      if (
        localFormData.wifiEncryption !== 'None' &&
        !localFormData.wifiPassword.trim()
      ) {
        setAlertConfig({
          visible: true,
          title: 'Validation Error',
          message: 'Password is required for secured networks.',
          // onConfirm:
          confirmText: 'OK',
        });
        return;
      }
    }

    if (localQrType === 'vcard') {
      if (!localFormData.vcardName.trim() || !localFormData.vcardPhone.trim()) {
        setAlertConfig({
          visible: true,
          title: 'Validation Error',
          message: 'Name and Phone number are required.',
          // onConfirm:
          confirmText: 'OK',
        });
        return;
      }
    }

    setQrType(localQrType);
    setFormData(localFormData);
    onClose();
  };
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
            <Text className="text-xl font-bold text-black">Edit QR Data</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="gray" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-6"
            >
              {qrTypeOptions.map(item => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    triggerHaptic();
                    setLocalQrType(item.id);
                  }}
                  className={`flex-row items-center px-4 py-2 mr-3 rounded-full ${localQrType === item.id ? 'bg-blue-500' : 'bg-gray-100'}`}
                >
                  <Text
                    className={`${localQrType === item.id ? 'text-white font-bold' : 'text-gray-600 font-medium'}`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mb-4">
              {/* URL FORM */}
              {localQrType === 'url' && (
                <UrlForm data={localFormData} onChange={setLocalFormData} />
              )}

              {/* TEXT FORM */}
              {localQrType === 'text' && (
                <TextForm data={localFormData} onChange={setLocalFormData} />
              )}

              {/* WIFI FORM */}
              {localQrType === 'wifi' && (
                <WifiForm
                  data={localFormData}
                  onChange={setLocalFormData}
                  triggerHaptic={triggerHaptic}
                />
              )}

              {/* VCARD FORM */}
              {localQrType === 'vcard' && (
                <VCardForm data={localFormData} onChange={setLocalFormData} />
              )}
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleSave}
            className="w-full bg-blue-500 rounded-xl py-4 items-center mt-4 shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Apply & Save</Text>
          </TouchableOpacity>
        </View>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </Modal>
  );
}
