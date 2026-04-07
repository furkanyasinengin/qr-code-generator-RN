import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { FormDataState } from '../DataModal';
import { useState } from 'react';

interface FormProps {
  data: FormDataState;
  onChange: (newData: FormDataState) => void;
}

const formatDateToVEvent = (date: Date) => {
  const pad = (n: number) => (n < 10 ? '0' + n : n);
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
};

const formatDisplayDate = (dateString: string) => {
  if (!dateString) return 'Select Date & Time';
  const year = dateString.slice(0, 4);
  const month = dateString.slice(4, 6);
  const day = dateString.slice(6, 8);
  const hour = dateString.slice(9, 11);
  const minute = dateString.slice(11, 13);
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const parseVEventToDate = (dateString: string) => {
  if (!dateString) return undefined;
  const year = parseInt(dateString.slice(0, 4), 10);
  const month = parseInt(dateString.slice(4, 6), 10) - 1; // JS'de aylar 0'dan başlar
  const day = parseInt(dateString.slice(6, 8), 10);
  const hour = parseInt(dateString.slice(9, 11), 10);
  const minute = parseInt(dateString.slice(11, 13), 10);
  return new Date(Date.UTC(year, month, day, hour, minute, 0));
};

export default function EventForm({ data, onChange }: FormProps) {
  const [openStart, setOpenStart] = useState(false);
  const [openEnd, setOpenEnd] = useState(false);

  const startDateObj = parseVEventToDate(data.eventStart);
  const endDateObj = parseVEventToDate(data.eventEnd);
  return (
    <View>
      <Text className="text-gray-500 text-sm font-bold mb-2 uppercase">
        EVENT
      </Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black"
        placeholder="Event Title"
        placeholderTextColor="gray"
        value={data.eventTitle}
        onChangeText={text => onChange({ ...data, eventTitle: text })}
        maxLength={50}
        keyboardType="default"
        autoCapitalize="words"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black my-4"
        placeholder="Event Location"
        placeholderTextColor="gray"
        value={data.eventLocation}
        onChangeText={text => onChange({ ...data, eventLocation: text })}
        maxLength={50}
        keyboardType="default"
        autoCapitalize="words"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
      {/* date picker */}
      <TouchableOpacity
        onPress={() => setOpenStart(true)}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3"
      >
        <Text className={data.eventStart ? 'text-black' : 'text-gray-400'}>
          Start: {formatDisplayDate(data.eventStart)}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={openStart}
        date={startDateObj || new Date()}
        onConfirm={date => {
          setOpenStart(false);
          const newStartString = formatDateToVEvent(date);
          if (endDateObj && date > endDateObj) {
            onChange({ ...data, eventStart: newStartString, eventEnd: '' });
          } else {
            onChange({ ...data, eventStart: newStartString });
          }
        }}
        onCancel={() => setOpenStart(false)}
      />

      {/* END DATE PICKER BUTTON */}
      <TouchableOpacity
        onPress={() => setOpenEnd(true)}
        disabled={!data.eventStart}
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3"
      >
        <Text className={data.eventEnd ? 'text-black' : 'text-gray-400'}>
          End: {formatDisplayDate(data.eventEnd)}
        </Text>
      </TouchableOpacity>

      <DatePicker
        modal
        open={openEnd}
        date={endDateObj || startDateObj || new Date()}
        minimumDate={startDateObj}
        onConfirm={date => {
          setOpenEnd(false);
          onChange({ ...data, eventEnd: formatDateToVEvent(date) });
        }}
        onCancel={() => setOpenEnd(false)}
      />
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-black h-32"
        placeholder="Event Notes"
        placeholderTextColor="gray"
        value={data.eventNotes}
        onChangeText={text => onChange({ ...data, eventNotes: text })}
        maxLength={200}
        multiline={true}
        textAlignVertical="top"
        keyboardType="default"
        autoCapitalize="words"
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
      />
    </View>
  );
}
