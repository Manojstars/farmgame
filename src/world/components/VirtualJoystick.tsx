import React, { useState } from 'react';
import { View, PanResponder, StyleSheet, Dimensions } from 'react-native';
import { useWorldStore } from '../store/worldStore';
import { worldService } from '../systems/worldService';

const JOYSTICK_SIZE = 90;
const OUTER_RADIUS = JOYSTICK_SIZE / 2;
const INNER_RADIUS = 18;
const MOVEMENT_SPEED = 0.08; // World units per tick
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const VirtualJoystick: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const setPlayerPosition = useWorldStore((state) => state.setPlayerPosition);
  const playerPosition = useWorldStore((state) => state.playerPosition);
  const setCameraPosition = useWorldStore((state) => state.setCameraPosition);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderMove: (evt, gestureState) => {
      // Clamp joystick position to circle
      const x = Math.max(-OUTER_RADIUS, Math.min(OUTER_RADIUS, gestureState.dx));
      const y = Math.max(-OUTER_RADIUS, Math.min(OUTER_RADIUS, gestureState.dy));
      setPosition({ x, y });

      // Calculate movement direction
      const magnitude = Math.sqrt(x * x + y * y);

      if (magnitude > 15) {
        // Dead zone
        const dirX = x / magnitude;
        const dirY = y / magnitude;

        // Calculate new position
        const newX = playerPosition.x + dirX * MOVEMENT_SPEED;
        const newY = playerPosition.y + dirY * MOVEMENT_SPEED;

        // Check if walkable
        if (worldService.isWalkable(newX, newY, 0.3, 0.3)) {
          setPlayerPosition(newX, newY);

          // Update camera to follow player (keep player centered)
          const cameraX = newX * 60 - screenWidth / 2;
          const cameraY = newY * 60 - (screenHeight / 2 + 80); // Account for HUD
          setCameraPosition(cameraX, cameraY);
        }
      }
    },

    onPanResponderRelease: () => {
      setPosition({ x: 0, y: 0 });
    },
  });

  return (
    <View style={styles.joystickContainer} {...panResponder.panHandlers}>
      {/* Outer ring */}
      <View style={styles.joystickOuter}>
        {/* Inner knob */}
        <View
          style={[
            styles.joystickInner,
            {
              transform: [{ translateX: position.x }, { translateY: position.y }],
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  joystickContainer: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    zIndex: 20,
  },
  joystickOuter: {
    width: JOYSTICK_SIZE,
    height: JOYSTICK_SIZE,
    borderRadius: OUTER_RADIUS,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joystickInner: {
    width: INNER_RADIUS * 2,
    height: INNER_RADIUS * 2,
    borderRadius: INNER_RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
