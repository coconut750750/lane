import React from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import HomeDrawer from './HomeDrawer';
import LoginScreen from '../screens/LoginScreen';
import StartScreen from '../screens/StartScreen';

export default createAppContainer(createSwitchNavigator({
    Start: StartScreen,
    Login: LoginScreen,
    Home: HomeDrawer
}));