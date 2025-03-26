import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react-native";
import CalendarScreen from "../screens/Calendar";
import DetailsModal from "../components/taskModal";
import { toggleCompleteTask, getTasksDueToday } from "../Tasks";

jest.mock("../Tasks", () => ({
  toggleCompleteTask: jest.fn(),
  getTasksDueToday: jest.fn()
}));



jest.mock("expo-font");

jest.mock('@expo/vector-icons', () => ({
    Feather: jest.fn(() => "FeatherIconMock"),
    FontAwesome: jest.fn(() =>"FontAwesomeIconMock" ),
    MaterialIcons: jest.fn(() =>"MaterialIconIconMock" ),
  }));

describe("Task Completion", () => {
  it("marks a task as completed when the checkbox is pressed", async () => {
    getTasksDueToday.mockResolvedValue([
        {
            id: "1",
            title: "Test Task",
            description: "A sample task",
            completed: false,
            dueDate: {
                toDate: () => new Date("2024-03-19T12:00:00Z"), // Simulating Firestore Timestamp
              },
        }
    ])
    const { getByTestId, getByText, debug } = render(<CalendarScreen  />)
    await waitFor(() => expect(getByText("Test Task")).toBeTruthy());

    const checkbox = getByTestId("task-checkbox");
    fireEvent.press(checkbox);
    expect(toggleCompleteTask).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
    debug();
    
  });
});
