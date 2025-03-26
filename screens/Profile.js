"use client"

import { useState, useEffect } from "react"
import * as Linking from 'expo-linking';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from "react-native"
import { auth } from "../firebaseConfig"
import { Feather, Ionicons } from "@expo/vector-icons";
import { db, doc, getDoc, updateDoc } from "../firebaseConfig"
import Toast from "react-native-toast-message"

const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [ fName, setfName] = useState("")
  const [ lName, setlName] = useState("") 
  const [loading, setLoading] = useState(false)



  useEffect( () => {

    const fetchUserData = async () => {
      const currentUser = auth.currentUser
      if (!currentUser) return;

      setLoading(true);
      try { 
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log("User Data:", userData);
              setfName(userData.firstName || "");
              setlName(userData.lastName || "");
            }
            setUser(currentUser);
            setEmail(currentUser.email);
        } catch (error) {
            console.error("Error fetching user data: ", error)
      } finally { 
        setLoading(false);
      }
    }
    fetchUserData();
  }, [])

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { firstName: fName, lastName: lName });
      setIsEditing(false)
       Toast.show({
              type: "success",
              text1: "Profile Updated Succesfully!",
            });
    } catch (error) {
      console.error("Error updating profile:", error)
      Toast.show({
              type: "error",
              text1: "Failed to update profile",
              text2: error.message,
            });
    }
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      // Navigate to login screen or handle sign out in your app's navigation
      Toast.show({
        type: "success",
        text1: "Signed Out Successfully!",
      });
    } catch (error) {
      console.error("Error signing out:", error)
      Toast.show({
        type: "error",
        text1: "Failed to sign out",
        text2: error.message,
      });
    }
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
          {loading && <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />}
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
        <Feather name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>


        <View style={styles.infoContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={fName}
            editable={isEditing}
            onChangeText={setfName}
            
          />
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={lName}
            editable={isEditing}
            onChangeText={setlName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.disabledInput]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={false}
          />
          { isEditing ? (
            <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveChangesButton} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
             ) : (
              <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
                      <View style={styles.signUpButtonContent}>
                        <Text style={styles.buttonText}>Edit Profile</Text>
                      </View>
                </TouchableOpacity>
             )}
        
                      
        
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  loadingIndicator: {
    marginTop: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  logoutButton: {
    padding: 8,
  },
  profileContent: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: THEME_COLOR,
    borderRadius: 20,
    padding: 8,
  },
  infoContainer: {
    width: "90%",
    marginHorizontal: "auto",
  },
  label: {
    color: "#999",
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: SECONDARY_BG,
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
    marginBottom: 20,
  },
  disabledInput: {
    backgroundColor: SECONDARY_BG,
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
      backgroundColor: THEME_COLOR,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
      justifyContent: "center", 
      width: "100%", 
  },
  saveChangesButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center", 
    width: "50%", 
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center", 
    width: "45%", 
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
})


