import React, { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Linking, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';

// camera
import { Camera } from 'react-native-vision-camera';

// push notifications
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

// components
import Image from '../../components/Image';

// helper
import { checkShowPermissions, saveShowPermissions } from '../../helpers/permissionsHelper';

export default function PermissionsScreen({ route, navigation }) {
  const appState = useRef(AppState.currentState);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState({ camera: false, notifications: false });
  const [show, setShow] = useState({ camera: true, notifications: true });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: true
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    checkStatus();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkStatus();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // steps begin ----------
  const CameraStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.svg}>
            <Image.ScanWithCamera />
          </View>
          <Text variant="bodyMedium">
            Using your camera, SoomSafety can look up the exact details of your specific individual products.
          </Text>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={async () => {
              await requestCameraPermission();
              setShow((prevState) => ({ ...prevState, camera: false }));
            }}>
            Allow camera access
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const NotificationsStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.svg}>
            <Image.PushNotification />
          </View>
          <Text variant="bodyMedium">
            SoomSafety sends you push notifications about important safety recalls for your medical products.
          </Text>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={async () => {
              await registerForPushNotificationsAsync();
              setShow((prevState) => ({ ...prevState, notifications: false }));
            }}>
            Allow notifications
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const DisclaimerStep = () => {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Text variant="titleMedium">Disclaimer</Text>
          <Divider style={{ marginVertical: 15 }} />
          <Text variant="bodyMedium">SoomSafety provides information from the openFDA database.</Text>
          <Divider style={{ marginVertical: 15 }} />
          <Text variant="bodyMedium">Do not rely on this information to make decisions regarding medical care.</Text>
          <Divider style={{ marginVertical: 15 }} />
          <Text variant="bodyMedium">
            Always speak to your health provider about the risks and benefits of FDA-regulated products.
          </Text>
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            style={styles.actionButton}
            onPress={async () => {
              await saveShowPermissions(false);
              navigation.navigate('SoomSafety');
            }}>
            Get Started
          </Button>
        </Card.Actions>
      </Card>
    );
  };
  // steps end  --------------

  const requestCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status === 'denied') {
      await Linking.openSettings();
    } else {
      const newCameraPermission = await Camera.requestCameraPermission();
      if (newCameraPermission === 'authorized') {
        setPermissions({ ...permissions, camera: true });
      }
    }
  };

  // this is the
  const checkStatus = async () => {
    const showPermissions = await checkShowPermissions();
    if (!showPermissions) {
      navigation.navigate('SoomSafety');
      return;
    }

    const newPermissions = { ...permissions };

    // let's check camera
    const cameraStatus = await Camera.getCameraPermissionStatus();
    newPermissions.camera = cameraStatus === 'authorized';

    // let's check notifications
    const { status: notStatus } = await Notifications.getPermissionsAsync();
    newPermissions.notifications = notStatus === 'granted';

    setPermissions(newPermissions);
  };

  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C'
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync()).data;
      } catch (error) {
        console.log(error);
      }
      console.log(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }

    return token;
  }

  let contentPermissions = null;
  if (!permissions.camera && show.camera) {
    contentPermissions = (
      <Animated.View>
        <CameraStep route={route} navigation={navigation} />
      </Animated.View>
    );
  } else if (!permissions.notifications && show.notifications) {
    contentPermissions = (
      <Animated.View>
        <NotificationsStep route={route} navigation={navigation} />
      </Animated.View>
    );
  } else {
    contentPermissions = (
      <Animated.View>
        <DisclaimerStep route={route} navigation={navigation} />
      </Animated.View>
    );
  }

  return (
    <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
      <View style={styles.headerContainer}>
        <Text variant="bodyMedium">
          Before you begin, please review and accept the following required app permissions and disclaimer.
        </Text>
      </View>
      {contentPermissions}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 5
  },
  card: {
    marginHorizontal: 10,
    marginVertical: 15
  },
  cardContent: {
    marginTop: 0,
    textAlign: 'center'
  },
  cardActions: {
    paddingVertical: 15,
    paddingRight: 20
  },
  actionButton: {
    backgroundColor: '#444444',
    color: '#FFFFFF'
  },
  hidden: {
    display: 'none'
  },
  svg: {
    textAlign: 'center',
    alignItems: 'center',
    marginBottom: 15
  }
});
