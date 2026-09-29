import { useEffect, useRef, useState } from "react";
import NameEntry from "../components/NameEntry";
import PetSprite from "../components/PetSprite";
import NeedMeter from "../components/NeedMeter";
import EventCard from "../components/EventCard";
import FinalSummary from "../components/FinalSummary";
import { useAudio } from "../audio/useAudio";
import { createInitialGameState, getPetMood } from "../game/createInitialGameState";
import { gameReducer } from "../game/gameReducer";
import { clearSavedGame, loadSavedGame, saveGame } from "../game/persistence";
import type { GameAction, GameState, PetAction } from "../game/types";
import "../styles/app.css";

const NEEDS = [
  { key: "hunger", label: "Hambre atendida", emoji: "🍎" },
  { key: "fun", label: "Diversión", emoji: "🎾" },
  { key: "hygiene", label: "Higiene", emoji: "🫧" },
  { key: "happiness", label: "Felicidad", emoji: "💛" },
] as const;

function formatGameTime(simulatedHour: number) {
  const hour = Math.min(Math.floor(simulatedHour), 24);
  const minute =
    hour === 24 ? 0 : Math.floor((simulatedHour - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function getPetMessage(game: GameState) {
  if (game.status === "ghost") return "Siempre tendrán sus recuerdos bonitos.";
  if (game.status === "paused") return "Una pausita está bien. Aquí te esperamos.";
  if (game.activeFoodRequest) return "🍗 Tengo un poquito de hambre...";
  if (game.pet.needs.hunger < 25) return "🍎 Mi pancita ya está haciendo ruido...";
  if (game.pet.needs.hygiene < 25) return "🫧 Creo que necesito un baño...";
  if (game.pet.needs.fun < 25) return "🎾 ¿Jugamos un ratito? Me estoy aburriendo...";
  if (game.pet.needs.happiness < 35) return "💛 ¿Me das un poquito de cariño?";
  if (game.pet.needs.happiness > 80) return "✨ ¡Qué feliz me haces! Eres genial.";
  return `${game.pet.name} está feliz de compartir el día contigo.`;
}

function getSaveSignature(game: GameState) {
  return JSON.stringify({
    status: game.status,
    pet: {
      ...game.pet,
      needs: Object.fromEntries(
        Object.entries(game.pet.needs).map(([need, value]) => [
          need,
          Math.round(value),
        ]),
      ),
      simulatedHour: Math.floor(game.pet.simulatedHour * 60) / 60,
    },
    statistics: {
      ...game.statistics,
      simulatedHoursSurvived:
        Math.floor(game.statistics.simulatedHoursSurvived * 60) / 60,
    },
    elapsedSecond: Math.floor(game.elapsedRealMs / 1_000),
    moodUntilMs: game.moodUntilMs,
    activeFoodRequest: game.activeFoodRequest,
    activeEvent: game.activeEvent,
    eventCooldownUntilHour: game.eventCooldownUntilHour,
    randomSeed: game.randomSeed,
    lastEventId: game.lastEventId,
    feedback: game.feedback,
  });
}

function StorageNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="storage-notice" role="status">
      <span aria-hidden="true">ⓘ</span>
      {message}
    </div>
  );
}

interface AudioSettingsProps {
  musicEnabled: boolean;
  soundsEnabled: boolean;
  onToggleMusic: () => void;
  onToggleSounds: () => void;
}

function AudioSettings({
  musicEnabled,
  soundsEnabled,
  onToggleMusic,
  onToggleSounds,
}: AudioSettingsProps) {
  return (
    <div className="audio-settings" aria-label="Controles de audio">
      <button
        aria-pressed={musicEnabled}
        className={`audio-toggle${musicEnabled ? " audio-toggle--on" : ""}`}
        onClick={onToggleMusic}
        type="button"
      >
        <span aria-hidden="true">{musicEnabled ? "♫" : "♪"}</span>
        Música {musicEnabled ? "sí" : "no"}
      </button>
      <button
        aria-pressed={soundsEnabled}
        className={`audio-toggle${soundsEnabled ? " audio-toggle--on" : ""}`}
        onClick={onToggleSounds}
        type="button"
      >
        <span aria-hidden="true">{soundsEnabled ? "◖" : "◌"}</span>
        Sonidos {soundsEnabled ? "sí" : "no"}
      </button>
    </div>
  );
}

interface GameScreenProps {
  game: GameState;
  dispatch: (action: GameAction) => void;
  onNewGame: () => void;
  onCare: (action: PetAction) => void;
  onResolveEvent: () => void;
  onIgnoreEvent: () => void;
  audioSettings: AudioSettingsProps;
  storageWarning: string | null;
}

function GameScreen({
  game,
  dispatch,
  onNewGame,
  onCare,
  onResolveEvent,
  onIgnoreEvent,
  audioSettings,
  storageWarning,
}: GameScreenProps) {
  const isPaused = game.status === "paused";
  const isFinished = game.status === "ghost" || game.status === "completed";
  const progress = (game.pet.simulatedHour / 24) * 100;
  const displayedMood =
    game.status === "ghost"
      ? "ghost"
      : game.activeEvent?.mood ??
        (game.elapsedRealMs < game.moodUntilMs
          ? game.pet.mood
          : getPetMood(game.pet.needs, game.activeFoodRequest));

  return (
    <main className="page-shell game-page">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Tamagotchi, inicio">
          <span className="wordmark__mark" aria-hidden="true">
            T
          </span>
          <span>tamagotchi</span>
        </a>
        <div className="game-header__right">
          <AudioSettings {...audioSettings} />
          <button className="exit-button" onClick={onNewGame} type="button">
            <span aria-hidden="true">↻</span>
            Nueva partida
          </button>
        </div>
      </header>

      <StorageNotice message={storageWarning} />

      <section className="game-console" aria-labelledby="game-title">
        <div className="console-heading">
          <div>
            <p className="eyebrow">TU PEQUEÑO MUNDO</p>
            <h1 id="game-title">
              El día de <span className="name-highlight">{game.pet.name}</span>
            </h1>
          </div>
          <div className={`clock-card${isPaused ? " clock-card--paused" : ""}`}>
            <span className="clock-card__label">
              {isPaused ? "PARTIDA EN PAUSA" : "DÍA 01 · AVENTURA"}
            </span>
            <strong>
              <span aria-hidden="true">◷</span> {formatGameTime(game.pet.simulatedHour)}
              <small> / 24:00</small>
            </strong>
          </div>
        </div>

        <div className="day-progress" aria-label={`${Math.floor(progress)}% del día completado`}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="game-layout">
          <section className="pet-panel" aria-label={`Mascota ${game.pet.name}`}>
            <div className="pet-scene">
              <div className="scene-sun" aria-hidden="true" />
              <div className="scene-sparkle scene-sparkle--one" aria-hidden="true">
                ✦
              </div>
              <div className="scene-sparkle scene-sparkle--two" aria-hidden="true">
                ✧
              </div>
              <div className="scene-platform" aria-hidden="true" />
              <PetSprite mood={displayedMood} name={game.pet.name} />
              <div className="pet-speech" aria-live="polite">
                {getPetMessage(game)}
              </div>
              <span className="pet-name-tag">{game.pet.name}</span>
            </div>
            <div className="pet-feedback" aria-live="polite" role="status">
              <span aria-hidden="true">✳</span>
              {game.feedback}
            </div>
          </section>

          <section className="care-panel" aria-labelledby="care-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">UN POQUITO DE ATENCIÓN</p>
                <h2 id="care-title">¿Cómo se siente?</h2>
              </div>
              <span className="care-heart" aria-hidden="true">
                ♡
              </span>
            </div>

            <div className="needs-list">
              {NEEDS.map((need) => (
                <NeedMeter
                  emoji={need.emoji}
                  key={need.key}
                  label={need.label}
                  name={need.key}
                  value={game.pet.needs[need.key]}
                />
              ))}
            </div>

            <div className="care-actions" aria-label="Acciones de cuidado">
              <button
                className="care-action care-action--food"
                disabled={isPaused || isFinished}
                onClick={() => onCare("feed")}
                type="button"
              >
                <span className="care-action__icon" aria-hidden="true">
                  🍎
                </span>
                <span>
                  <strong>Dar comida</strong>
                  <small>{game.statistics.normalFood} comidas ricas</small>
                </span>
              </button>
              <button
                className="care-action"
                disabled={isPaused || isFinished}
                onClick={() => onCare("play")}
                type="button"
              >
                <span className="care-action__icon" aria-hidden="true">
                  🎾
                </span>
                <span>
                  <strong>Jugar juntos</strong>
                  <small>{game.statistics.totalPlay} momentos de juego</small>
                </span>
              </button>
              <button
                className="care-action"
                disabled={isPaused || isFinished}
                onClick={() => onCare("clean")}
                type="button"
              >
                <span className="care-action__icon" aria-hidden="true">
                  🫧
                </span>
                <span>
                  <strong>Dar un baño</strong>
                  <small>{game.statistics.totalCleaning} baños compartidos</small>
                </span>
              </button>
              <button
                className="care-action"
                disabled={isPaused || isFinished}
                onClick={() => onCare("cuddle")}
                type="button"
              >
                <span className="care-action__icon" aria-hidden="true">
                  💛
                </span>
                <span>
                  <strong>Dar cariño</strong>
                  <small>Un abrazo siempre ayuda</small>
                </span>
              </button>
            </div>
          </section>
        </div>

        <EventCard
          event={game.activeEvent}
          foodRequest={game.activeFoodRequest}
          onFeed={() => onCare("feed")}
          onIgnoreEvent={onIgnoreEvent}
          onResolveEvent={onResolveEvent}
          disabled={isPaused || isFinished}
          petName={game.pet.name}
          simulatedHour={game.pet.simulatedHour}
        />

        <div className="console-footer">
          <span>
            🍎 {game.pet.foodRequests} peticiones de comida
            {game.pet.ignoredFoodRequests > 0 &&
              ` · ${game.pet.ignoredFoodRequests} sin responder`}
          </span>
          <button
            className={`pause-button${isPaused ? " pause-button--resume" : ""}`}
            disabled={isFinished}
            onClick={() => dispatch({ type: isPaused ? "resume" : "pause" })}
            type="button"
          >
            <span aria-hidden="true">{isPaused ? "▶" : "Ⅱ"}</span>
            {isPaused ? "Continuar el día" : "Tomar una pausa"}
          </button>
        </div>
      </section>

      <footer className="page-footer">
        <span>HECHO CON CARIÑO Y PIXELES</span>
        <span className="footer-separator" aria-hidden="true">
          ✳
        </span>
        <span>UN DÍA A LA VEZ</span>
      </footer>
      {isPaused && (
        <div className="pause-banner" role="status">
          El tiempo se detuvo para que puedan descansar.
        </div>
      )}
      {isFinished && <FinalSummary game={game} onNewGame={onNewGame} />}
    </main>
  );
}

export default function App() {
  const [initialSave] = useState(loadSavedGame);
  const [game, setGame] = useState<GameState | null>(initialSave.value);
  const [gameStorageWarning, setGameStorageWarning] = useState<string | null>(
    initialSave.warning,
  );
  const clockRef = useRef({ startedAt: 0, baseElapsedMs: 0 });
  const latestGameRef = useRef<GameState | null>(game);
  const lastSavedSignatureRef = useRef<string | null>(null);
  const previousEventIdRef = useRef<string | null>(null);
  const previousStatusRef = useRef<GameState["status"] | null>(null);
  const {
    musicEnabled,
    soundsEnabled,
    storageWarning: audioStorageWarning,
    playSound,
    unlockAudio,
    toggleMusic,
    toggleSounds,
  } = useAudio();

  const isRunning =
    game?.status === "playing" || game?.status === "event_active";
  latestGameRef.current = game;

  useEffect(() => {
    if (!game || !isRunning) return;
    clockRef.current = {
      startedAt: performance.now(),
      baseElapsedMs: game.elapsedRealMs,
    };
    const timer = window.setInterval(() => {
      const elapsedRealMs =
        clockRef.current.baseElapsedMs +
        performance.now() -
        clockRef.current.startedAt;
      setGame((current) =>
        current ? gameReducer(current, { type: "advance", elapsedRealMs }) : current,
      );
    }, 100);
    return () => window.clearInterval(timer);
  }, [Boolean(game), isRunning]);

  useEffect(() => {
    if (!game) return;
    const signature = getSaveSignature(game);
    if (signature === lastSavedSignatureRef.current) return;
    lastSavedSignatureRef.current = signature;
    const warning = saveGame(game);
    setGameStorageWarning((current) => (current === warning ? current : warning));
  }, [game]);

  useEffect(() => {
    function saveBeforeLeaving() {
      const currentGame = latestGameRef.current;
      if (currentGame) saveGame(currentGame);
    }
    window.addEventListener("pagehide", saveBeforeLeaving);
    return () => window.removeEventListener("pagehide", saveBeforeLeaving);
  }, []);

  useEffect(() => {
    if (!game) return;
    const previousStatus = previousStatusRef.current;
    if (game.activeEvent && previousEventIdRef.current !== game.activeEvent.id) {
      playSound("event");
    }
    previousEventIdRef.current = game.activeEvent?.id ?? null;
    if (game.status === "ghost" && previousStatus !== "ghost") playSound("ghost");
    if (game.status === "completed" && previousStatus !== "completed") playSound("finish");
    previousStatusRef.current = game.status;
  }, [game?.status, game?.activeEvent?.id, playSound]);

  function startGame(name: string) {
    unlockAudio();
    lastSavedSignatureRef.current = null;
    previousStatusRef.current = null;
    previousEventIdRef.current = null;
    setGame(createInitialGameState(name));
  }

  function dispatch(action: GameAction) {
    setGame((current) => (current ? gameReducer(current, action) : current));
  }

  function pauseGame() {
    setGame((current) => {
      if (!current || !isRunning) return current;
      const elapsedRealMs =
        clockRef.current.baseElapsedMs +
        performance.now() -
        clockRef.current.startedAt;
      return gameReducer(gameReducer(current, { type: "advance", elapsedRealMs }), {
        type: "pause",
      });
    });
  }

  function handleCare(action: PetAction) {
    unlockAudio();
    if (action === "feed") playSound("feed");
    if (action === "play") playSound("play");
    if (action === "clean") playSound("clean");
    if (action === "cuddle") playSound("cuddle");
    dispatch({ type: "care", action });
  }

  function handleResolveEvent() {
    unlockAudio();
    playSound("event");
    dispatch({ type: "resolve-event" });
  }

  function handleIgnoreEvent() {
    unlockAudio();
    playSound("warning");
    dispatch({ type: "ignore-event" });
  }

  function startAnotherGame() {
    const warning = clearSavedGame();
    setGameStorageWarning((current) => (current === warning ? current : warning));
    lastSavedSignatureRef.current = null;
    previousStatusRef.current = null;
    previousEventIdRef.current = null;
    setGame(null);
  }

  const audioSettings: AudioSettingsProps = {
    musicEnabled,
    soundsEnabled,
    onToggleMusic: toggleMusic,
    onToggleSounds: toggleSounds,
  };

  if (game) {
    return (
      <GameScreen
        audioSettings={audioSettings}
        dispatch={(action) => {
          if (action.type === "pause") pauseGame();
          else {
            if (action.type === "resume") unlockAudio();
            dispatch(action);
          }
        }}
        game={game}
        onCare={handleCare}
        onIgnoreEvent={handleIgnoreEvent}
        onNewGame={startAnotherGame}
        onResolveEvent={handleResolveEvent}
        storageWarning={gameStorageWarning ?? audioStorageWarning}
      />
    );
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="/" aria-label="Tamagotchi, inicio">
          <span className="wordmark__mark" aria-hidden="true">
            T
          </span>
          <span>tamagotchi</span>
        </a>
        <span className="header-note">
          <span className="status-dot" aria-hidden="true" />
          Una pequeña aventura
        </span>
      </header>

      <StorageNotice message={gameStorageWarning ?? audioStorageWarning} />

      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="welcome-card__copy">
          <p className="eyebrow">TU NUEVA MEJOR AMISTAD</p>
          <h1 id="welcome-title">
            Un mundo pequeño,
            <br />
            <span className="title-highlight">un gran corazón.</span>
          </h1>
          <p className="intro-copy">
            Conoce a tu nueva mascota virtual. Ponle nombre y prepárate para compartir cada momento.
          </p>
          <NameEntry onSubmit={startGame} />
        </div>

        <div className="pet-stage" aria-label="Tu futura mascota pixel art">
          <div className="pet-stage__sun" aria-hidden="true" />
          <div className="pet-stage__sparkle pet-stage__sparkle--one" aria-hidden="true">
            ✦
          </div>
          <div className="pet-stage__sparkle pet-stage__sparkle--two" aria-hidden="true">
            ✧
          </div>
          <div className="pet-stage__platform" aria-hidden="true" />
          <PetSprite mood="happy" name="Tu mascota" />
          <p className="pet-stage__caption">Alguien te está esperando</p>
        </div>
      </section>

      <footer className="page-footer">
        <span>HECHO CON CARIÑO Y PIXELES</span>
        <span className="footer-separator" aria-hidden="true">
          ✳
        </span>
        <span>UN DÍA A LA VEZ</span>
      </footer>
    </main>
  );
}
