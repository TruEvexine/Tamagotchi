import { useEffect, useRef } from "react";
import type { GameState } from "../game/types";

interface FinalSummaryProps {
  game: GameState;
  onNewGame: () => void;
}

const FINAL_NEEDS = [
  { key: "happiness", label: "Felicidad", emoji: "💛" },
  { key: "hunger", label: "Hambre atendida", emoji: "🍎" },
  { key: "fun", label: "Diversión", emoji: "🎾" },
  { key: "hygiene", label: "Higiene", emoji: "🫧" },
] as const;

export default function FinalSummary({ game, onNewGame }: FinalSummaryProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const survivedHours = Math.floor(game.statistics.simulatedHoursSurvived);
  const survivedMinutes = Math.floor(
    (game.statistics.simulatedHoursSurvived - survivedHours) * 60,
  );
  const completed = game.status === "completed";

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, []);

  function keepFocusInside(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement;
    if (event.shiftKey && (activeElement === first || activeElement === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="summary-backdrop">
      <section
        aria-labelledby="summary-title"
        aria-modal="true"
        className="summary-card"
        onKeyDown={keepFocusInside}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="summary-card__confetti" aria-hidden="true">
          {completed ? "✦　✳　✦" : "✧　👻　✧"}
        </div>
        <p className="eyebrow">FIN DE LA AVENTURA</p>
        <h2 id="summary-title">
          {completed ? "¡Un día inolvidable!" : "Un recuerdo para siempre"}
        </h2>
        <p className="summary-card__message">
          {completed
            ? `¡Gracias por cuidar a ${game.pet.name} durante todo un día!`
            : `${game.pet.name} se convirtió en fantasmita, pero cada momento juntos cuenta.`}
        </p>
        <div className={`final-state${completed ? "" : " final-state--ghost"}`}>
          <span aria-hidden="true">{completed ? "🌟" : "👻"}</span>
          <div>
            <strong>{completed ? "DÍA COMPLETADO" : "ESTADO: FANTASMA"}</strong>
            <span>
              Tiempo juntos: {survivedHours} h {String(survivedMinutes).padStart(2, "0")} min
            </span>
          </div>
        </div>
        <div className="summary-needs">
          {FINAL_NEEDS.map((need) => (
            <div className="summary-needs__item" key={need.key}>
              <span>
                {need.emoji} {need.label}
              </span>
              <strong>{Math.round(game.pet.needs[need.key])}%</strong>
            </div>
          ))}
        </div>
        <div className="summary-stats">
          <div>
            <strong>{game.statistics.normalFood}</strong>
            <span>comidas a tiempo</span>
          </div>
          <div>
            <strong>{game.statistics.totalPlay}</strong>
            <span>momentos de juego</span>
          </div>
          <div>
            <strong>{game.statistics.totalCleaning}</strong>
            <span>baños compartidos</span>
          </div>
          <div>
            <strong>
              {game.statistics.eventsCompleted}/{game.statistics.eventsTriggered}
            </strong>
            <span>momentos especiales</span>
          </div>
          <div>
            <strong>{game.statistics.excessiveFood}</strong>
            <span>comidas de más</span>
          </div>
          <div>
            <strong>{game.statistics.ignoredFoodRequests}</strong>
            <span>peticiones sin responder</span>
          </div>
        </div>
        <button className="primary-button summary-card__button" onClick={onNewGame} type="button">
          Conocer otra mascota <span aria-hidden="true">→</span>
        </button>
      </section>
    </div>
  );
}
