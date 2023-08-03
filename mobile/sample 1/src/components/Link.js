import React, { useCallback } from 'react';
import { Text, Linking, Alert } from 'react-native';
import { useTheme } from 'react-native-paper';

function Link({ children, url, color, onPress }) {
  const theme = useTheme();

  const textColor = theme.colors[color] || theme.colors.primary;

  const handlePress = useCallback(async () => {
    if (!url) {
      return;
    }

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error!', `URL not supported: ${url}`);
    }
  }, [url]);

  return (
    <Text style={{ color: textColor, fontWeight: 'bold' }} onPress={onPress || handlePress}>
      {children}
    </Text>
  );
}

export default Link;
