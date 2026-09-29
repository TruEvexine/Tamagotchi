import type { FoodRequest, PetEvent } from "../game/types";

interface EventCardProps {
  event: PetEvent | null;
  foodRequest: FoodRequest | null;
  simulatedHour: number;
  petName: string;
  onFeed: () => void;
  onResolveEvent: () => void;
  onIgnoreEvent: () => void;
  disabled?: boolean;
}

export default function EventCard({
  event,
  foodRequest,
  simulatedHour,
  petName,
  onFeed,
  onResolveEvent,
  onIgnoreEvent,
  disabled = false,
}: EventCardProps) {
  if (event) {
    const remainingHours = Math.max(0, event.expiresAtHour - simulatedHour);
    return (
      <section className="event-card event-card--active" aria-labelledby="event-title">
        <div className="event-card__icon" aria-hidden="true">
          {event.emoji}
        </div>
        <div className="event-card__body">
          <span className="event-card__eyebrow">MOMENTO JUNTOS</span>
          <h2 id="event-title">{event.title}</h2>
          <p>{event.message}</p>
          <div className="event-card__actions">
            <button
              className="small-game-button"
              disabled={disabled}
              onClick={onResolveEvent}
              type="button"
            >
              {event.actionLabel} <span aria-hidden="true">→</span>
            </button>
            <button className="text-button" disabled={disabled} onClick={onIgnoreEvent} type="button">
              Ahora no
            </button>
            {foodRequest && (
              <button className="food-quick-button" disabled={disabled} onClick={onFeed} type="button">
                🍎 Dar comida · {Math.ceil(Math.max(0, foodRequest.expiresAtHour - simulatedHour) * 60)} min
              </button>
            )}
          </div>
        </div>
        <span className="event-card__timer">
          {Math.ceil(remainingHours)} h para compartirlo
        </span>
      </section>
    );
  }

  if (foodRequest) {
    const remainingMinutes = Math.ceil(
      Math.max(0, foodRequest.expiresAtHour - simulatedHour) * 60,
    );
    return (
      <section className="event-card event-card--food" aria-labelledby="food-request-title">
        <div className="event-card__icon" aria-hidden="true">
          🍎
        </div>
        <div className="event-card__body">
          <span className="event-card__eyebrow">UNA PETICIÓN ESPECIAL</span>
          <h2 id="food-request-title">¡{petName} tiene hambre!</h2>
          <p>¿Compartimos un bocadito? A {petName} le vendría muy bien.</p>
          <div className="event-card__actions">
            <button className="small-game-button" disabled={disabled} onClick={onFeed} type="button">
              Darle de comer <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <span className="event-card__timer">
          {remainingMinutes} min para responder
        </span>
      </section>
    );
  }

  return (
    <section className="event-card event-card--quiet" aria-live="polite">
      <span className="event-card__quiet-icon" aria-hidden="true">
        ✿
      </span>
      <div>
        <span className="event-card__eyebrow">UN DÍA A LA VEZ</span>
        <p>Los momentos especiales aparecen de repente. {petName} está feliz de tenerte cerca.</p>
      </div>
      <span className="event-card__next" aria-hidden="true">
        ♡
      </span>
    </section>
  );
}
