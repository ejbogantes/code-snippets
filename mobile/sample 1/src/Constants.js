import { Dimensions, Platform } from 'react-native';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

export const CONTENT_SPACING = 15;

export const USER_SESSION_KEY = 'UserSession';

const SAFE_BOTTOM =
  Platform.select({
    ios: StaticSafeAreaInsets.safeAreaInsetsBottom
  }) ?? 0;

export const SAFE_AREA_PADDING = {
  paddingLeft: StaticSafeAreaInsets.safeAreaInsetsLeft + CONTENT_SPACING,
  paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + CONTENT_SPACING,
  paddingRight: StaticSafeAreaInsets.safeAreaInsetsRight + CONTENT_SPACING,
  paddingBottom: SAFE_BOTTOM + CONTENT_SPACING
};

// The maximum zoom _factor_ you should be able to zoom in
export const MAX_ZOOM_FACTOR = 20;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Platform.select({
  android: Dimensions.get('screen').height - StaticSafeAreaInsets.safeAreaInsetsBottom,
  ios: Dimensions.get('window').height
});

// Capture Button
export const CAPTURE_BUTTON_SIZE = 78;

// API
// export const apiEndpoint = SOOMSAFETYAPI_ENDPOINT;
// export const apiKey = SOOMSAFETYAPI_APIKEY;
export const apiPaths = {
  accessCode: `/users/access-code`,
  login: `/users/login`,
  user: (userId) => `/users/${userId}`,
  usersBarcode: '/users/barcode',
  guestBarcode: '/guest/barcode',
  devices: '/devices',
  device: (deviceId) => `/devices/${deviceId}`,
  deviceGroups: '/device-groups',
  deviceGroup: (deviceGroupId) => `/device-groups/${deviceGroupId}`,
  notDevices: '/notifications/devices',
  notDevice: (deviceId) => `/notifications/devices/${deviceId}`,
  images: `/devices/images`,
  imagesUploadData: `/devices/images/upload-data`
};

// Help View
export const helpUrls = {
  feedback: 'https://www.soom.com/contact/soom-safety-feedback',
  reportBug: 'https://www.soom.com/contact/soom-safety-bug-report',
  terms: 'https://www.soom.com/terms-and-conditions-of-use',
  privacyPolicy: 'https://www.soom.com/privacy-policy',
  openFDA: 'https://open.fda.gov',
  reportABug: 'https://www.soom.com/contact/soom-safety-bug-report',
  submitFeedback: 'https://www.soom.com/contact/soom-safety-feedback',
  notifyInstructions: 'https://www.soom.com/contact/soom-safety-notify'
};

// user types
export const userTypes = {
  patient: 1,
  manufacturer: 2
};
