import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import DetailsModal from '../components/taskModal'
import Toast from 'react-native-toast-message';
import { updateTaskDB } from '../Tasks'

jest.mock('../Tasks', () => ({
  updateTaskDB: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

jest.mock("expo-font");

jest.mock('@expo/vector-icons', () => ({
    Feather: jest.fn(() => "FeatherIconMock"),
    FontAwesome: jest.fn(() =>"FontAwesomeIconMock" ),
    MaterialIcons: jest.fn(() =>"MaterialIconIconMock" ),
  }));

describe('Edit Task', () => {
  const mockOnClose = jest.fn();
  const mockOnTaskUpdated = jest.fn();
  const mockTask = {
    id: '123',
    title: 'Test Task',
    description: 'This is a test task',
    dueDate: '2025-03-20',
    time: '12:00',
    notes: 'Some notes',
    attachments: [],
    priority: 'High',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('allows editing a task and saving updates', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(
      <DetailsModal isVisible={true} onClose={mockOnClose} onTaskUpdated={mockOnTaskUpdated} task={mockTask} />
    );

    fireEvent.press(getByTestId('editButton')); // Click edit button
    
    const titleInput = getByPlaceholderText('Enter task name');
    fireEvent.changeText(titleInput, 'Updated Task Title');
    
    fireEvent.press(getByText('Save'));

    await waitFor(() => expect(updateTaskDB).toHaveBeenCalledWith('123', expect.objectContaining({ title: 'Updated Task Title' })));
    expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ text1: 'Task updated successfully!' }));
    screen.debug();
  });

  test('shows an error if task update fails', async () => {
    updateTaskDB.mockRejectedValue(new Error('Update failed'));

    const { getByText, getByPlaceholderText, getByTestId } = render(
      <DetailsModal isVisible={true} onClose={mockOnClose} onTaskUpdated={mockOnTaskUpdated} task={mockTask} />
    );

    fireEvent.press(getByTestId('editButton')); // Click edit button
    fireEvent.changeText(getByPlaceholderText('Enter task name'), 'Updated Task Title');
    fireEvent.press(getByText('Save'));

    await waitFor(() => expect(Toast.show).toHaveBeenCalledWith(expect.objectContaining({ text1: 'Failed to update task' })));
    screen.debug();
  });
});
