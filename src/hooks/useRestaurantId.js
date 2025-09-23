import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useRestaurantId = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        setLoading(true);
        const owner = await AsyncStorage.getItem('owner');

        if (!owner) {
          throw new Error('No owner data found');
        }

        const ownerData = JSON.parse(owner);

        if (!ownerData.restaurantId) {
          throw new Error('No restaurant ID found in owner data');
        }

        setRestaurantId(ownerData.restaurantId);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurant ID:', err);
        setError(err.message);
        setRestaurantId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantId();
  }, []);

  return { restaurantId, loading, error };
};