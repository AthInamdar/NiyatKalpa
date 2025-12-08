import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from '../../components/common/AppLogo';
import { sendMessageToAIVaidya, ChatMessage } from '../../services/aiVaidya';
import Toast from 'react-native-toast-message';
import Markdown from 'react-native-markdown-display';

export default function AIVaidyaScreen({ navigation }: any) {
    const insets = useSafeAreaInsets();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = inputText.trim();
        setInputText('');
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setLoading(true);

        try {
            const response = await sendMessageToAIVaidya(messages, userMessage);
            setMessages(prev => [...prev, { role: 'model', text: response }]);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to get response from AI Vaidya',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, loading]);

    return (
        <View className="flex-1 bg-secondary-50">
            {/* Header */}
            <View className="bg-white shadow-sm z-10">
                <View style={{ paddingTop: insets.top }}>
                    <View className="px-4 py-3 flex-row items-center border-b border-secondary-100">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="mr-3"
                        >
                            <Ionicons name="arrow-back" size={24} color="#334155" />
                        </TouchableOpacity>

                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3 border border-emerald-100">
                                <Ionicons name="medical" size={20} color="#059669" />
                            </View>
                            <View>
                                <Text className="text-lg font-bold text-secondary-900">AI Vaidya</Text>
                                <Text className="text-xs text-emerald-600 font-medium">Always here to help</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description Banner */}
                    <View className="bg-emerald-50 px-4 py-3 border-b border-emerald-100">
                        <Text className="text-xs text-emerald-800 leading-5">
                            👋 I am your professional doctor bot for <Text className="font-bold">NiyatKalpa</Text>.
                            Ask me about medicines, health advice, or our mission to reduce medical wastage.
                        </Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {messages.length === 0 && (
                        <View className="items-center justify-center mt-10 opacity-50">
                            <AppLogo size={80} style={{ marginBottom: 16 }} />
                            <Text className="text-secondary-400 text-center">
                                Start a conversation with AI Vaidya
                            </Text>
                        </View>
                    )}

                    {messages.map((msg, index) => (
                        <View
                            key={index}
                            className={`mb-4 max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'
                                }`}
                        >
                            <View
                                className={`p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-emerald-600 rounded-tr-none'
                                    : 'bg-white rounded-tl-none shadow-sm border border-secondary-100'
                                    }`}
                            >
                                <Markdown
                                    style={{
                                        body: {
                                            color: msg.role === 'user' ? 'white' : '#1e293b',
                                            fontSize: 16,
                                            fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                                        },
                                        heading1: {
                                            color: msg.role === 'user' ? 'white' : '#0f766e',
                                            fontSize: 22,
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                        },
                                        heading2: {
                                            color: msg.role === 'user' ? 'white' : '#0f766e',
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            marginBottom: 8,
                                        },
                                        strong: {
                                            fontWeight: 'bold',
                                            color: msg.role === 'user' ? 'white' : '#0f766e',
                                        },
                                        link: {
                                            color: msg.role === 'user' ? '#ccfbf1' : '#0d9488',
                                        },
                                        bullet_list: {
                                            marginBottom: 8,
                                        },
                                    }}
                                >
                                    {msg.text}
                                </Markdown>
                            </View>
                        </View>
                    ))}

                    {loading && (
                        <View className="self-start mb-4 bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-secondary-100">
                            <ActivityIndicator color="#059669" />
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View className="p-4 bg-white border-t border-secondary-100">
                    <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-full px-4 py-2">
                        <TextInput
                            className="flex-1 text-base text-secondary-900 max-h-24 py-2"
                            placeholder="Ask about medicines..."
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || loading}
                            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${inputText.trim() && !loading ? 'bg-emerald-600' : 'bg-secondary-200'
                                }`}
                        >
                            <Ionicons name="send" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
