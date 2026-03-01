import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * BrowseRequestsScreen Component
 * Allows donors to see what medicines are needed by receivers/NGOs
 */
export default function BrowseRequestsScreen({ navigation }: any) {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const loadRequests = async () => {
        try {
            const requestsRef = collection(db, 'requests');
            const q = query(
                requestsRef,
                where('status', '==', 'open'),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            const querySnapshot = await getDocs(q);
            const requestsList = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setRequests(requestsList);
        } catch (error: any) {
            console.error('Error loading requests:', error);
            Toast.show({
                type: 'error',
                text1: 'Error Loading Requests',
                text2: 'Please try again',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadRequests();
    };

    const filteredRequests = requests.filter(req =>
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'low':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-secondary-100 text-secondary-700 border-secondary-200';
        }
    };

    const renderRequestItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white rounded-2xl p-5 mb-4 mx-6 shadow-sm border border-secondary-100"
            onPress={() => {
                navigation.navigate('RequestDetails', { requestId: item.id });
            }}
            activeOpacity={0.7}
        >
            <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                    <Text className="text-lg font-bold text-secondary-900 mb-1" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View className="flex-row items-center">
                        <View className="bg-secondary-100 px-2 py-0.5 rounded mr-2">
                            <Text className="text-[10px] text-secondary-600 font-bold uppercase">{item.category}</Text>
                        </View>
                        <Text className="text-sm text-secondary-500 font-medium">
                            Qty: {item.quantityNeeded}
                        </Text>
                    </View>
                </View>
                <View className={`px-2.5 py-1 rounded-full border ${getUrgencyColor(item.urgency)}`}>
                    <Text className="text-[10px] font-bold uppercase tracking-wider">
                        {item.urgency || 'medium'}
                    </Text>
                </View>
            </View>

            <Text className="text-secondary-600 text-sm mb-4 leading-5" numberOfLines={2}>
                {item.description}
            </Text>

            <View className="h-[1px] bg-secondary-100 mb-4" />

            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-primary-50 rounded-full items-center justify-center mr-2">
                        <Ionicons name="business-outline" size={16} color="#0d9488" />
                    </View>
                    <View>
                        <Text className="text-[10px] text-secondary-400 font-medium uppercase tracking-wider">Requested By</Text>
                        <Text className="text-xs text-secondary-700 font-semibold" numberOfLines={1}>
                            {item.ngoName || 'Anonymous NGO'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-secondary-50 rounded-full items-center justify-center mr-2">
                        <Ionicons name="location-outline" size={16} color="#64748b" />
                    </View>
                    <View>
                        <Text className="text-[10px] text-secondary-400 font-medium uppercase tracking-wider">Distance</Text>
                        <Text className="text-xs text-secondary-700 font-semibold">
                            Near you
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-secondary-50">
            {/* Header Background */}
            <View className="absolute top-0 w-full h-[25%] bg-primary-700 rounded-b-[40px] overflow-hidden">
                <LinearGradient
                    colors={['#0f766e', '#14b8a6']}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <View className="absolute top-20 -left-10 w-20 h-20 bg-white/10 rounded-full" />
            </View>

            <View className="flex-1" style={{ paddingTop: insets.top }}>
                {/* Header Content */}
                <View className="px-6 pt-4 pb-2 flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md mr-4"
                    >
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-white tracking-tight">
                        Receiver Requests
                    </Text>
                </View>

                {/* Search Bar */}
                <View className="px-6 mb-4">
                    <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 shadow-sm border border-secondary-100">
                        <Ionicons name="search-outline" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-secondary-900"
                            placeholder="Search by medicine or category..."
                            placeholderTextColor="#94a3b8"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>
                </View>

                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#0d9488" />
                        <Text className="text-secondary-500 mt-4 font-medium">Finding requests...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredRequests}
                        renderItem={renderRequestItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 px-6">
                                <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                                    <Text className="text-5xl">📋</Text>
                                </View>
                                <Text className="text-xl font-bold text-secondary-900 mb-2 text-center">
                                    No Requests Found
                                </Text>
                                <Text className="text-secondary-500 text-center leading-6">
                                    There are no open medicine requests at the moment.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
}
