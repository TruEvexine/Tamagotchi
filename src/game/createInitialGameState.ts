import { GAME_CONFIG } from "./config";
import type { GameState, PetMood } from "./types";

const INITIAL_NEEDS = {
  hunger: 100,
  fun: 100,
  hygiene: 100,
  happiness: 100,
};

export function createInitialGameState(
  name: string,
  randomSeed = Date.now(),
): GameState {
  const petName = name.trim();

  if (!petName || petName.length > GAME_CONFIG.maximumPetNameLength) {
    throw new RangeError(
      `Pet name must be between 1 and ${GAME_CONFIG.maximumPetNameLength} characters.`,
    );
  }

  return {
    status: "playing",
    pet: {
      name: petName,
      needs: { ...INITIAL_NEEDS },
      simulatedHour: 0,
      foodRequests: 0,
      ignoredFoodRequests: 0,
      consecutiveOverfeeding: 0,
      mood: "happy",
    },
    statistics: {
      totalFood: 0,
      normalFood: 0,
      excessiveFood: 0,
      totalPlay: 0,
      totalCleaning: 0,
      eventsTriggered: 0,
      eventsCompleted: 0,
      eventsIgnored: 0,
      foodRequests: 0,
      ignoredFoodRequests: 0,
      highestHappiness: 100,
      lowestHappiness: 100,
      highestHunger: 100,
      lowestHunger: 100,
      simulatedHoursSurvived: 0,
      finalState: null,
    },
    elapsedRealMs: 0,
    moodUntilMs: 0,
    activeFoodRequest: null,
    activeEvent: null,
    eventCooldownUntilHour: GAME_CONFIG.eventCooldownHours,
    randomSeed: Math.trunc(randomSeed) || 1,
    lastEventId: null,
    feedback: `${petName} llegó para conocerte. ¡Empieza un día lleno de aventuras!`,
  };
}

export function getPetMood(
  needs: GameState["pet"]["needs"],
  activeFoodRequest: GameState["activeFoodRequest"],
): PetMood {
  if (activeFoodRequest || needs.hunger < 25) return "hungry";
  if (needs.happiness < 25) return "bored";
  if (needs.hygiene < 25) return "dirty";
  if (needs.fun < 25) return "sleepy";
  if (needs.happiness >= 75) return "happy";
  return "happy";
}
