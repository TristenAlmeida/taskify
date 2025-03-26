import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import CreateEventModal from "../components/createEvent";
import Toast from "react-native-toast-message";

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));


jest.mock("expo-font");

jest.mock('@expo/vector-icons', () => ({
    Feather: jest.fn(() => "FeatherIconMock"),
  }));
  

describe("Create Task", () => {
  const mockOnClose = jest.fn();
  const mockOnTaskAdded = jest.fn();

  it("renders correctly when visible", () => {
    const { getAllByText } = render(
      <CreateEventModal isVisible={true} onClose={mockOnClose} onTaskAdded={mockOnTaskAdded} />
    );

    expect(getAllByText("Create Task")[0]).toBeTruthy();
  });

  it("updates task title input", async () => {
    const { getByPlaceholderText,  } = render(
      <CreateEventModal isVisible={true} onClose={mockOnClose} onTaskAdded={mockOnTaskAdded} />
    );

    const input = getByPlaceholderText("Enter task name");
    await act(async () => {
        fireEvent.changeText(input, "Test Task");
    })

    expect(input.props.value).toBe("Test Task");
  });

  it("selects a date", async () => {
    const { getByText, getByTestId } = render(
        <CreateEventModal isVisible={true} onClose={mockOnClose} onTaskAdded={mockOnTaskAdded} />
    )
    const dateButton = getByText("Select Due Date");
    fireEvent.press(dateButton);

    await waitFor(() => {
        expect(getByTestId("date-picker")).toBeTruthy();
      });

      const mockDate = new Date(2025, 2, 31); // March 18, 2025
      fireEvent(getByTestId("date-picker"), "onConfirm", mockDate);

      await waitFor(() => {
        expect(getByText("2025-03-31")).toBeTruthy();
      });
  })

  it("selects a time", async () => {
    const { getByText, getByTestId } = render(
        <CreateEventModal isVisible={true} onClose={mockOnClose} onTaskAdded={mockOnTaskAdded} />
    )
    const timeButton = getByText("Select Time");
    fireEvent.press(timeButton);

    await waitFor(() => {
        expect(getByTestId("time-picker")).toBeTruthy();
      });

      const mockTime = new Date(2025, 2, 31, 14, 30); // March 18, 2025
      fireEvent(getByTestId("time-picker"), "onConfirm", mockTime);

      await waitFor(() => {
        expect(getByText("14:30")).toBeTruthy();
      });
  })

  it("closes when cancel button is pressed", () => {
    const { getByText } = render(
      <CreateEventModal isVisible={true} onClose={mockOnClose} onTaskAdded={mockOnTaskAdded} />
    );

    const cancelButton = getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
});
});
