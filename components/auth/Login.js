import React, { Component } from 'react';
import { View, Button, TextInput } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: ''
        }

        this.onSignUp = this.onSignUp.bind(this);
    }

    onSignUp() {
        const { email, password } = this.state;
        const auth = getAuth(app);
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log('User Logined successfully:', user);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Login error:', errorCode, errorMessage);
            });
    }

    render() {
        return (
            <View>
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

                <Button onPress={this.onSignUp} title="Sign In" />
            </View>
        )
    }
}

export default Login;
