import React, { Component } from "react";
import { View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
    };

    this.onSignUp = this.onSignUp.bind(this);
  }

  onSignUp() {
    const { email, password } = this.state;
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log("User Logined successfully:", user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
      });
  }

  render() {
    return (
      <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
        <TextInput
          label="Email"
          mode="outlined"
          onChangeText={(email) => this.setState({ email })}
          value={this.state.email}
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry={true}
          onChangeText={(password) => this.setState({ password })}
          value={this.state.password}
          style={{ marginBottom: 10 }}
        />

        <Button mode="contained" onPress={this.onSignUp}>
          Sign In
        </Button>
      </View>
    );
  }
}

export default Login;