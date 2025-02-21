import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

// Import screens from src/screens
import HomeScreen from './src/screens/HomeScreen';
import CanvasScreen from './src/screens/CanvasScreen';

// Placeholder screens
const ProfileScreen = () => (
  
  <View style={styles.screen}>
    {/* User profile content will go here */}
  </View>
);

const SettingsScreen = () => (
  <View style={styles.screen}>
    {/* App settings will go here */}
  </View>
);

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Drawer.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            drawerStyle: styles.drawer,
            headerStyle: styles.header,
            headerTintColor: '#000',
            drawerIcon: ({ focused, color }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Canvas') {
                iconName = focused ? 'create' : 'create-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }
              return <Ionicons name={iconName} size={24} color={color} />;
            },
          })}
        >
          <Drawer.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              title: 'My Sketchbooks'
            }}
          />
          <Drawer.Screen 
            name="Canvas" 
            component={CanvasScreen}
            options={{
              title: 'Canvas Editor'
            }}
          />
          <Drawer.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              drawerLabel: 'Profile',
              drawerLabelStyle: styles.drawerLabel,
            }}
          />
          <Drawer.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              drawerLabel: 'Settings',
              drawerLabelStyle: styles.drawerLabel,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const { width } = Dimensions.get('window');
const drawerWidth = Math.min(width * 0.2, 180); // 20% de la largeur de l'écran, max 180px

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  drawer: {
    width: drawerWidth,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  drawerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  drawerItem: {
    marginVertical: 0,
    marginHorizontal: 0,
    padding: 8,
  },
  drawerContent: {
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#fff',
  },
}); 