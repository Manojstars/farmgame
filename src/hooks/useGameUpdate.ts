import { useEffect } from 'react';
import { gameLoopService } from '../services/gameLoopService';

/**
 * Hook that starts the game loop on mount and stops on unmount
 */
export const useGameUpdate = () => {
  useEffect(() => {
    gameLoopService.start();

    return () => {
      gameLoopService.stop();
    };
  }, []);
};

export default useGameUpdate;
