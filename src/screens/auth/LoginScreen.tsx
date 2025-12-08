import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from '../../components/common/AppLogo';

const { width } = Dimensions.get('window');

/**
 * LoginScreen Component
 * Handles user authentication with Firebase
 */
export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please enter both email and password',
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome back!',
      });
      // Navigation handled by auth state listener
    } catch (error: any) {
      console.error('Login error:', error);
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error.message || 'Invalid credentials',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false} showsVerticalScrollIndicator={false}>
        {/* Header Section with Gradient */}
        <View className="h-[35%] w-full relative overflow-hidden">
          <LinearGradient
            colors={['#0f766e', '#14b8a6']}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Decorative Circles */}
          <View className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <View className="absolute top-20 -left-10 w-32 h-32 bg-white/10 rounded-full" />

          <View className="flex-1 justify-center px-8 pb-10">
            <AppLogo size={100} style={{ marginBottom: 24 }} />
            <Text className="text-4xl font-bold text-white mb-2 tracking-tight">
              Welcome Back
            </Text>
            <Text className="text-primary-100 text-lg">
              Sign in to continue your journey
            </Text>
          </View>

          {/* Curve Divider */}
          <View className="absolute -bottom-1 w-full h-10 bg-secondary-50 rounded-t-[40px]" />
        </View>

        {/* Form Section */}
        <View className="flex-1 px-6 -mt-4">
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-secondary-100 mb-6">
            <View className="mb-6">
              {/* Email Input */}
              <View className="mb-5">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Email Address
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="mail-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="name@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-2">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Password
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="Enter your password"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="self-end p-2">
                <Text className="text-primary-600 font-medium text-sm">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-primary-600 rounded-xl py-4 items-center shadow-lg shadow-primary-500/30 mb-4 ${loading ? 'opacity-70' : ''
                }`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold tracking-wide">Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mb-10">
            <Text className="text-secondary-500 text-base">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-primary-600 font-bold text-base">Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
