import { useEffect, useState } from "react"
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth, db, doc, getDoc } from "../firebaseConfig"
import { Link } from "expo-router";
import Toast from "react-native-toast-message"




const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

function SignIn({navigation}) {

const [email, setEmail] = useState("")
const [password, setPassword] = useState("")
const [showPassword, setShowPassword] = useState(false)
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");




const handlesignIn = async () => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User Data:", userData);
      }

   
    } catch (err) {
      console.log(err);
      

      Toast.show({
        type: "error",
        text1: "Sign in Failed",
        text2: "Invalid email/password. Please try again.",

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

          <Text style={styles.title}>Sign in to Taskify</Text>

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

          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handlesignIn}
            testID="SigninButton:Button:SignIn"

          >
            <View style={styles.signUpButtonContent}>
              {loading && <ActivityIndicator size="large" color="white" style={styles.loadingIndicator} />}
              <Text style={styles.signUpButtonText}>Sign In</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.loginPromptContainer}>
              <Pressable onPress={() => {navigation.navigate('Signup')}} >
                <Text style={styles.loginPrompt}>
                  Don't have an account? <Text style={styles.loginLink}>Sign Up</Text>
                </Text>
              </Pressable>
          </View>
          <View style={styles.loginPromptContainer}>
              <Pressable onPress={() => {navigation.navigate('PasswordReset')}} >
                <Text style={styles.loginPrompt}>
                  <Text style={styles.loginLink}>Forgot your Password?</Text>
                </Text>
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
  },
})

export { SignIn };

