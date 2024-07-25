import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app, auth } from '../../auth/firebaseConfig';
import SingleReel from './SingleReel';

const ReelsComponent = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const fetchReels = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, `reels/${auth.currentUser.uid}/userReels`));
      const fetchedReels = [];
      querySnapshot.forEach((doc) => {
        fetchedReels.push({ id: doc.id, ...doc.data() });
      });
      setReels(fetchedReels);
    };
    fetchReels();
  }, []);

  const handleChangeIndexValue = ({ index }) => {
    setCurrentIndex(index);
  };

  return (
    <SwiperFlatList
      vertical={true}
      onChangeIndex={handleChangeIndexValue}
      data={reels}
      renderItem={({ item, index }) => (
        <SingleReel item={item} index={index} currentIndex={currentIndex} />
      )}
      keyExtractor={(item) => item.id}    />
  );
};

export default ReelsComponent;
