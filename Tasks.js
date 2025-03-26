
import { db, storage} from "./firebaseConfig";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, Timestamp, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { datetoTimestamp } from "./components/util/convertDateStringtoTimestamp";


const tasksRef = collection(db, "tasks");

export const createTask = async(task) => {
    try {
        const newTask = {
            ...task,
            completed: false,
            startDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastCompletedDate: null,
            attachments: [],
        };
        const docRef = await addDoc(tasksRef, newTask);
        return docRef.id;
    } catch(error) {
        console.error("Error creating task: ", error);
        throw error;
    }
    
}

export const uploadAttachments = async (taskId, files) => {
  try {
      const uploadedFiles = [];

      for (const file of files) {
          if (!file.uri) {
              console.error("File URI is missing:", file);
              continue;
          }

          console.log("📂 Uploading file:", file);

          try {
              const fileInfo = await FileSystem.getInfoAsync(file.uri);
              if (!fileInfo.exists) {
                  console.error("❌ File does not exist at:", file.uri);
                  continue;
              }

              console.log("File Info:", fileInfo);
              
              const response = await fetch(file.uri);
              if (!response.ok) {
                  console.error("❌ Error fetching file:", response.statusText);
                  continue;
              }

              const blob = await response.blob();
              const fileRef = ref(storage, `tasks/${taskId}/${file.name}`);

              console.log("Uploading to Firebase Storage:", fileRef);
              await uploadBytes(fileRef, blob);

              const fileUrl = await getDownloadURL(fileRef);

              const uploadedFile = {
                  name: file.name,
                  url: fileUrl,
                  type: file.type || "application/octet-stream",
              };

              uploadedFiles.push(uploadedFile);

              // ✅ Update Firestore for each uploaded file
              await updateDoc(doc(db, "tasks", taskId), {
                  attachments: arrayUnion(uploadedFile),
                  updatedAt: serverTimestamp(),
              });

              console.log("✅ File uploaded:", uploadedFile);
          } catch (fetchError) {
              console.error("❌ Error uploading file:", fetchError);
          }
      }

      console.log("📂 All uploaded files:", uploadedFiles);
      return uploadedFiles;
  } catch (error) {
      console.error("Error uploading attachments: ", error);
      throw error;
  }
};


export const removeAttachmentFromDB = async (taskId, attachment) => {
  try {
    if (!taskId || !attachment?.url) {
      console.error("Invalid taskId or attachment");
      return false;
    }

    // Fetch the current task document
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      console.error("Task not found!");
      return false;
    }

    const taskData = taskSnap.data();
    const updatedAttachments = (taskData.attachments || []).filter(att => att.url !== attachment.url);

    // Update Firestore document with the new attachments list
    await updateDoc(taskRef, {
      attachments: updatedAttachments,
    });

    console.log("✅ Attachment removed from Firestore");

    // Remove from Firebase Storage
    const fileRef = ref(storage, `tasks/${taskId}/${attachment.name}`);
    await deleteObject(fileRef)
      .then(() => console.log("✅ File deleted from Firebase Storage"))
      .catch((err) => console.warn("⚠️ Failed to delete file from storage:", err));

    return true;
  } catch (error) {
    console.error("❌ Error removing attachment:", error);
    return false;
  }
};

export const fetchAttachments = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    const taskSnap = await getDoc(taskRef);
    if (!taskSnap.exists()) return [];
    if (taskSnap.exists()) {
        const data = taskSnap.data();
        return data.attachments || [];
      }
};


export const getTasksDueToday = async (selectedDate) => {
    try {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        const q = query(
            tasksRef, 
            where("dueDate", ">=", Timestamp.fromDate(startOfDay)), 
            where("dueDate", "<=", Timestamp.fromDate(endOfDay))
        );
        const querySnapshot = await getDocs(q);
        const tasks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return tasks;
    } catch (error) {
        console.error("Error getting tasks: ", error);
        throw error;
    }
}



export const updateTaskDB = async (taskId, updatedData) => {
  if (!taskId) {
    console.error("Task ID is missing!");
    return;
  }
  try {
    console.log("Task Id ", taskId)
    console.log("DB data", updatedData);
    const taskRef = doc(db, "tasks", taskId);
    console.log("Firestore doc ref:", taskRef.path);
    console.log(updatedData);
    await setDoc(taskRef, {...updatedData, dueDate: updatedData.dueDate ? datetoTimestamp(updatedData.dueDate, updatedData.time) : null, updatedAt: serverTimestamp() }, { merge: true })
    const updatedTask = await getDoc(taskRef);
    console.log("Updated task:", updatedTask.data());

    console.log("Task updated successfully");
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log(`Task with ID ${taskId} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};

export const toggleCompleteTask = async(task) => {
  if (!task?.id) {
    console.error("Invalid task data");
    return false;
  }
  try {
    const taskRef = doc(db, "tasks", task.id);
    await updateDoc(taskRef, {
      completed: !task.completed,
    });
  } catch (error) {
    console.error('Error updating task', error)
  }
}
