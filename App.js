import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { useState, useEffect } from "react"
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebaseConfig"
import { SignIn } from './screens/SignIn';
import  { Landing } from './screens/Landing';
import {SignUp} from './screens/SignUp';
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import {Home} from './screens/Home';
import {PasswordResetScreen} from './screens/PasswordReset';
import * as Linking from 'expo-linking';
import { GestureHandlerRootView } from "react-native-gesture-handler";



const Stack = createNativeStackNavigator();
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "green",
        height: 80, // Increase height
        width: "90%", // Make it wider
        borderRadius: 10,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
      }}
      text1Style={{
        fontSize: 20, // Make title text bigger
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 16, // Make description text bigger
      }}
    />
  ),

  error: (props) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "red",
        height: 80, // Bigger error toast
        width: "90%",
        borderRadius: 10,
      }}
      text1Style={{
        fontSize: 20,
        fontWeight: "bold",
      }}
      text2Style={{
        fontSize: 16,
      }}
    />
  ),
};

export function myStack(user) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Landing" component={Landing} options={{ headerShown: false }} />
            <Stack.Screen name="Signin" component={SignIn} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
            <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
      <Toast config={toastConfig} />
    </SafeAreaView>
  </GestureHandlerRootView>
  )
}

export function App() {

const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe =  auth.onAuthStateChanged(user => {
        setUser(user)
    })
    return unsubscribe;
  }, [])
  


  return (
    <NavigationContainer>
      <StatusBar translucent={false} backgroundColor="black" style="light" />
        {myStack(user)}
    </NavigationContainer>
 
  )
}
