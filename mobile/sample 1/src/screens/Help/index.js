import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, Linking } from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { Divider } from '@rneui/themed';
import { get as _get, find as _find } from 'lodash';

import { helpUrls } from '../../Constants';

export default function ResultScreen({ route }) {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps='always' contentContainerStyle={styles.scrollView}>
        <View style={styles.divContainer}>
          <View style={styles.buttonSection}>
            <MaterialIcons name="feedback" size={40} color={theme.colors.primary} />

            <Text style={styles.textCenter}>Have any feedback about the SoomSafety app? We'd love to header it!</Text>

            <Button style={styles.fullWidthButton} mode="contained" onPress={() => Linking.openURL(helpUrls.feedback)}>
              Submit Feedback
            </Button>
          </View>

          <Divider width={2} color="#dddddd" />

          <View style={styles.buttonSection}>
            <MaterialIcons name="bug-report" size={40} color={theme.colors.primary} />

            <Text style={styles.textCenter}>
              Did you find a bug in the SoomSafety app? Please let us know so we can fix it.
            </Text>

            <Button style={styles.fullWidthButton} mode="contained" onPress={() => Linking.openURL(helpUrls.reportBug)}>
              Report a Bug
            </Button>
          </View>

          {/* <Divider width={2} color="#dddddd" />

          <View style={styles.buttonSection}>
            <MaterialIcons name="menu-book" size={40} color={theme.colors.primary} />

            <Text style={styles.textCenter}>
              Do you need some help with the SoomSafety app? You can read about in our user manual.
            </Text>

            <Button style={styles.fullWidthButton} mode="contained" onPress={() => Linking.openURL(helpUrls.reportBug)}>
              Report a Bug
            </Button>
          </View> */}
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
  textCenter: {
    marginVertical: 10,
    textAlign: 'center'
  },
  buttonSection: {
    paddingHorizontal: 10,
    paddingVertical: 60,
    alignItems: 'center'
  },
  fullWidthButton: {
    alignSelf: 'stretch'
  }
});
