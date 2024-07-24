import React, { Component } from "react";

import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FeedScreen from "./main/Feed";
import SearchScreen from "./main/Search";
import ProfileScreen from "./main/Profile";
import ReelsScreen from "./main/reels/Reels";
import AddScreen from "./main/Add";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  fetchUser,
  fetchUserPosts,
  fetchUserFollowing,
  clearData,
} from "../redux/actions/index";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../components/auth/firebaseConfig";
import NotificationProvider from "../providers/NotificationProvider";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const Tab = createMaterialBottomTabNavigator();

const EmptyScreen = () => {
  return null;
};
export class Main extends Component {
  componentDidMount() {
    this.props.fetchUser();
    this.props.fetchUserPosts();
    this.props.fetchUserFollowing();
    this.props.clearData();
  }

  render() {
    return (
      <NotificationProvider>
        <Tab.Navigator initialRouteName="Feed" labeled={false}>
          <Tab.Screen
            name="Feed"
            component={FeedScreen}
            options={{
              tabBarIcon: "home",
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            navigation={this.props.navigation}
            options={{
              tabBarIcon: "magnify",
            }}
          />
          <Tab.Screen
            name="Add"
            component={AddScreen}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("Add");
              },
            })}
            options={{
              tabBarIcon: "plus-box",
            }}
          />
          <Tab.Screen
            name="Reels"
            component={ReelsScreen}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("Reels", { uid: auth.currentUser.uid });
              },
            })}
            options={{
              tabBarIcon: "video",
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            listeners={({ navigation }) => ({
              tabPress: (event) => {
                event.preventDefault();
                navigation.navigate("Profile", { uid: auth.currentUser.uid });
              },
            })}
            options={{
              tabBarIcon: "account-circle",
            }}
          />
        </Tab.Navigator>
      </NotificationProvider>
    );
  }
}

const mapStateToProps = (store) => ({
  currentUser: store.userState.currentUser,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { fetchUser, fetchUserPosts, fetchUserFollowing, clearData },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(Main);
