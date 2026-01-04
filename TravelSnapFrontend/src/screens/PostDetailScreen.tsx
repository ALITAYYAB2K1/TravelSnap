import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  TextInput,
  Modal,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { auth } from "../firebaseConfig";

// Use localhost for web, IP for mobile
const API_BASE_URL =
  Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.2:8000";

type PostDetailParams = {
  PostDetail: {
    post: {
      id: number;
      title: string;
      image_url: string;
      user_uid: string;
      created_at?: string;
    };
  };
};

export default function PostDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PostDetailParams, "PostDetail">>();
  const { post } = route.params;

  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.title);
  const [currentTitle, setCurrentTitle] = useState(post.title);

  const currentUser = auth.currentUser;
  const isOwner = currentUser?.uid === post.user_uid;

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeleting(true);
          try {
            await axios.delete(`${API_BASE_URL}/posts/${post.id}`);
            Alert.alert("Deleted", "Post has been deleted successfully", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch (error: any) {
            console.error("Delete error:", error);
            Alert.alert("Error", "Failed to delete post");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!editedTitle.trim()) {
      Alert.alert("Error", "Title cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      // Create FormData for the PUT request
      const formData = new FormData();
      formData.append("title", editedTitle);

      await axios.put(`${API_BASE_URL}/posts/${post.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCurrentTitle(editedTitle);
      setShowEditModal(false);
      Alert.alert("Success", "Post title updated successfully!");
    } catch (error: any) {
      console.error("Update error:", error);
      Alert.alert("Error", "Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      {/* Image */}
      <Image source={{ uri: post.image_url }} style={styles.image} />

      {/* Post Info */}
      <View style={styles.content}>
        <Text style={styles.title}>{currentTitle}</Text>

        {post.created_at && (
          <Text style={styles.date}>
            📅 {new Date(post.created_at).toLocaleDateString()}
          </Text>
        )}

        <Text style={styles.userId}>
          👤 Posted by: {post.user_uid.substring(0, 8)}...
        </Text>

        {/* Edit & Delete Buttons - only show if user owns the post */}
        {isOwner && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setShowEditModal(true)}
            >
              <Text style={styles.editButtonText}>✏️ Edit Title</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post Title</Text>

            <TextInput
              style={styles.modalInput}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Enter new title"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setEditedTitle(currentTitle);
                  setShowEditModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },
  backButtonText: {
    fontSize: 18,
    color: "#e91e63",
    fontWeight: "600",
  },
  image: {
    width: "100%",
    height: 350,
    resizeMode: "cover",
  },
  content: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    minHeight: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  date: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  userId: {
    fontSize: 14,
    color: "#888",
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#ff5252",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#e91e63",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
