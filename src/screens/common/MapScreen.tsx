import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { getCurrentLocation, calculateDistance, formatDistance } from '../../services/location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { height } = Dimensions.get('window');

type MapMode = 'donors' | 'medicals';

interface MarkerData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance?: number;
  distanceText?: string;
  medicines?: number;
  donorType?: string;
  phone?: string;
  email?: string;
  isDonor?: boolean; // Has available donations
}

/**
 * MapScreen Component
 * Shows donors and medical stores on a map with location-based search
 */
export default function MapScreen({ navigation }: any) {
  const { user } = useAuth();
  const [mode, setMode] = useState<MapMode>('donors');
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    loadMapData();
  }, [mode]);

  /**
   * Load map data based on selected mode
   */
  const loadMapData = async () => {
    try {
      setLoading(true);
      setSelectedMarker(null);

      // Get user location
      const location = await getCurrentLocation();
      if (location) {
        setUserLocation(location);
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }

      if (mode === 'donors') {
        await loadDonors(location);
      } else {
        await loadMedicals(location);
      }
    } catch (error: any) {
      console.error('Error loading map data:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Map',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load donors who have available donations
   */
  const loadDonors = async (location: any) => {
    try {
      // Get available donations
      const donationsRef = collection(db, 'donations');
      const q = query(donationsRef, where('status', '==', 'available'));
      const querySnapshot = await getDocs(q);

      const donorMap = new Map<string, MarkerData>();

      querySnapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.geo && data.geo.lat && data.geo.lng) {
          const donorId = data.donorId;

          if (!donorMap.has(donorId)) {
            let distance: number | undefined;
            let distanceText: string | undefined;

            if (location) {
              distance = calculateDistance(
                location.lat,
                location.lng,
                data.geo.lat,
                data.geo.lng
              );
              distanceText = formatDistance(distance);
            }

            donorMap.set(donorId, {
              id: donorId,
              name: data.donorName || 'Anonymous Donor',
              lat: data.geo.lat,
              lng: data.geo.lng,
              distance,
              distanceText,
              medicines: 1,
              donorType: data.donorType || 'individual',
            });
          } else {
            const existing = donorMap.get(donorId)!;
            existing.medicines = (existing.medicines || 0) + 1;
          }
        }
      });

      let markersList = Array.from(donorMap.values());

      // Sort by distance
      if (location) {
        markersList.sort((a, b) => {
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        });
      }

      setMarkers(markersList);
    } catch (error) {
      console.error('Error loading donors:', error);
      throw error;
    }
  };

  /**
   * Load medical stores/pharmacies
   * Shows ALL medical stores and highlights those with available donations
   */
  const loadMedicals = async (location: any) => {
    try {
      // Get ALL users with role 'donor' (medical stores/pharmacies)
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'donor'));
      const querySnapshot = await getDocs(q);

      const markersList: MarkerData[] = [];

      for (const doc of querySnapshot.docs) {
        const data = doc.data();

        // Only show stores that have a location
        if (data.geo && data.geo.lat && data.geo.lng) {
          // Count available donations by this donor
          const donationsRef = collection(db, 'donations');
          const donorQuery = query(
            donationsRef,
            where('donorId', '==', doc.id),
            where('status', '==', 'available')
          );
          const donationsSnapshot = await getDocs(donorQuery);
          const medicineCount = donationsSnapshot.size;

          let distance: number | undefined;
          let distanceText: string | undefined;

          if (location) {
            distance = calculateDistance(
              location.lat,
              location.lng,
              data.geo.lat,
              data.geo.lng
            );
            distanceText = formatDistance(distance);
          }

          markersList.push({
            id: doc.id,
            name: data.name || data.email || 'Medical Store',
            lat: data.geo.lat,
            lng: data.geo.lng,
            distance,
            distanceText,
            medicines: medicineCount,
            phone: data.phone,
            email: data.email,
            isDonor: medicineCount > 0, // Highlight if has donations
          });
        }
      }

      // Sort by donors first, then by distance
      markersList.sort((a, b) => {
        // Prioritize donors
        if (a.isDonor && !b.isDonor) return -1;
        if (!a.isDonor && b.isDonor) return 1;

        // Then sort by distance
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setMarkers(markersList);
    } catch (error) {
      console.error('Error loading medical stores:', error);
      throw error;
    }
  };

  /**
   * Handle marker press
   */
  const handleMarkerPress = (marker: MarkerData) => {
    setSelectedMarker(marker);
  };

  /**
   * Handle view details
   */
  const handleViewDetails = () => {
    if (selectedMarker) {
      Toast.show({
        type: 'info',
        text1: selectedMarker.name,
        text2: 'Details screen coming soon',
      });
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-secondary-500 mt-4 font-medium">Loading map...</Text>
      </View>
    );
  }

  /**
   * Render no location state
   */
  if (!region) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center px-6">
        <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="location-outline" size={48} color="#2563eb" />
        </View>
        <Text className="text-xl font-bold text-secondary-900 mb-2 text-center">
          Location Required
        </Text>
        <Text className="text-secondary-500 text-center mb-8 leading-6">
          Please enable location services to view nearby {mode === 'donors' ? 'donors' : 'medical stores'}
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-xl px-8 py-3 shadow-lg shadow-blue-500/30"
          onPress={loadMapData}
        >
          <Text className="text-white font-bold">Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Header */}
          <View className="bg-white px-6 py-4 border-b border-secondary-100 z-10 shadow-sm">
            <Text className="text-2xl font-bold text-secondary-900 mb-4">
              Find Nearby
            </Text>

            {/* Mode Toggle */}
            <View className="flex-row bg-secondary-50 rounded-xl p-1 border border-secondary-100">
              <TouchableOpacity
                className={`flex-1 py-2.5 px-4 rounded-lg flex-row items-center justify-center ${mode === 'donors' ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                onPress={() => setMode('donors')}
              >
                <Text className="mr-2">🏥</Text>
                <Text
                  className={`text-center font-bold ${mode === 'donors' ? 'text-blue-600' : 'text-secondary-500'
                    }`}
                >
                  Donors
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-2.5 px-4 rounded-lg flex-row items-center justify-center ${mode === 'medicals' ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                onPress={() => setMode('medicals')}
              >
                <Text className="mr-2">🏪</Text>
                <Text
                  className={`text-center font-bold ${mode === 'medicals' ? 'text-emerald-600' : 'text-secondary-500'
                    }`}
                >
                  Medical Stores
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="text-secondary-500 text-xs font-medium mt-3 ml-1">
              {markers.length} {mode === 'donors' ? 'donors' : 'medical stores'} found nearby
            </Text>
          </View>

          {/* Map View */}
          <View className="flex-1 relative">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              region={region}
              onRegionChangeComplete={setRegion}
              showsUserLocation
              showsMyLocationButton={false}
              customMapStyle={[
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]}
            >
              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                  }}
                  title="Your Location"
                  pinColor="blue"
                />
              )}

              {/* Donor/Medical Store Markers */}
              {markers.map((marker) => (
                <Marker
                  key={marker.id}
                  coordinate={{
                    latitude: marker.lat,
                    longitude: marker.lng,
                  }}
                  title={marker.name}
                  description={
                    mode === 'medicals' && marker.isDonor
                      ? `✓ Active Donor - ${marker.medicines || 0} medicines available`
                      : `${marker.medicines || 0} medicines available`
                  }
                  onPress={() => handleMarkerPress(marker)}
                  pinColor={
                    mode === 'donors'
                      ? 'red'
                      : marker.isDonor
                        ? 'green' // Green for active donors
                        : 'orange' // Orange for medical stores without donations
                  }
                />
              ))}
            </MapView>

            {/* My Location Button */}
            <TouchableOpacity
              className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-lg shadow-black/20"
              onPress={() => {
                if (userLocation) {
                  setRegion({
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                  });
                }
              }}
            >
              <Ionicons name="locate" size={24} color="#2563eb" />
            </TouchableOpacity>

            {/* Selected Marker Details */}
            {selectedMarker && (
              <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1 mr-4">
                    <Text className="text-xl font-bold text-secondary-900 mb-1" numberOfLines={1}>
                      {selectedMarker.name}
                    </Text>
                    {selectedMarker.distanceText && (
                      <View className="flex-row items-center">
                        <Ionicons name="location" size={14} color="#2563eb" style={{ marginRight: 4 }} />
                        <Text className="text-blue-600 font-bold text-sm">
                          {selectedMarker.distanceText} away
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedMarker(null)}
                    className="w-8 h-8 bg-secondary-100 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>

                <View className="bg-secondary-50 rounded-2xl p-4 mb-4 border border-secondary-100">
                  {mode === 'medicals' && selectedMarker.isDonor && (
                    <View className="bg-emerald-100 rounded-xl p-3 mb-3 flex-row items-center border border-emerald-200">
                      <View className="w-6 h-6 bg-emerald-500 rounded-full items-center justify-center mr-2">
                        <Ionicons name="checkmark" size={14} color="white" />
                      </View>
                      <Text className="text-emerald-800 font-bold flex-1 text-sm">
                        Active Donor with Available Medicines
                      </Text>
                    </View>
                  )}
                  {mode === 'medicals' && !selectedMarker.isDonor && (
                    <View className="bg-orange-100 rounded-xl p-3 mb-3 flex-row items-center border border-orange-200">
                      <View className="w-6 h-6 bg-orange-500 rounded-full items-center justify-center mr-2">
                        <Ionicons name="information" size={14} color="white" />
                      </View>
                      <Text className="text-orange-800 font-bold flex-1 text-sm">
                        No donations currently available
                      </Text>
                    </View>
                  )}

                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-secondary-600 font-medium">Available Medicines</Text>
                    <View className="bg-blue-100 px-3 py-1 rounded-full">
                      <Text className="text-blue-700 font-bold">
                        {selectedMarker.medicines || 0} units
                      </Text>
                    </View>
                  </View>

                  {selectedMarker.donorType && (
                    <View className="flex-row items-center mt-2 pt-2 border-t border-secondary-200">
                      <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider mr-2">Type:</Text>
                      <Text className="text-secondary-800 font-bold capitalize">
                        {selectedMarker.donorType}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedMarker.phone && (
                  <View className="mb-4 flex-row items-center">
                    <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                      <Ionicons name="call" size={16} color="#16a34a" />
                    </View>
                    <View>
                      <Text className="text-secondary-500 text-xs font-bold uppercase tracking-wider">Phone</Text>
                      <Text className="text-secondary-900 font-bold">
                        {selectedMarker.phone}
                      </Text>
                    </View>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-secondary-100 rounded-xl py-3.5 items-center"
                    onPress={handleViewDetails}
                  >
                    <Text className="text-secondary-700 font-bold">View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-blue-600 rounded-xl py-3.5 items-center shadow-lg shadow-blue-500/30"
                    onPress={() => {
                      setSelectedMarker(null);
                      navigation.navigate('AvailableDonations');
                    }}
                  >
                    <Text className="text-white font-bold">Browse Medicines</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Nearby List (when no marker selected) */}
            {!selectedMarker && markers.length > 0 && (
              <View
                className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-100 rounded-t-[32px] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
                style={{ maxHeight: height * 0.35 }}
              >
                <View className="px-6 py-4 border-b border-secondary-50">
                  <View className="w-12 h-1 bg-secondary-200 rounded-full self-center mb-4" />
                  <Text className="text-lg font-bold text-secondary-900">
                    Nearby {mode === 'donors' ? 'Donors' : 'Medical Stores'}
                  </Text>
                </View>
                <ScrollView style={{ paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
                  {markers.slice(0, 5).map((marker, index) => (
                    <TouchableOpacity
                      key={marker.id}
                      className="py-4 border-b border-secondary-50 flex-row items-center"
                      onPress={() => handleMarkerPress(marker)}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${index === 0 ? 'bg-yellow-100' : 'bg-secondary-100'
                        }`}>
                        <Text className="text-lg">{index === 0 ? '⭐' : '📍'}</Text>
                      </View>

                      <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                          <Text className="font-bold text-secondary-900 text-base mr-2 flex-1" numberOfLines={1}>
                            {marker.name}
                          </Text>
                          {mode === 'medicals' && marker.isDonor && (
                            <View className="bg-emerald-100 px-2 py-0.5 rounded-md">
                              <Text className="text-emerald-700 text-[10px] font-bold uppercase">Donor</Text>
                            </View>
                          )}
                        </View>

                        <View className="flex-row items-center justify-between">
                          <Text className="text-sm text-secondary-500 font-medium">
                            {(marker.medicines || 0) > 0
                              ? `${marker.medicines} medicines available`
                              : 'No medicines currently'}
                          </Text>
                          {marker.distanceText && (
                            <Text className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                              {marker.distanceText}
                            </Text>
                          )}
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  ))}
                  <View className="h-6" />
                </ScrollView>
              </View>
            )}
          </View>

          {/* Empty State */}
          {markers.length === 0 && !loading && (
            <View className="absolute inset-0 items-center justify-center bg-white/90 z-20">
              <View className="w-24 h-24 bg-secondary-50 rounded-full items-center justify-center mb-6">
                <Text className="text-5xl">
                  {mode === 'donors' ? '🏥' : '🏪'}
                </Text>
              </View>
              <Text className="text-xl font-bold text-secondary-900 mb-2">
                No {mode === 'donors' ? 'Donors' : 'Medical Stores'} Nearby
              </Text>
              <Text className="text-secondary-500 text-center px-10 mb-8 leading-6">
                No {mode === 'donors' ? 'donors with available donations' : 'medical stores'} found in your area
              </Text>
              <TouchableOpacity
                className="bg-blue-600 rounded-xl px-8 py-3 shadow-lg shadow-blue-500/30"
                onPress={loadMapData}
              >
                <Text className="text-white font-bold">Refresh Map</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
