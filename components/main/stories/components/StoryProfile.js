import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const StoryProfile = ({ outLineColor, displayName, imageUrl, onPressWrapped }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPressWrapped}>
        <View style={[styles.imageContainer, { borderColor: outLineColor }]}>
          <Image
            source={imageUrl ? { uri: imageUrl } : require('../assets/profile.jpg')}
            style={styles.profileImage}
          />
        </View>
      </TouchableOpacity>
      <Text style={styles.nameText}>{displayName}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  imageContainer: {
    borderWidth: 2,
    borderRadius: 40,
    padding: 0.1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  nameText: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StoryProfile;
