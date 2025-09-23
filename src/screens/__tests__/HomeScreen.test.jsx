import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../HomeScreen';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../components/ColorContext/ColorContext', () => ({
  useColors: () => ({
    colors: {
      primary: '#007AFF',
      background: '#FFFFFF',
      text: '#000000',
      card: '#F2F2F2',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('HomeScreen', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('should render without crashing', () => {
    renderWithNavigation(<HomeScreen />);
    expect(screen).toBeTruthy();
  });

  it('should load restaurant ID from AsyncStorage', async () => {
    const mockOwner = {
      restaurantId: 'rest-123',
      email: 'test@restaurant.com',
    };

    AsyncStorage.setItem('owner', JSON.stringify(mockOwner));

    renderWithNavigation(<HomeScreen />);

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('owner');
    });
  });

  it('should handle AsyncStorage errors gracefully', async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    renderWithNavigation(<HomeScreen />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should display current date', () => {
    renderWithNavigation(<HomeScreen />);

    const currentDate = new Date();
    const dateOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    const formattedDate = currentDate.toLocaleDateString('fr-FR', dateOptions);

    expect(screen.getByText(formattedDate)).toBeTruthy();
  });
});