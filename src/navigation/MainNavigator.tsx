import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';

// Home Screens
import DonorHomeScreen from '../screens/home/DonorHomeScreen';
import ReceiverHomeScreen from '../screens/home/ReceiverHomeScreen';
import AdminHomeScreen from '../screens/home/AdminHomeScreen';

// Donor Screens
import UploadMedicineScreen from '../screens/donor/UploadMedicineScreen';
import MyDonationsScreen from '../screens/donor/MyDonationsScreen';

// Receiver Screens
import RequestMedicineScreen from '../screens/receiver/RequestMedicineScreen';
import AvailableDonationsScreen from '../screens/receiver/AvailableDonationsScreen';
import MyRequestsScreen from '../screens/receiver/MyRequestsScreen';

// Admin Screens
import VerifyUsersScreen from '../screens/admin/VerifyUsersScreen';

// Common Screens
import AIVaidyaScreen from '../screens/home/AIVaidyaScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import MapScreen from '../screens/common/MapScreen';
import DonationDetailsScreen from '../screens/common/DonationDetailsScreen';
import RequestDetailsScreen from '../screens/common/RequestDetailsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * HomeStack Navigator
 * Stack navigator for home and related screens
 */
function HomeStack() {
  const { user } = useAuth();

  // Determine which home screen to show based on role
  const HomeScreen =
    user?.role === 'admin'
      ? AdminHomeScreen
      : user?.role === 'ngo'
        ? ReceiverHomeScreen
        : DonorHomeScreen;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UploadMedicine"
        component={UploadMedicineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RequestMedicine"
        component={RequestMedicineScreen}
        options={{ title: 'Request Medicine' }}
      />
      <Stack.Screen
        name="AvailableDonations"
        component={AvailableDonationsScreen}
        options={{ title: 'Available Donations' }}
      />
      <Stack.Screen
        name="MyDonations"
        component={MyDonationsScreen}
        options={{ title: 'My Donations' }}
      />
      <Stack.Screen
        name="MyRequests"
        component={MyRequestsScreen}
        options={{ title: 'My Requests' }}
      />
      <Stack.Screen
        name="AIVaidya"
        component={AIVaidyaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DonationDetails"
        component={DonationDetailsScreen}
        options={{ title: 'Donation Details' }}
      />
      <Stack.Screen
        name="RequestDetails"
        component={RequestDetailsScreen}
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen
        name="VerifyUsers"
        component={VerifyUsersScreen}
        options={{ title: 'Verify Users' }}
      />
    </Stack.Navigator>
  );
}

/**
 * MainNavigator Component
 * Bottom tab navigation with role-based screens
 */
export default function MainNavigator() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />

      <Tab.Screen
        name="AIVaidya"
        component={AIVaidyaScreen}
        options={{
          tabBarLabel: 'AI Vaidya',
          tabBarIcon: ({ color }) => <TabIcon icon="🤖" color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * TabIcon Component
 * Simple emoji-based tab icon
 */
function TabIcon({ icon, color }: { icon: string; color: string }) {
  const { Text } = require('react-native');
  return (
    <Text style={{ fontSize: 24, opacity: color === '#10b981' ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}
