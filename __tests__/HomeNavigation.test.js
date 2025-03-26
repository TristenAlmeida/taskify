// LandingNavigator.test.js
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { waitFor } from '@testing-library/react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Landing } from '../screens/Landing';
// Import the actual components
import { Home } from '../screens/Home';

const Stack = createNativeStackNavigator();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

jest.mock("expo-font");

jest.mock('@expo/vector-icons', () => {
    const actualIcons = jest.requireActual('@expo/vector-icons');
    return {
      ...actualIcons,
      Font: {
        ...actualIcons.Font,
        isLoaded: jest.fn().mockReturnValue(true),
        loadAsync: jest.fn(),
      },
    };
  });

describe('Landing Navigation Integration', () => {
  it('navigates to Signup when "Get Started" is pressed', async () => {
    const navigate = jest.fn();
    useNavigation.mockReturnValue({ navigate });

    const { getByText } = render(<Landing navigation={useNavigation()} />);
    
    fireEvent.press(getByText('Get Started'));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Signup');
    });
  });

  it('navigates to Signin when "Sign In" is pressed', async () => {
    const navigate = jest.fn();
    useNavigation.mockReturnValue({ navigate });

    const { getByText } = render(<Landing navigation={useNavigation()} />);
    
    fireEvent.press(getByText('Sign in'));

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('Signin');
    });
  });
});