import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

export const renderWithNavigation = (component, { navigationOptions = {} } = {}) => {
  return render(
    <NavigationContainer {...navigationOptions}>
      {component}
    </NavigationContainer>
  );
};

export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

export const createMockAsyncStorage = () => {
  const storage = new Map();

  return {
    getItem: jest.fn((key) => Promise.resolve(storage.get(key) || null)),
    setItem: jest.fn((key, value) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve([...storage.keys()])),
    multiGet: jest.fn((keys) =>
      Promise.resolve(keys.map(key => [key, storage.get(key) || null]))
    ),
  };
};

export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

export const mockSupabaseResponse = (data = null, error = null) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(mockSupabaseResponse()),
  })),
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } },
    })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue(mockSupabaseResponse()),
      download: jest.fn().mockResolvedValue(mockSupabaseResponse()),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: 'https://example.com/image.jpg' }
      })),
    })),
  },
});

// Dummy test to prevent "no tests" error
describe('Test Utils', () => {
  it('should export test utilities', () => {
    expect(renderWithNavigation).toBeDefined();
  });
});