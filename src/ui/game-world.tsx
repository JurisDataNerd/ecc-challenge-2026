import { useCallback, useEffect, useRef, useState } from 'react';
import type Phaser from 'phaser';
import { Pause } from '@phosphor-icons/react';
import type { ParticipantStage } from '../data/participantStages';
import { movementInput } from '../game/terrain';
import type { StageBoard } from '../game/arena-scene';

type Movement = { x: number; y: number };

export function GameWorld({ stage, paused, onOpenBoard, onPause }: {
  stage: ParticipantStage;
  paused: boolean;
  onOpenBoard: () => void;
  onPause: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{ interact: () => void } | null>(null);
  const [portrait, setPortrait] = useState(() => matchMedia('(pointer:coarse) and (orientation:portrait)').matches);
  useEffect(() => { const media=matchMedia('(pointer:coarse) and (orientation:portrait)');const change=()=>setPortrait(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change); }, []);
  const pausedRef = useRef(paused);
  pausedRef.current = paused || portrait;
  const movementRef = useRef<Movement>({ x: 0, y: 0 });
  const keyboardMovementRef = useRef<Movement>({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const [stickPosition, setStickPosition] = useState<Movement>({ x: 0, y: 0 });
  const [nearbyBoard, setNearbyBoard] = useState<StageBoard | null>(null);
  const [gameReady, setGameReady] = useState(false);

  const updateMovement = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (pausedRef.current) return;
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
      const scene = new Scene(stage, () => movementInput(keyboardMovementRef.current,movementRef.current,pausedRef.current), setNearbyBoard, () => { if (!pausedRef.current) onOpenBoard(); }, () => setGameReady(true));
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
      if (import.meta.env.DEV) Object.assign(parent, { __game: game });
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
      if (event.key === 'Escape' && !event.repeat && !pausedRef.current) { event.preventDefault(); onPause(); return; }
      if (pausedRef.current || (target instanceof HTMLElement && target.closest('input,textarea,select,dialog,[contenteditable="true"]'))) return;
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
      endMovement();
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
  }, [paused, portrait, onPause, endMovement]);

  useEffect(() => { if (paused || portrait) endMovement(); }, [paused, portrait, endMovement]);

  const startMovement = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pausedRef.current) return;
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateMovement(event);
  };

  const movePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current === event.pointerId) updateMovement(event);
  };

  return (
    <section className="game-viewport" tabIndex={0} aria-label={`${stage.phase} ${stage.name} scene`}>
      <div className="phaser-mount" ref={mountRef} aria-label={`${stage.name} game map`} />
      {!gameReady && <div className="loading-note" role="status">Memuat peta {stage.phase}…</div>}
      <button className="game-pause-button" type="button" aria-label="Jeda permainan" onClick={onPause}><Pause size={22} weight="bold" /></button>

      <div className="orientation-note" role="status"><strong>Putar ponsel ke posisi lanskap</strong><p>Peta dan kontrol gerak membutuhkan layar yang lebih lebar. Buka Jeda untuk kembali ke peta.</p></div>
      <div
        className="virtual-stick"
        role="group"
        aria-disabled={paused}
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
        <button className="interact-button" disabled={paused} aria-label={`Interaksi dengan ${nearbyBoard.name}`} onClick={() => { if (!pausedRef.current) sceneRef.current?.interact(); }}>
          <span className="interact-key">E</span><span>Interaksi</span>
        </button>
      )}
    </section>
  );
}
