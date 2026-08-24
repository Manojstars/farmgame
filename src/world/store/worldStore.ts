import create from 'zustand';

export interface WorldState {
  playerPosition: { x: number; y: number };
  cameraPosition: { x: number; y: number };
  isMoving: boolean;
  selectedObjectId: string | null;
  worldWidth: number;
  worldHeight: number;
  tileSize: number;
}

interface WorldStore extends WorldState {
  setPlayerPosition: (x: number, y: number) => void;
  setCameraPosition: (x: number, y: number) => void;
  setIsMoving: (moving: boolean) => void;
  setSelectedObject: (id: string | null) => void;
}

export const useWorldStore = create<WorldStore>((set) => ({
  playerPosition: { x: 7, y: 8 },
  cameraPosition: { x: 0, y: 0 },
  isMoving: false,
  selectedObjectId: null,
  worldWidth: 16,
  worldHeight: 12,
  tileSize: 60,

  setPlayerPosition: (x, y) => set({ playerPosition: { x, y } }),
  setCameraPosition: (x, y) => set({ cameraPosition: { x, y } }),
  setIsMoving: (moving) => set({ isMoving: moving }),
  setSelectedObject: (id) => set({ selectedObjectId: id }),
}));

export default useWorldStore;
