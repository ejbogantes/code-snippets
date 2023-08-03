import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useFormik } from 'formik';
import * as yup from 'yup';

// components
import InputText from '../../components/InputText';

const validationSchema = yup.object({
  barcode: yup.string().required('Barcode is required')
});

export default function ScanScreen({ navigation }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: { barcode: '01006431694727781720113010E05852' },
    validationSchema,
    onSubmit: async (values) => {
      navigation.navigate('Result', { barcode: values.barcode });
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.divContainer}>
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

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={formik.handleSubmit}
              loading={formik.isSubmitting}
              disabled={formik.isSubmitting}>
              Continue
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: StatusBar.currentHeight || 0,
    backgroundColor: '#ffffff'
  },
  divContainer: {
    paddingHorizontal: 30
  },
  buttonContainer: {
    paddingTop: 20,
    paddingBottom: 10
  }
});
