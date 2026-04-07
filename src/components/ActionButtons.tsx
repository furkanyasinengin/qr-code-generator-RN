import { View, TouchableOpacity } from 'react-native';
import { SaveIcon } from './icons/SaveIcon';
import { ShareIcon } from './icons/ShareIcon';

interface ActionButtonsProps {
  onShare: () => void;
  onSave: () => void;
}

export default function ActionButtons({ onShare, onSave }: ActionButtonsProps) {
  return (
    <View className="flex-row gap-4 my-5">
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
