import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

const ToastComponent = Toast as unknown as React.ComponentType<any>;

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Main Navigator
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

/**
 * AppNavigator Component
 * Root navigation with authentication flow
 */
export default function AppNavigator() {
  const { firebaseUser, loading } = useAuth();

  // Show loading screen while auth state is being determined
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {firebaseUser ? (
            // User is signed in
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            // User is not signed in
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
        <ToastComponent />
      </View>
    </NavigationContainer>
  );
}
