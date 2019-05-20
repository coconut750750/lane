import React from 'react';
import { View, Text } from 'react-native';
import { createDrawerNavigator } from 'react-navigation';

import DrawerContent from "./DrawerContent"
import CalendarScreen from '../screens/CalendarScreen';

export default Drawer = createDrawerNavigator({   
        Home: CalendarScreen,
        // Create: CreateScreen,
        // Add: AddScreen
    }, {
        contentComponent: DrawerContent,
        drawerWidth: 250,
        drawerPosition: 'left',
        drawerOpenRoute: 'DrawerOpen',
        drawerCloseRoute: 'DrawerClose',
        drawerToggleRoute: 'DrawerToggle',
    }
);