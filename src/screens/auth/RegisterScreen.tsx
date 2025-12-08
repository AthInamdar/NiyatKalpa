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
} from 'react-native';
import { signUpAndCreateProfile } from '../../services/auth';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from '../../components/common/AppLogo';

/**
 * RegisterScreen Component
 * Handles new user registration with role selection
 */
export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'donor' | 'ngo' | 'admin'>('donor');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all fields',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match',
      });
      return;
    }

    if (password.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters',
      });
      return;
    }

    setLoading(true);
    try {
      await signUpAndCreateProfile(email, password, role);
      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'Welcome to NiyatKalpa!',
      });
      // Navigation handled by auth state listener
    } catch (error: any) {
      console.error('Registration error:', error);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error.message || 'Something went wrong',
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header Section with Gradient */}
        <View className="h-[30%] w-full relative overflow-hidden mb-6">
          <LinearGradient
            colors={['#0f766e', '#14b8a6']}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Decorative Circles */}
          <View className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
          <View className="absolute top-20 -left-10 w-32 h-32 bg-white/10 rounded-full" />

          <View className="flex-1 justify-center px-8 pb-4">
            <AppLogo size={80} style={{ marginBottom: 16 }} />
            <Text className="text-3xl font-bold text-white mb-1 tracking-tight">
              Create Account
            </Text>
            <Text className="text-primary-100 text-base">
              Join NiyatKalpa to donate or receive medicines
            </Text>
          </View>

          {/* Curve Divider */}
          <View className="absolute -bottom-1 w-full h-10 bg-secondary-50 rounded-t-[40px]" />
        </View>

        {/* Registration Form */}
        <View className="px-6 pb-8 -mt-4">
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-secondary-100 mb-6">
            <View className="mb-6">
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Full Name
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="person-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Email
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="mail-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Password
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="Enter your password"
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

              {/* Confirm Password Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-secondary-50 border border-secondary-200 rounded-xl px-4 h-14 focus:border-primary-500 focus:bg-white transition-all">
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-secondary-900"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role Selection */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-secondary-700 mb-3 ml-1">
                  I am a:
                </Text>
                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className={`flex-1 mr-2 py-3 rounded-xl border-2 items-center justify-center ${role === 'donor'
                      ? 'bg-emerald-50 border-emerald-600'
                      : 'bg-secondary-50 border-secondary-200'
                      }`}
                    onPress={() => setRole('donor')}
                    disabled={loading}
                  >
                    <Text className="text-2xl mb-1">🎁</Text>
                    <Text
                      className={`text-xs font-bold ${role === 'donor' ? 'text-emerald-700' : 'text-secondary-500'
                        }`}
                    >
                      Donor
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 mx-1 py-3 rounded-xl border-2 items-center justify-center ${role === 'ngo'
                      ? 'bg-emerald-50 border-emerald-600'
                      : 'bg-secondary-50 border-secondary-200'
                      }`}
                    onPress={() => setRole('ngo')}
                    disabled={loading}
                  >
                    <Text className="text-2xl mb-1">🏥</Text>
                    <Text
                      className={`text-xs font-bold ${role === 'ngo' ? 'text-emerald-700' : 'text-secondary-500'
                        }`}
                    >
                      Receiver
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 ml-2 py-3 rounded-xl border-2 items-center justify-center ${role === 'admin'
                      ? 'bg-emerald-50 border-emerald-600'
                      : 'bg-secondary-50 border-secondary-200'
                      }`}
                    onPress={() => setRole('admin')}
                    disabled={loading}
                  >
                    <Text className="text-2xl mb-1">🛡️</Text>
                    <Text
                      className={`text-xs font-bold ${role === 'admin' ? 'text-emerald-700' : 'text-secondary-500'
                        }`}
                    >
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                className={`bg-emerald-600 rounded-xl py-4 items-center shadow-lg shadow-emerald-500/30 ${loading ? 'opacity-50' : ''
                  }`}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold tracking-wide">
                    Create Account
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center">
              <Text className="text-secondary-500 font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-emerald-600 font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView >
  );
}
