import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';

const RadioButtonGroup = ({ items, value, onChange }) => {
  if (!items || !Array.isArray(items)) {
    return null;
  }

  const dateTime = new Date().getTime();

  return (
    <View style={styles.container}>
      <RadioButton.Group onValueChange={onChange} value={value}>
        {items.map((item, index) => {
          return (
            <TouchableOpacity key={`radioGroup${dateTime}Item${index}`} onPress={() => onChange(item.value)}>
              <View style={styles.itemContainer}>
                <RadioButton value={item.value} />
                <Text style={styles.label}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </RadioButton.Group>
    </View>
  );
};

export default RadioButtonGroup;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {}
});
