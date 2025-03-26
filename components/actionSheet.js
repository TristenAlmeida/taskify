import React from "react";
import { Modal, View, TouchableOpacity, Text, StyleSheet } from "react-native";

const SideActionSheet = ({ visible, onClose, onEdit, onDelete, position }) => {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
        <View style={[styles.menuContainer, { top: position.y, left: position.x }]}>
          <TouchableOpacity onPress={onEdit} style={styles.menuItem}>
            <Text>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.menuItem}>
            <Text>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  menuContainer: {
    position: "absolute",
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    padding: 10,
  },
});

export default SideActionSheet;
