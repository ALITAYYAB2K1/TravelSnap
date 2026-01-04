import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { auth } from "../firebaseConfig";
import { useNavigation } from "@react-navigation/native";

// Use localhost for web, IP for mobile
const API_BASE_URL =
  Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.2:8000";

export default function AddPostScreen() {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera roll permissions to upload photos."
      );
      return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera permissions to take photos."
      );
      return;
    }

    // Open camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!image) {
      Alert.alert("Error", "Please select an image");
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    setLoading(true);
    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("user_uid", currentUser.uid);

      // Get the file extension from the URI
      const uriParts = image.uri.split(".");
      const fileType = uriParts[uriParts.length - 1] || "jpg";

      if (Platform.OS === "web") {
        // Web: fetch the blob and append it
        const response = await fetch(image.uri);
        const blob = await response.blob();
        formData.append("file", blob, `photo.${fileType}`);
      } else {
        // Mobile: use uri/name/type object
        formData.append("file", {
          uri: image.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        } as any);
      }

      await axios.post(`${API_BASE_URL}/posts/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success! 🎉", "Your travel photo has been posted!", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setTitle("");
            setImage(null);
            // Navigate to Feed
            navigation.navigate("Feed" as never);
          },
        },
      ]);
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert("Error", error.message || "Failed to upload post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>📷 Add New Post</Text>

        {/* Image Preview */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No image selected</Text>
            </View>
          )}
        </View>

        {/* Image Picker Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
            <Text style={styles.pickerButtonText}>📁 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
            <Text style={styles.pickerButtonText}>📸 Camera</Text>
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <TextInput
          style={styles.input}
          placeholder="Enter a title for your photo..."
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Share Post 🚀</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  imageContainer: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  submitButton: {
    backgroundColor: "#e91e63",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
