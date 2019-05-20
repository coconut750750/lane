import React from 'react';
import { Platform, StatusBar, StyleSheet, View, ToolbarAndroid } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import * as firebase from 'firebase'

import AppNavigator from './navigation/AppNavigator';
import Colors from './constants/Colors'
import { firebaseConfig } from './config'

firebase.initializeApp(firebaseConfig)

export default class App extends React.Component {
  state = {
    isLoadingComplete: false,
  };

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    hidden={false}
                    backgroundColor={Colors.background}
                    translucent={false}
                />
                <AppNavigator />
            </View>
        </PaperProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/robot-dev.png'),
        require('./assets/images/robot-prod.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        // We include SpaceMono because we use it in HomeScreen.js. Feel free
        // to remove this if you are not using it in your app
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
        ...DefaultTheme.colors,
        primary: Colors.primary,
        accent: Colors.secondary,
    }
};
