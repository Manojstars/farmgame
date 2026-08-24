// World system types

export type TileType = 'grass' | 'dirt' | 'water' | 'path';

export interface Tile {
  type: TileType;
  x: number;
  y: number;
}

export type FarmObjectType = 'plot' | 'building' | 'decoration' | 'tree' | 'fence';

export interface FarmObject {
  id: string;
  type: FarmObjectType;
  x: number;
  y: number;
  width: number;
  height: number;
  collidable: boolean;
  data?: Record<string, any>;
}

export interface PlotState {
  cropId: string | null;
  plantedAt: number | null;
  state: 'empty' | 'planted' | 'growing' | 'ready';
}
