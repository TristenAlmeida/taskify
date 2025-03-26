import { useState, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  StatusBar
} from "react-native";
import CalendarStrip from "react-native-calendar-strip";
import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import moment from "moment";
import { Checkbox } from "react-native-paper";
import { getTasksDueToday, toggleCompleteTask } from "../Tasks";
import AddTaskModal from "../components/createEvent";
import DetailsModal from "../components/taskModal";
import { fetchUserData, setLastCompleted, updateStreak } from "../Users";
import StreakButton from "../components/streakButton";
import { useFocusEffect } from "@react-navigation/native";
import { listenToUserData } from "../Users";


const THEME_COLOR = "#0A84FF";
const BG_COLOR = "#121212";
const CARD_BG = "#1E1E1E";
const LIGHT_BG = "#F2F2F7";
const TEXT_COLOR = "#FFFFFF";
const SECONDARY_TEXT = "#8E8E93";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CalendarScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(moment());
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [updateTask, setUpdateTask] = useState({
    id: null,
    title: "",
    description: "",
    dueDate: "",
    time: "",
    notes: "",
    attachments: [],
    priority: ""
  });

  useEffect(() => {
    getUserData();
    const unsubscribe = listenToUserData(setUser); // Subscribe to user data changes
  
    return () => unsubscribe(); // Unsubscribe when the component unmounts
  }, []);

  const onDateSelected = (date) => {
    setSelectedDate(date);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const tasksForToday = await getTasksDueToday(selectedDate.toDate());
      console.log("Fetched tasks:", tasksForToday);
      setTasks(tasksForToday);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserData = async () => {
    try {
      const data = await fetchUserData();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }


  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);
  

  const openAddModal = () => {
    setIsAddModalVisible(true);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
  };

  const openModal = (task) => {
    setUpdateTask({
      id: task.id || null,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate ? moment(task.dueDate.toDate()).format("YYYY-MM-DD") : "",
      time: task.dueDate ? moment(task.dueDate.toDate()).format("HH:mm") : "",
      notes: task.notes || "",
      attachments: task.attachments || [],
      priority: task.priority || ""
    });
    setIsModalVisible(true);
  };

  const toggleTaskCompletion = async (task) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
    try {
      await toggleCompleteTask(task);
      await updateStreak();
      
    } catch (error) {
      console.error("Error updating task", error);
      // Revert UI in case of failure
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        )
      );
    }
    
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

  const groupTasksByTime = () => {
    const grouped = {};
    
    tasks.forEach(task => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.headerButtons}>
          {user ? (
              <StreakButton  />
            ) : (
              <ActivityIndicator size="small" color={THEME_COLOR} />
            )}
          <TouchableOpacity onPress={openAddModal} style={styles.addButton}>
            <Feather name="plus" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarContainer}>
        <CalendarStrip
          style={styles.calendarStrip}
          calendarHeaderStyle={styles.calendarHeader}
          dateNumberStyle={styles.dateNumber}
          dateNameStyle={styles.dateName}
          highlightDateNumberStyle={styles.highlightDateNumber}
          highlightDateNameStyle={styles.highlightDateName}
          disabledDateNameStyle={styles.disabledDateName}
          disabledDateNumberStyle={styles.disabledDateNumber}
          iconContainer={{ flex: 0.1 }}
          calendarAnimation={{ type: "sequence", duration: 30 }}
          daySelectionAnimation={{
            type: "border",
            duration: 200,
            borderWidth: 0,
            borderHighlightColor: "transparent",
          }}
          onDateSelected={onDateSelected}
          iconLeft={require("../assets/images/arrow-left-50.png")}
          iconRight={require("../assets/images/arrow-right-50.png")}
          selectedDate={selectedDate}
          showMonth={true}
        />
      </View>

      {/* Selected Date Header */}
      <View style={styles.selectedDateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate.format("dddd, MMMM D")}
        </Text>
        <TouchableOpacity 
          style={styles.todayButton}
          onPress={() => setSelectedDate(moment())}
        >
          <Text style={styles.todayButtonText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Tasks List */}
      <View style={styles.tasksContainer}>
        {loading ? (
          <ActivityIndicator size="large" color={THEME_COLOR} style={styles.loader} />
        ) : tasks.length > 0 ? (
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
                    onPress={() => openModal(task)}
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
                        testID="task-checkbox"
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
            <Feather name="calendar" size={64} color="#8E8E93" />
            <Text style={styles.noTasksText}>No tasks for this day</Text>
            <TouchableOpacity 
              style={styles.addTaskButton}
              onPress={openAddModal}
            >
              <Feather name="plus" size={16} color="white" />
              <Text style={styles.addTaskText}>Add Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Floating Action Button (for smaller screens) */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={openAddModal}
      >
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* Modals */}
      <AddTaskModal 
        isVisible={isAddModalVisible} 
        onClose={closeAddModal} 
        onTaskAdded={fetchTasks} 
      />
      
      <DetailsModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        task={updateTask} 
        onTaskUpdated={fetchTasks} 
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: TEXT_COLOR,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    width: 80,
    height:  40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    flexDirection: "row"
  },
  streakText: {
    color: "white",
    fontSize: 14,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: THEME_COLOR,
  },
  calendarContainer: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 8,
  },
  calendarStrip: {
    height: 100,
    paddingTop: 8,
    paddingBottom: 8,
  },
  calendarHeader: {
    color: TEXT_COLOR,
    fontSize: 14,
    fontWeight: "600",
  },
  dateNumber: {
    color: TEXT_COLOR,
    fontSize: 16,
  },
  dateName: {
    color: SECONDARY_TEXT,
    fontSize: 12,
  },
  highlightDateNumber: {
    color: THEME_COLOR,
    fontSize: 18,
    fontWeight: "bold",
  },
  highlightDateName: {
    color: THEME_COLOR,
    fontSize: 12,
    fontWeight: "600",
  },
  disabledDateName: {
    color: "rgba(142, 142, 147, 0.5)",
    fontSize: 12,
  },
  disabledDateNumber: {
    color: "rgba(142, 142, 147, 0.5)",
    fontSize: 16,
  },
  selectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_COLOR,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  todayButtonText: {
    fontSize: 14,
    color: THEME_COLOR,
    fontWeight: "500",
  },
  tasksContainer: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loader: {
    marginTop: 40,
  },
  timeGroup: {
    marginBottom: 16,
  },
  timeHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636366",
    marginLeft: 16,
    marginBottom: 8,
  },
  tasksList: {
    paddingTop: 16,
    paddingBottom: 80,
  },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedTaskCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  priorityIndicator: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
  },
  taskContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 8,
  },
  taskMain: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: "#636366",
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#8E8E93",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  priorityText: {
    fontSize: 12,
    color: "#636366",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  noTasksText: {
    fontSize: 16,
    color: "#636366",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  addTaskButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME_COLOR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addTaskText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 8,
  },
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME_COLOR,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});