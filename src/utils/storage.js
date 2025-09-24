import AsyncStorage from '@react-native-async-storage/async-storage';

export const safeJSONParse = (jsonString, fallback = null) => {
  try {
    if (!jsonString) {
      return fallback;
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return fallback;
  }
};

export const getOwnerData = async () => {
  try {
    const owner = await AsyncStorage.getItem('owner');
    return safeJSONParse(owner);
  } catch (error) {
    console.error('Error fetching owner data:', error);
    return null;
  }
};

export const getRestaurantId = async () => {
  const ownerData = await getOwnerData();
  return ownerData?.restaurantId || null;
};