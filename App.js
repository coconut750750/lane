import React from 'react';
import { Platform, StatusBar, StyleSheet, View, ToolbarAndroid } from 'react-native';
import { AppLoading, Asset, Font, Icon } from 'expo';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import AppNavigator from './navigation/AppNavigator';
import Colors from './constants/Colors'
import init from './backend/Init'

init();

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
                <AppNavigator />
            </View>
        </PaperProvider>
      );
    }
  }

  _loadResourcesAsync = async () => {
    return Promise.all([
      Asset.loadAsync([
        require('./assets/images/splash.png'),
        require('./assets/images/logo.png'),
      ]),
      Font.loadAsync({
        // This is the font that we are using for our tab bar
        ...Icon.Ionicons.font,
        'roboto': require('./assets/fonts/Roboto-Regular.ttf'),
        'roboto-light': require('./assets/fonts/Roboto-Light.ttf'),
        'roboto-medium': require('./assets/fonts/Roboto-Medium.ttf'),
        'roboto-thin': require('./assets/fonts/Roboto-Thin.ttf'),
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
    colors: {
        primary: Colors.primary,
        accent: Colors.secondary,
        backdrop: Colors.backdrop,
        background: Colors.background,
        disabled: Colors.background,
        error: Colors.error,
        notification: "#f50057",
        placeholder: "rgba(0, 0, 0, 0.54)",
        surface: "#ffffff",
        text: "#000000",
    },
    fonts: {
        light: "roboto-light",
        medium: "roboto-medium",
        regular: "roboto",
        thin: "roboto-thin",
    },
    dark: false,
    roundness: 2,
};
