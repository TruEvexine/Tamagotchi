import type { NeedName } from "../game/types";

interface NeedMeterProps {
  name: NeedName;
  label: string;
  emoji: string;
  value: number;
}

export default function NeedMeter({ name, label, emoji, value }: NeedMeterProps) {
  const level = value < 25 ? "critical" : value < 50 ? "low" : "good";

  return (
    <div className={`need-meter need-meter--${level}`}>
      <div className="need-meter__label">
        <span aria-hidden="true">{emoji}</span>
        <span>{label}</span>
        <strong>{Math.round(value)}%</strong>
      </div>
      <progress
        aria-label={`${label}: ${Math.round(value)} por ciento`}
        className={`need-meter__bar need-meter__bar--${name}`}
        max={100}
        value={value}
      />
      <span className="need-meter__status">
        {level === "critical" ? "Necesita atención" : level === "low" ? "Un poco más de cariño" : "Va muy bien"}
      </span>
    </div>
  );
}
