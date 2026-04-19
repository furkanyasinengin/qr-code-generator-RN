import { Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ban, Plus } from 'lucide-react-native';

interface IconSelectorProps {
  activeIcon: string | number | null | any;
  onIconSelect: (source: any) => void;
  onGallerySelect: () => void;
  triggerHaptic: () => void;
}

const SOCIAL_LOGOS = [
  { id: 'remove', type: 'action' },
  {
    id: 'whatsapp',
    type: 'logo',
    source: require('../assets/icons/social/whatsapp.png'),
  },
  {
    id: 'facebook',
    type: 'logo',
    source: require('../assets/icons/social/facebook.png'),
  },
  {
    id: 'instagram',
    type: 'logo',
    source: require('../assets/icons/social/instagram.png'),
  },
  {
    id: 'youtube',
    type: 'logo',
    source: require('../assets/icons/social/youtube.png'),
  },
  {
    id: 'github',
    type: 'logo',
    source: require('../assets/icons/social/github.png'),
  },
  {
    id: 'linkedin',
    type: 'logo',
    source: require('../assets/icons/social/linkedin.png'),
  },
  { id: 'x', type: 'logo', source: require('../assets/icons/social/x.png') },
  { id: 'gallery', type: 'action' },
];

export default function IconSelector({
  activeIcon,
  onIconSelect,
  onGallerySelect,
  triggerHaptic,
}: IconSelectorProps) {
  return (
    <View className="w-full my-4">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-grow-0 mx-5 p-2 bg-gray-200 rounded-xl"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {SOCIAL_LOGOS.map(item => {
          if (item.id === 'remove') {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  triggerHaptic();
                  onIconSelect(null);
                }}
                className={`w-12 h-12 rounded-full mr-4 border-4 items-center justify-center bg-white ${
                  activeIcon === null ? 'border-gray-300' : 'border-transparent'
                }`}
              >
                <Ban size={24} color="red" />
              </TouchableOpacity>
            );
          } else if (item.id === 'gallery') {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  triggerHaptic();
                  onGallerySelect();
                }}
                className="w-12 h-12 rounded-full mr-4 border-2 border-dashed border-gray-400 items-center justify-center bg-gray-100"
              >
                <Plus size={24} color="#9CA3AF" />
              </TouchableOpacity>
            );
          } else {
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  triggerHaptic();
                  onIconSelect(item.source);
                }}
                className={`w-12 h-12 rounded-full mr-4 border-4 items-center justify-center bg-white ${
                  item.id === activeIcon
                    ? 'border-gray-300'
                    : 'border-transparent'
                }`}
              >
                <Image
                  source={item.source}
                  className="w-8 h-8"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            );
          }
        })}
      </ScrollView>
    </View>
  );
}
