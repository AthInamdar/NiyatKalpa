import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { sendMessage, subscribeToMessages } from '../../services/chat';

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth();
    const { chatRoomId } = route.params as { chatRoomId: string };

    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        if (!chatRoomId) return;
        const unsubscribe = subscribeToMessages(chatRoomId, (msgs) => {
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [chatRoomId]);

    const handleSend = async () => {
        if (!inputText.trim() || !user?.uid) return;
        const textToSend = inputText;
        setInputText('');
        try {
            await sendMessage(chatRoomId, user.uid, textToSend);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Revert if failed
            setInputText(textToSend);
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        const isMine = item.senderId === user?.uid;
        return (
            <View className={`my-1 mx-4 p-3 rounded-2xl max-w-[80%] ${isMine ? 'bg-blue-600 self-end rounded-tr-sm' : 'bg-gray-200 self-start rounded-tl-sm'}`}>
                <Text className={`text-base ${isMine ? 'text-white' : 'text-gray-900'}`}>{item.text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-100 bg-white shadow-sm mt-4">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="w-10 h-10 items-center justify-center -ml-2 rounded-full active:bg-gray-100"
                >
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="flex-1 text-lg font-bold text-gray-900 ml-2">Chat</Text>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    inverted={false}
                />

                <View className="flex-row items-center p-4 border-t border-gray-200 bg-white">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base mr-3"
                        placeholder="Type a message..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        className={`w-12 h-12 rounded-full items-center justify-center ${inputText.trim() ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
