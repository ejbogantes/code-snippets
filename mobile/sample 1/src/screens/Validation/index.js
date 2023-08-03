import React, { useState, useContext } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Divider, Text, Button, RadioButton, useTheme } from 'react-native-paper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Spinner from 'react-native-loading-spinner-overlay';

// components
import InputText from '../../components/InputText';

// helpers
import { saveUserSession } from '../../helpers/sessionHelper';

// requests
import { sendAccessCode, login, updateUser } from '../../requests/users';

// auth context
import AuthContext from '../../context/AuthContext';

// constants
import { helpUrls } from '../../Constants';

const validationSchema = yup.object({
  code: yup.string().required('A code is required')
});

export default function ValidationScreen({ route, navigation }) {
  const theme = useTheme();
  const { setSession } = useContext(AuthContext);
  const [userType, setUserType] = useState(1);

  const {
    params: { email, showUserType }
  } = route;

  const [loading, setLoading] = useState(false);

  const handlerResendAccessCode = async () => {
    try {
      setLoading(true);
      const resultAccessCode = await sendAccessCode(email);
      setLoading(false);
      if (!resultAccessCode || !resultAccessCode.valid) {
        const msg = resultAccessCode.message || 'An error has ocurred. Please try again';
        Alert.alert('Error!', msg);
      }
      return;
    } catch (error) {
      // console.error(error);
      Alert.alert('Error!', 'An error has ocurred. Please try again');
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const type = showUserType ? userType : undefined;
        const resultLogin = await login(email, values.code, type);
        if (!resultLogin || !resultLogin.valid) {
          const msg = resultLogin.message || 'An error has ocurred. Please try again';
          Alert.alert('Error!', msg);
          return;
        }

        const resultSaveLogin = await saveUserSession(resultLogin.user);
        if (!resultSaveLogin) {
          Alert.alert('Error!', 'An error has ocurred. Please try again');
          return;
        }

        setSession(resultSaveLogin);
        return;
      } catch (error) {
        // console.error(error);
        Alert.alert('Error!', 'An error has ocurred. Please try again');
      }
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">
        <Spinner visible={loading} textContent={'Loading...'} textStyle={styles.spinnerTextStyle} />

        <View style={styles.divContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} variant="headlineSmall">
              Verification Code
            </Text>
            <Text style={styles.paragraph} variant="bodyMedium">
              Please enter the verification code that we sent to your email address ({email}).
            </Text>
          </View>

          <InputText
            autoCapitalize='characters'
            mode="outlined"
            label="Code"
            placeholder="Enter the code"
            value={formik.values.code}
            onBlur={formik.handleBlur('code')}
            onChange={formik.handleChange('code')}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />

          {showUserType && (
            <View style={styles.userSelectorContainer}>
              <Text>
                This appears to be your first time signing in. Please select your user type from the options below to
                get started.
              </Text>

              <Divider style={{ marginVertical: 10 }} />

              <RadioButton.Group onValueChange={(value) => setUserType(value)} value={userType}>
                <RadioButton.Item label="Healthcare provider or patient" value={1} labelVariant="bodyMedium" />
                <RadioButton.Item label="Manufacturer" value={2} labelVariant="bodyMedium" />
              </RadioButton.Group>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}>
              Validate
            </Button>
          </View>

          <View style={styles.linkContainer}>
            <Button mode="text" textColor={theme.colors.secondary} onPress={handlerResendAccessCode} disabled={loading}>
              Resend the code
            </Button>
          </View>
        </View>
      </ScrollView>
      <View style={styles.supportContainer}>
        <Button icon="lifebuoy" mode="text" onPress={() => Linking.openURL(helpUrls.reportBug)}>
          <Text>Need Assistance?</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#ffffff'
  },
  container: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff'
  },
  divContainer: {
    paddingHorizontal: 30
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 10
  },
  paragraph: {
    marginBottom: 10
  },
  userSelectorContainer: {
    paddingVertical: 20
  },
  buttonContainer: {
    paddingTop: 20,
    paddingBottom: 10
  },
  linkContainer: {
    paddingBottom: 10
  },
  supportContainer: {
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 30,
    textAlign: 'center',
    justifyContent: 'center'
  }
});
