import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function EmailForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        EMAIL
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="example@mail.com"
        placeholderTextColor="gray"
        value={data.emailTo}
        onChangeText={text => onChange({ ...data, emailTo: text })}
        maxLength={50}
        keyboardType="email-address"
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mt-4"
        placeholder="Hello There"
        placeholderTextColor="gray"
        value={data.emailSubject}
        onChangeText={text => onChange({ ...data, emailSubject: text })}
        maxLength={50}
        keyboardType="default"
        autoCapitalize="words"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black h-32 mt-4"
        placeholder="Enter your message here..."
        placeholderTextColor="gray"
        value={data.emailBody}
        onChangeText={text => onChange({ ...data, emailBody: text })}
        maxLength={500}
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
