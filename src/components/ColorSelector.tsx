import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Plus } from 'lucide-react-native';
import ColorPicker, {
  Panel1,
  HueSlider,
  Preview,
} from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';

interface ColorSelectorProps {
  activeTab: 'data' | 'eye' | 'bg';
  setActiveTab: (tab: 'data' | 'eye' | 'bg') => void;
  activeColor: string;
  onColorSelect: (color: string) => void;
  triggerHaptic: () => void;
}

const colorPalette = [
  '#000000',
  '#FFFFFF',
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];

export default function ColorSelector({
  activeTab,
  setActiveTab,
  activeColor,
  onColorSelect,
  triggerHaptic,
}: ColorSelectorProps) {
  const [showPicker, setShowPicker] = useState(false);
  return (
    <View className="w-full">
      <View className="flex-row bg-gray-200 p-1 rounded-xl mb-3 mx-2">
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setActiveTab('data');
          }}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'data' ? 'bg-white' : 'bg-transparent'}`}
        >
          <Text
            className={`font-semibold ${activeTab === 'data' ? 'text-black' : 'text-gray-500'}`}
          >
            Data
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setActiveTab('eye');
          }}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'eye' ? 'bg-white' : 'bg-transparent'}`}
        >
          <Text
            className={`font-semibold ${activeTab === 'eye' ? 'text-black' : 'text-gray-500'}`}
          >
            Eye
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setActiveTab('bg');
          }}
          className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'bg' ? 'bg-white' : 'bg-transparent'}`}
        >
          <Text
            className={`font-semibold ${activeTab === 'bg' ? 'text-black' : 'text-gray-500'}`}
          >
            Background
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        className="flex-grow-0 mx-5 p-2 bg-gray-200 rounded-xl"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {colorPalette.map(color => (
          <TouchableOpacity
            key={color}
            style={{ backgroundColor: color }}
            className={`w-12 h-12 rounded-full mr-4 border-4 ${
              color === activeColor ? 'border-gray-300' : 'border-transparent'
            }`}
            onPress={() => {
              triggerHaptic();
              onColorSelect(color);
            }}
          />
        ))}
        <TouchableOpacity
          onPress={() => {
            triggerHaptic();
            setShowPicker(true);
          }}
          className="w-12 h-12 rounded-full mr-4 border-2 border-dashed border-gray-400 items-center justify-center bg-gray-100"
        >
          <Plus size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={showPicker} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-5/6 p-6 rounded-2xl shadow-xl">
            <Text className="text-lg font-bold text-gray-800 mb-4 text-center">
              Custom Color
            </Text>
            <ColorPicker
              value={activeColor}
              style={{ width: '100%', gap: 20 }}
              onComplete={color => {
                'worklet';
                if (onColorSelect) {
                  runOnJS(onColorSelect)(color.hex);
                }
              }}
            >
              <Preview />
              <Panel1 />
              <HueSlider />
            </ColorPicker>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              className="w-full bg-blue-500 rounded-xl py-3 items-center mt-6"
            >
              <Text className="text-white font-bold text-base">Select</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
