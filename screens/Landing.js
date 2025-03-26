import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView, Pressable } from "react-native"
import { Feather } from "@expo/vector-icons"
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useRouter } from "expo-router";
import * as Linking from 'expo-linking';





const THEME_COLOR = "#0A84FF"
const BG_COLOR = "#1C1C1E"
const SECONDARY_BG = "#2C2C2E"

const Landing = function ({navigation}) {
  

  
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Feather name="check-square" size={32} color={THEME_COLOR} />
          <Text style={styles.headerTitle}>Taskify</Text>
        </View>

        <View style={styles.heroSection}>
          <Image source={require('../assets/banner.png')} style={styles.heroImage} />
          <Text style={styles.heroTitle}>Organize your tasks with ease</Text>
          <Text style={styles.heroSubtitle}>
            Taskify helps you manage your daily tasks, projects, and goals all in one place.
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <FeatureItem icon="list" title="Create Tasks" description="Easily add and organize your tasks" />
          <FeatureItem icon="calendar" title="Set Due Dates" description="Never miss a deadline with reminders" />
          <FeatureItem icon="award" title="Gamification" description="Earn badges and streaks for every task you complete" />
        </View>
      
          <Pressable testID='getStartedButton' style={styles.getStartedButton} onPress={() =>  navigation.navigate('Signup')}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </Pressable>
          <Pressable onPress={() =>  navigation.navigate('Signin')} testID = "signin">
            <Text style={styles.loginPrompt}>
             Already have an account? <Text style={styles.loginLink}>Sign in</Text>
            </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function FeatureItem({ icon, title, description }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Feather name={icon} size={24} color={THEME_COLOR} />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    
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
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  heroImage: {
    width: 400,
    height: 400,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
  },
  featuresSection: {
    marginBottom: 40,
    fontSize: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: SECONDARY_BG,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: "#999",
  },
  getStartedButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  getStartedButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginPrompt: {
    color: "#999",
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  loginLink: {
    color: THEME_COLOR,
    fontWeight: "600",
  },
})

export {Landing};

