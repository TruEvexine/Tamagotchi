import ghostSprite from "../assets/sprites/pet-ghost.svg";
import petSprite from "../assets/sprites/pet-idle.svg";
import type { PetMood } from "../game/types";

interface PetSpriteProps {
  mood: PetMood;
  name: string;
}

const MOOD_EMOJI: Record<PetMood, string> = {
  happy: "✦",
  hungry: "🍎",
  bored: "…",
  dirty: "🫧",
  sleepy: "z",
  ghost: "✧",
  eating: "🍎",
  playing: "✦",
  cleaning: "✦",
  singing: "♪",
  dancing: "♫",
};

const MOOD_LABEL: Record<PetMood, string> = {
  happy: "feliz",
  hungry: "con hambre",
  bored: "aburrida",
  dirty: "necesita un baño",
  sleepy: "con sueño",
  ghost: "convertida en fantasma",
  eating: "comiendo",
  playing: "jugando",
  cleaning: "disfrutando su baño",
  singing: "cantando",
  dancing: "bailando",
};

export default function PetSprite({ mood, name }: PetSpriteProps) {
  const isGhost = mood === "ghost";

  return (
    <div className={`pet-character pet-character--${mood}`}>
      <span className="pet-character__sparkle" aria-hidden="true">
        {MOOD_EMOJI[mood]}
      </span>
      <img
        alt={`${name}, ${isGhost ? MOOD_LABEL.ghost : MOOD_LABEL[mood]}`}
        className="pet-sprite"
        height="192"
        src={isGhost ? ghostSprite : petSprite}
        width="192"
      />
    </div>
  );
}
