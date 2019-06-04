import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from 'react-navigation';

import CalendarScreen from 'lane/screens/CalendarScreen';
import CreateScreen from 'lane/screens/CreateScreen';

import DrawerContent from "./DrawerContent"

export default Drawer = createDrawerNavigator({   
        Home: CalendarScreen,
        Create: CreateScreen,
        // Edit: EditScreen
    }, {
        contentComponent: DrawerContent,
        drawerWidth: 250,
        drawerPosition: 'left',
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle',
    }
);