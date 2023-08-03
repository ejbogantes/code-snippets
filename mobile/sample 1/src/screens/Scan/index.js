// general stuff
import 'react-native-reanimated';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useIsFocused } from '@react-navigation/core';

// camera stuff
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import { useScanBarcodes, BarcodeFormat } from 'vision-camera-code-scanner';
import { PinchGestureHandler } from 'react-native-gesture-handler';
import Reanimated, {
  Extrapolate,
  interpolate,
  useAnimatedGestureHandler,
  useAnimatedProps,
  useSharedValue
} from 'react-native-reanimated';

import { Alert, View, StatusBar, StyleSheet, Linking, AppState, TouchableOpacity } from 'react-native';
import { Button, Card, Text, Portal, Modal, Divider, Checkbox } from 'react-native-paper';
import { PressableOpacity } from 'react-native-pressable-opacity';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { useFormik } from 'formik';
import * as yup from 'yup';

// hooks
import { useIsForeground } from '../../hooks/useIsForeground';

// constants
import { CONTENT_SPACING, SAFE_AREA_PADDING, MAX_ZOOM_FACTOR, SCALE_FULL_ZOOM } from '../../Constants';

// components
import Image from '../../components/Image';
import InputText from '../../components/InputText';

const BUTTON_SIZE = 50;
const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera);
Reanimated.addWhitelistedNativeProps({
  zoom: true
});

export default function ScanScreen({ navigation, route }) {
  // camera and devices hooks
  const onError = useCallback((error) => {
    console.error(error);
  }, []);
  const appState = useRef(AppState.currentState);
  const camera = useRef(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const isFocused = useIsFocused();
  const devices = useCameraDevices();
  const zoom = useSharedValue(0);

  // states
  const [barcode, setBarcode] = useState(undefined);
  const [scanStatus, setScanStatus] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [torch, setTorch] = useState('off');
  const [isDetectionEnabled, setIsDetectionEnabled] = useState(true);

  // frame processors
  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.ALL_FORMATS], {
    checkInverted: true,
    isActive: isDetectionEnabled
  });

  // manual scan
  const [modalVisible, setModalVisible] = useState(false);
  const [stackedBarcode, setStackedBarcode] = useState(false);

  // check the camera permission
  const checkCameraPermission = async () => {
    try {
      const status = await Camera.getCameraPermissionStatus();
      setHasPermission(status === 'authorized');
    } catch (error) {
      console.log(error);
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        checkCameraPermission();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    checkCameraPermission();
  }, [Camera]);

  useEffect(() => {
    navigation.addListener('focus', () => {
      checkCameraPermission();
    });
  }, [navigation]);

  useEffect(() => {
    const toggleActiveState = async () => {
      try {
        if (isDetectionEnabled && barcodes && barcodes.length > 0 && scanStatus === false) {
          setScanStatus(true);

          // get the quantity of scanned barcodes
          const barcodesSize = barcodes.length;
          let alertTitle = 'Code Scanned';
          if (barcodesSize === 1) {
            alertTitle = 'Single Barcode Scanned';
          } else if (barcodesSize >= 2) {
            alertTitle = 'Stacked Barcode Scanned';
          }
          const results = [];
          barcodes.forEach(async (scannedBarcode) => {
            if (scannedBarcode.displayValue !== '') {
              results.push(scannedBarcode.displayValue);
            }
          });

          const resultsJoin = results.join('');
          setBarcode(resultsJoin);

          Alert.alert(alertTitle, resultsJoin, [
            {
              text: 'Re-scan',
              onPress: () => setScanStatus(false),
              style: 'destructive'
            },
            {
              text: 'Proceed',
              onPress: async () => {
                setScanStatus(false);
                navigation.navigate('Result', { barcode: resultsJoin });
              },
              style: 'default'
            }
          ]);
        }
      } catch (error) {
        console.log(error);
        Alert.alert('Error!', 'An error has ocurred. Please try again.');
      }
    };
    toggleActiveState();
    return () => {
      barcodes;
    };
  }, [barcodes]);

  // actions
  const onTorchPressed = useCallback(() => {
    setTorch((f) => (f === 'off' ? 'on' : 'off'));
  }, []);

  const onBarcodePressed = useCallback(() => {
    setIsDetectionEnabled((f) => !f);
  }, []);

  const onManualScanPressed = useCallback(() => {
    setModalVisible((f) => {
      if (f) {
        formik.resetForm();
        setStackedBarcode(false);
      }
      return !f;
    });
  }, []);

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, []);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { barcode: '', barcode2: '' },
    validationSchema: yup.object({
      barcode: yup.string().required('Barcode is required'),
      barcode2: stackedBarcode ? yup.string().required('Barcode is required') : undefined
    }),
    onSubmit: async (values) => {
      setModalVisible(false);
      formik.resetForm();
      setStackedBarcode(false);
      let barcodeValue = stackedBarcode ? `${values.barcode}${values.barcode2}` : values.barcode;
      navigation.navigate('Result', { barcode: barcodeValue });
    }
  });

  // gets the device and other features
  const device = devices.back;
  const supportsTorch = device?.hasTorch ?? false;
  const isAppForeground = useIsForeground();

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1;
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR);

  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom);
    return {
      zoom: z
    };
  }, [maxZoom, minZoom, zoom]);
  //#endregion

  //#region Effects
  const neutralZoom = device?.neutralZoom ?? 1;
  useEffect(() => {
    // Run every time the neutralZoomScaled value changes. (reset zoom when device changes)
    zoom.value = neutralZoom;
  }, [neutralZoom, zoom]);
  //#endregion

  //#region Pinch to Zoom Gesture
  // The gesture handler maps the linear pinch gesture (0 - 1) to an exponential curve since a camera's zoom
  // function does not appear linear to the user. (aka zoom 0.1 -> 0.2 does not look equal in difference as 0.8 -> 0.9)
  const onPinchGesture = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startZoom = zoom.value;
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0;
      const scale = interpolate(
        event.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolate.CLAMP
      );
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP);
    }
  });
  //#endregion

  if (!device) {
    return null;
  }

  if (!hasPermission) {
    return (
      <View style={{ marginVertical: 10, marginHorizontal: 10 }}>
        <View style={styles.headerContainer}>
          <Text variant="bodyMedium">
            Before you begin, please review and accept the following required app permissions and disclaimer.
          </Text>
        </View>
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
                await Linking.openSettings();
              }}>
              Allow camera access
            </Button>
          </Card.Actions>
        </Card>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Spinner visible={!isCameraInitialized} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />
      <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={true}>
        <Reanimated.View style={StyleSheet.absoluteFill}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <ReanimatedCamera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={isAppForeground && isFocused && !scanStatus}
            frameProcessor={frameProcessor}
            frameProcessorFps={5}
            torch={supportsTorch ? torch : 'off'}
            audio={false}
            video={false}
            photo={true}
            animatedProps={cameraAnimatedProps}
            enableZoomGesture={true}
            onInitialized={onInitialized}
            onError={onError}
          />
          <View style={styles.rightButtonRow}>
            {supportsTorch && (
              <PressableOpacity style={styles.button} onPress={onTorchPressed} disabledOpacity={0.4}>
                <MaterialCommunityIcons
                  name={torch === 'on' ? 'flashlight' : 'flashlight-off'}
                  color="white"
                  size={32}
                />
              </PressableOpacity>
            )}
            <PressableOpacity style={styles.button} onPress={onBarcodePressed} disabledOpacity={0.4}>
              <MaterialCommunityIcons name={isDetectionEnabled ? 'barcode' : 'barcode-off'} color="white" size={32} />
            </PressableOpacity>
            <PressableOpacity style={styles.button} onPress={onManualScanPressed} disabledOpacity={0.4}>
              <MaterialCommunityIcons name="keyboard" color="white" size={32} />
            </PressableOpacity>
          </View>
        </Reanimated.View>
      </PinchGestureHandler>

      <Portal>
        <Modal visible={modalVisible} onDismiss={onManualScanPressed} contentContainerStyle={styles.modalContainer}>
          <InputText
            autoCapitalize="none"
            mode="outlined"
            label="Barcode"
            placeholder="Type a barcode"
            value={formik.values.barcode}
            onBlur={formik.handleBlur('barcode')}
            onChange={formik.handleChange('barcode')}
            error={formik.touched.barcode && Boolean(formik.errors.barcode)}
            helperText={formik.touched.barcode && formik.errors.barcode}
          />

          {stackedBarcode && (
            <InputText
              autoCapitalize="none"
              mode="outlined"
              label="Second barcode"
              placeholder="Type a barcode"
              value={formik.values.barcode2}
              onBlur={formik.handleBlur('barcode2')}
              onChange={formik.handleChange('barcode2')}
              error={formik.touched.barcode2 && Boolean(formik.errors.barcode2)}
              helperText={formik.touched.barcode2 && formik.errors.barcode2}
            />
          )}

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => {
              setStackedBarcode((f) => !f);
            }}>
            <Checkbox status={stackedBarcode ? 'checked' : 'unchecked'} />
            <Text variant="bodyLarge">Stacked barcode</Text>
          </TouchableOpacity>

          <Divider style={{ marginBottom: 15 }} bold />

          <View style={styles.row}>
            <View style={[styles.col(50), { paddingRight: 5 }]}>
              <Button mode="outlined" onPress={onManualScanPressed} disabled={formik.isSubmitting}>
                Cancel
              </Button>
            </View>
            <View style={[styles.col(50), { paddingLeft: 5 }]}>
              <Button
                mode="contained"
                onPress={formik.handleSubmit}
                loading={formik.isSubmitting}
                disabled={formik.isSubmitting}>
                Continue
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#ffffff'
  },
  barcodeTextURL: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold'
  },
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: 10,
    padding: 30
  },
  divContainer: {
    paddingHorizontal: 30
  },
  row: {
    flexDirection: 'row'
  },
  col: (width) => {
    return { width: `${width}%` };
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
