import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import LoginScreen from 'lane/screens/LoginScreen';
import StartScreen from 'lane/screens/StartScreen';

import HomeDrawer from './HomeDrawer';

export default createAppContainer(createSwitchNavigator({
    Start: StartScreen,
    Login: LoginScreen,
    Home: HomeDrawer
}));