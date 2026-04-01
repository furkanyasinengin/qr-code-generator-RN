import { View, Text, TextInput, Switch, TouchableOpacity } from 'react-native';
import { FormDataState } from '../DataModal';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
  triggerHaptic: () => void;
}

export default function WifiForm({ data, onChange, triggerHaptic }: FormProps) {
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        WIFI Network
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="Network Name (SSID)"
        placeholderTextColor="gray"
        value={data.wifiName}
        maxLength={50}
        onChangeText={text => onChange({ ...data, wifiName: text })}
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <View className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
        <Text className="text-gray-700 font-medium">Hidden Network</Text>
        <Switch
          trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
          thumbColor={data.wifiIsHidden ? '#3b82f6' : '#f3f4f6'}
          ios_backgroundColor="#d1d5db"
          onValueChange={isEnabled =>
            onChange({
              ...data,
              wifiIsHidden: isEnabled,
            })
          }
          value={data.wifiIsHidden}
        />
      </View>
      <Text className="text-gray-500 text-sm font-bold mt-4 mb-2 uppercase">
        SECURITY
      </Text>
      <View className="flex-row gap-2 mb-4">
        {['WPA/WPA2', 'WEP', 'None'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => {
              triggerHaptic();
              onChange({
                ...data,
                wifiEncryption: type,
              });
            }}
            className={`flex-1 py-3 rounded-xl items-center border ${
              data.wifiEncryption === type
                ? 'bg-blue-50 border-blue-500'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <Text
              className={
                data.wifiEncryption === type
                  ? 'text-blue-600 font-bold'
                  : 'text-gray-500 font-medium'
              }
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {data.wifiEncryption !== 'None' && (
        <View>
          <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
            Password
          </Text>
          <TextInput
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
            placeholder="Password"
            placeholderTextColor="gray"
            value={data.wifiPassword}
            maxLength={50}
            onChangeText={text =>
              onChange({
                ...data,
                wifiPassword: text,
              })
            }
            secureTextEntry={true}
            textContentType="none"
            autoComplete="off"
            importantForAutofill="no"
          />
        </View>
      )}
    </View>
  );
}
