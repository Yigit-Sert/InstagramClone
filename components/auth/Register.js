import React, { Component } from 'react';
import { View, Button, TextInput } from 'react-native';
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
