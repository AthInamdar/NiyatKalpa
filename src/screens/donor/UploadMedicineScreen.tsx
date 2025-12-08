import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Your services
import { db, storage } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import { getCurrentLocation, LocationCoords } from "../../services/location";
import { extractMedicineDetails } from "../../services/medicineExtraction";

// Type-safe navigation
import { useNavigation } from "@react-navigation/native";

export default function UploadMedicineScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Images
  const [frontImageUri, setFrontImageUri] = useState<string | null>(null);
  const [labelImageUri, setLabelImageUri] = useState<string | null>(null);

  // Form Fields
  const [medicineName, setMedicineName] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [batchNo, setBatchNo] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [mrp, setMrp] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");

  // System
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<LocationCoords | null>(null);

  // Fetch location
  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      if (loc) setLocation(loc);
    })();
  }, []);

  // Pick image (camera or gallery)
  const pickImage = async (type: "front" | "label", useCamera: boolean = false) => {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          quality: 0.8,
        });

    if (!result.canceled && result.assets[0]) {
      if (type === "front") setFrontImageUri(result.assets[0].uri);
      else setLabelImageUri(result.assets[0].uri);
    }
  };

  // OCR using your existing Gemini service
  const runOCR = async () => {
    if (!frontImageUri) {
      Toast.show({
        type: "error",
        text1: "Missing Image",
        text2: "Please upload the front image",
      });
      return;
    }

    setExtracting(true);

    try {
      Toast.show({
        type: "info",
        text1: "Extracting Details",
        text2: "Please wait while we scan the medicine...",
      });

      // Use your existing extractMedicineDetails function
      const extractedData = await extractMedicineDetails(frontImageUri, labelImageUri || undefined);

      // Autofill with original field names
      if (extractedData.name) setMedicineName(extractedData.name);
      if (extractedData.manufacturer) setManufacturer(extractedData.manufacturer);
      if (extractedData.batchNo) setBatchNo(extractedData.batchNo);
      if (extractedData.mfdDate) setMfgDate(extractedData.mfdDate);
      if (extractedData.expiryDate) setExpiryDate(extractedData.expiryDate);
      if (extractedData.mrp) setMrp(extractedData.mrp.toString());

      Toast.show({
        type: "success",
        text1: "Details Extracted",
        text2: "Review before submitting"
      });

    } catch (e) {
      console.error(e);
      Toast.show({
        type: "error",
        text1: "OCR Failed",
        text2: "Please fill manually.",
      });
    }

    setExtracting(false);
  };

  // Upload to Firebase
  const uploadToFirebase = async () => {
    if (!medicineName || !batchNo || !manufacturer || !quantity || !expiryDate) {
      Toast.show({
        type: "error",
        text1: "Missing fields",
        text2: "Please fill all required fields"
      });
      return;
    }

    setLoading(true);

    try {
      const urls: string[] = [];

      const uploadImage = async (uri: string, name: string) => {
        const blob = await (await fetch(uri)).blob();
        const storageRef = ref(storage, `donations/${user?.uid}/${Date.now()}_${name}.jpg`);
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      };

      if (frontImageUri) urls.push(await uploadImage(frontImageUri, "front"));
      if (labelImageUri) urls.push(await uploadImage(labelImageUri, "label"));

      // convert expiry to timestamp
      const [mm, yyyy] = expiryDate.split("/");
      const expiryTS = Timestamp.fromDate(new Date(Number(yyyy), Number(mm) - 1));

      const payload = {
        name: medicineName,
        batchNo,
        manufacturer,
        mfgDate: mfgDate || null,
        expiryDate: expiryTS,
        mrp: mrp || null,
        description,
        quantity: Number(quantity),
        photos: urls,
        donorId: user?.uid,
        donorName: user?.displayName || user?.email,
        createdAt: serverTimestamp(),
        location: location ? {
          lat: location.lat,
          lng: location.lng,
          address: location.address || ""
        } : null
      };

      await addDoc(collection(db, "donations"), payload);

      Toast.show({
        type: "success",
        text1: "Donation uploaded",
      });

      navigation.goBack();

    } catch (err) {
      console.error(err);
      Toast.show({
        type: "error",
        text1: "Upload failed",
      });
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      
      {/* Header */}
      <LinearGradient
        colors={["#2563eb", "#3b82f6"]}
        style={{ paddingTop: insets.top + 20, paddingBottom: 30 }}
      >
        <View className="flex-row items-center px-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4"
          >
            <Ionicons name="arrow-back" color="#fff" size={22} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Upload Medicine</Text>
        </View>
      </LinearGradient>

      <ScrollView className="px-5 mt-4">

        {/* IMAGES */}
        <View className="bg-white p-5 rounded-2xl mb-6 shadow">
          <Text className="font-bold mb-3">📸 Medicine Images</Text>

          {/* Front */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Front Photo (Medicine Name & Brand) *
            </Text>
            {frontImageUri ? (
              <View className="relative">
                <Image source={{ uri: frontImageUri }} className="h-48 w-full rounded-xl" />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  onPress={() => setFrontImageUri(null)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 rounded-xl bg-blue-50 border border-blue-300 p-4"
                  onPress={() => pickImage("front", true)}
                >
                  <View className="items-center">
                    <Ionicons name="camera" size={24} color="#2563eb" />
                    <Text className="text-blue-700 mt-1">Camera</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-xl bg-blue-50 border border-blue-300 p-4"
                  onPress={() => pickImage("front", false)}
                >
                  <View className="items-center">
                    <Ionicons name="images" size={24} color="#2563eb" />
                    <Text className="text-blue-700 mt-1">Gallery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Label */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">
              Label Photo (Batch, MFG, EXP, MRP) - Optional
            </Text>
            {labelImageUri ? (
              <View className="relative">
                <Image source={{ uri: labelImageUri }} className="h-48 w-full rounded-xl" />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-2"
                  onPress={() => setLabelImageUri(null)}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 rounded-xl bg-emerald-50 border border-emerald-300 p-4"
                  onPress={() => pickImage("label", true)}
                >
                  <View className="items-center">
                    <Ionicons name="camera" size={24} color="#059669" />
                    <Text className="text-emerald-700 mt-1">Camera</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 rounded-xl bg-emerald-50 border border-emerald-300 p-4"
                  onPress={() => pickImage("label", false)}
                >
                  <View className="items-center">
                    <Ionicons name="images" size={24} color="#059669" />
                    <Text className="text-emerald-700 mt-1">Gallery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Scan Button */}
          {frontImageUri && (
            <TouchableOpacity
              onPress={runOCR}
              disabled={extracting}
              className="bg-purple-600 rounded-xl py-4 mt-4 items-center"
            >
              {extracting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold">Scan & Autofill</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* FORM */}
        <View className="bg-white p-5 rounded-2xl shadow mb-10">
          <Text className="font-bold mb-4">📝 Details</Text>

          <TextInput
            placeholder="Medicine Name *"
            value={medicineName}
            onChangeText={setMedicineName}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Manufacturer *"
            value={manufacturer}
            onChangeText={setManufacturer}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Batch Number *"
            value={batchNo}
            onChangeText={setBatchNo}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Mfg Date (MM/YYYY)"
            value={mfgDate}
            onChangeText={setMfgDate}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Expiry Date (MM/YYYY) *"
            value={expiryDate}
            onChangeText={setExpiryDate}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="MRP (₹)"
            keyboardType="numeric"
            value={mrp}
            onChangeText={setMrp}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Quantity *"
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          <TextInput
            placeholder="Description (optional)"
            multiline
            value={description}
            onChangeText={setDescription}
            className="bg-gray-100 p-3 rounded-xl mb-3"
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={uploadToFirebase}
            disabled={loading}
            className="bg-emerald-600 rounded-xl py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Submit Donation</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
