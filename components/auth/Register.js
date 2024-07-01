import React, { Component } from 'react';
import { View, Button, TextInput } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

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

export class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
            name: ''
        }

        this.onSignUp = this.onSignUp.bind(this);
    }

    onSignUp() {
        const { email, password, name } = this.state;
        const auth = getAuth(app);
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log('User registered successfully:', user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Registration error:', errorCode, errorMessage);
            });
    }

    render() {
        return (
            <View>
                <TextInput
                    placeholder="Name"
                    onChangeText={(name) => this.setState({ name })}
                    value={this.state.name}
                />
                <TextInput
                    placeholder="Email"
                    onChangeText={(email) => this.setState({ email })}
                    value={this.state.email}
                />
                <TextInput
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(password) => this.setState({ password })}
                    value={this.state.password}
                />

                <Button onPress={this.onSignUp} title="Sign Up" />
            </View>
        )
    }
}

export default Register;
