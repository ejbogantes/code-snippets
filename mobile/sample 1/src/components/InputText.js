import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

const InputText = ({
  autoComplete,
  autoCapitalize,
  mode,
  secureTextEntry,
  label,
  placeholder,
  value,
  onBlur,
  onChange,
  error,
  helperText,
  disabled,
  style
}) => {
  const customStyle = style ? { ...styles.container, ...style } : styles.container;
  return (
    <View style={customStyle}>
      <TextInput
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize || 'sentences'}
        mode={mode}
        secureTextEntry={secureTextEntry}
        label={label}
        placeholder={placeholder}
        value={value}
        onBlur={onBlur}
        onChangeText={onChange}
        error={error}
        disabled={disabled}
      />
      {helperText && <HelperText type={error ? 'error' : undefined}>{helperText}</HelperText>}
    </View>
  );
};

export default InputText;

const styles = StyleSheet.create({
  container: {
    marginBottom: 15
  }
});
