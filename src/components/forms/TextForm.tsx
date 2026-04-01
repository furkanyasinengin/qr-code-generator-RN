import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function TextForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        PLAIN TEXT
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black h-32"
        placeholder="Enter your message here..."
        placeholderTextColor="gray"
        value={data.text}
        maxLength={500}
        onChangeText={text => onChange({ ...data, text: text })}
        multiline={true}
        textAlignVertical="top"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
