import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useWorldStore } from '../store/worldStore';
import { worldService } from '../systems/worldService';

const TILE_SIZE = 60;
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface TileProps {
  type: 'grass' | 'dirt' | 'water' | 'path';
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

const TileComponent: React.FC<TileProps> = ({ type, x, y, offsetX, offsetY }) => {
  const colors: Record<string, string> = {
    grass: '#7cb342',
    dirt: '#9d7e5b',
    water: '#2196f3',
    path: '#c8b89b',
  };

  const borderColors: Record<string, string> = {
    grass: '#6ba436',
    dirt: '#8b6e52',
    water: '#1976d2',
    path: '#b8a889',
  };

  const screenX = x * TILE_SIZE - offsetX;
  const screenY = y * TILE_SIZE - offsetY;

  // Only render if visible
  if (screenX + TILE_SIZE < 0 || screenX > screenWidth || screenY + TILE_SIZE < 0 || screenY > screenHeight) {
    return null;
  }

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: colors[type],
          borderColor: borderColors[type],
          left: screenX,
          top: screenY,
        },
      ]}
    />
  );
};

export const MapRenderer: React.FC<{ farmObjects: any[] }> = ({ farmObjects }) => {
  const cameraPosition = useWorldStore((state) => state.cameraPosition);

  const tiles = useMemo(() => {
    return worldService.generateWorld();
  }, []);

  // Flatten and filter visible tiles
  const visibleTiles = useMemo(() => {
    return tiles.flat().filter((tile) => {
      const screenX = tile.x * TILE_SIZE - cameraPosition.x;
      const screenY = tile.y * TILE_SIZE - cameraPosition.y;
      return (
        screenX + TILE_SIZE > 0 &&
        screenX < screenWidth &&
        screenY + TILE_SIZE > 0 &&
        screenY < screenHeight
      );
    });
  }, [tiles, cameraPosition]);

  return (
    <View style={styles.mapContainer}>
      {/* Tiles */}
      {visibleTiles.map((tile) => (
        <TileComponent
          key={`${tile.x}-${tile.y}`}
          type={tile.type}
          x={tile.x}
          y={tile.y}
          offsetX={cameraPosition.x}
          offsetY={cameraPosition.y}
        />
      ))}

      {/* Farm objects (buildings, trees, plots) rendered on top */}
      {farmObjects.map((obj) => {
        const screenX = obj.x * TILE_SIZE - cameraPosition.x;
        const screenY = obj.y * TILE_SIZE - cameraPosition.y;

        // Skip if off-screen
        if (
          screenX + obj.width * TILE_SIZE < 0 ||
          screenX > screenWidth ||
          screenY + obj.height * TILE_SIZE < 0 ||
          screenY > screenHeight
        ) {
          return null;
        }

        const getObjectColor = () => {
          switch (obj.type) {
            case 'building':
              return '#c41c3b';
            case 'tree':
              return '#4caf50';
            case 'fence':
              return '#8b7355';
            case 'plot':
              return '#9d7e5b';
            case 'decoration':
              return '#ffc107';
            default:
              return '#999';
          }
        };

        const getObjectLabel = () => {
          if (obj.type === 'plot') return '▫️';
          if (obj.type === 'building' && obj.data?.name === 'Farmhouse') return '🏡';
          if (obj.type === 'building' && obj.data?.name === 'Barn') return '🏚️';
          if (obj.type === 'building' && obj.data?.name === 'Shop') return '🛍️';
          if (obj.type === 'tree') return '🌳';
          if (obj.type === 'fence') return '🚧';
          return '';
        };

        return (
          <View
            key={obj.id}
            style={[
              styles.object,
              {
                backgroundColor: getObjectColor(),
                left: screenX,
                top: screenY,
                width: obj.width * TILE_SIZE,
                height: obj.height * TILE_SIZE,
                opacity: obj.type === 'tree' || obj.type === 'fence' ? 0.8 : 0.9,
              },
            ]}
          >
            <View style={styles.objectLabel}>
              {getObjectLabel() ? getObjectLabel() : ''}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: '#558b2f',
    overflow: 'hidden',
    position: 'relative',
  },
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderWidth: 1,
  },
  object: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  objectLabel: {
    fontSize: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
