import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Text, View, Button } from "react-native"
import { auth } from "../firebaseConfig"
import ProfileScreen from "./Profile"
import Ionicons from '@expo/vector-icons/Ionicons';
import CalendarScreen from "./Calendar";
import * as Linking from 'expo-linking';
import DashboardScreen from "../components/Dashboard";



const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

const Tab = createBottomTabNavigator()



function Home() {
  return (
    <Tab.Navigator 
    screenOptions={{ headerShown: false,tabBarActiveTintColor: "black",
      tabBarInactiveTintColor: SECONDARY_BG,
      headerStyle: {
        backgroundColor: "white",
      },
      tabBarLabelStyle: {
        fontSize: 12,
        marginTop: 2,
      },
      headerShadowVisible: false,
      headerTintColor: "#fff",
      tabBarStyle: {
        backgroundColor: "white",
        borderTopWidth: 0,
        borderTopColor: "black",
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
        justifyContent: "center", }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home-sharp" : "home-outline"} color={color} size={24} />
          ),
        }}  />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar-sharp" : "calendar-outline"} color={color} size={24} />
          ),
        }}  />
      <Tab.Screen name="Profile" component={ProfileScreen}  options={{
          title: "",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={24} />
          ),
        }}  />
    </Tab.Navigator>
  )
}

export {Home};

