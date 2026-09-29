import { useCallback, useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import type { ParticipantStage } from '../data/participantStages';
import type { StageBoard } from '../game/arena-scene';

type Movement = { x: number; y: number };

export function GameWorld({ stage, readOnly, paused, onOpenBoard }: {
  stage: ParticipantStage;
  readOnly: boolean;
  paused: boolean;
  onOpenBoard: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ interact: () => void } | null>(null);
  const movementRef = useRef<Movement>({ x: 0, y: 0 });
  const keyboardMovementRef = useRef<Movement>({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const [stickPosition, setStickPosition] = useState<Movement>({ x: 0, y: 0 });
  const [nearbyBoard, setNearbyBoard] = useState<StageBoard | null>(null);
  const [gameReady, setGameReady] = useState(false);

  const updateMovement = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy);
    const scale = distance > 42 ? 42 / distance : 1;
    const x = dx * scale;
    const y = dy * scale;
    movementRef.current = { x: x / 42, y: y / 42 };
    setStickPosition({ x, y });
  }, []);

  const endMovement = useCallback(() => {
    pointerIdRef.current = null;
    movementRef.current = { x: 0, y: 0 };
    setStickPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    let disposed = false;
    let game: Phaser.Game | null = null;

    async function createGame() {
      const [{ default: PhaserModule }, { ArenaScene: Scene }] = await Promise.all([
        import('phaser'), import('../game/arena-scene'),
      ]);
      const parent = mountRef.current;
      if (disposed || !parent) return;
      const scene = new Scene(stage, () => ({
        x: movementRef.current.x + keyboardMovementRef.current.x,
        y: movementRef.current.y + keyboardMovementRef.current.y,
      }), setNearbyBoard, () => onOpenBoard(), () => setGameReady(true));
      sceneRef.current = scene;
      game = new PhaserModule.Game({
        type: PhaserModule.AUTO,
        width: Math.max(1, parent.clientWidth),
        height: Math.max(1, parent.clientHeight),
        parent,
        backgroundColor: '#0b1724',
        scale: { mode: PhaserModule.Scale.RESIZE, parent },
        scene,
        render: { antialias: false, roundPixels: true, pixelArt: true },
      });
    }

    void createGame();
    return () => {
      disposed = true;
      game?.destroy(true);
      sceneRef.current = null;
    };
  }, [stage, onOpenBoard]);

  useEffect(() => {
    const pressed = new Set<string>();
    const syncMovement = () => {
      keyboardMovementRef.current = {
        x: Number(pressed.has('d') || pressed.has('arrowright')) - Number(pressed.has('a') || pressed.has('arrowleft')),
        y: Number(pressed.has('s') || pressed.has('arrowdown')) - Number(pressed.has('w') || pressed.has('arrowup')),
      };
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (paused || (target instanceof HTMLElement && target.closest('button,a,input,textarea,select,[contenteditable="true"]'))) return;
      const key = event.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        if (key.startsWith('arrow')) event.preventDefault();
        pressed.add(key);
        syncMovement();
      } else if (key === 'e' && !event.repeat) {
        sceneRef.current?.interact();
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      pressed.delete(event.key.toLowerCase());
      syncMovement();
    };
    const clearMovement = () => {
      pressed.clear();
      syncMovement();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearMovement);
    return () => {
      clearMovement();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearMovement);
    };
  }, [paused]);

  const startMovement = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateMovement(event);
  };

  const movePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === event.pointerId) updateMovement(event);
  };

  return (
    <section className="game-viewport" aria-label={`${stage.phase} ${stage.name} scene`}>
      <div className="phaser-mount" ref={mountRef} aria-label={`${stage.name} game map`} />
      {!gameReady && <div className="loading-note" role="status">Memuat peta {stage.phase}…</div>}
      <div className="world-corner-note">
        <span className="world-dot" />{readOnly ? 'READ-ONLY DEMO' : 'SOLO EXPLORATION'}
      </div>

      <div className="orientation-note" role="status">Putar perangkat ke posisi lanskap untuk menjelajah</div>
      <div
        className="virtual-stick"
        role="group"
        aria-label="Kontrol gerak. Gunakan tombol panah atau WASD di komputer."
        onPointerDown={startMovement}
        onPointerMove={movePointer}
        onPointerUp={endMovement}
        onPointerCancel={endMovement}
        onLostPointerCapture={endMovement}
      >
        <span className="stick-ring" />
        <span className="stick-knob" style={{ transform: `translate(calc(-50% + ${stickPosition.x}px), calc(-50% + ${stickPosition.y}px))` }} />
        <span className="stick-caption">GERAK</span>
      </div>

      {nearbyBoard && (
        <button className="interact-button" onClick={() => sceneRef.current?.interact()}>
          <span className="interact-key">E</span><span>Interaksi · {nearbyBoard.name}</span>
        </button>
      )}
      <div className="map-caption" aria-live="polite">{nearbyBoard ? nearbyBoard.name : 'Jelajahi sekitar untuk menemukan papan misi'}</div>
      <p className="keyboard-hint">Gerak: WASD / panah <span>·</span> Interaksi: E</p>
    </section>
  );
}
