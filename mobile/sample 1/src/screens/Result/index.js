import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  SafeAreaView,
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  Alert,
  TouchableOpacity,
  Linking,
  ActivityIndicator
} from 'react-native';
import { useTheme, Text, Card, Divider, Button, Modal, Portal } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Collapse, CollapseHeader, CollapseBody } from 'accordion-collapse-react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ImageGallery } from '@georstat/react-native-image-gallery';
import { get as _get, find as _find, filter as _filter } from 'lodash';
import moment from 'moment';
import { useFormik } from 'formik';
import * as yup from 'yup';

import Link from '../../components/Link';
import RadioButtonGroup from '../../components/RadioButtonGroup';

// Local Storage
import { guestDevicesKey, storeObject, getObject } from '../../helpers/storageHelper';

import { getGuestBarcodeDetail, getUserBarcodeDetail } from '../../requests/barcodes';
import {
  saveDevice,
  updateDevice,
  getDevice,
  getDeviceImageUploadData,
  uploadDeviceImage,
  createDeviceImage,
  deleteDeviceImage
} from '../../requests/devices';

import AuthContext from '../../context/AuthContext';

import { userTypes } from '../../Constants';

const validationSchema = yup.object({});

export default function ResultScreen({ navigation, route }) {
  const theme = useTheme();
  const { session } = useContext(AuthContext);
  const { user } = session;
  const isLogged = Boolean(user);
  const isManufacturer = user && user.type === userTypes.manufacturer;

  const { params } = route;
  const barcode = _get(params, 'barcode', null);
  const fromList = _get(params, 'fromList', false);
  const deviceId = _get(params, 'device_id', null);
  const groups = _get(params, 'groups', []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSaved, setIsSaved] = useState(true);
  const [collapseIcons, setCollapseIcons] = useState({
    recalls: 'keyboard-arrow-down',
    documents: 'keyboard-arrow-down',
    gs1: 'keyboard-arrow-down',
    safetyDetails: 'keyboard-arrow-down',
    details: 'keyboard-arrow-down'
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(false);
  const [modalGallery, setModalGallery] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setData(null);
    setUserData(null);
    setIsSaved(true);

    let result;
    let resultData = null;
    let resultUserData = null;
    let saved = true;
    if (isLogged) {
      if (fromList) {
        result = await getDevice(deviceId, user.user_id);
        resultData = result && result.barcode ? result.barcode : null;
        resultUserData = result && result.data ? result.data : null;
        saved = true;
      } else {
        result = await getUserBarcodeDetail(barcode, user.user_id);
        resultData = result && result.data ? result.data : null;
        saved = result.saved;
      }
    } else {
      result = await getGuestBarcodeDetail(barcode);
      resultData = result && result.data ? result.data : null;
      saved = await checkIsSavedFromLocalStorage();
    }
    // console.log(JSON.stringify(result));
    // console.log(JSON.stringify(resultData));
    // console.log(JSON.stringify(resultUserData));

    if (!result.valid) {
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
      return;
    }

    setData(resultData);
    setUserData(resultUserData);
    setIsSaved(saved);
    setLoading(false);
    setRefreshing(false);
  };

  const checkIsSavedFromLocalStorage = async () => {
    const devices = await getObject(guestDevicesKey);
    if (!devices) {
      return false;
    }

    const device = _find(devices, (item) => {
      return barcode === item.barcode;
    });

    return Boolean(device);
  };

  // load vars
  let notFound = true;
  let brandName;
  let description;
  let batchLot;
  let modelNumber;
  let date;
  let manufacturer;
  let manufacturerPhone;
  let manufacturerEmail;
  let applyGS1 = false;
  let isValidGS1 = false;
  let labelsGS1 = [];
  let errorsGS1 = [];
  let applySafetyDetails = false;
  let safetyDetails = [];
  let recalls = [];
  let documents = [];
  if (data) {
    const details = data.details || {};
    recalls = data.recalls || [];
    documents = data.documents || [];
    documents = _filter(documents, (d) => {
      return d.latest_revision;
    });
    const validation = data.validation || {};
    const safety = data.safety_and_use || {};

    notFound = !Boolean(details.primary_di);
    applyGS1 = Boolean(data.validation);
    applySafetyDetails = Boolean(data.safety_and_use);

    brandName = details.brand_name || 'N/A';
    description = details.standardized_description || 'N/A';
    description = Array.isArray(description) ? description[0] : description;
    batchLot = details.lot_batch_number || 'N/A';
    modelNumber = details.model_number || 'N/A';
    date = details.expiry_date || details.manufacture_date || 'N/A';
    manufacturer = details.manufacturer || 'N/A';
    manufacturerPhone = details.phone || 'N/A';
    manufacturerEmail = details.email || 'N/A';

    if (applyGS1) {
      isValidGS1 = Boolean(validation.valid);
      if (isValidGS1) {
        labelsGS1 = validation.ais || [];
        labelsGS1 = labelsGS1.map((l) => {
          return { label: `${l.description} (AI ${l.ai})`, value: l.value };
        });
      } else {
        errorsGS1 = validation.error_validation_message || [];
        if (Array.isArray(errorsGS1)) {
          errorsGS1 = errorsGS1.map((e) => {
            return e.message;
          });
        } else {
          errorsGS1 = [errorsGS1];
        }
      }
    }

    if (applySafetyDetails) {
      safetyDetails = [
        {
          label: 'MRI Safety',
          value: safety.mri_safety
        },
        {
          label: 'Sterilization',
          value: safety.is_sterile ? 'This is a sterile product' : 'This is not a sterile product'
        },
        {
          label: 'Sterilization Methods',
          value: safety.sterilization_method || 'N/A'
        },
        {
          label: 'Uses',
          value: safety.single_use ? 'This is a single use product' : 'This product can be used multiple times'
        },
        {
          label: 'Prescription',
          value: safety.is_rx ? 'This product requires a prescription' : 'This product does not require a prescription'
        },
        {
          label: 'Kit',
          value: safety.is_kit ? 'This product is a kit' : 'This product is not a kit'
        }
      ];
    }
  }

  const handlerCollapseToggle = (name, isOpen) => {
    const icon = isOpen ? 'keyboard-arrow-up' : 'keyboard-arrow-down';
    setCollapseIcons((prevState) => {
      return { ...prevState, [name]: icon };
    });
  };

  const storeDevice = async () => {
    if (isLogged) {
      try {
        setLoading(true);
        const resultSave = await saveDevice(barcode, user.user_id);
        setLoading(false);

        if (!resultSave) {
          Alert.alert('Error!', 'An error has ocurred. Please try again.');
          return;
        } else if (!resultSave.valid) {
          const message = resultSave.message || 'An error has ocurred. Please try again.';
          Alert.alert('Error!', message);
          return;
        }
        setUserData(resultSave.data);
        setIsSaved(true);
      } catch (error) {
        console.error(error);
        setLoading(false);
        Alert.alert('Error!', 'An error has ocurred. Please try again.');
      }
    } else {
      try {
        setLoading(true);
        const devices = await getObject(guestDevicesKey);
        const createAt = new Date();
        const newDevices = [
          {
            barcode,
            brand_name: brandName,
            description,
            model_number: modelNumber,
            created_at: createAt.toISOString()
          },
          ...(devices || [])
        ];
        await storeObject(guestDevicesKey, newDevices);
        setIsSaved(true);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        Alert.alert('Error!', 'An error has ocurred. Please try again.');
      }
    }
  };

  const handlerSaveDevice = () => {
    return Alert.alert('Please Confirm', 'You will save this device to your list. Do you want to continue?', [
      {
        text: 'Cancel',
        onPress: () => {
          return false;
        },
        style: 'destructive'
      },
      {
        text: 'Continue',
        onPress: async () => {
          await storeDevice();
          return true;
        },
        style: 'default'
      }
    ]);
  };

  const handlerDownloadDoc = async (docUrl) => {
    if (!docUrl) {
      return;
    }

    const supported = await Linking.canOpenURL(docUrl);
    if (supported) {
      await Linking.openURL(docUrl);
    } else {
      Alert.alert('Error!', `URL not supported: ${docUrl}`);
    }
  };

  const handlerShowModal = () => {
    if (!userData) {
      return;
    }
    setModalVisible(true);
  };

  const handlerHideModal = () => {
    setModalVisible(false);
    formik.resetForm();
  };

  const handlerShowModalPhoto = () => {
    if (!userData) {
      return;
    }
    setModalPhoto(true);
  };

  const handlerHideModalPhoto = () => {
    setModalPhoto(false);
  };

  const handlerAddPhoto = async (photoLibrary = true) => {
    const handler = photoLibrary ? launchImageLibrary : launchCamera;
    const result = await handler({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setLoadingPhoto(true);
      await uploadImage(result.assets[0]);
      setModalPhoto(false);
      setLoadingPhoto(false);
    }
  };

  const uploadImage = async (imageData) => {
    const { fileName, type, uri } = imageData;
    const fileExt = fileName.split('.').pop();
    const uploadData = await getDeviceImageUploadData(user.user_id, fileExt, type);
    if (!uploadData || !uploadData.valid) {
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
      return null;
    }

    const { url, key } = uploadData.data;

    const uploadResult = await uploadDeviceImage(url, uri);
    if (!uploadResult) {
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
      return null;
    }

    const createResult = await createDeviceImage(user.user_id, userData.device_id, key);
    if (!createResult || !createResult.valid) {
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
      return null;
    }

    const newUserData = { ...userData };
    newUserData.device_images.push(createResult.data);
    setUserData(newUserData);

    return createResult;
  };

  const handlerShowModalGallery = () => {
    if (!userData) {
      return;
    }
    setModalGallery(true);
  };

  const handlerHideModalGallery = () => {
    setModalGallery(false);
  };

  const handlerDeletePhoto = (id, index) => {
    if (!userData) {
      return;
    }

    return Alert.alert('Please Confirm', `You will permanently delete this photo. Do you want to continue?`, [
      {
        text: 'Cancel',
        onPress: () => {
          return false;
        },
        style: 'destructive'
      },
      {
        text: 'Continue',
        onPress: async () => {
          await deletePhoto(id, index);
          return true;
        },
        style: 'default'
      }
    ]);
  };

  const deletePhoto = async (id, index) => {
    const result = await deleteDeviceImage(user.user_id, userData.device_id, id);
    if (!result.valid) {
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
      return;
    }

    const newUserData = { ...userData };
    newUserData.device_images.splice(index, 1);
    setUserData(newUserData);

    handlerHideModalGallery();

    return;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { groupId: userData && userData.device_group_id ? userData.device_group_id : -1 },
    validationSchema,
    onSubmit: async (values) => {
      if (!userData) {
        return;
      }
      try {
        const groupId = values.groupId !== -1 ? values.groupId : null;
        const resultUpdate = await updateDevice(userData.device_id, groupId, user.user_id);
        if (!resultUpdate || !resultUpdate.valid) {
          const msg = resultUpdate.message || 'An error has ocurred. Please try again';
          Alert.alert('Error!', msg);
          return;
        }

        setUserData(resultUpdate.data);
        handlerHideModal();
        return;
      } catch (error) {
        // console.error(error);
        Alert.alert('Error!', 'An error has ocurred. Please try again');
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Spinner visible={loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />

        {!loading && (
          <View style={styles.divContainer}>
            <Card style={styles.card}>
              <Card.Content>
                {notFound ? (
                  <View style={[styles.cardTitleContainer, { marginBottom: 0 }]}>
                    <Text style={[styles.cardSubtitle, styles.textCenter]}>No device found</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.cardTitleContainer}>
                      <Text style={styles.cardTitle} variant="bodyLarge">
                        {brandName}
                      </Text>
                      <Text style={styles.cardSubtitle} variant="titleMedium">
                        {description}
                      </Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.textLabel}>Batch/Lot: </Text>
                      <Text>{batchLot}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.textLabel}>Model #: </Text>
                      <Text>{modelNumber}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.textLabel}>Manufactured: </Text>
                      <Text>{date}</Text>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>

            {!isSaved && !notFound && (
              <Card style={styles.cardTransparent} mode="outlined">
                <Card.Content>
                  <View style={styles.cardTitleContainer}>
                    <Text>
                      This device is not saved in your list.
                      <Link color="secondary" onPress={handlerSaveDevice}>
                        Tap to save this device.
                      </Link>
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            {userData && (
              <>
                <Card style={styles.cardTransparent} mode="outlined">
                  <Card.Content>
                    <View style={styles.cardTitleContainer}>
                      <Text>
                        This device belongs to the group{' '}
                        {userData.device_group ? userData.device_group.name : 'My Devices'}.{' '}
                        <Link color="secondary" onPress={() => handlerShowModal()}>
                          Tap to move this device to different group.
                        </Link>
                      </Text>
                    </View>
                  </Card.Content>
                </Card>

                <Portal>
                  <Modal
                    visible={modalVisible}
                    onDismiss={handlerHideModal}
                    contentContainerStyle={styles.modalContainer}>
                    <Text variant="titleMedium">Groups</Text>

                    <Divider style={{ marginBottom: 15 }} bold />

                    <RadioButtonGroup
                      items={[{ value: -1, label: 'My Devices' }, ...groups]}
                      value={formik.values.groupId}
                      onChange={(value) => {
                        formik.setFieldValue('groupId', value);
                      }}
                    />

                    <Divider style={{ marginBottom: 15 }} bold />

                    <View style={styles.row}>
                      <View style={[styles.col(50), { paddingRight: 5 }]}>
                        <Button mode="outlined" onPress={handlerHideModal} disabled={formik.isSubmitting}>
                          Cancel
                        </Button>
                      </View>
                      <View style={[styles.col(50), { paddingLeft: 5 }]}>
                        <Button
                          mode="contained"
                          onPress={formik.handleSubmit}
                          loading={formik.isSubmitting}
                          disabled={formik.isSubmitting}>
                          Save
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </Portal>
              </>
            )}

            {recalls.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Collapse onToggle={(e) => handlerCollapseToggle('recalls', e)}>
                    <CollapseHeader>
                      <View style={styles.row}>
                        <View style={styles.col(50)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginRight: 5 }} name="update" size={25} />
                            <Text style={{}}>Recalls</Text>
                          </View>
                        </View>
                        <View style={[styles.col(50), { alignItems: 'flex-end' }]}>
                          <View style={styles.iconTextContainer}>
                            <Text style={styles.textLabel}>
                              {recalls.length} {recalls.length === 1 ? `recall` : `recalls`}
                            </Text>
                            <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.recalls} size={25} />
                          </View>
                        </View>
                      </View>
                    </CollapseHeader>
                    <CollapseBody>
                      {recalls.map((r, i) => {
                        return (
                          <View key={`recall${i}`}>
                            <Divider style={{ marginVertical: 15 }} bold />
                            <View style={styles.row}>
                              <View style={styles.col(85)}>
                                <Text style={[styles.textLabel, styles.textContainer]} variant="bodyLarge">
                                  {r.recalling_firm || ``}
                                </Text>
                                <Text style={styles.textContainer} variant="bodyMedium">
                                  {r.reason_for_recall || ``}
                                </Text>

                                {r.date_initiated ? (
                                  <Text style={[styles.textLabel]}>Recalled on {r.date_initiated}</Text>
                                ) : (
                                  <Text style={[styles.textLabel]}>Official recall date not yet assigned</Text>
                                )}
                                {r.date_terminated && (
                                  <Text style={[styles.textLabel]}>Terminated on {r.date_terminated}</Text>
                                )}
                              </View>
                              <View style={[styles.col(15), styles.iconContainer]}>
                                <TouchableOpacity
                                  style={styles.touchContainer}
                                  onPress={() =>
                                    navigation.navigate('Recall', {
                                      recall: r,
                                      device: { brandName, description, batchLot, modelNumber, date },
                                      contact: { manufacturer, manufacturerPhone, manufacturerEmail }
                                    })
                                  }>
                                  <MaterialCommunityIcons name="chevron-right" size={35} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </CollapseBody>
                  </Collapse>
                </Card.Content>
              </Card>
            )}

            {documents.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <Collapse onToggle={(e) => handlerCollapseToggle('documents', e)}>
                    <CollapseHeader>
                      <View style={styles.row}>
                        <View style={styles.col(75)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginRight: 5 }} name="list-alt" size={25} />
                            <Text style={{}}>Instructions for Use</Text>
                          </View>
                        </View>
                        <View style={[styles.col(25), { alignItems: 'flex-end' }]}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.documents} size={25} />
                          </View>
                        </View>
                      </View>
                    </CollapseHeader>
                    <CollapseBody>
                      {documents.map((d, i) => {
                        const langs = d.document_language || [];
                        const langsLabel = langs.length > 0 ? ` in ${langs.join(', ')}` : ``;
                        const date = d.date_published || ``;
                        let dateLabel = ``;
                        if (date && date !== ``) {
                          dateLabel = ` on ${moment(date).format('YYYY-MM-DD')}`;
                        }

                        return (
                          <View key={`document${i}`}>
                            <Divider style={{ marginVertical: 15 }} bold />
                            <View style={styles.row}>
                              <View style={[styles.col(85), styles.textContainer]}>
                                <Text style={styles.textBold}>
                                  Doc. {d.document_number || `N/A`} Rev. {d.document_revision || `N/A`}
                                </Text>
                                <Text style={styles.textLabel}>
                                  Published
                                  {langsLabel}
                                  {dateLabel}
                                </Text>
                              </View>
                              <View style={[styles.col(15), styles.iconContainer]}>
                                <TouchableOpacity
                                  style={styles.touchContainer}
                                  onPress={() => handlerDownloadDoc(d.document_url)}>
                                  <MaterialCommunityIcons name="cloud-download-outline" size={25} />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </CollapseBody>
                  </Collapse>
                </Card.Content>
              </Card>
            )}

            {applyGS1 && (
              <Card style={styles.card}>
                <Card.Content>
                  {isValidGS1 ? (
                    <Collapse onToggle={(e) => handlerCollapseToggle('gs1', e)}>
                      <CollapseHeader>
                        <View style={styles.row}>
                          <View style={styles.col(75)}>
                            <View style={styles.iconTextContainer}>
                              <MaterialCommunityIcons
                                style={{ marginRight: 5 }}
                                name="check-circle-outline"
                                size={25}
                              />
                              <Text>GS1 Compliant Barcode</Text>
                            </View>
                          </View>
                          <View style={[styles.col(25), { alignItems: 'flex-end' }]}>
                            <View style={styles.iconTextContainer}>
                              <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.gs1} size={25} />
                            </View>
                          </View>
                        </View>
                      </CollapseHeader>
                      <CollapseBody>
                        <Divider style={{ marginVertical: 15 }} bold />
                        {labelsGS1.map((l, i) => {
                          return (
                            <View style={styles.textContainer} key={`labelGS1${i}`}>
                              <Text>{l.label}</Text>
                              <Text style={styles.textLabel}>{l.value}</Text>
                            </View>
                          );
                        })}
                      </CollapseBody>
                    </Collapse>
                  ) : (
                    <Collapse onToggle={(e) => handlerCollapseToggle('gs1', e)}>
                      <CollapseHeader>
                        <View style={styles.row}>
                          <View style={styles.col(75)}>
                            <View style={styles.iconTextContainer}>
                              <MaterialCommunityIcons
                                style={{ marginRight: 5 }}
                                name="close-circle-outline"
                                size={25}
                              />
                              <Text>GS1 Noncompliant Barcode</Text>
                            </View>
                          </View>
                          <View style={[styles.col(25), { alignItems: 'flex-end' }]}>
                            <View style={styles.iconTextContainer}>
                              <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.gs1} size={25} />
                            </View>
                          </View>
                        </View>
                      </CollapseHeader>
                      <CollapseBody>
                        <Divider style={{ marginVertical: 15 }} bold />
                        {errorsGS1.map((e, i) => {
                          return (
                            <View style={styles.textContainer} key={`errorGS1${i}`}>
                              <Text style={styles.textLabel}>
                                <MaterialCommunityIcons style={{ marginRight: 5 }} name="chevron-right" /> {e}
                              </Text>
                            </View>
                          );
                        })}
                      </CollapseBody>
                    </Collapse>
                  )}
                </Card.Content>
              </Card>
            )}

            {applySafetyDetails && (
              <Card style={styles.card}>
                <Card.Content>
                  <Collapse onToggle={(e) => handlerCollapseToggle('safetyDetails', e)}>
                    <CollapseHeader>
                      <View style={styles.row}>
                        <View style={styles.col(50)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialCommunityIcons style={{ marginRight: 5 }} name="safe-square-outline" size={25} />
                            <Text style={{}}>Safety & Handling</Text>
                          </View>
                        </View>
                        <View style={[styles.col(50), { alignItems: 'flex-end' }]}>
                          <View style={styles.iconTextContainer}>
                            <Text style={styles.textLabel}>
                              {safetyDetails.length} {safetyDetails.length === 1 ? `detail` : `details`}
                            </Text>
                            <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.safetyDetails} size={25} />
                          </View>
                        </View>
                      </View>
                    </CollapseHeader>
                    <CollapseBody>
                      <Divider style={{ marginVertical: 15 }} bold />
                      {safetyDetails.map((sd, i) => {
                        return (
                          <View style={styles.textContainer} key={`safetyDetail${i}`}>
                            <Text>{sd.label}</Text>
                            <Text style={styles.textLabel}>{sd.value}</Text>
                          </View>
                        );
                      })}
                    </CollapseBody>
                  </Collapse>
                </Card.Content>
              </Card>
            )}

            {!notFound && (
              <Card style={styles.card}>
                <Card.Content>
                  <Collapse onToggle={(e) => handlerCollapseToggle('details', e)}>
                    <CollapseHeader>
                      <View style={styles.row}>
                        <View style={styles.col(75)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginRight: 5 }} name="chat-bubble-outline" size={25} />
                            <Text style={{}}>Contact Info</Text>
                          </View>
                        </View>
                        <View style={[styles.col(25), { alignItems: 'flex-end' }]}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginLeft: 5 }} name={collapseIcons.details} size={25} />
                          </View>
                        </View>
                      </View>
                    </CollapseHeader>
                    <CollapseBody>
                      <Divider style={{ marginVertical: 15 }} bold />
                      <View style={styles.textContainer}>
                        <Text style={styles.textLabel}>Manufacturer</Text>
                        <Text>{manufacturer}</Text>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.textLabel}>Manufacturer Phone</Text>
                        <Text>
                          <Link
                            color="primary"
                            onPress={() => {
                              if (manufacturerPhone !== 'N/A') {
                                Linking.openURL(`tel:${manufacturerPhone}`);
                              }
                            }}>
                            {manufacturerPhone}
                          </Link>
                        </Text>
                      </View>
                      <View style={styles.textContainer}>
                        <Text style={styles.textLabel}>Manufacturer Email</Text>
                        <Text>
                          <Link
                            color="primary"
                            onPress={() => {
                              if (manufacturerEmail !== 'N/A') {
                                Linking.openURL(`mailto:${manufacturerEmail}`);
                              }
                            }}>
                            {manufacturerEmail}
                          </Link>
                        </Text>
                      </View>
                    </CollapseBody>
                  </Collapse>
                </Card.Content>
              </Card>
            )}

            {isManufacturer && userData && (
              <>
                <View style={styles.row}>
                  <View style={styles.col(userData.device_images.length > 0 ? 50 : 100)}>
                    <TouchableOpacity
                      style={[styles.touchContainer, { alignItems: 'center' }]}
                      onPress={handlerShowModalPhoto}>
                      <View style={[styles.iconTextContainer, { margin: 'auto' }]}>
                        <MaterialCommunityIcons style={{ marginRight: 5 }} name="camera" size={25} />
                        <Text style={styles.textBold}>Add Photo</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  {userData.device_images.length > 0 && (
                    <View style={styles.col(50)}>
                      <TouchableOpacity
                        style={[styles.touchContainer, { alignItems: 'center' }]}
                        onPress={handlerShowModalGallery}>
                        <View style={[styles.iconTextContainer, { margin: 'auto' }]}>
                          <MaterialCommunityIcons style={{ marginRight: 5 }} name="eye" size={25} />
                          <Text style={styles.textBold}>View Photos</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Portal>
                  <Modal
                    visible={modalPhoto}
                    onDismiss={handlerHideModalPhoto}
                    contentContainerStyle={[styles.modalContainer]}>
                    {loadingPhoto ? (
                      <>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text variant="titleMedium" style={[styles.textCenter, { marginTop: 15 }]}>
                          Uploading Photo..
                        </Text>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handlerAddPhoto(false)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialCommunityIcons style={{ marginRight: 5 }} name="camera" size={25} />
                            <Text variant="titleMedium">Camera</Text>
                          </View>
                        </TouchableOpacity>

                        <Divider style={{ marginVertical: 10 }} bold />

                        <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => handlerAddPhoto(true)}>
                          <View style={styles.iconTextContainer}>
                            <MaterialIcons style={{ marginRight: 5 }} name="photo-library" size={25} />
                            <Text variant="titleMedium">Photo Library</Text>
                          </View>
                        </TouchableOpacity>
                      </>
                    )}
                  </Modal>
                </Portal>

                {userData.device_images.length > 0 && (
                  <ImageGallery
                    close={handlerHideModalGallery}
                    isOpen={modalGallery}
                    images={userData.device_images.map((img) => {
                      return { ...img, id: img.device_image_id };
                    })}
                    renderHeaderComponent={(image, currentIndex) => {
                      return (
                        <View style={[styles.row, { backgroundColor: '#ffffff', paddingHorizontal: 10 }]}>
                          <View style={styles.col(50)}>
                            <TouchableOpacity
                              style={[styles.touchContainer, { alignItems: 'flex-start' }]}
                              onPress={() => handlerDeletePhoto(image.device_image_id, currentIndex)}>
                              <Text style={styles.textBold}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.col(50)}>
                            <TouchableOpacity
                              style={[styles.touchContainer, { alignItems: 'flex-end' }]}
                              onPress={handlerHideModalGallery}>
                              <Text style={styles.textBold}>Close</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    }}
                  />
                )}
              </>
            )}

            <View style={styles.buttonSection}>
              <Text style={styles.textCenter}>Learn more about Soom</Text>
              <Button style={styles.fullWidthButton} mode="contained" onPress={() => navigation.navigate('Help')}>
                Contact
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#ffffff'
  },
  container: {
    flex: 1
    // paddingTop: StatusBar.currentHeight || 0,
    // backgroundColor: '#ffffff'
  },
  divContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15
  },
  card: {
    backgroundColor: '#ffffff',
    marginVertical: 10
  },
  cardTransparent: {
    backgroundColor: 'inherit',
    marginVertical: 10
  },
  cardTitleContainer: {
    marginBottom: 10
  },
  cardTitle: {
    color: '#6f6f6f'
  },
  cardSubtitle: {
    backgroundColor: '#ffffff'
  },
  textContainer: {
    marginBottom: 10
  },
  textLabel: {
    color: '#6f6f6f'
  },
  textBold: {
    fontWeight: 'bold'
  },
  textCenter: {
    textAlign: 'center'
  },
  textLeft: {
    textAlign: 'left'
  },
  textRight: {
    textAlign: 'right'
  },
  row: {
    flexDirection: 'row'
  },
  col: (width) => {
    return { width: `${width}%` };
  },
  iconContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  touchContainer: {
    paddingVertical: 10
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  accordion: {
    margin: 0,
    padding: 0
  },
  buttonSection: {
    marginVertical: 10
  },
  fullWidthButton: {
    alignSelf: 'stretch',
    marginVertical: 10
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: 10,
    padding: 30
  }
});
