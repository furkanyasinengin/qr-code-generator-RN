import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function VCardForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-3 uppercase">
        Contact
      </Text>
      <View className="bg-gray-500 h-0.5 rounded mb-2" />
      <Text className="text-gray-500 text-sm mb-2">Personal Info</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-2"
        placeholder="Name"
        placeholderTextColor="gray"
        value={data.vcardName}
        maxLength={50}
        onChangeText={text =>
          onChange({
            ...data,
            vcardName: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-2"
        placeholder="Phone"
        keyboardType="phone-pad"
        maxLength={20}
        placeholderTextColor="gray"
        value={data.vcardPhone}
        onChangeText={text =>
          onChange({
            ...data,
            vcardPhone: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-3"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="gray"
        maxLength={50}
        value={data.vcardEmail}
        onChangeText={text =>
          onChange({
            ...data,
            vcardEmail: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <View className="bg-gray-500 h-0.5 rounded mb-2" />
      <Text className="text-gray-500 text-sm mb-2">Work Info</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-3"
        placeholder="Company"
        placeholderTextColor="gray"
        maxLength={50}
        value={data.vcardCompany}
        onChangeText={text =>
          onChange({
            ...data,
            vcardCompany: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-3"
        placeholder="Work Title"
        placeholderTextColor="gray"
        maxLength={50}
        value={data.vcardWorkTitle}
        onChangeText={text =>
          onChange({
            ...data,
            vcardWorkTitle: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mb-3"
        placeholder="Web Site"
        placeholderTextColor="gray"
        maxLength={50}
        keyboardType="url"
        autoCapitalize="none"
        value={data.vcardWebsite}
        onChangeText={text =>
          onChange({
            ...data,
            vcardWebsite: text,
          })
        }
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
