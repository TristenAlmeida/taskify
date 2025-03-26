import React from 'react';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react-native';
import StreakButton from '../components/streakButton';





jest.mock("expo-font");
jest.mock("expo-asset");

jest.mock('@expo/vector-icons', () => ({
  Feather: jest.fn(() => "FeatherIconMock"),
  FontAwesome: jest.fn(() =>"FontAwesomeIconMock" ),
  FontAwesome5: jest.fn(() =>"FontAwesome5IconMock" ),
  MaterialCommunityIcons: jest.fn(() =>"MaterialCommunityIconsIconMock" ),
}));
  
// Mock the image imports to avoid issues in testing
jest.mock('../assets/orange-badge.png', () => 'mocked-image');
jest.mock('../assets/purple-badge.png', () => 'mocked-image');
jest.mock('../assets/red-badge.png', () => 'mocked-image');

describe('StreakButton Component', () => {
  test('renders correctly with default streak value', () => {
    console.log(StreakButton);
    const { getByText, debug } = render(<StreakButton streak={0} />);
    expect(getByText('0')).toBeTruthy();

  });

  test('displays correct streak count', () => {
    const { getByText } = render(<StreakButton streak={15} />);
    expect(getByText('15')).toBeTruthy();
  });

  test('opens modal when button is pressed', async () => {
    const { getByRole, findByText, getByTestId } = render(<StreakButton streak={10} />);
    await act(async () => {
      fireEvent.press(getByTestId('open-button'));
    });
  
    expect(await findByText('Keep Going!')).toBeTruthy();

  });

  test('closes modal when close button is pressed', async () => {
    const { getByRole, findByText, queryByText, getByTestId } = render(<StreakButton streak={20} />);
    fireEvent.press(getByTestId('open-button'));
    await waitFor(() => expect(queryByText('Keep Going!')).toBeTruthy());
    
    fireEvent.press(getByTestId('close-button'));
    await waitFor(() => expect(queryByText('Keep Going!')).toBeNull());

  });

  test('displays correct number of earned badges', () => {
    const { getByText, debug } = render(<StreakButton streak={30} />);
    expect(getByText('2')).toBeTruthy(); // 7-day and 30-day milestones reached
    debug();
  });
});
