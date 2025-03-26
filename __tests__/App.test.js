import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { App } from '../App';
import { auth } from '../firebaseConfig';
import { Text } from 'react-native';
import 'react-native-gesture-handler/jestSetup';

jest.mock('../firebaseConfig', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
}));
jest.mock('react-native-gesture-handler', () => {
  return {
    GestureHandlerRootView: ({ children }) => children,
  };
});


jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  console.log(actualNav);
  return {
    ...actualNav,
    useNavigation: jest.fn(),
  };
});

// Mocking the screens
jest.mock('../screens/Landing', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return { 
        Landing: () => <Text>LandingScreen</Text> 
    };
  });

jest.mock('../screens/Home', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return { 
        Home: () => <Text>HomeScreen</Text> 
    };
  });
  
  
  

describe('App Component', () => {
  it('renders Landing screen when user is not logged in', async () => {
    // Mock user as null (not logged in)
    auth.onAuthStateChanged.mockImplementation((callback) => callback(null));

    const { getByText, debug } = render(<App />);
    debug();

    await waitFor(() => {
      expect(getByText('LandingScreen')).toBeTruthy();
    });
  });

  it('renders Home screen when user is logged in', async () => {
    // Mock user as logged in
    auth.onAuthStateChanged.mockImplementation((callback) =>
      callback({ uid: '12345', email: 'test@example.com' })
    );

    const { getByText, debug } = render(<App />);

    await waitFor(() => {
      expect(getByText('HomeScreen')).toBeTruthy();
    });
  });
});

