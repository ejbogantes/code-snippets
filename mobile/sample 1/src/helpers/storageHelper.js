import AsyncStorage from '@react-native-async-storage/async-storage';

export const guestDevicesKey = 'devices';

export const storeString = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const storeObject = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const getString = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getObject = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const removeKey = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
