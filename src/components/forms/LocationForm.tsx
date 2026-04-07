import { View, Text, TextInput } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

export default function LocationForm({ data, onChange }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        LOCATION
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="40.123"
        placeholderTextColor="gray"
        value={data.geoLat}
        onChangeText={text => onChange({ ...data, geoLat: text })}
        maxLength={50}
        keyboardType="numeric"
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black mt-4"
        placeholder="40.123"
        placeholderTextColor="gray"
        value={data.geoLng}
        onChangeText={text => onChange({ ...data, geoLng: text })}
        maxLength={50}
        keyboardType="numeric"
        autoCapitalize="none"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
