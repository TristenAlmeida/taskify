import { Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react"
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Image, ActivityIndicator } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker";

import moment from "moment"
import { createTask, updateTaskDB } from "../Tasks"
import Toast from "react-native-toast-message";


export default function editEventModal({ isVisible, onClose, onTaskUpdated, task }) {
    const [updateTask, setUpdateTask] = useState({ id: null, title: "", description: "", dueDate: "", time: "", notes: "" });
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (task) {
        setUpdateTask({
          id: task.id || null,
          title: task.title || "",
          description: task.description || "",
          dueDate: task.dueDate || "",
          time: task.time || "",
          notes: task.notes || "",
          attachments: task.attachments || []
        });
      }
      console.log("Task prop received:", task);
    }, [task]);

    const showTimePicker = () => setTimePickerVisible(true);
    const hideTimePicker = () => setTimePickerVisible(false);
    const showDatePicker = () => setDatePickerVisible(true);
    const hideDatePicker = () => setDatePickerVisible(false);

const handleConfirmTime = (time) => {
        const formattedTime = moment(time).format("HH:mm");
        setUpdateTask({ ...updateTask, time: formattedTime });
        hideTimePicker();
      };

      const handleConfirmDate = (date) => {
        setUpdateTask({ ...updateTask, dueDate: date });
        hideDatePicker();
    };

  const editEvent = async () => {
    if (updateTask.id) {
      try {
        setLoading(true);
        await updateTaskDB(updateTask.id, updateTask);
        setLoading(false)
        onClose();
        onTaskUpdated();
        Toast.show({
          type: "success",
          text1: "Task updated successfully!"
        })
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Failed to update task",  
       });
       console.error(error);
      } 
    }
    else {
         Toast.show({
          type: "error",
          text1: "Task does not exist"
         })   
    }
    
  }

  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <View style={styles.headerContainer}>
              <Text style={styles.modalTitle}>Edit Task</Text>
            </View>

            {/* Event Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Task title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter task name"
                value={updateTask.title}
                onChangeText={(text) => setUpdateTask({ ...updateTask, title: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Add details about the task"
                value={updateTask.description}
                onChangeText={(text) => setUpdateTask({ ...updateTask, description: text })}
                multiline
              />
            </View>

            {/* Date and Time */}
            <View style={styles.rowContainer}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Date</Text>
                <TouchableOpacity style={styles.dateTimeButton} onPress={showDatePicker}>
                  <Calendar size={16} color="#666" />
                  <Text style={styles.dateTimeText}>{updateTask.dueDate ? moment(updateTask.dueDate).format("YYYY-MM-DD") : "Select Due Date"}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  mode="date" 
                  display="default"  
                  isVisible={isDatePickerVisible} 
                  onConfirm={handleConfirmDate}
                  onCancel={hideDatePicker} />
              </View>

              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Time</Text>
                <TouchableOpacity style={styles.dateTimeButton} onPress={showTimePicker}>
                  <Clock size={16} color="#666" />
                  <Text style={styles.dateTimeText}>{updateTask.time ? updateTask.time : "Select Time"}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={isTimePickerVisible}
                  mode="time"
                  onConfirm={handleConfirmTime}
                  onCancel={hideTimePicker}
                  is24Hour={true} 
                  display="inline"
                  />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes</Text>
              <TextInput
                style={styles.input}
                placeholder="Add a note"
                value={updateTask.notes}
                onChangeText={(text) => setUpdateTask({ ...updateTask, notes: text })}
                multiline={true}
              />
            </View>
        
           

            {/* Upload Attachments */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Upload attachments</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Select Files</Text>
              </TouchableOpacity>

              <View style={styles.fileContainer}>
                <View style={styles.fileRow}>
                  <File size={16} color="#666" />
                  <Text style={styles.fileName}>Presentation.pptx</Text>
                  <Text style={styles.fileSize}>1.2MB</Text>
                  <TouchableOpacity>
                    <Trash2 size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={editEvent}>
                {loading && <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />}
              <Text style={styles.createButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 10,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  timeRangeText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 10,
    zIndex: 1,
  },
  roomButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  roomButtonText: {
    fontSize: 12,
    color: "#333",
  },
  guestInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 12,
    color: "#333",
  },
  guestsContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reminderText: {
    fontSize: 12,
    color: "#007AFF",
  },
  notificationContainer: {
    marginTop: 8,
  },
  notificationOptions: {
    flexDirection: "row",
    marginBottom: 8,
  },
  notificationOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#F0F0F0",
  },
  selectedOption: {
    backgroundColor: "#E6F2FF",
  },
  notificationText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#666",
  },
  selectedText: {
    color: "#007AFF",
  },
  reminderTimeContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignSelf: "flex-start",
  },
  reminderTimeText: {
    fontSize: 12,
    color: "#666",
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#333",
  },
  fileContainer: {
    marginTop: 12,
  },
  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
    marginRight: 8,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#666",
  },
  createButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
})

