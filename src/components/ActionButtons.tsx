import { View, Text, TouchableOpacity } from 'react-native';
import { SaveIcon } from './icons/SaveIcon';
import { ShareIcon } from './icons/ShareIcon';

interface ActionButtonsProps {
  hasLogo: boolean;
  onLogoSelect: () => void;
  onShare: () => void;
  onSave: () => void;
}

export default function ActionButtons({
  hasLogo,
  onLogoSelect,
  onShare,
  onSave,
}: ActionButtonsProps) {
  return (
    <View className="flex-row gap-4 my-5">
      <TouchableOpacity
        onPress={onLogoSelect}
        className={`p-4 rounded-full items-center justify-center ${hasLogo ? 'bg-red-500' : 'bg-emerald-500'}`}
      >
        <Text className="text-white text-lg font-bold">
          {hasLogo ? 'Remove Logo' : 'Select Logo'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onShare}
        className="p-4 rounded-full bg-blue-500 items-center justify-center"
      >
        <ShareIcon color="white" size={24} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onSave}
        className="p-4 rounded-full bg-blue-500 items-center justify-center"
      >
        <SaveIcon color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}
