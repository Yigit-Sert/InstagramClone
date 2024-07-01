import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LandingScreen from './components/auth/Landing';
import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkbXvrg_uUXOFMnpR9Rhi8m2zUABIXNno",
  authDomain: "instagram-dev-58752.firebaseapp.com",
  projectId: "instagram-dev-58752",
  storageBucket: "instagram-dev-58752.appspot.com",
  messagingSenderId: "823225858944",
  appId: "1:823225858944:web:63b6e5b6ae5411b53e9f65",
  measurementId: "G-P7HFEZWESQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loaded: false
    };
  }

  componentDidMount() {
    const auth = getAuth(app);
    auth.onAuthStateChanged(user => {
      if (user) {
        this.setState({
          loggedIn: true,
          loaded: true
        });
      } else {
        this.setState({
          loggedIn: false,
          loaded: true
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      );
    }

    if (!loggedIn) {
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
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>User is logged in</Text>
      </View>
    );
  }
}

export default App;
