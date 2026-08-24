// World service for collision detection and world management

import { Tile, FarmObject } from '../types/world';

export class WorldService {
  private tileMap: Tile[][] = [];
  private worldWidth = 16;
  private worldHeight = 12;
  private tileSize = 60;

  // World boundaries in world coordinates
  private farmBounds = {
    minX: 0.5,
    maxX: 15.5,
    minY: 0.5,
    maxY: 11.5,
  };

  generateWorld(): Tile[][] {
    const tiles: Tile[][] = [];

    for (let y = 0; y < this.worldHeight; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.worldWidth; x++) {
        // Create grass base
        let type: 'grass' | 'dirt' | 'water' | 'path' = 'grass';

        // Add some paths/dirt roads
        if ((x === 0 && y > 0 && y < 10) || (y === 0 && x > 0 && x < 15)) {
          type = 'path';
        }

        row.push({ type, x, y });
      }
      tiles.push(row);
    }

    this.tileMap = tiles;
    return tiles;
  }

  getTile(x: number, y: number): Tile | null {
    const gridX = Math.floor(x);
    const gridY = Math.floor(y);

    if (gridY < 0 || gridY >= this.tileMap.length) return null;
    if (gridX < 0 || gridX >= this.tileMap[0].length) return null;

    return this.tileMap[gridY][gridX];
  }

  isWalkable(x: number, y: number, playerWidth = 0.3, playerHeight = 0.3): boolean {
    // Check bounds
    if (
      x - playerWidth / 2 < this.farmBounds.minX ||
      x + playerWidth / 2 > this.farmBounds.maxX ||
      y - playerHeight / 2 < this.farmBounds.minY ||
      y + playerHeight / 2 > this.farmBounds.maxY
    ) {
      return false;
    }

    // Check tile type
    const tile = this.getTile(x, y);
    if (!tile || tile.type === 'water') {
      return false;
    }

    return true;
  }

  checkCollision(
    playerX: number,
    playerY: number,
    playerWidth: number,
    playerHeight: number,
    objects: FarmObject[]
  ): boolean {
    const playerBox = {
      left: playerX - playerWidth / 2,
      right: playerX + playerWidth / 2,
      top: playerY - playerHeight / 2,
      bottom: playerY + playerHeight / 2,
    };

    for (const obj of objects) {
      if (!obj.collidable) continue;

      const objBox = {
        left: obj.x,
        right: obj.x + obj.width,
        top: obj.y,
        bottom: obj.y + obj.height,
      };

      // AABB collision
      if (
        playerBox.left < objBox.right &&
        playerBox.right > objBox.left &&
        playerBox.top < objBox.bottom &&
        playerBox.bottom > objBox.top
      ) {
        return true;
      }
    }

    return false;
  }

  // Generate farm objects (buildings, trees, fences, plots)
  generateFarmObjects(): FarmObject[] {
    const objects: FarmObject[] = [];

    // Farmhouse (top right)
    objects.push({
      id: 'farmhouse',
      type: 'building',
      x: 12,
      y: 1.5,
      width: 2,
      height: 1.8,
      collidable: true,
      data: { name: 'Farmhouse' },
    });

    // Barn (top center)
    objects.push({
      id: 'barn',
      type: 'building',
      x: 6,
      y: 1,
      width: 2,
      height: 2,
      collidable: true,
      data: { name: 'Barn' },
    });

    // Shop (right side)
    objects.push({
      id: 'shop',
      type: 'building',
      x: 14,
      y: 4,
      width: 1.5,
      height: 1.5,
      collidable: true,
      data: { name: 'Shop' },
    });

    // Trees around perimeter
    for (let i = 1; i < 15; i++) {
      objects.push({
        id: `tree-top-${i}`,
        type: 'tree',
        x: i,
        y: 0.3,
        width: 0.5,
        height: 0.5,
        collidable: true,
      });
    }

    for (let i = 2; i < 15; i++) {
      objects.push({
        id: `tree-bottom-${i}`,
        type: 'tree',
        x: i,
        y: 11.2,
        width: 0.5,
        height: 0.5,
        collidable: true,
      });
    }

    // Crop plots (center-left area) - 3x3 grid
    let plotIndex = 0;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        objects.push({
          id: `plot-${plotIndex}`,
          type: 'plot',
          x: 2 + col * 1.2,
          y: 3.5 + row * 1.2,
          width: 1,
          height: 1,
          collidable: false,
          data: {
            plotIndex,
            state: 'empty',
            cropId: null,
            plantedAt: null,
          },
        });
        plotIndex++;
      }
    }

    // More plots on right side
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        objects.push({
          id: `plot-${plotIndex}`,
          type: 'plot',
          x: 8.5 + col * 1.2,
          y: 6 + row * 1.2,
          width: 1,
          height: 1,
          collidable: false,
          data: {
            plotIndex,
            state: 'empty',
            cropId: null,
            plantedAt: null,
          },
        });
        plotIndex++;
      }
    }

    return objects;
  }

  getWorldWidth(): number {
    return this.worldWidth;
  }

  getWorldHeight(): number {
    return this.worldHeight;
  }

  getTileSize(): number {
    return this.tileSize;
  }
}

export const worldService = new WorldService();
