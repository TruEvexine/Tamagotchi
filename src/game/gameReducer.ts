import { GAME_CONFIG } from "./config";
import { createInitialGameState, getPetMood } from "./createInitialGameState";
import { PET_EVENTS, type PetEventDefinition } from "./events";
import type {
  GameAction,
  GameState,
  NeedName,
  PetAction,
  PetEvent,
  PetMood,
  PetNeeds,
} from "./types";

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function makeTerminal(state: GameState, status: "ghost" | "completed"): GameState {
  return {
    ...state,
    status,
    activeEvent: null,
    activeFoodRequest: null,
    pet: { ...state.pet, mood: status === "ghost" ? "ghost" : state.pet.mood },
    statistics: {
      ...state.statistics,
      simulatedHoursSurvived: state.pet.simulatedHour,
      finalState: status,
    },
    feedback:
      status === "ghost"
        ? `${state.pet.name} se convirtió en fantasmita. Su aventura queda guardada con mucho cariño.`
        : `¡Lo lograron! ${state.pet.name} completó un día entero contigo.`,
  };
}

function withStatus(state: GameState): GameState {
  if (state.status === "paused" || state.status === "ghost" || state.status === "completed") {
    return state;
  }
  return { ...state, status: state.activeEvent ? "event_active" : "playing" };
}

function updateExtremes(state: GameState): GameState {
  const { hunger, happiness } = state.pet.needs;
  return {
    ...state,
    statistics: {
      ...state.statistics,
      highestHappiness: Math.max(state.statistics.highestHappiness, happiness),
      lowestHappiness: Math.min(state.statistics.lowestHappiness, happiness),
      highestHunger: Math.max(state.statistics.highestHunger, hunger),
      lowestHunger: Math.min(state.statistics.lowestHunger, hunger),
    },
  };
}

function setMood(
  state: GameState,
  mood: PetMood,
  feedback: string,
): GameState {
  return {
    ...state,
    pet: { ...state.pet, mood },
    moodUntilMs: state.elapsedRealMs + GAME_CONFIG.moodDurationMs,
    feedback,
  };
}

function applyEffects(needs: PetNeeds, effects: Partial<PetNeeds>): PetNeeds {
  const nextNeeds = { ...needs };
  (Object.keys(effects) as NeedName[]).forEach((need) => {
    const amount = effects[need];
    if (amount !== undefined) nextNeeds[need] = clamp(nextNeeds[need] + amount);
  });
  return nextNeeds;
}

function nextRandom(state: GameState): { value: number; seed: number } {
  let seed = state.randomSeed | 0;
  seed ^= seed << 13;
  seed ^= seed >>> 17;
  seed ^= seed << 5;
  const normalizedSeed = seed >>> 0;
  return { value: normalizedSeed / 4_294_967_296, seed: normalizedSeed || 1 };
}

function selectEvent(state: GameState, hour: number): GameState {
  const candidates = PET_EVENTS.filter((event) => event.id !== state.lastEventId);
  const random = nextRandom(state);
  const eventIndex = Math.floor(random.value * candidates.length);
  const definition: PetEventDefinition = candidates[eventIndex];
  const event: PetEvent = {
    ...definition,
    expiresAtHour: hour + GAME_CONFIG.eventDurationHours,
  };

  return {
    ...state,
    status: "event_active",
    activeEvent: event,
    lastEventId: event.id,
    eventCooldownUntilHour: hour + GAME_CONFIG.eventCooldownHours,
    randomSeed: random.seed,
    statistics: {
      ...state.statistics,
      eventsTriggered: state.statistics.eventsTriggered + 1,
    },
    feedback: `${event.emoji} ${event.title} ${state.pet.name} tiene una idea para compartir contigo.`,
  };
}

function processHourBoundary(state: GameState, hour: number): GameState {
  let next = { ...state, pet: { ...state.pet, simulatedHour: hour } };

  if (next.activeFoodRequest && hour >= next.activeFoodRequest.expiresAtHour) {
    const ignoredFoodRequests = next.pet.ignoredFoodRequests + 1;
    next = {
      ...next,
      activeFoodRequest: null,
      pet: {
        ...next.pet,
        ignoredFoodRequests,
        mood: getPetMood(next.pet.needs, null),
      },
      moodUntilMs: next.elapsedRealMs,
      statistics: {
        ...next.statistics,
        ignoredFoodRequests: next.statistics.ignoredFoodRequests + 1,
      },
      feedback: `${next.pet.name} esperó un bocadito, pero siguió con su día.`,
    };
    if (ignoredFoodRequests >= GAME_CONFIG.maximumIgnoredFoodRequests) {
      return makeTerminal(next, "ghost");
    }
  }

  if (next.activeEvent && hour >= next.activeEvent.expiresAtHour) {
    next = {
      ...next,
      activeEvent: null,
      status: "playing",
      pet: {
        ...next.pet,
        needs: applyEffects(next.pet.needs, { happiness: -5 }),
      },
      statistics: {
        ...next.statistics,
        eventsIgnored: next.statistics.eventsIgnored + 1,
      },
      eventCooldownUntilHour: hour + GAME_CONFIG.eventCooldownHours,
      feedback: `${next.pet.name} dejó pasar su momento de juego; todavía habrá más oportunidades.`,
    };
  }

  if (
    hour < GAME_CONFIG.totalGameHours &&
    hour % GAME_CONFIG.foodRequestIntervalHours === 0 &&
    !next.activeFoodRequest
  ) {
    next = {
      ...next,
      activeFoodRequest: {
        requestedAtHour: hour,
        expiresAtHour: hour + GAME_CONFIG.foodRequestGraceHours,
      },
      pet: { ...next.pet, foodRequests: next.pet.foodRequests + 1, mood: "hungry" },
      moodUntilMs: Number.MAX_SAFE_INTEGER,
      statistics: {
        ...next.statistics,
        foodRequests: next.statistics.foodRequests + 1,
      },
      feedback: `🍗 ${next.pet.name} tiene hambre y pide un bocadito.`,
    };
  }

  if (
    hour < GAME_CONFIG.totalGameHours &&
    !next.activeEvent &&
    hour >= next.eventCooldownUntilHour
  ) {
    const random = nextRandom(next);
    next = { ...next, randomSeed: random.seed };
    if (random.value < GAME_CONFIG.eventChancePerHour) {
      next = selectEvent(next, hour);
    }
  }

  return withStatus(next);
}

function advanceGame(state: GameState, elapsedRealMs: number): GameState {
  if (
    state.status === "paused" ||
    state.status === "ghost" ||
    state.status === "completed"
  ) {
    return state;
  }

  const safeElapsed = Math.max(state.elapsedRealMs, elapsedRealMs);
  const targetHour = Math.min(
    safeElapsed / (GAME_CONFIG.realSecondsPerGameHour * 1_000),
    GAME_CONFIG.totalGameHours,
  );
  const hourInRealMs =
    GAME_CONFIG.realSecondsPerGameHour * 1_000;
  const targetElapsed = targetHour * hourInRealMs;
  let next = { ...state };
  let processedHour = state.pet.simulatedHour;
  const finalFullHour = Math.floor(targetHour);

  for (
    let hour = Math.floor(processedHour) + 1;
    hour <= finalFullHour;
    hour += 1
  ) {
    const needs = { ...next.pet.needs };
    const elapsedHours = hour - processedHour;
    (Object.keys(GAME_CONFIG.needsDecayPerHour) as NeedName[]).forEach((need) => {
      needs[need] = clamp(
        needs[need] - GAME_CONFIG.needsDecayPerHour[need] * elapsedHours,
      );
    });
    next = {
      ...next,
      elapsedRealMs: hour * hourInRealMs,
      pet: {
        ...next.pet,
        needs,
        simulatedHour: hour,
        mood:
          hour * hourInRealMs >= next.moodUntilMs
            ? getPetMood(needs, next.activeFoodRequest)
            : next.pet.mood,
      },
      statistics: {
        ...next.statistics,
        simulatedHoursSurvived: hour,
      },
    };
    next = updateExtremes(processHourBoundary(next, hour));
    processedHour = hour;
    if (next.status === "ghost") return next;
  }

  const remainingHours = targetHour - processedHour;
  if (remainingHours > 0) {
    const needs = { ...next.pet.needs };
    (Object.keys(GAME_CONFIG.needsDecayPerHour) as NeedName[]).forEach((need) => {
      needs[need] = clamp(
        needs[need] - GAME_CONFIG.needsDecayPerHour[need] * remainingHours,
      );
    });
    next = {
      ...next,
      elapsedRealMs: targetElapsed,
      pet: {
        ...next.pet,
        needs,
        simulatedHour: targetHour,
        mood:
          targetElapsed >= next.moodUntilMs
            ? getPetMood(needs, next.activeFoodRequest)
            : next.pet.mood,
      },
      statistics: {
        ...next.statistics,
        simulatedHoursSurvived: targetHour,
      },
    };
  }

  if (targetHour >= GAME_CONFIG.totalGameHours) {
    next = makeTerminal(next, "completed");
  } else {
    next = withStatus(next);
  }

  return updateExtremes(next);
}

function performCare(state: GameState, action: PetAction): GameState {
  if (state.status === "paused" || state.status === "ghost" || state.status === "completed") {
    return state;
  }

  if (action === "feed") {
    const excessive =
      state.pet.needs.hunger >= GAME_CONFIG.overfeedingHungerThreshold;
    const consecutiveOverfeeding = excessive
      ? state.pet.consecutiveOverfeeding + 1
      : 0;
    const isTerminal =
      excessive &&
      consecutiveOverfeeding >= GAME_CONFIG.maximumConsecutiveOverfeeding;
    const next: GameState = {
      ...state,
      activeFoodRequest: null,
      pet: {
        ...state.pet,
        needs: applyEffects(state.pet.needs, {
          hunger: GAME_CONFIG.careEffects.food.hunger,
          happiness: excessive
            ? -6
            : GAME_CONFIG.careEffects.food.happiness,
        }),
        consecutiveOverfeeding,
        mood: excessive ? "bored" : "eating",
      },
      moodUntilMs: state.elapsedRealMs + GAME_CONFIG.moodDurationMs,
      statistics: {
        ...state.statistics,
        totalFood: state.statistics.totalFood + 1,
        normalFood: state.statistics.normalFood + (excessive ? 0 : 1),
        excessiveFood: state.statistics.excessiveFood + (excessive ? 1 : 0),
      },
      feedback: excessive
        ? consecutiveOverfeeding >= GAME_CONFIG.maximumConsecutiveOverfeeding
          ? `👻 ${state.pet.name} comió demasiado varias veces seguidas.`
          : consecutiveOverfeeding === 2
            ? `🤢 ${state.pet.name} comió de más otra vez. Dale un respiro.`
            : `😅 ${state.pet.name} ya estaba satisfecho; esa porción fue demasiado.`
        : `🍎 ¡Qué rico! ${state.pet.name} disfruta su bocadito.`,
    };

    return isTerminal
      ? updateExtremes(makeTerminal(next, "ghost"))
      : updateExtremes(withStatus(next));
  }

  if (action === "play") {
    return updateExtremes(
      setMood(
        {
          ...state,
          pet: {
            ...state.pet,
            needs: applyEffects(state.pet.needs, GAME_CONFIG.careEffects.play),
          },
          statistics: {
            ...state.statistics,
            totalPlay: state.statistics.totalPlay + 1,
          },
        },
        "playing",
        `🎾 ¡Un ratito de juego con ${state.pet.name}! Ya se siente con más energía.`,
      ),
    );
  }

  if (action === "clean") {
    return updateExtremes(
      setMood(
        {
          ...state,
          pet: {
            ...state.pet,
            needs: applyEffects(state.pet.needs, GAME_CONFIG.careEffects.clean),
          },
          statistics: {
            ...state.statistics,
            totalCleaning: state.statistics.totalCleaning + 1,
          },
        },
        "cleaning",
        `🫧 ${state.pet.name} quedó reluciente y se siente mucho mejor.`,
      ),
    );
  }

  return updateExtremes(
    setMood(
      {
        ...state,
        pet: {
          ...state.pet,
          needs: applyEffects(state.pet.needs, GAME_CONFIG.careEffects.cuddle),
        },
      },
      "happy",
      `💛 Un abrazo para ${state.pet.name}. ¡Qué bien sienta un poquito de cariño!`,
    ),
  );
}

function resolveEvent(state: GameState, ignored: boolean): GameState {
  const event = state.activeEvent;
  if (!event || state.status === "paused") return state;

  if (ignored) {
    const next: GameState = {
      ...state,
      activeEvent: null,
      status: "playing",
      pet: {
        ...state.pet,
        needs: applyEffects(state.pet.needs, { happiness: -5 }),
      },
      statistics: {
        ...state.statistics,
        eventsIgnored: state.statistics.eventsIgnored + 1,
      },
      eventCooldownUntilHour:
        state.pet.simulatedHour + GAME_CONFIG.eventCooldownHours,
      feedback: `${state.pet.name} guardó su idea para otro momento.`,
    };
    return updateExtremes(next);
  }

  let needs = applyEffects(state.pet.needs, event.effects);
  let totalPlay = state.statistics.totalPlay;
  let totalCleaning = state.statistics.totalCleaning;
  if (event.action === "play" || event.action === "dance" || event.action === "sing") {
    totalPlay += 1;
  }
  if (event.action === "clean") totalCleaning += 1;
  if (event.action === "sleep") {
    needs = applyEffects(needs, { happiness: 5 });
  }

  const next: GameState = {
    ...state,
    activeEvent: null,
    status: "playing",
    pet: { ...state.pet, needs, mood: event.mood },
    moodUntilMs: state.elapsedRealMs + GAME_CONFIG.moodDurationMs,
    statistics: {
      ...state.statistics,
      eventsCompleted: state.statistics.eventsCompleted + 1,
      totalPlay,
      totalCleaning,
    },
    eventCooldownUntilHour:
      state.pet.simulatedHour + GAME_CONFIG.eventCooldownHours,
    feedback: `${event.emoji} ¡Lo hicieron! ${state.pet.name} disfrutó mucho: ${event.title.toLowerCase()}.`,
  };
  return updateExtremes(next);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "advance":
      return advanceGame(state, action.elapsedRealMs);
    case "pause":
      if (state.status === "paused" || state.status === "ghost" || state.status === "completed") {
        return state;
      }
      return { ...state, status: "paused" };
    case "resume":
      if (state.status !== "paused") return state;
      return { ...state, status: state.activeEvent ? "event_active" : "playing" };
    case "care":
      return performCare(state, action.action);
    case "resolve-event":
      return resolveEvent(state, false);
    case "ignore-event":
      return resolveEvent(state, true);
    case "reset":
      return createInitialGameState(state.pet.name);
  }
}
