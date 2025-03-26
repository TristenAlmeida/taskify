import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { fetchUserData, updateStreak } from '../Users';
import { getTasksDueToday, toggleCompleteTask } from '../Tasks';
import moment from 'moment';
import AddTaskModal from './createEvent';
import DetailsModal from './taskModal';
import { Checkbox } from "react-native-paper";
import Toast from 'react-native-toast-message';
import StreakButton from './streakButton';
import { useFocusEffect } from "@react-navigation/native";


const THEME_COLOR = "#0A84FF";
const BG_COLOR = "#121212";
const CARD_BG = "#1E1E1E";
const LIGHT_BG = "#F2F2F7";
const TEXT_COLOR = "#FFFFFF";
const SECONDARY_TEXT = "#8E8E93";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function Dashboard({ navigation }) {
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  
  const today = moment();

  const formattedDate = today.format("MMM D");

  
  // Calculate completion percentage
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;

  const openAddModal = () => setIsAddModalVisible(true);
  const closeAddModal = () => setIsAddModalVisible(false);
  
  const openDetailModal = (task) => {
    setSelectedTask(task);
    console.log("Task", task)
    console.log("Task selected", selectedTask)
    setIsDetailModalVisible(true);
  };
  
  const closeDetailModal = () => setIsDetailModalVisible(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const tasksForToday = await getTasksDueToday(today.toDate());
      console.log("Fetched tasks:", tasksForToday);
      setTasks(tasksForToday);
      filterTasks(selectedFilter, tasksForToday);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      Toast.show({
        type: "error",
        text1: "Error Could not load your tasks. Please try again."
      })

    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    setLoading(true);
    try {
      const userData = await fetchUserData();
      setUser(userData)
      setName(userData.firstName);
      await fetchTasks();
    } catch (error) {
      console.error("Error fetching user data: ", error);
      Toast.show({
          type: "error",
          text1: "Error Could not load your profile. Please try again."
        })
    } finally {
      setLoading(false);
    }

  };

  useFocusEffect(
    useCallback(() => {
      getUserData();  // Call the function to refetch data
    }, [])
  );

  const filterTasks = (filter, taskList = tasks) => {
    setSelectedFilter(filter);
    if (filter === 'all') {
      setFilteredTasks(taskList);
    } else if (filter === 'pending') {
      setFilteredTasks(taskList.filter(task => !task.completed));
    } else if (filter === 'completed') {
      setFilteredTasks(taskList.filter(task => task.completed));
    }
  };

   const toggleTaskCompletion = async (task) => {
      await toggleCompleteTask(task);
      await updateStreak();
      await fetchTasks();
      
    };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#FF453A";
      case "Medium":
        return "#FF9F0A";
      case "Low":
        return "#30D158";
      default:
        return "#8E8E93";
    }
  };

  // Group tasks by time for better organization
  const groupTasksByTime = () => {
    const grouped = {};
    
    filteredTasks.forEach(task => {
      const time = task.dueDate ? moment(task.dueDate.toDate()).format("HH:mm") : "No time";
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(task);
    });
    
    return Object.entries(grouped).map(([time, tasks]) => ({
      time,
      tasks,
      id: time
    }));
  };

  if (loading && !name) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={THEME_COLOR} style={styles.loadingIndicator} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with greeting and notification */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <TouchableOpacity style={styles.avatarButton}>
            <Ionicons name="person" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>Hi {name}</Text>
            <Text style={styles.greetingSubtitle}>Welcome Back!</Text>
          </View>
        </View>
        <StreakButton />
      </View>
      
      {/* Productivity Overview Section */}
      <View style={styles.overviewContainer}>
        <Text style={styles.overviewTitle}>Overview of your{'\n'}Productivity</Text>
        
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Feather name="bar-chart-2" size={20} color={THEME_COLOR} />
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPercentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              You completed {completionPercentage}% of your tasks today!
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.addTaskButton} onPress={openAddModal}>
          <Feather name="plus" size={20} color="white" />
          <Text style={styles.addTaskText}>Add New Task</Text>
        </TouchableOpacity>
      </View>
      
      {/* Add Task Modal */}
      <AddTaskModal 
        isVisible={isAddModalVisible} 
        onClose={closeAddModal} 
        onTaskAdded={fetchTasks} 
      />
      
      {/* Task Detail Modal */}
      {selectedTask && (
        <DetailsModal
          isVisible={isDetailModalVisible}
          onClose={closeDetailModal}
          task={selectedTask}
          onTaskUpdated={fetchTasks}
        />
      )}
      
      {/* Tasks Section */}
      <View style={styles.tasksContainer}>
        <View style={styles.tasksHeader}>
          <View style={styles.tasksHeaderLeft}>
            <Feather name="check-square" size={20} color="#000000" />
            <Text style={styles.tasksTitle}>Tasks for Today</Text>
          </View>
          <Text style={styles.taskCount}>
            {completedTasksCount}/{tasks.length} Done
          </Text>
        </View>
        
        {/* Filter Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedFilter === 'all' && styles.activeTab]}
            onPress={() => filterTasks('all')}
          >
            <Text style={[styles.tabText, selectedFilter === 'all' && styles.activeTabText]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedFilter === 'pending' && styles.activeTab]}
            onPress={() => filterTasks('pending')}
          >
            <Text style={[styles.tabText, selectedFilter === 'pending' && styles.activeTabText]}>
              Pending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, selectedFilter === 'completed' && styles.activeTab]}
            onPress={() => filterTasks('completed')}
          >
            <Text style={[styles.tabText, selectedFilter === 'completed' && styles.activeTabText]}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Tasks List */}
        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLOR} style={styles.listLoader} />
        ) : filteredTasks.length > 0 ? (
          <FlatList
            data={groupTasksByTime()}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.timeGroup}>
                <Text style={styles.timeHeader}>{item.time}</Text>
                {item.tasks.map((task) => (
                  <TouchableOpacity 
                    key={task.id} 
                    style={[
                      styles.taskCard,
                      task.completed && styles.completedTaskCard
                    ]}
                    onPress={() => openDetailModal(task)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.priorityIndicator, 
                      { backgroundColor: getPriorityColor(task.priority) }
                    ]} />
                    
                    <View style={styles.taskContent}>
                      <View style={styles.taskMain}>
                        <Text 
                          style={[
                            styles.taskTitle,
                            task.completed && styles.completedText
                          ]}
                          numberOfLines={1}
                        >
                          {task.title}
                        </Text>
                        
                        {task.description ? (
                          <Text 
                            style={[
                              styles.taskDescription,
                              task.completed && styles.completedText
                            ]}
                            numberOfLines={2}
                          >
                            {task.description}
                          </Text>
                        ) : null}
                        
                        {task.priority ? (
                          <View style={styles.priorityBadge}>
                            <Feather
                              name="flag"
                              size={12}
                              color={getPriorityColor(task.priority)}
                            />
                            <Text style={styles.priorityText}>
                              {task.priority}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                      
                      <Checkbox
                        status={task.completed ? "checked" : "unchecked"}
                        color={THEME_COLOR}
                        onPress={() => toggleTaskCompletion(task)}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tasksList}
            ListEmptyComponent={null}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="clipboard" size={64} color="#8E8E93" />
            <Text style={styles.noTasksText}>No tasks for today</Text>
            <TouchableOpacity 
              style={styles.emptyAddButton}
              onPress={openAddModal}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.emptyAddButtonText}>Add Your First Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_COLOR,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: SECONDARY_TEXT,
    marginTop: 2,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_COLOR,
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  dateText: {
    color: SECONDARY_TEXT,
    fontSize: 14,
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME_COLOR,
    borderRadius: 4,
  },
  progressText: {
    color: TEXT_COLOR,
    fontSize: 14,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLOR,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addTaskText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  tasksContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tasksHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tasksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  taskCount: {
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#E5E5EA',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: THEME_COLOR,
  },
  tabText: {
    color: '#636366',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  listLoader: {
    marginTop: 40,
  },
  timeGroup: {
    marginBottom: 16,
  },
  timeHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636366',
    marginLeft: 16,
    marginBottom: 8,
  },
  tasksList: {
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTaskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  priorityIndicator: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 8,
  },
  taskMain: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#636366',
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    color: '#636366',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noTasksText: {
    fontSize: 16,
    color: '#636366',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});