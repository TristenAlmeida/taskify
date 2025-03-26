import { db, storage, auth} from "./firebaseConfig";
import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, arrayUnion, Timestamp, addDoc, serverTimestamp, query, where, getDocs, increment, onSnapshot } from "firebase/firestore";

export const fetchUserData = async () => {
        const currentUser = auth.currentUser
        if (!currentUser) return;
        try { 
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log("User Data:", userData);
                return userData;
              }
          } catch (error) {
              console.error("Error fetching user data: ", error)
        } finally { 
        }
    }

    export const listenToUserData = (callback) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
    
        const userRef = doc(db, "users", currentUser.uid);
        
        return onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data()); 
                console.log("Streak Data:", docSnap.data()?.streak); // Update state in real time
            }
        }, (error) => {
            console.error("Error fetching real-time user data: ", error);
        });
    };
    
    export const updateStreak = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
    
        const userRef = doc(db, "users", currentUser.uid);
        const today = new Date();
        today.setHours(0, 0, 0, 0);  // Normalize to start of day
    
        try {
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                const { lastCompleted, streak = 0 } = userSnap.data();
                let newStreak = streak;
    
                if (lastCompleted) {
                    const lastDate = lastCompleted.toDate(); // Convert Firestore timestamp
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
    
                    if (lastDate.toDateString() === yesterday.toDateString()) {
                        newStreak += 1; // Continue streak
                    } else if (lastDate.toDateString() !== today.toDateString()) {
                        newStreak = 1; // Reset streak
                    }
                } else {
                    newStreak = 1; // First-time completion
                }
    
                await updateDoc(userRef, {
                    streak: newStreak,
                    lastCompleted: serverTimestamp(),
                });
    
            } else {
                // First-time user, set initial streak
                await setDoc(userRef, {
                    streak: 1,
                    lastCompleted: serverTimestamp(),
                }, { merge: true });
            }
    
        } catch (error) {
            console.error("Error updating streak", error);
        }
    };
    
   

