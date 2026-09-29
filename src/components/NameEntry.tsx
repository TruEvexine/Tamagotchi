import { useState, type FormEvent } from "react";
import { GAME_CONFIG } from "../game/config";

interface NameEntryProps {
  onSubmit: (name: string) => void;
}

export default function NameEntry({ onSubmit }: NameEntryProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const trimmedName = name.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trimmedName) {
      setError("Escribe un nombre para tu mascota.");
      return;
    }
    setError("");
    onSubmit(trimmedName);
  }

  return (
    <form className="name-form" onSubmit={handleSubmit}>
      <label className="name-form__label" htmlFor="pet-name">
        ¿Cómo se va a llamar?
      </label>
      <div className="name-form__controls">
        <input
          autoComplete="off"
          aria-describedby="pet-name-hint"
          aria-invalid={Boolean(error)}
          id="pet-name"
          maxLength={GAME_CONFIG.maximumPetNameLength}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
          placeholder="Escribe un nombre..."
          required
          value={name}
        />
        <button className="primary-button" disabled={!trimmedName} type="submit">
          Conocerla <span aria-hidden="true">→</span>
        </button>
      </div>
      <p
        className={`name-form__hint${error ? " name-form__hint--error" : ""}`}
        id="pet-name-hint"
        role={error ? "alert" : undefined}
      >
        {error || `Hasta ${GAME_CONFIG.maximumPetNameLength} caracteres`}
      </p>
    </form>
  );
}
