import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import * as Linking from 'expo-linking';
import { auth } from "../firebaseConfig"; 
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import Toast from "react-native-toast-message"

const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

const PasswordResetScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
        Toast.show({
            type: "error",
            text1: "Error, Please enter your email.",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Toast.show({
              type: "success",
              text1: "Password reset link sent!",
            });
    } catch (error) {
        Toast.show({
            type: "error",
            text1: "Error",
            text2: error.message,
      });
    }
  };

   return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Feather name="check-square" size={32} color={THEME_COLOR} />
              <Text style={styles.headerTitle}>Taskify</Text>
            </View>
  
            <Text style={styles.title}>Reset Password</Text>
  
            <View style={styles.form}>
  
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
  
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handlePasswordReset}
            >
              <View style={styles.signUpButtonContent}>
                <Text style={styles.signUpButtonText}>Reset Password</Text>
              </View>
            </TouchableOpacity>
  
            <View style={styles.loginPromptContainer}>
                <Pressable onPress={() => {navigation.navigate('Signin')}} >
                  <Text style={styles.loginLink}> Go back to Sign in</Text>
                </Pressable>
            </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
     
    )
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BG_COLOR,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 40,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "white",
      marginLeft: 10,
      
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "white",
      marginBottom: 30,
    },
    subtitle: {
      fontSize: 20,
      color: "#999",
      marginBottom: 30,
    },
    form: {
      marginBottom: 30,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: SECONDARY_BG,
      borderRadius: 10,
      marginBottom: 16,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: "white",
      fontSize: 20,
      paddingVertical: 12,
    },
    eyeIcon: {
      padding: 10,
    },
    signUpButton: {
      backgroundColor: THEME_COLOR,
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: "center",
      marginBottom: 20,
      justifyContent: "center",  
      marginTop: 10,
    },
    loadingIndicator: {
      marginRight: 10,
    },
    signUpButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    signUpButtonText: {
      color: "white",
      fontSize: 20,
      fontWeight: "bold",
    },
    termsText: {
      color: "#999",
      textAlign: "center",
      fontSize: 18,
      marginBottom: 20,
    },
    termsLink: {
      color: THEME_COLOR,
      fontWeight: "600",
    },
    loginPromptContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 10,
    },
    loginPrompt: {
      color: "#999",
      fontSize: 18,
    },
    loginLink: {
      color: THEME_COLOR,
      fontWeight: "600",
      fontSize: 18,
    },
  })

export {PasswordResetScreen};
