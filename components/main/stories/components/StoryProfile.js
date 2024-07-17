import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const StoryProfile = ({ outLineColor, displayName, imageUrl, onPressWrapped }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPressWrapped}>
        <View style={[styles.imageContainer, { borderColor: outLineColor }]}>
          <Image
            source={imageUrl ? { uri: imageUrl } : require('../assets/binary.png')}
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
  },
  imageContainer: {
    borderWidth: 5,
    borderRadius: 80,
    padding: 0.2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  nameText: {
    marginTop: 8,
    fontSize: 18,
    textAlign: 'center',
  },
});

export default StoryProfile;
