import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowingUsers } from '../../redux/actions/index';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';

export default function FollowingList({ navigation }) {
  const dispatch = useDispatch();
  const followingUsers = useSelector((state) => state.userState.followingUsers);

  useEffect(() => {
    dispatch(fetchFollowingUsers());
  }, [dispatch]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={followingUsers}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivateChat', { userId: item.uid, userName: item.name })}
            style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
