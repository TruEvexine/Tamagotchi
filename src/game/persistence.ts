import { GAME_CONFIG } from "./config";
import type {
  FoodRequest,
  GameState,
  GameStatistics,
  GameStatus,
  PetEvent,
  PetMood,
  PetNeeds,
} from "./types";

const GAME_STORAGE_KEY = "tamagotchi.current-game";
const AUDIO_STORAGE_KEY = "tamagotchi.audio-settings";
const SAVE_VERSION = 1;

export interface AudioSettings {
  musicEnabled: boolean;
  soundsEnabled: boolean;
}

interface PersistenceResult<T> {
  value: T;
  warning: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isGameStatus(value: unknown): value is GameStatus {
  return (
    value === "start" ||
    value === "playing" ||
    value === "event_active" ||
    value === "ghost" ||
    value === "completed" ||
    value === "paused"
  );
}

function isPetMood(value: unknown): value is PetMood {
  return (
    value === "happy" ||
    value === "hungry" ||
    value === "bored" ||
    value === "dirty" ||
    value === "sleepy" ||
    value === "ghost" ||
    value === "eating" ||
    value === "playing" ||
    value === "cleaning" ||
    value === "singing" ||
    value === "dancing"
  );
}

function isPetNeeds(value: unknown): value is PetNeeds {
  if (!isRecord(value)) return false;
  return (["hunger", "fun", "hygiene", "happiness"] as const).every(
    (need) =>
      isFiniteNumber(value[need]) && value[need] >= 0 && value[need] <= 100,
  );
}

function isFoodRequest(value: unknown): value is FoodRequest | null {
  if (value === null) return true;
  return (
    isRecord(value) &&
    isFiniteNumber(value.requestedAtHour) &&
    isFiniteNumber(value.expiresAtHour) &&
    value.expiresAtHour >= value.requestedAtHour
  );
}

function isNeedEffects(value: unknown): value is Partial<PetNeeds> {
  if (!isRecord(value)) return false;
  return Object.entries(value).every(
    ([need, amount]) =>
      (need === "hunger" ||
        need === "fun" ||
        need === "hygiene" ||
        need === "happiness") &&
      isFiniteNumber(amount),
  );
}

function isPetEvent(value: unknown): value is PetEvent | null {
  if (value === null) return true;
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.message !== "string" ||
    typeof value.actionLabel !== "string" ||
    typeof value.emoji !== "string" ||
    !isNeedEffects(value.effects) ||
    !isPetMood(value.mood) ||
    !isFiniteNumber(value.expiresAtHour)
  ) {
    return false;
  }
  return (
    value.action === "clean" ||
    value.action === "play" ||
    value.action === "sing" ||
    value.action === "dance" ||
    value.action === "sleep" ||
    value.action === "cuddle"
  );
}

function isStatistics(value: unknown): value is GameStatistics {
  if (!isRecord(value)) return false;
  const numericFields: (keyof GameStatistics)[] = [
    "totalFood",
    "normalFood",
    "excessiveFood",
    "totalPlay",
    "totalCleaning",
    "eventsTriggered",
    "eventsCompleted",
    "eventsIgnored",
    "foodRequests",
    "ignoredFoodRequests",
    "highestHappiness",
    "lowestHappiness",
    "highestHunger",
    "lowestHunger",
    "simulatedHoursSurvived",
  ];
  return (
    numericFields.every((field) => isFiniteNumber(value[field])) &&
    (value.finalState === null ||
      value.finalState === "ghost" ||
      value.finalState === "completed")
  );
}

function isGameState(value: unknown): value is GameState {
  if (
    !isRecord(value) ||
    !isGameStatus(value.status) ||
    !isRecord(value.pet) ||
    !isPetNeeds(value.pet.needs) ||
    !isPetMood(value.pet.mood) ||
    typeof value.pet.name !== "string" ||
    value.pet.name.trim().length === 0 ||
    value.pet.name.length > GAME_CONFIG.maximumPetNameLength ||
    !isFiniteNumber(value.pet.simulatedHour) ||
    value.pet.simulatedHour < 0 ||
    value.pet.simulatedHour > GAME_CONFIG.totalGameHours ||
    !isFiniteNumber(value.pet.foodRequests) ||
    !isFiniteNumber(value.pet.ignoredFoodRequests) ||
    !isFiniteNumber(value.pet.consecutiveOverfeeding) ||
    !isStatistics(value.statistics) ||
    !isFiniteNumber(value.elapsedRealMs) ||
    value.elapsedRealMs < 0 ||
    !isFiniteNumber(value.moodUntilMs) ||
    !isFoodRequest(value.activeFoodRequest) ||
    !isPetEvent(value.activeEvent) ||
    !isFiniteNumber(value.eventCooldownUntilHour) ||
    !isFiniteNumber(value.randomSeed) ||
    (value.lastEventId !== null && typeof value.lastEventId !== "string") ||
    typeof value.feedback !== "string"
  ) {
    return false;
  }
  return true;
}

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new Error("El almacenamiento local no está disponible en este entorno.");
  }
  return window.localStorage;
}

function removeSavedGame() {
  try {
    getStorage().removeItem(GAME_STORAGE_KEY);
    return null;
  } catch {
    return "No se pudo acceder al almacenamiento local. La partida solo estará disponible mientras esta pestaña permanezca abierta.";
  }
}

export function loadSavedGame(): PersistenceResult<GameState | null> {
  let serialized: string | null;
  try {
    serialized = getStorage().getItem(GAME_STORAGE_KEY);
  } catch {
    return {
      value: null,
      warning:
        "No se pudo leer el almacenamiento local. Podrás jugar, pero la partida no se guardará.",
    };
  }
  if (!serialized) return { value: null, warning: null };

  let saved: unknown;
  try {
    saved = JSON.parse(serialized);
  } catch {
    return {
      value: null,
      warning:
        removeSavedGame() ??
        "La partida guardada estaba dañada y no se pudo recuperar.",
    };
  }

  if (
    !isRecord(saved) ||
    saved.version !== SAVE_VERSION ||
    !isGameState(saved.game)
  ) {
    return {
      value: null,
      warning:
        removeSavedGame() ??
        "La partida guardada no era compatible y se eliminó.",
    };
  }

  const game = saved.game;
  if (game.status === "completed" || game.status === "ghost") {
    return { value: game, warning: null };
  }
  return { value: { ...game, status: "paused" }, warning: null };
}

export function saveGame(game: GameState): string | null {
  const savedGame =
    game.status === "ghost" || game.status === "completed"
      ? game
      : { ...game, status: "paused" as const };
  try {
    getStorage().setItem(
      GAME_STORAGE_KEY,
      JSON.stringify({ version: SAVE_VERSION, game: savedGame }),
    );
    return null;
  } catch {
    return "No se pudo guardar la partida en este navegador. Podrás seguir jugando, pero se perderá al cerrar la pestaña.";
  }
}

export function clearSavedGame(): string | null {
  return removeSavedGame();
}

export function loadAudioSettings(): PersistenceResult<AudioSettings> {
  const defaults = { musicEnabled: false, soundsEnabled: true };
  let serialized: string | null;
  try {
    serialized = getStorage().getItem(AUDIO_STORAGE_KEY);
  } catch {
    return {
      value: defaults,
      warning:
        "No se pudieron cargar las preferencias de audio desde el almacenamiento local.",
    };
  }
  if (!serialized) return { value: defaults, warning: null };

  let settings: unknown;
  try {
    settings = JSON.parse(serialized);
  } catch {
    try {
      getStorage().removeItem(AUDIO_STORAGE_KEY);
    } catch {
      return {
        value: defaults,
        warning: "Las preferencias de audio no se pudieron leer ni limpiar.",
      };
    }
    return {
      value: defaults,
      warning: "Las preferencias de audio estaban dañadas y se restablecieron.",
    };
  }

  if (
    !isRecord(settings) ||
    typeof settings.musicEnabled !== "boolean" ||
    typeof settings.soundsEnabled !== "boolean"
  ) {
    try {
      getStorage().removeItem(AUDIO_STORAGE_KEY);
    } catch {
      return {
        value: defaults,
        warning: "Las preferencias de audio no se pudieron limpiar.",
      };
    }
    return {
      value: defaults,
      warning: "Las preferencias de audio no eran válidas y se restablecieron.",
    };
  }
  return {
    value: {
      musicEnabled: settings.musicEnabled,
      soundsEnabled: settings.soundsEnabled,
    },
    warning: null,
  };
}

export function saveAudioSettings(settings: AudioSettings): string | null {
  try {
    getStorage().setItem(AUDIO_STORAGE_KEY, JSON.stringify(settings));
    return null;
  } catch {
    return "No se pudieron guardar las preferencias de audio en este navegador.";
  }
}
