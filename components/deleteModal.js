import { useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Image, ActivityIndicator } from "react-native"
import { deleteTask } from "../Tasks";
import Toast from "react-native-toast-message";
 

const THEME_COLOR = "#0A84FF";
const BG_COLOR = "#1C1C1E";
const SECONDARY_BG = "#2C2C2E";

export default function DeleteEventModal({ isVisible, onClose, onTaskDeleted, task, closeEdit }) {
    const [loading, setLoading] = useState(false);
    const handleDeleteTask = async () => {
        setLoading(true);
        try {
            await deleteTask(task.id);
            onClose();
           closeEdit();
            onTaskDeleted();
            Toast.show({
                type: "success",
                text1: "Task deleted successfully!"
            })
        } catch {
            Toast.show({
                type: "error",
                text1: "Error, deleting task"
            })
        } finally {
            setLoading(false);
        }
        

      }
    
    return (
        <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
        >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Event</Text>
            <Text style={styles.modalText}>Are you sure you want to delete task '{ task.title }'?</Text>
            <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDeleteTask}>
            {loading && <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />}
                <Text style={styles.modalButtonDeleteText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
    </Modal>
    );
 
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxWidth: 400, // ✅ Ensures modal doesn't stretch too wide
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "black",
    marginBottom: 20,
    textAlign: "center", // ✅ This is valid for Text components
  },
  modalText: {
    fontSize: 18,
    color: "black",
    marginBottom: 20,
    textAlign: "center", // ✅ Ensure this is inside a Text component
  },
  modalButtonDelete: {
    flexDirection: "row",
    backgroundColor: "red",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center", // ✅ Ensures text is centered
    marginTop: 10,
    width: "90%", // ✅ Fix: Prevent button from stretching
  },
  modalButtonDeleteText: {
    fontSize: 16,
    color: "white",
    textAlign: "center", // ✅ Only for Text components
  },
  modalButtonText: {
    fontSize: 16,
    color: "black",
    textAlign: "center", // ✅ Only for Text components
  },
  modalButton: {
    backgroundColor: "#EFEFEF",
    borderRadius: 8,
    padding: 10,
    width: "90%", // ✅ Match delete button width
    alignItems: "center",
    marginTop: 10,
  },
  loadingIndicator: {
    marginRight: 10,
  },
});
