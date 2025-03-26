"use client"
import { useState } from "react"
import * as Linking from 'expo-linking';
import { StatusBar } from "expo-status-bar"
import {
  StyleSheet,
  Text,
  View,
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
import { auth, doc, setDoc, db } from "../firebaseConfig"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { Redirect, router } from "expo-router"
import Toast from "react-native-toast-message"





const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

function SignUp({navigation}) {
  const [firstName, setfName] = useState("")
  const [lastName, setlName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false);
  

  
  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "All fields are required!",
      });
      return;
      }
    if (password != confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords don't match!",
      });
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user;
      console.log(user);

      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        streak: 0,
        badges: [],
        lastCompletedDate: null
      });

      Toast.show({
        type: "success",
        text1: "Account Created Succesfully!",
      });
    } catch (error) {
      console.log(error);
      Toast.show({
        type: "error",
        text1: "Sign up Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
      
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Feather name="check-square" size={32} color={THEME_COLOR} />
            <Text style={styles.headerTitle}>Taskify</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with Taskify</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setfName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setlName}
              />
            </View>

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

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>

          
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <View style={styles.signUpButtonContent}>
              {loading && <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />}
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </View>
          </TouchableOpacity>
            

          <Text style={styles.termsText}>
            By signing up, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
          <View style={styles.loginPromptContainer}>
            <Pressable onPress={() => navigation.navigate('Signin')} >
              <Text style={styles.loginPrompt}>
                Already have an account? <Text style={styles.loginLink}>Sign In</Text>
              </Text>
            </Pressable>
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
    marginBottom: 10,
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
  },
  loginPrompt: {
    color: "#999",
    fontSize: 18,
  },
  loginLink: {
    color: THEME_COLOR,
    fontWeight: "600",
  },
})

export { SignUp };
