import { useCallback, useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import type { ArenaScene, StageBoard } from "../game/arena-scene";

type Movement = { x: number; y: number };
type StickPosition = { x: number; y: number };

const STICK_RADIUS = 42;

export function GameWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<ArenaScene | null>(null);
  const movementRef = useRef<Movement>({ x: 0, y: 0 });
  const pointerIdRef = useRef<number | null>(null);
  const [stickPosition, setStickPosition] = useState<StickPosition>({ x: 0, y: 0 });
  const [nearbyBoard, setNearbyBoard] = useState<StageBoard | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<StageBoard | null>(null);
  const [gameReady, setGameReady] = useState(false);

  const updateMovement = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const distance = Math.hypot(dx, dy);
    const scale = distance > STICK_RADIUS ? STICK_RADIUS / distance : 1;
    const x = dx * scale;
    const y = dy * scale;

    movementRef.current = { x: x / STICK_RADIUS, y: y / STICK_RADIUS };
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
        import("phaser"),
        import("../game/arena-scene"),
      ]);

      if (disposed || !mountRef.current) return;

      const scene = new Scene(
        () => movementRef.current,
        setNearbyBoard,
        setSelectedBoard,
        () => setGameReady(true),
      );
      sceneRef.current = scene;
      game = new PhaserModule.Game({
        type: PhaserModule.AUTO,
        width: window.innerWidth,
        height: window.innerHeight,
        parent: mountRef.current,
        backgroundColor: "#889544",
        scale: {
          mode: PhaserModule.Scale.RESIZE,
        },
        scene,
        render: {
          antialias: false,
          roundPixels: true,
        },
      });
    }

    void createGame();

    return () => {
      disposed = true;
      game?.destroy(true);
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!selectedBoard) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedBoard(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedBoard]);

  const startMovement = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    pointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateMovement(event);
  };

  const movePointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    updateMovement(event);
  };

  return (
    <main className="game-shell">
      <h1 className="visually-hidden">Future Quest arena</h1>
      <section className="game-viewport" aria-label="Future Quest arena">
        <div className="phaser-mount" ref={mountRef} aria-label="Explore the Future Quest arena" />

        {!gameReady && <div className="loading-note">Entering the arena…</div>}

        <div className="world-hud" aria-label="Game status">
          <span className="world-title">Future Quest</span>
          <span className="world-subtitle">SIAP Impact 2026</span>
        </div>
        <div className="stage-count" aria-label="Three stages in this arena">
          <span className="stage-count-dot" /> 1 stage open <span className="stage-count-divider">/</span> 2 locked
        </div>

        <div className="orientation-note" role="status">
          Turn your device sideways to explore
        </div>

        <div
          className="virtual-stick"
          role="group"
          aria-label="Movement control. Use the keyboard arrows or WASD on desktop."
          onPointerDown={startMovement}
          onPointerMove={movePointer}
          onPointerUp={endMovement}
          onPointerCancel={endMovement}
          onLostPointerCapture={endMovement}
        >
          <span className="stick-ring" />
          <span
            className="stick-knob"
            style={{ transform: `translate(calc(-50% + ${stickPosition.x}px), calc(-50% + ${stickPosition.y}px))` }}
          />
          <span className="stick-caption">MOVE</span>
        </div>

        {nearbyBoard && (
          <button
            className={`interact-button ${nearbyBoard.locked ? "is-locked" : ""}`}
            onClick={() => sceneRef.current?.interact()}
            aria-label={nearbyBoard.locked ? `View why ${nearbyBoard.name} is locked` : `Open ${nearbyBoard.name}`}
          >
            <span className="interact-key">E</span>
            <span>{nearbyBoard.locked ? "Why locked?" : "Open board"}</span>
          </button>
        )}

        <div className="map-caption" aria-live="polite">
          {nearbyBoard ? nearbyBoard.name : "Explore the paths"}
        </div>
        <p className="keyboard-hint">Move with WASD or arrow keys</p>
      </section>

      {selectedBoard && (
        <div className="dialog-scrim" onMouseDown={() => setSelectedBoard(null)}>
          <section
            className="board-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="board-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dialog-topline">
              <span>{selectedBoard.locked ? "STAGE ACCESS" : `STAGE ${selectedBoard.id}`}</span>
              <button className="close-button" onClick={() => setSelectedBoard(null)} aria-label="Close board">×</button>
            </div>
            <h2 id="board-title">{selectedBoard.name}</h2>

            {selectedBoard.locked ? (
              <div className="locked-message">
                <span className="lock-mark" aria-hidden="true">▣</span>
                <div>
                  <strong>This stage isn’t open yet.</strong>
                  <p>It opens after your result is published and the stage start date arrives.</p>
                </div>
              </div>
            ) : (
              <>
                <p className="board-copy">Your first stage begins with listening closely and finding the real problem.</p>
                <div className="quest-list">
                  <article className="quest-row">
                    <span className="quest-kind quiz-kind">QUIZ</span>
                    <span><strong>Discover &amp; empathize</strong><small>Check your understanding</small></span>
                    <span className="quest-state">Ready</span>
                  </article>
                  <article className="quest-row">
                    <span className="quest-kind mission-kind">MISSION</span>
                    <span><strong>Interview and insight</strong><small>Bring back what you learn</small></span>
                    <span className="quest-state">Ready</span>
                  </article>
                </div>
                <p className="flow-note">Quiz and mission screens will connect here.</p>
              </>
            )}
            <button className="dialog-done" onClick={() => setSelectedBoard(null)}>Back to the arena</button>
          </section>
        </div>
      )}
    </main>
  );
}
