import { Timestamp } from "firebase/firestore";

export const datetoTimestamp = (dueDate, time) => {
    const date = dueDate instanceof Timestamp
          ? dueDate.toDate()
          : new Date(dueDate);
    
        if (time) {
          const [hours, minutes] = time.split(":");
          date.setHours(parseInt(hours), parseInt(minutes));
        }

        return Timestamp.fromDate(date);


}