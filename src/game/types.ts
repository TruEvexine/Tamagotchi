export type GameStatus =
  | "start"
  | "playing"
  | "event_active"
  | "ghost"
  | "completed"
  | "paused";

export type PetMood =
  | "happy"
  | "hungry"
  | "bored"
  | "dirty"
  | "sleepy"
  | "ghost"
  | "eating"
  | "playing"
  | "cleaning"
  | "singing"
  | "dancing";

export type NeedName = "hunger" | "fun" | "hygiene" | "happiness";
export type PetAction = "feed" | "play" | "clean" | "cuddle";

export interface PetNeeds {
  hunger: number;
  fun: number;
  hygiene: number;
  happiness: number;
}

export interface FoodRequest {
  requestedAtHour: number;
  expiresAtHour: number;
}

export interface PetEvent {
  id: string;
  title: string;
  message: string;
  actionLabel: string;
  emoji: string;
  effects: Partial<PetNeeds>;
  mood: PetMood;
  action: "clean" | "play" | "sing" | "dance" | "sleep" | "cuddle";
  expiresAtHour: number;
}

export interface GameStatistics {
  totalFood: number;
  normalFood: number;
  excessiveFood: number;
  totalPlay: number;
  totalCleaning: number;
  eventsTriggered: number;
  eventsCompleted: number;
  eventsIgnored: number;
  foodRequests: number;
  ignoredFoodRequests: number;
  highestHappiness: number;
  lowestHappiness: number;
  highestHunger: number;
  lowestHunger: number;
  simulatedHoursSurvived: number;
  finalState: "ghost" | "completed" | null;
}

export interface GameState {
  status: GameStatus;
  pet: {
    name: string;
    needs: PetNeeds;
    simulatedHour: number;
    foodRequests: number;
    ignoredFoodRequests: number;
    consecutiveOverfeeding: number;
    mood: PetMood;
  };
  statistics: GameStatistics;
  elapsedRealMs: number;
  moodUntilMs: number;
  activeFoodRequest: FoodRequest | null;
  activeEvent: PetEvent | null;
  eventCooldownUntilHour: number;
  randomSeed: number;
  lastEventId: string | null;
  feedback: string;
}

export type GameAction =
  | { type: "advance"; elapsedRealMs: number }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "care"; action: PetAction }
  | { type: "resolve-event" }
  | { type: "ignore-event" };
