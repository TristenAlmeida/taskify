import React, { useState, useEffect } from "react";
import { View, Linking, Button, FlatList, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, TextInput} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { uploadAttachments,  removeAttachmentFromDB, fetchAttachments } from "../Tasks";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { Feather, Ionicons} from '@expo/vector-icons';
import { Link } from "expo-router";

const FilePicker = ({ taskId }) => {
    const [attachments, setAttachments] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [fileToRename, setFileToRename] = useState(null);
    const [newFileName, setNewFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [removingAttachment, setRemovingAttachment] = useState(null);



  

  useEffect(() => {
    if (!taskId) return;
    const loadFiles = async () => {
      await fetchFiles();
    };
    loadFiles();
   }, [taskId])

    const fetchFiles = async () => {
      setLoading(true)
      try {
        let fetchedAttachments = await fetchAttachments(taskId);
        console.log("Fetched attachments:", fetchedAttachments);
        if (fetchedAttachments) {
          setAttachments(fetchedAttachments);
        } else {
          setAttachments([]);
        }
      } catch(error) {
        Toast.show({
          type: "error",
          text1: "Unable to fetch attachments"
        })
      } finally {
        setLoading(false);
      }
      
    }

    const pickFiles = async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
          copyToCacheDirectory: true,
        });
  
        if (result.type === "cancel" || !result.assets) return;
  
        console.log("📂 DocumentPicker result:", result);
  
        const file = result.assets[0]; // Pick only one file at a time
        setFileToRename(file);
        setNewFileName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension for editing
        console.log("📝 Opening modal for renaming...");
        setModalVisible(true);
      } catch (error) {
        console.error("❌ Error picking files:", error);
      }
    };
  
    const handleRenameAndUpload = async () => {
      if (!fileToRename) return;
  
      try {
        setUploading(true);
  
        // Get file extension
        const fileExtension = fileToRename.name.split(".").pop();
        const updatedFileName = `${newFileName}.${fileExtension}`;
  
        // Define new persistent location
        const newUri = `${FileSystem.documentDirectory}${updatedFileName}`;
  
        // Copy file to persistent storage
        await FileSystem.copyAsync({ from: fileToRename.uri, to: newUri });
  
        console.log("✅ File copied to:", newUri);
  
        const file = {
          name: updatedFileName,
          uri: newUri,
          type: fileToRename.mimeType || "application/octet-stream",
        };
  
        // Upload to Firebase
        const uploadedFiles = (await uploadAttachments(taskId, [file])) || [];
        setAttachments([...attachments, ...uploadedFiles]);
  
        Toast.show({ type: "success", text1: "File uploaded successfully!" });
      } catch (error) {
        console.error("Error uploading file:", error);
        Toast.show({ type: "error", text1: "File upload failed!" });
      } finally {
        setUploading(false);
        setModalVisible(false);
        setFileToRename(null);
        await fetchFiles();
      }
    };
  

    const handleUploadFiles = async () => {
        if (!taskId) {
            Toast.show({ type: "error", text1: "Task must exist before uploading!" });
            return;
        }
        try {
            setUploading(true);
            const file = await pickFiles();
           if ( !file) return;
          const uploadedFile = await uploadAttachments(taskId, file);  // Upload one at a time
          if (uploadedFile) uploadedFiles.push(uploadedFile);

            if (uploadedFiles.length > 0) {
                setAttachments((prev) => [...prev, ...uploadedFiles]);
            }

            Toast.show({ type: "success", text1: "Files uploaded successfully!" });
        } catch (error) {
            console.error("Error uploading files:", error);
            Toast.show({ type: "error", text1: "File upload failed!" });
        } finally {
            setUploading(false);
        }
    };

    const openAttachment = async(item) => {
      setLoading(true)
      const file = attachments.find((attachment) => attachment.url === item.url)
      console.log(file);
      if (file) {
        try {
          await Linking.openURL(file.url);
          console.log("Opening file:", file.url);
        } catch (error) {
          console.error("Error opening file:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.warn("File URL not found!");
      }
    }

    const removeAttachment = async (attachment) => {
      setRemovingAttachment(attachment.url);
      try {
        const success = await removeAttachmentFromDB(taskId, attachment);
        if (success) {
          setAttachments((prev) => prev.filter((att) => att.url && att.url !== attachment.url));
          Toast.show({ type: "success", text1: "Attachment removed!" });
        }
      } catch (error) {
        console.error("Failed to remove attachment", error);
        Toast.show({ type: "error", text1: "Failed to remove attachment!" });
      } finally {
        setRemovingAttachment(null);
      }
    };
  
  

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Upload attachments</Text>
    
        <TouchableOpacity style={styles.uploadButton} onPress={handleUploadFiles}>
          <Text style={styles.uploadButtonText}>Select Files</Text>
        </TouchableOpacity>
    
        {loading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : attachments.length > 0 ? (
          <View>
            <FlatList
              data={attachments}
              keyExtractor={(item, index) => item.url || item.name || index.toString()}
              renderItem={({ item }) => {
                console.log("Rendering item:", item);
                return ( // ✅ Fixed: Added return statement
                  <View style={styles.fileRow}>
                    <TouchableOpacity onPress={() => {openAttachment(item)}} style={{ flexDirection: 'row', alignItems: 'center' }} >
                    <Ionicons name="link-outline" size={24} color="#1C1C1E" />
                      <Text style={{ color: '#1C1C1E', marginLeft: 5, textDecorationLine: 'underline'}}>{item.name}</Text>
                      {loading && <ActivityIndicator size="small" color="#0000ff" />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeAttachment(item)} disabled={removingAttachment === item.url}>
                      {removingAttachment === item.url ? (
                        <ActivityIndicator size="small" color="red" />
                      ) : (
                        <View style={styles.deleteRow}>
                          <Feather name="trash-2" size={20} color={"red"} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
              nestedScrollEnabled={true} // ✅ Fixed: Moved these outside renderItem
              scrollEnabled={false}
            />
          </View>
        ) : (
          <View style={styles.fileText}>
            <Text>No attachments added yet</Text>
          </View>
        )}
    
        <Modal animationType="slide" transparent={true} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename File</Text>
              <TextInput
                style={styles.input}
                value={newFileName}
                onChangeText={setNewFileName}
                placeholder="Enter new file name"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonUpload} onPress={handleRenameAndUpload}>
                  {uploading && <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />}
                  <Text style={{ color: "white" }}>Save & Upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
};

export default FilePicker;

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 8,
        color: "#333",
    },
    uploadButton: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        backgroundColor: "black",
        borderRadius: 6,
        padding: 10,
        alignItems: "center",
    },
    uploadButtonText: {
        fontSize: 14,
        color: "white",
    },
    fileText: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        padding: 8,
        borderColor: "#E0E0E0",
        color: "black"
    },
    fileRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 6,
    },
   
    modalContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      width: "80%",
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 6,
      padding: 10,
      fontSize: 14,
      width: "100%",
      marginBottom: 10,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      color: 'black'
    },
    modalButtonUpload: {
      flexDirection: "row",
      backgroundColor: "#0A84FF",
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      marginTop: 10,
      color: "white",
  },
    modalButton: {
      backgroundColor: '#EFEFEF',
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
      marginTop: 10,
      color: "black"
  },
  loadingIndicator: {
    marginRight: 10,
  }
});
