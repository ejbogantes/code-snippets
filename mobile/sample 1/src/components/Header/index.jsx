import { View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';

// images
import Image from '../Image';

export default function Header({ back }) {
  const theme = useTheme();

  const _goBack = () => console.log('Went back');

  const _handleSearch = () => console.log('Searching');

  const _handleMore = () => console.log('Shown more');

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
      {back && (<Appbar.BackAction onPress={_goBack} color="#ffffff" />)}
      <Appbar.Content
        style={styles.appbarContent}
        titleStyle={styles.appbarContentTitle}
        title={<Image.SoomSafetyLogo />}
      />
      <Appbar.Action icon="magnify" onPress={_handleSearch} />
      <Appbar.Action icon="dots-vertical" onPress={_handleMore} />
    </Appbar.Header>
  );
  // return <View style={styles.header}><Image.SoomSafetyLogo /></View>
}

const styles = StyleSheet.create({
  appbarContent: {
    alignItems: 'center',
    marginLeft: 0,
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: -1
  },
  appbarContentTitle: {
    alignSelf: 'center'
  }
  //   header: {
  //     backgroundColor: '#444444',
  //     height: 100,
  //     justifyContent: 'center',
  //     alignContent: 'center',
  //     alignItems: 'center',
  //     paddingTop: 40
  //   }
});
