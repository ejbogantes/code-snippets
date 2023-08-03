import React, { useState, useEffect, useContext, useCallback } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, RefreshControl, View, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Modal, Portal, Divider, Menu } from 'react-native-paper';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Spinner from 'react-native-loading-spinner-overlay';
import { useFormik } from 'formik';
import * as yup from 'yup';

// components
import InputText from '../../components/InputText';

// get storage
import { guestDevicesKey, getObject } from '../../helpers/storageHelper';

import {
  getDevices,
  getDeviceGroups,
  createDeviceGroup,
  updateDeviceGroup,
  deleteDeviceGroup
} from '../../requests/devices';

// context
import AuthContext from '../../context/AuthContext';

const validationSchema = yup.object({
  name: yup.string().required('Name is required.').max(45, 'Maximum 45 characters.')
});

export default function DevicesScreen({ navigation }) {
  const { session } = useContext(AuthContext);
  const { user } = session;
  const isLogged = Boolean(user);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [groupsLabels, setGroupsLabels] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsVisible, setOptionsVisible] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    navigation.addListener('focus', () => {
      fetchData();
    });
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    let groups = [];
    let devices = [];
    if (isLogged) {
      const resultDevices = await getDevices(user.user_id);
      if (resultDevices && resultDevices.valid) {
        devices = resultDevices.data;
      }
      const resultGroups = await getDeviceGroups(user.user_id);
      if (resultGroups && resultGroups.valid) {
        groups = resultGroups.data;
      }
    } else {
      const resultDevices = await getObject(guestDevicesKey);
      if (resultDevices) {
        devices = resultDevices;
      }
    }

    const finalItems = formatDevices(groups, devices);
    const groupOptions = Array(finalItems.length).fill(false);
    const groupsLabelsMap = groups.map((g) => {
      return { value: g.device_group_id, label: g.name };
    });

    setItems(finalItems);
    setOptionsVisible(groupOptions);
    setGroupsLabels(groupsLabelsMap);
    setLoading(false);
    setRefreshing(false);
  };

  const formatDevices = (groups, devices) => {
    const keys = { default: 0 };
    const result = [{ name: 'My Devices', options: false, devices: [] }];
    groups.forEach((group, i) => {
      keys[`group${group.device_group_id}`] = i + 1;
      result[i + 1] = { ...group, options: true, devices: [] };
    });

    devices.forEach((device) => {
      if (!device.device_group_id) {
        result[keys.default].devices.unshift(device);
      } else {
        const groupKey = keys[`group${device.device_group_id}`];
        if (result[groupKey]) {
          result[groupKey].devices.unshift(device);
        } else {
          result[keys.default].devices.unshift(device);
        }
      }
    });

    return result;
  };

  const handlerShowOptions = (index) => {
    if (!isLogged) {
      return;
    }
    setOptionsVisible((prevState) => {
      const newState = [...prevState];
      newState[index] = true;
      return newState;
    });
  };

  const handlerHideOptions = (index) => {
    setOptionsVisible((prevState) => {
      const newState = [...prevState];
      newState[index] = false;
      return newState;
    });
  };

  const handlerShowModal = (group) => {
    if (!isLogged) {
      return;
    }
    if (group) {
      formik.setFieldValue('id', group.device_group_id);
      formik.setFieldValue('name', group.name);
    }
    setModalVisible(true);
  };

  const handlerHideModal = () => {
    setModalVisible(false);
    formik.resetForm();
  };

  const handlerDeleteGroup = (name, id) => {
    if (!isLogged) {
      return;
    }
    return Alert.alert(
      'Please Confirm',
      `You will permanently delete ${name} group from your list. Devices will remain in the My Devices group. Do you want to continue?`,
      [
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
            await deleteGroup(id);
            return true;
          },
          style: 'default'
        }
      ]
    );
  };

  const deleteGroup = async (id) => {
    if (!isLogged) {
      return;
    }
    try {
      setLoading(true);
      const resultDelete = await deleteDeviceGroup(id, user.user_id);
      setLoading(false);

      if (!resultDelete) {
        Alert.alert('Error!', 'An error has ocurred. Please try again.');
        return;
      } else if (!resultDelete.valid) {
        const message = resultDelete.message || 'An error has ocurred. Please try again.';
        Alert.alert('Error!', message);
        return;
      }

      fetchData();
    } catch (error) {
      console.error(error);
      setLoading(false);
      Alert.alert('Error!', 'An error has ocurred. Please try again.');
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { id: null, name: '' },
    validationSchema,
    onSubmit: async (values) => {
      if (!isLogged) {
        return;
      }
      try {
        if (values.id) {
          // edit
          const resultUpdate = await updateDeviceGroup(values.id, values.name, user.user_id);
          if (!resultUpdate || !resultUpdate.valid) {
            const msg = resultUpdate.message || 'An error has ocurred. Please try again';
            Alert.alert('Error!', msg);
            return;
          }

          fetchData();
        } else {
          // new
          const resultCreate = await createDeviceGroup(values.name, user.user_id);
          if (!resultCreate || !resultCreate.valid) {
            const msg = resultCreate.message || 'An error has ocurred. Please try again';
            Alert.alert('Error!', msg);
            return;
          }

          setItems((prevState) => {
            return [...prevState, { ...resultCreate.data, options: true, devices: [] }];
          });
          setGroupsLabels((prevState) => {
            return [...prevState, { value: resultCreate.data.device_group_id, label: resultCreate.data.name }];
          });
        }

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
      <ScrollView
        keyboardShouldPersistTaps="always"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Spinner visible={loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />

        {!loading && (
          <View style={styles.divContainer}>
            {items.map((item, groupIndex) => {
              const { name, device_group_id } = item;
              const devices = item.devices;
              return (
                <View style={styles.itemsContainer} key={`groupItem${groupIndex}`}>
                  <View style={[styles.row, styles.groupsTitle]}>
                    <View style={styles.col(85)}>
                      <Text variant="titleMedium">{name}</Text>
                    </View>
                    {item.options && (
                      <View style={[styles.col(15), styles.optionsContainer]}>
                        <Menu
                          contentStyle={styles.menuContainer}
                          visible={optionsVisible[groupIndex]}
                          onDismiss={() => handlerHideOptions(groupIndex)}
                          anchor={
                            <TouchableOpacity onPress={() => handlerShowOptions(groupIndex)}>
                              <MaterialCommunityIcons name="dots-vertical" size={25} />
                            </TouchableOpacity>
                          }>
                          <Menu.Item
                            onPress={() => {
                              handlerShowModal({ name, device_group_id });
                              handlerHideOptions(groupIndex);
                            }}
                            title={
                              <View style={styles.iconTextContainer}>
                                <MaterialIcons style={{ marginRight: 5 }} name="edit" size={20} />
                                <Text variant="bodyLarge">Edit</Text>
                              </View>
                            }
                          />
                          <Divider bold />
                          <Menu.Item
                            onPress={() => {
                              handlerDeleteGroup(name, device_group_id);
                              handlerHideOptions(groupIndex);
                            }}
                            title={
                              <View style={styles.iconTextContainer}>
                                <MaterialIcons style={{ marginRight: 5 }} name="delete" size={20} />
                                <Text variant="bodyLarge">Delete</Text>
                              </View>
                            }
                          />
                        </Menu>
                      </View>
                    )}
                  </View>
                  {devices.length === 0 ? (
                    <View style={styles.noDevicesContainer}>
                      <Text style={styles.noDevicesText}>No devices saved yet</Text>
                    </View>
                  ) : (
                    devices.map((device, deviceIndex) => {
                      return (
                        <TouchableOpacity
                          key={`deviceGroup${groupIndex}Item${deviceIndex}`}
                          style={[styles.item]}
                          onPress={() =>
                            navigation.navigate('Result', { ...device, fromList: true, groups: groupsLabels })
                          }>
                          <Text style={styles.textLabel} variant="bodyLarge">
                            {device.brand_name}
                          </Text>
                          <Text variant="titleMedium">{device.description}</Text>
                          <Text style={styles.textLabel}>{device.model_number}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              );
            })}

            {isLogged && (
              <View style={styles.buttonContainer}>
                <Button icon="plus" mode="contained" onPress={() => handlerShowModal()}>
                  Add Group
                </Button>
              </View>
            )}

            <Portal>
              <Modal visible={modalVisible} onDismiss={handlerHideModal} contentContainerStyle={styles.modalContainer}>
                <Text variant="titleMedium">{formik.values.id ? `Editing ${formik.values.name}` : 'New Group'}</Text>

                <Divider style={{ marginBottom: 10 }} bold />

                <InputText
                  mode="outlined"
                  label="Name"
                  placeholder="Type a name"
                  value={formik.values.name}
                  onBlur={formik.handleBlur('name')}
                  onChange={formik.handleChange('name')}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
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
  },
  divContainer: {
    paddingHorizontal: 30,
    paddingVertical: 15
  },
  row: {
    flexDirection: 'row'
  },
  col: (width) => {
    return { width: `${width}%` };
  },
  noDevicesContainer: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  },
  noDevicesText: {
    textAlign: 'center',
    fontWeight: 'bold'
  },
  textLabel: {
    color: '#6f6f6f'
  },
  groupsContainer: {
    marginBottom: 10
  },
  groupsTitle: {
    marginBottom: 10
  },
  item: {
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    textAlign: 'left',
    padding: 15,
    marginBottom: 10
  },
  optionsContainer: {
    alignItems: 'flex-end'
  },
  buttonContainer: {
    marginTop: 20
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    marginHorizontal: 10,
    padding: 30
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 0
  }
});
