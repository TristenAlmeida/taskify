import { Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react"
import { View, Animated, TouchableWithoutFeedback, Text, TextInput, StyleSheet, Modal, TouchableOpacity, ScrollView, Platform, Image, ActivityIndicator, Dimensions } from "react-native"
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { 
  FontAwesome, 
  MaterialIcons, 
  Ionicons, 
  Feather, 
  Entypo 
} from '@expo/vector-icons';
import moment from "moment"
import { createTask, updateTaskDB, uploadAttachments } from "../Tasks"
import Toast from "react-native-toast-message";
import * as DocumentPicker from 'expo-document-picker';
import { FlatList } from "react-native-actions-sheet";
import FilePicker from "./uploadAttachmentModal";
import { Picker } from "@react-native-picker/picker";
import DeleteEventModal from "./deleteModal";



const { width } = Dimensions.get('window');


export default function DetailsModal({ isVisible, onClose, onTaskUpdated, task, navigation}) {
    const [updateTask, setUpdateTask] = useState({ id: null, title: "", description: "", dueDate: "", time: "", notes: "", attachments: [], priority: "" });
    const [isTimePickerVisible, setTimePickerVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editing, setIsEditing] = useState(false);
    const [isDeleteEventModalVisible, setIsDeleteModalVisible] = useState(false);


    useEffect(() => {
        if (task.id) {
          setUpdateTask({
            id: task.id ,
            title: task.title || "",
            description: task.description || "",
            dueDate: task.dueDate instanceof Timestamp ? task.dueDate.toDate() : task.dueDate || "",
            time: task.time || "",
            notes: task.notes || "",
            attachments: task.attachments ?? [],
            priority: task.priority || "",
          });
          console.log("Task prop received:", task);
      }
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
        const formattedDate = moment(date).format("YYYY-MM-DD");
        console.log("Selected Date:", formattedDate);
        setUpdateTask({ ...updateTask, dueDate: formattedDate });
        hideDatePicker();
    };

    const handleClose = () => {
        setIsEditing(false);
        onClose();
    }


  const editEvent = async ( ) => {
    console.log("updateTask before checking ID:", updateTask);
    if (!updateTask || !updateTask.id) {
      Toast.show({
        type: "error",
        text1: "Task does not exist"
      });
      return;
    }
    try {
        setLoading(true);
        console.log(updateTask);
        const {id, ...data} = updateTask;
        console.log("Sending to updateTaskDB - ID:", id, "Data:", data);
        await updateTaskDB(id, data);
        onTaskUpdated();
        onClose();
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
      } finally {
        setLoading(false);
      }   
  }




  return (
    <Modal animationType="slide" transparent={true} visible={isVisible} onRequestClose={handleClose} >
    <TouchableWithoutFeedback onPress={handleClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ScrollView showsVerticalScrollIndicator={true}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleClose}> 
                    <FontAwesome name="arrow-circle-left" size={24} color={"black"} />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Details</Text>
                <View style={styles.actionContainer}>
                    <TouchableOpacity testID="editButton" onPress={() => setIsEditing((prev) => !prev)}>
                    <Feather name="edit" size={24} color={"black"} />   
                    </TouchableOpacity> 
                    <TouchableOpacity onPress={() => { setIsDeleteModalVisible(true)}}>
                      <Feather name="trash-2" size={24} color={"red"}  /> 
                    </TouchableOpacity>
                </View>
            </View>
        
            {/* Event Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Task title</Text>
              <TextInput
                placeholder="Enter task name"
                value={updateTask.title}
                style={editing ? styles.input : styles.disabled}
                editable={editing}
                onChangeText={(text) => setUpdateTask({ ...updateTask, title: text })}
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={editing ? styles.input : styles.disabled}
                editable={editing}
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
                <TouchableOpacity onPress={showDatePicker} disabled={!editing}  style={editing ? styles.dateTimeButton : styles.disabledButton}>
                <MaterialIcons name="event" size={16} color={"#666"}/> 
                  <Text style={editing ? styles.dateTimeText : styles.disabledDate}>{updateTask.dueDate ? moment(updateTask.dueDate).format("YYYY-MM-DD") : "Select Due Date"}</Text>
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
                <TouchableOpacity  style={editing ? styles.dateTimeButton : styles.disabledButton} onPress={showTimePicker} disabled={!editing}>
                <FontAwesome name="clock-o" size={16} color={"#666"} />
                  <Text style={editing ? styles.dateTimeText : styles.disabledDate}>{updateTask.time ? updateTask.time : "Select Time"}</Text>
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
                style={editing ? styles.input : styles.disabled}
                editable={editing}
                placeholder="Add a note"
                value={updateTask.notes}
                onChangeText={(text) => setUpdateTask({ ...updateTask, notes: text })}
                multiline={true}
              />
            </View>
        
            <DeleteEventModal isVisible={isDeleteEventModalVisible} onClose={() => { setIsDeleteModalVisible(false)}} task={task} onTaskDeleted={onTaskUpdated} closeEdit={handleClose}/>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Select Priority</Text>
                      <Picker
                          enabled={editing}
                          style={editing ? styles.picker : styles.disabledPicker}
                          selectedValue={updateTask.priority}
                          onValueChange={(value) => setUpdateTask({...updateTask, priority: value})}
                           >
                        <Picker.Item label="None" value="None" />
                        <Picker.Item label="🟢 Low" value="Low" />
                        <Picker.Item label="🟡 Medium" value="Medium" />
                          <Picker.Item label="🔴 High" value="High" />
                        </Picker>
            </View>
            <View>
                <FilePicker taskId={updateTask.id}/>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          {editing ? (
            <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.createButton} onPress={editEvent}>
                {loading && <ActivityIndicator size="small" color="white" style={styles.loadingIndicator} />}
              <Text style={styles.createButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
          ) : (
            null
          )}
          
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  picker: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 6,
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

  disabledDate: {
    marginLeft: 8,
    color: "#777",  // Slightly dimmed text color
    fontStyle: "italic", // Italicized text for clarity
  },
  disabledButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#F2F2F2",
    borderColor: "#D3D3D3",  // Softer border
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
    backgroundColor: "black",
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  uploadButtonText: {
    fontSize: 14,
    color: "white",
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
    alignItems: "center",
    justifyContent: "space-around",
    gap: 10,
    marginTop: 5,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#EFEFEF',
  },
  cancelButtonText: {
    fontSize: 14,
    color: "black",
  },
  createButton: {
    backgroundColor: "#0A84FF",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    width: "auto",
    alignSelf: "center"
  },
  createButtonText: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  disabled: {
    borderWidth: 1,
    borderColor: "#D3D3D3",  // Softer border
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#F2F2F2", // Lighter background
    color: "#777",  // Slightly dimmed text color
    fontStyle: "italic", // Italicized text for clarity
},
disabledPicker: {
  borderWidth: 1,
  borderColor: "#D3D3D3",  // Softer border
  borderRadius: 6,
  fontSize: 14,
  backgroundColor: "#F2F2F2", // Lighter background
  color: "#777",  // Slightly dimmed text color
  fontStyle: "italic", // Italicized text for clarity
},
loadingIndicator: {
  marginRight: 10,
}
})

