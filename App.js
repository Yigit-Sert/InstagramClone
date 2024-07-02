import React, { Component } from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import LandingScreen from "./components/auth/Landing";
import RegisterScreen from "./components/auth/Register";
import LoginScreen from "./components/auth/Login";
import MainScreen from "./components/Main";
import AddScreen from "./components/main/Add";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "./components/auth/firebaseConfig";
import { Provider } from "react-redux";
import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import rootReducer from "./redux/reducers";
import thunk from "redux-thunk";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Redux Toolkit - store setup
const store = configureStore({
  reducer: rootReducer,
});

const Stack = createStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loaded: false,
    };
  }

  componentDidMount() {
    const auth = getAuth(app);
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      } else {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      }
    });
  }

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Loading...</Text>
        </View>
      );
    }

    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Main">
            <Stack.Screen
              name="Main"
              component={MainScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Add"
              component={AddScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    );
  }
}

export default App;
