// helpers
import { getString, removeKey, storeString } from './storageHelper';

export const checkShowPermissions = async () => {
  try {
    const firstSteps = await getString('FIRST_STEPS');
    return !Boolean(firstSteps);
  } catch (error) {
    return true;
  }
};

export const saveShowPermissions = async (showPermissions = true) => {
  if (showPermissions) {
    return removeKey('FIRST_STEPS');
  } else {
    return storeString('FIRST_STEPS', 'ready');
  }
};
