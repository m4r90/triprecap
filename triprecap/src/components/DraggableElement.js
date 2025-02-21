import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const DraggableElement = ({ 
  element,
  onUpdate,
  onDelete,
  onSelect,
  isSelected,
}) => {
  const translateX = useSharedValue(element.position.x);
  const translateY = useSharedValue(element.position.y);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onFinish: () => {
      onUpdate({
        ...element,
        position: {
          x: translateX.value,
          y: translateY.value,
        },
      });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <Pressable onPress={onSelect}>
          {element.type === 'image' ? (
            <Image 
              source={{ uri: element.content }} 
              style={[styles.image, element.style]}
              resizeMode="contain"
            />
          ) : (
            <Text style={[styles.text, element.style]}>
              {element.content}
            </Text>
          )}
          {isSelected && (
            <Pressable 
              onPress={onDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>×</Text>
            </Pressable>
          )}
        </Pressable>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 5,
  },
  image: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 16,
    color: 'black',
    padding: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DraggableElement; 