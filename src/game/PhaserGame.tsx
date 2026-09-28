import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { WorldScene } from './scenes/WorldScene';
import { PathCode } from '../types';

interface PhaserGameProps {
  currentPath: PathCode;
  currentStage: number;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ currentPath, currentStage }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: width,
      height: height,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      pixelArt: true,
      render: {
        pixelArt: true,
        antialias: false
      },
      backgroundColor: '#3f739e',
      scene: [BootScene, WorldScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        parent: gameContainerRef.current,
        width: width,
        height: height
      }
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    game.events.once('ready', () => {
      const worldScene = game.scene.getScene('WorldScene') as WorldScene;
      if (worldScene) {
        worldScene.init({ pathCode: currentPath, stageOrdinal: currentStage });
      }
    });

    const handleResize = () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={gameContainerRef} 
      className="absolute inset-0 w-full h-full overflow-hidden cursor-crosshair m-0 p-0 bg-[#3f739e]"
    />
  );
};
