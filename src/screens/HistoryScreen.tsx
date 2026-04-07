import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useStore } from '../store/useStore';
import {
  Star,
  Trash2,
  Link as LinkIcon,
  Wifi,
  Contact,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react-native';
import {
  parseWifiData,
  parseVcardData,
  parseEmailData,
  parseEventData,
  parseSmsData,
} from '../utils/qrParser';
import CustomAlert from '../components/CustomAlert';
import { useNavigation } from '@react-navigation/native';
import ScannerModal from '../components/ScannerModal';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [selectedScanData, setSelectedScanData] = useState<string | null>(null);

  const history = useStore(state => state.history);
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const deleteHistoryItem = useStore(state => state.deleteHistoryItem);
  const clearHistory = useStore(state => state.clearHistory);

  const [activeTab, setActiveTab] = useState<'scan' | 'create'>('create');

  const filteredHistory = (history || []).filter(
    item => item?.source === activeTab,
  );

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    closeText: '',
    onClose: () => {},
    onConfirm: () => {},
  });

  const getPreviewText = (item: any) => {
    if (!item || !item.rawData) return 'No Data';

    try {
      switch (item.qrType) {
        case 'wifi':
          return parseWifiData(item.rawData).ssid || 'Unknown Network';
        case 'vcard':
          return parseVcardData(item.rawData).fn || 'Unknown Contact';
        case 'email':
          return parseEmailData(item.rawData).email || 'No Email';
        case 'event':
          return parseEventData(item.rawData).title || 'Calendar Event';
        case 'sms':
          return parseSmsData(item.rawData).phone || 'SMS Message';
        case 'url':
          return item.rawData;
        default:
          return item.rawData.replace(/^(tel:|mailto:|geo:)/i, '');
      }
    } catch {
      return 'Invalid Data Format';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIcon = (qrType: string) => {
    const props = { size: 24, color: '#3B82F6' };
    switch (qrType) {
      case 'url':
        return <LinkIcon {...props} />;
      case 'wifi':
        return <Wifi {...props} />;
      case 'vcard':
        return <Contact {...props} />;
      case 'email':
        return <Mail {...props} />;
      case 'phone':
        return <Phone {...props} />;
      case 'sms':
        return <MessageSquare {...props} />;
      case 'location':
        return <MapPin {...props} />;
      case 'event':
        return <Calendar {...props} />;
      default:
        return <FileText {...props} />;
    }
  };
  return (
    <View className="flex-1 bg-gray-100 mt-10">
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="text-2xl font-bold text-gray-800">History</Text>

        <TouchableOpacity
          className="p-2"
          onPress={() =>
            setAlertConfig({
              ...alertConfig,
              visible: true,
              title: 'Are you sure?',
              message: 'All QR code information will be deleted.',
              confirmText: 'Delete All',
              onConfirm: () => {
                clearHistory();
                setAlertConfig({ ...alertConfig, visible: false });
              },
              closeText: 'Cancel',
              onClose: () => setAlertConfig({ ...alertConfig, visible: false }),
            })
          }
        >
          <Trash2 size={25} color="#EF4444" />
        </TouchableOpacity>
      </View>
      <View className="flex-row bg-gray-200 p-1 rounded-xl mx-5 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab('create')}
          // className="flex-1"
          // style={{
          //   display: 'flex',
          //   paddingHorizontal: 2,
          //   alignItems: 'center',
          // }}
          className={`flex-1 py-2 rounded-lg items-center ${
            activeTab === 'create' ? 'bg-white' : 'bg-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'create' ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            Created
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('scan')}
          // className="flex-1"
          className={`flex-1 py-2 rounded-lg items-center ${
            activeTab === 'scan' ? 'bg-white' : 'bg-transparent'
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'scan' ? 'text-gray-800' : 'text-gray-500'
            }`}
          >
            Scanned
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredHistory}
        keyExtractor={(item, index) => item?.id || index.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-lg">No history found.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.source === 'scan') {
                setSelectedScanData(item.rawData);
              } else {
                navigation.navigate('Create', {
                  editData: item.parsedData,
                  qrType: item.qrType,
                });
              }
            }}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm flex-row items-center"
          >
            <View className="bg-blue-50 p-3 rounded-full mr-3">
              {getIcon(item?.qrType)}
            </View>
            <View className="flex-1 ">
              <Text className="uppercase font-bold text-gray-800">
                {item?.qrType || 'UNKNOWN'}
              </Text>
              <Text className="text-gray-500" numberOfLines={1}>
                {getPreviewText(item)}
              </Text>
              <Text className="text-xs text-gray-400">
                {item?.createdAt ? formatDate(item.createdAt) : 'Unknown Date'}
              </Text>
            </View>
            <View className="flex-row space-x-3 gap-2">
              <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                <Star
                  color={item.isFavorite ? '#EAB308' : '#9CA3AF'}
                  fill={item.isFavorite ? '#EAB308' : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setAlertConfig({
                    ...alertConfig,
                    visible: true,
                    title: 'Delete Item',
                    message: 'Are you sure you want to delete this item?',
                    confirmText: 'Delete',
                    onConfirm: () => {
                      deleteHistoryItem(item.id);
                      setAlertConfig({ ...alertConfig, visible: false });
                    },
                    closeText: 'Cancel',
                    onClose: () =>
                      setAlertConfig({ ...alertConfig, visible: false }),
                  })
                }
              >
                <Trash2 color="#EF4444" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        confirmText={alertConfig.confirmText}
        onConfirm={alertConfig.onConfirm}
        closeText={alertConfig.closeText}
        onClose={alertConfig.onClose}
      />
      <ScannerModal
        isVisible={!!selectedScanData}
        scannedData={selectedScanData}
        onClose={() => setSelectedScanData(null)}
      />
    </View>
  );
}
