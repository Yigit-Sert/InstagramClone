import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, View, TouchableOpacity, Pressable, StyleSheet, SafeAreaView, Text } from "react-native";
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../../../auth/firebaseConfig';
import StoryProfile from './StoryProfile'; 
import { mute, unmute, pause, play } from '../helpers/exportedFunctions';

const { width } = Dimensions.get("window");

const StoryComponent = ({ onFinishStory, uid }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [userStories, setUserStories] = useState([]);
  const [userName, setUserName] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pausedProgress = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [wentBack, setWentBack] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', uid);
      const userSnapshot = await getDoc(userRef);
      if (userSnapshot.exists()) {
        setUserName(userSnapshot.data().name);
      }

      const storiesRef = collection(db, 'stories', uid, 'userStories');
      const storiesSnapshot = await getDocs(storiesRef);
      const fetchedStories = [];
      storiesSnapshot.forEach(doc => {
        fetchedStories.push(doc.data().downloadURL); 
      });
      setUserStories(fetchedStories);
    };

    fetchUserData();
  }, [uid]);

  const currentStory = userStories[currentStoryIndex];

  const renderStoryContent = (story) => {
    return <Image source={{ uri: story }} style={styles.backgroundImage} />;
  };

  const goToNextStory = () => {
    if (currentStoryIndex < userStories.length - 1) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(() => {
        pausedProgress.current = 0;
        setCurrentStoryIndex(currentStoryIndex + 1);
        progressAnim.setValue(0);
      });
    } else {
      setWentBack(0);
      onFinishStory();
      setCurrentStoryIndex(0);
    }
  };

  const runProgressAnimation = () => {
    progressAnim.setValue(pausedProgress.current);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: (1 - pausedProgress.current) * 6000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goToNextStory();
      }
    });
  };

  const getProgressBarWidth = (storyIndex, currentIndex) => {
    if (currentIndex > storyIndex) {
      return "100%";
    }
    if (currentIndex === storyIndex) {
      return progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      });
    }
    return "0%";
  };

  const goToPreviousStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      progressAnim.setValue(0);
      pausedProgress.current = 0;
    } else {
      setWentBack(wentBack + 1);
      if (wentBack > 0) {
        onFinishStory();
        setCurrentStoryIndex(0);
      }
    }
  };

  const handlePress = (event) => {
    const x = event.nativeEvent.locationX;
    if (x < width / 2) {
      goToPreviousStory();
    } else {
      goToNextStory();
    }
  };

  useEffect(() => {
    if (!isPaused) {
      runProgressAnimation();
    }
  }, [currentStoryIndex, isPaused]);

  const handlePause = () => {
    setIsPaused(true);
    progressAnim.stopAnimation(value => {
      pausedProgress.current = value;
    });
  };

  const handlePlay = () => {
    setIsPaused(false);
    runProgressAnimation();
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.muteButton} onPress={handleMute}>
        <Image source={isMuted ? unmute : mute} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.pauseButton} onPress={isPaused ? handlePlay : handlePause}>
        <Image source={isPaused ? play : pause} style={styles.icon} />
      </TouchableOpacity>
      <Pressable style={styles.pressable} onPress={handlePress}>
        {userStories.length > 0 ? (
          <>
            {currentStory && renderStoryContent(currentStory)}
            <View style={styles.progressContainer}>
              {userStories.map((story, index) => (
                <React.Fragment key={index}>
                  <StoryProfile
                    outLineColor="green"
                    // displayName={userName}
                    imageUrl={story}
                    onPressWrapped={() => {}}
                    progressBarWidth={getProgressBarWidth(index, currentStoryIndex)} // Add this prop
                  />
                  <Text 
                  style={{ 
                    color: "white", 
                    fontSize: 18, 
                    fontWeight: "bold",
                    textShadowColor: "black",
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 10,
                    top: 20,
                   }}>{userName}</Text>
                </React.Fragment>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.noStoriesContainer}>
            <Text style={styles.noStoriesText}>{userName} has no stories available.</Text>
          </View>
        )}
      </Pressable>
    </SafeAreaView>
  );
};

export default StoryComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  pressable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    position: "absolute",
    top: 20,
    flexDirection: "row",
    width: "100%",
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: "white",
  },
  muteButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  pauseButton: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  icon: {
    width: 24,
    height: 24,
  },
  noStoriesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noStoriesText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
