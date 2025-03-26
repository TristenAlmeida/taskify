import { render, fireEvent, waitFor } from "@testing-library/react-native";
import React from "react";
import DeleteEventModal from "../components/deleteModal";
import { deleteTask } from "../Tasks";
import Toast from "react-native-toast-message";

// Mock deleteTask function
jest.mock("../Tasks", () => ({
  deleteTask: jest.fn(),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("expo-font");

jest.mock('@expo/vector-icons', () => ({
    Feather: jest.fn(() => "FeatherIconMock"),
    FontAwesome: jest.fn(() =>"FontAwesomeIconMock" ),
    MaterialIcons: jest.fn(() =>"MaterialIconIconMock" ),
  }));


describe("Delete Task", () => {
  const mockOnClose = jest.fn();
  const mockOnTaskDeleted = jest.fn();
  const mockCloseEdit = jest.fn();
  const mockTask = { id: "1", title: "Sample Task" };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("deletes a task successfully and shows success message", async () => {
    deleteTask.mockResolvedValueOnce();

    const { getByText, getByTestId } = render(
      <DeleteEventModal
        isVisible={true}
        onClose={mockOnClose}
        onTaskDeleted={mockOnTaskDeleted}
        closeEdit={mockCloseEdit}
        task={mockTask}
      />
    );

    fireEvent.press(getByText("Delete"));

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(mockTask.id);
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockCloseEdit).toHaveBeenCalled();
      expect(mockOnTaskDeleted).toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "success",
          text1: "Task deleted successfully!",
        })
      );
    });
  });

  test("shows an error message if task deletion fails", async () => {
    deleteTask.mockRejectedValueOnce(new Error("Deletion failed"));

    const { getByText } = render(
      <DeleteEventModal
        isVisible={true}
        onClose={mockOnClose}
        onTaskDeleted={mockOnTaskDeleted}
        closeEdit={mockCloseEdit}
        task={mockTask}
      />
    );

    fireEvent.press(getByText("Delete"));

    await waitFor(() => {
      expect(deleteTask).toHaveBeenCalledWith(mockTask.id);
      expect(mockOnClose).not.toHaveBeenCalled();
      expect(mockCloseEdit).not.toHaveBeenCalled();
      expect(mockOnTaskDeleted).not.toHaveBeenCalled();
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "error",
          text1: "Error, deleting task",
        })
      );
    });
  });

  test("cancels task deletion when cancel button is pressed", () => {
    const { getByText } = render(
      <DeleteEventModal
        isVisible={true}
        onClose={mockOnClose}
        onTaskDeleted={mockOnTaskDeleted}
        closeEdit={mockCloseEdit}
        task={mockTask}
      />
    );

    fireEvent.press(getByText("Cancel"));

    expect(mockOnClose).toHaveBeenCalled();
    expect(deleteTask).not.toHaveBeenCalled();
    expect(mockOnTaskDeleted).not.toHaveBeenCalled();
  });
});
