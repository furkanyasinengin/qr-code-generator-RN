import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function SMSForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        SMS
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="e.g. +1 234 567 8900"
        placeholderTextColor="gray"
        value={data.smsNum}
        onChangeText={text => onChange({ ...data, smsNum: text })}
        maxLength={20}
        keyboardType="phone-pad"
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black h-32 mt-4"
        placeholder="Enter your message here..."
        placeholderTextColor="gray"
        value={data.smsMsg}
        onChangeText={text => onChange({ ...data, smsMsg: text })}
        maxLength={200}
        multiline={true}
        textAlignVertical="top"
        keyboardType="default"
        autoCapitalize="sentences"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
