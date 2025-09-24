import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeJSONParse } from '../utils/storage';

export const useRestaurantId = () => {
  const [restaurantId, setRestaurantId] = useState(null);
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurantId = async () => {
      try {
        setLoading(true);
        const owner = await AsyncStorage.getItem('owner');

        if (!owner) {
          setError('No owner data found');
          return;
        }

        const parsedOwnerData = safeJSONParse(owner);

        if (!parsedOwnerData) {
          setError('Invalid owner data');
          return;
        }

        if (!parsedOwnerData.restaurantId) {
          setError('No restaurant ID found in owner data');
          return;
        }

        setOwnerData(parsedOwnerData);
        setRestaurantId(parsedOwnerData.restaurantId);
        setError(null);
      } catch (err) {
        console.error('Error fetching restaurant ID:', err);
        setError(err.message);
        setRestaurantId(null);
        setOwnerData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantId();
  }, []);

  return { restaurantId, ownerData, loading, error };
};