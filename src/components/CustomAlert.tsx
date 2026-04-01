import { Text, TouchableOpacity, View } from 'react-native';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText: string;
  onClose?: () => void;
  closeText?: string;
}
export default function CustomAlert({
  visible,
  title,
  message,
  onConfirm,
  confirmText,
  onClose,
  closeText,
}: CustomAlertProps) {
  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-50 justify-center items-center bg-black/50">
      <View className="bg-white w-5/6 p-6 rounded-2xl shadow-lg">
        <Text className="text-xl font-bold text-gray-900 mb-2">{title}</Text>
        <Text className="text-base text-gray-600">{message}</Text>
        <View className="flex-row justify-end mt-6 gap-3">
          {closeText && (
            <TouchableOpacity
              className="px-5 py-2.5 rounded-xl bg-gray-100"
              onPress={onClose}
            >
              <Text className="text-gray-700 font-bold">{closeText}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onConfirm}
            className="px-5 py-2.5 rounded-xl bg-blue-500"
          >
            <Text className="text-white font-bold">{confirmText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
