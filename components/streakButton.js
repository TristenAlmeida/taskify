import {useState, useEffect} from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { listenToUserData } from "../Users";

const THEME_COLOR = "#0A84FF";
const MILESTONE_COLORS = {
  7: "#FF9F0A",    // Orange
  30: "#5E5CE6",   // Purple
  100: "#FF375F"   // Red
};

const MILESTONES = [7, 30, 100];

const StreakButton = ({  onPress }) => {
    const [userData, setUserData] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [streak, setStreak] = useState(0)
    useEffect(() => {
        const unsubscribe = listenToUserData(setUserData);
        return () => unsubscribe();  // Cleanup listener when component unmounts
    }, []);
    
useEffect(() => {
    if (userData?.streak !== undefined) {
        setStreak(userData.streak);
    }
}, [userData]);
 
  
  // Find the next milestone
  const nextMilestone = MILESTONES.find(m => streak < m) || MILESTONES[MILESTONES.length - 1];
  const previousMilestone = MILESTONES.filter(m => streak >= m).pop() || 0;
  
  // Calculate progress to next milestone
  const progress = nextMilestone ? 
    ((streak - previousMilestone) / (nextMilestone - previousMilestone)) * 100 : 
    100;
  
  // Determine which badges are earned
  const earnedBadges = MILESTONES.filter(m => streak >= m);
  
  // Get color based on current progress
  const getProgressColor = () => {
    if (streak >= 100) return MILESTONE_COLORS[100];
    if (streak >= 30) return MILESTONE_COLORS[30];
    if (streak >= 7) return MILESTONE_COLORS[7];
    return MILESTONE_COLORS[7]; // Default to first milestone color
  };
  
  const handlePress = () => {
    setModalVisible(true);
    if (onPress) onPress();
  };

 
  
  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
        testID='open-button'
      >
        <MaterialCommunityIcons 
          name="fire" 
          size={24} 
          color={getProgressColor()} 
        />
        
        <View style={styles.streakInfo}>
          <Text style={styles.streakCount}>{streak}</Text>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${progress}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
          </View>
        </View>
        
        {/* Show badge indicators for earned milestones */}
        <View style={styles.badgeIndicators}>
          {earnedBadges.length > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{earnedBadges.length}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      
      {/* Streak Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Keep Going!</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
                testID='close-button'
              >
                <Feather name='x' size={20} color={"white"}/>
              </TouchableOpacity>
            </View>
            
            <View style={styles.currentStreakContainer}>
              <MaterialCommunityIcons 
                name="fire" 
                size={40} 
                color={getProgressColor()} 
              />
              <View style={styles.currentStreakInfo}>
                <Text style={styles.currentStreakLabel}>Current Streak</Text>
                <Text style={styles.currentStreakCount}>{streak} days</Text>
              </View>
            </View>
            
            <View style={styles.milestoneProgress}>
              <Text style={styles.milestoneTitle}>
                {nextMilestone > streak ? 
                  `${nextMilestone - streak} days until next milestone` : 
                  "All milestones achieved!"}
              </Text>
              
              <View style={styles.milestoneBar}>
                {MILESTONES.map((milestone, index) => (
                  <View key={milestone} style={styles.milestoneSection}>
                    <View 
                      style={[
                        styles.milestoneDot, 
                        { 
                          backgroundColor: streak >= milestone ? 
                            MILESTONE_COLORS[milestone] : '#8E8E93' 
                        }
                      ]} 
                    />
                    <Text style={styles.milestoneLabel}>{milestone}</Text>
                  </View>
                ))}
              </View>
              
              <View style={styles.milestoneBarBackground}>
                <View 
                  style={[
                    styles.milestoneBarFill,
                    { width: `${(Math.min(streak, 100) / 100) * 100}%` }
                  ]}
                />
              </View>
            </View>
            
            <Text style={styles.badgesTitle}>Earned Badges</Text>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesContainer}
            >
              {MILESTONES.map(milestone => (
                <View key={milestone} style={styles.badgeItem}>
                  <View 
                    style={[
                      styles.badge, 
                      streak >= milestone ? 
                        { backgroundColor: 'rgba(255, 255, 255, 0.1)' } : 
                        styles.unearned
                    ]}
                  >
                    {streak >= milestone ? (
                        <Image
                            source={milestone === 7 ? require("../assets/orange-badge.png") :
                                milestone === 30 ? require("../assets/purple-badge.png") :
                                require("../assets/red-badge.png")}
                            style={styles.image}
                        />
        
         
                      
                    ) : (
                      <FontAwesome5 name="lock" size={20} color="#8E8E93" />
                    )}
                  </View>
                  <Text style={styles.badgeLabel}>
                    {milestone} Day{milestone !== 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.badgeDescription}>
                    {streak >= milestone ? 
                      `Completed ${milestone} day streak!` : 
                      `Complete ${milestone} day streak`}
                  </Text>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default StreakButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 90,
  },
  streakInfo: {
    marginLeft: 8,
    flex: 1,
  },
  streakCount: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginTop: 4,
    width: '100%',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  badgeIndicators: {
    marginLeft: 4,
  },
  badgeCount: {
    backgroundColor: '#FF453A',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentStreakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  currentStreakInfo: {
    marginLeft: 16,
  },
  currentStreakLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  currentStreakCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  milestoneProgress: {
    marginBottom: 24,
  },
  milestoneTitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
  },
  milestoneBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  milestoneSection: {
    alignItems: 'center',
  },
  milestoneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  milestoneLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  milestoneBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  milestoneBarFill: {
    height: '100%',
    backgroundColor: THEME_COLOR,
    borderRadius: 3,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  badgesContainer: {
    paddingBottom: 16,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 100,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  unearned: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image: {
    height: 40,
    width: 40,
    resizeMode: "contain"


  }
});

