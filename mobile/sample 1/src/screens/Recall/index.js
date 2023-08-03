import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Text, Card, Divider, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { get as _get } from 'lodash';

import Link from '../../components/Link';

const recallClassification = {
  Severe: {
    title: 'Life Threatening Safety Recall',
    explanation: 'There is a reasonable chance of serious health problems or death.'
  },
  Moderate: {
    title: 'Important Safety Recall',
    explanation:
      'This product may cause a temporary health problem. There is a slight chance that it will cause serious health problems or death.'
  },
  Low: {
    title: 'Safety Recall',
    explanation: 'This product is not likely to cause any health problem or injury.'
  },
  Unclassified: {
    title: 'Unclassified Recall',
    explanation: 'This recall has not yet been classified with regard to its safety impact.'
  }
};

export default function RecallScreen({ navigation, route }) {
  const { params } = route;
  const recall = _get(params, 'recall', null);
  const device = _get(params, 'device', null);
  const contact = _get(params, 'contact', null);
  const classification = recall.classification || 'Unclassified';
  const classificationDetail = recallClassification[classification] || recallClassification['Unclassified'];

  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={[styles.divContainer, { backgroundColor: theme.colors.recallTitleBackground }]}>
          <View style={styles.row}>
            <View style={[styles.col(20), styles.iconContainer]}>
              <MaterialIcons name="warning" size={45} color="#000000" />
            </View>
            <View style={styles.col(80)}>
              <Text variant="titleMedium">{classificationDetail.title}</Text>
              {recall.date_initiated ? (
                <Text>Recalled {recall.date_initiated}</Text>
              ) : (
                <Text>Official recall date not yet assigned</Text>
              )}
              {recall.date_terminated && <Text>Terminated {recall.date_terminated}</Text>}
            </View>
          </View>
        </View>
        <View style={styles.divContainer}>
          <Text style={styles.textContainer} variant="titleSmall">
            {classificationDetail.explanation}
          </Text>

          {/* <Text style={styles.textContainer}>
                This recall may match your product, based on your product's unique identifier.
              </Text> */}

          {device && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle} variant="bodyLarge">
                    {device.brandName}
                  </Text>
                  <Text style={styles.cardSubtitle} variant="titleMedium">
                    {device.description}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.textLabel}>Batch/Lot: </Text>
                  <Text>{device.batchLot}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.textLabel}>Model #: </Text>
                  <Text>{device.modelNumber}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.textLabel}>Manufactured: </Text>
                  <Text>{device.date}</Text>
                </View>
              </Card.Content>
            </Card>
          )}

          <View style={styles.textContainer}>
            <Text variant="titleSmall">Why is this product being recalled?</Text>
            <Divider style={{ marginTop: 5, marginBottom: 15 }} bold />
            <Text>{recall.reason_for_recall}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text variant="titleSmall">What should you do about it?</Text>
            <Divider style={{ marginTop: 5, marginBottom: 15 }} bold />
            <Text>{recall.recommended_action}</Text>
          </View>

          {contact && (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleSmall">Contact Info</Text>
                <Divider style={{ marginTop: 5, marginBottom: 15 }} bold />
                <View style={styles.cardTextContainer}>
                  <Text style={styles.textLabel}>Manufacturer</Text>
                  <Text>{contact.manufacturer}</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.textLabel}>Manufacturer Phone</Text>
                  <Text>
                    <Link
                      color="primary"
                      onPress={() => {
                        if (contact.manufacturerPhone !== 'N/A') {
                          Linking.openURL(`tel:${contact.manufacturerPhone}`);
                        }
                      }}>
                      {contact.manufacturerPhone}
                    </Link>
                  </Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.textLabel}>Manufacturer Email</Text>
                  <Text>
                    <Link
                      color="primary"
                      onPress={() => {
                        if (contact.manufacturerEmail !== 'N/A') {
                          Linking.openURL(`mailto:${contact.manufacturerEmail}`);
                        }
                      }}>
                      {contact.manufacturerEmail}
                    </Link>
                  </Text>
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
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
  row: {
    flexDirection: 'row'
  },
  col: (width) => {
    return { width: `${width}%` };
  },
  textContainer: {
    marginBottom: 25
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
  textRight: {
    textAlign: 'right'
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    marginBottom: 25
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
  cardTextContainer: {
    marginBottom: 5
  }
});
