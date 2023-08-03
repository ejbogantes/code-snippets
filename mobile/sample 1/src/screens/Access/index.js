import React, { useState, useContext } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { useFormik } from 'formik';
import * as yup from 'yup';
import Spinner from 'react-native-loading-spinner-overlay';

// components
import InputText from '../../components/InputText';
import Link from '../../components/Link';

// helpers
import { saveGuestSession } from '../../helpers/sessionHelper';

// requests
import { sendAccessCode } from '../../requests/users';

// auth context
import AuthContext from '../../context/AuthContext';

// constants
import { helpUrls } from '../../Constants';

const validationSchema = yup.object({
  email: yup.string().required('To continue, we need your email address.').email('Invalid email address')
});

export default function AccessScreen({ navigation }) {
  const theme = useTheme();
  const { setSession } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handlerGuestLogin = async () => {
    try {
      const resultGuestLogin = await saveGuestSession();
      if (!resultGuestLogin) {
        Alert.alert('Error!', 'An error has ocurred. Please try again');
        return;
      }

      setSession(resultGuestLogin);
      return;
    } catch (error) {
      // Error saving data
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const resultAccessCode = await sendAccessCode(values.email);
        if (!resultAccessCode || !resultAccessCode.valid) {
          const msg = resultAccessCode.message || 'An error has ocurred. Please try again';
          Alert.alert('Error!', msg);
        }

        navigation.navigate('Validation', {
          email: resultAccessCode.email,
          showUserType: resultAccessCode.user_type_required || false
        });
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
              Welcome to
            </Text>
            <Text style={styles.title} variant="headlineSmall">
              SoomSafety
            </Text>
          </View>

          <InputText
            autoComplete="email"
            autoCapitalize="none"
            mode="outlined"
            label="Email"
            placeholder="Enter a valid email address"
            value={formik.values.email}
            onBlur={formik.handleBlur('email')}
            onChange={formik.handleChange('email')}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}>
              Continue
            </Button>
          </View>

          <View style={styles.linkContainer}>
            <Button mode="text" textColor={theme.colors.secondary} onPress={handlerGuestLogin}>
              Continue as a guest
            </Button>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By clicking Continue or Continue as a guest, you agree to our{' '}
              <Link url={helpUrls.terms}>
                <Text variant="labelLarge">Terms and Conditions</Text>
              </Link>{' '}
              and{' '}
              <Link url={helpUrls.privacyPolicy}>
                <Text variant="labelLarge">Privacy Policy</Text>
              </Link>
            </Text>
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
  buttonContainer: {
    paddingTop: 20,
    paddingBottom: 10
  },
  linkContainer: {
    paddingBottom: 10
  },
  termsContainer: {
    paddingBottom: 10
  },
  termsText: {
    textAlign: 'center'
  },
  supportContainer: {
    bottom: 0,
    alignItems: 'center',
    paddingBottom: 30,
    textAlign: 'center',
    justifyContent: 'center'
  }
});
