import React, { Component } from 'react';
import { View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

    async onSignUp() {
        const { email, password, name } = this.state;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), { name, email });

            console.log('User registered successfully:', user);
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Registration error:', errorCode, errorMessage);
        }
    }

    render() {
        return (
            <View style={{ padding: 20,
                flex: 1,
                justifyContent: 'center'
             }}>
                <TextInput
                    label="Name"
                    mode="outlined"
                    onChangeText={(name) => this.setState({ name })}
                    value={this.state.name}
                    style={{ marginBottom: 10 }}
                />
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
                    Sign Up
                </Button>
            </View>
        )
    }
}

export default Register;