import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function PhoneForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        PHONE
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="e.g. +1 234 567 8900"
        placeholderTextColor="gray"
        value={data.phoneNum}
        maxLength={20}
        keyboardType="phone-pad"
        onChangeText={text => {
          const formatted = text.replace(/[^\d\s+]/g, '');
          onChange({ ...data, phoneNum: formatted });
        }}
        textAlignVertical="top"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
