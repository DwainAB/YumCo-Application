import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRestaurantId } from '../useRestaurantId';

describe('useRestaurantId', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  it('should return restaurant ID from AsyncStorage', async () => {
    const mockOwner = { restaurantId: 'rest-123', email: 'test@example.com' };
    AsyncStorage.setItem('owner', JSON.stringify(mockOwner));

    const { result } = renderHook(() => useRestaurantId());

    expect(result.current.loading).toBe(true);
    expect(result.current.restaurantId).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.restaurantId).toBe('rest-123');
    expect(result.current.error).toBe(null);
  });

  it('should handle missing owner data', async () => {
    const { result } = renderHook(() => useRestaurantId());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.restaurantId).toBe(null);
    expect(result.current.error).toBe('No owner data found');
  });

  it('should handle invalid JSON', async () => {
    AsyncStorage.setItem('owner', 'invalid-json');

    const { result } = renderHook(() => useRestaurantId());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.restaurantId).toBe(null);
    expect(result.current.error).toBeTruthy();
  });

  it('should handle missing restaurant ID in owner data', async () => {
    AsyncStorage.setItem('owner', JSON.stringify({ email: 'test@example.com' }));

    const { result } = renderHook(() => useRestaurantId());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.restaurantId).toBe(null);
    expect(result.current.error).toBe('No restaurant ID found in owner data');
  });
});