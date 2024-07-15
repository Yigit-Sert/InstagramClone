import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFollowingUsers } from '../../redux/actions/index';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { List } from 'react-native-paper'; // React Native Paper'dan List bileşenini ekliyoruz

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
            onPress={() => navigation.navigate('Chat', { userId: item.uid, userName: item.name })}
            style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
          >
            <List.Item title={item.name} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
