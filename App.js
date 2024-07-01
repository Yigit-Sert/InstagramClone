import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';

import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkbXvrg_uUXOFMnpR9Rhi8m2zUABIXNno",
  authDomain: "instagram-dev-58752.firebaseapp.com",
  projectId: "instagram-dev-58752",
  storageBucket: "instagram-dev-58752.appspot.com",
  messagingSenderId: "823225858944",
  appId: "1:823225858944:web:63b6e5b6ae5411b53e9f65",
  measurementId: "G-P7HFEZWESQ"
};

if (!firebase.getApps().length){
  firebase.initializeApp(firebaseConfig)
}
/* if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
} */

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';

const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
