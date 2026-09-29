import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadAudioSettings,
  saveAudioSettings,
} from "../game/persistence";

type SoundKind = "feed" | "play" | "clean" | "cuddle" | "event" | "warning" | "finish" | "ghost";

const SOUND_NOTES: Record<SoundKind, number[]> = {
  feed: [660, 880],
  play: [523, 659, 784],
  clean: [587, 784],
  cuddle: [659, 784],
  event: [784, 988],
  warning: [440, 370],
  finish: [523, 659, 784, 1047],
  ghost: [392, 330, 262],
};

export function useAudio() {
  const [initialSettings] = useState(loadAudioSettings);
  const [musicEnabled, setMusicEnabled] = useState(initialSettings.value.musicEnabled);
  const [soundsEnabled, setSoundsEnabled] = useState(initialSettings.value.soundsEnabled);
  const [storageWarning, setStorageWarning] = useState<string | null>(
    initialSettings.warning,
  );
  const contextRef = useRef<AudioContext | null>(null);
  const musicTimerRef = useRef<number | null>(null);
  const musicStepRef = useRef(0);
  const soundsEnabledRef = useRef(soundsEnabled);
  const musicEnabledRef = useRef(musicEnabled);
  const audioUnlockedRef = useRef(false);

  soundsEnabledRef.current = soundsEnabled;
  musicEnabledRef.current = musicEnabled;

  const getContext = useCallback(() => {
    if (typeof window === "undefined" || !("AudioContext" in window)) return null;
    if (!contextRef.current) contextRef.current = new AudioContext();
    return contextRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    const context = getContext();
    if (!context) return;

    audioUnlockedRef.current = true;
    if (context.state === "suspended") {
      void context.resume().catch(() => {
        audioUnlockedRef.current = false;
      });
    }
  }, [getContext]);

  const playTone = useCallback(
    (frequency: number, duration = 0.12, volume = 0.035, waveform: OscillatorType = "square") => {
      const context = contextRef.current;
      if (!context || !audioUnlockedRef.current) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime;
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    },
    [getContext],
  );

  const playSound = useCallback(
    (kind: SoundKind) => {
      if (!soundsEnabledRef.current || !audioUnlockedRef.current) return;
      SOUND_NOTES[kind].forEach((frequency, index) => {
        window.setTimeout(() => {
          if (soundsEnabledRef.current) playTone(frequency, 0.11, 0.035);
        }, index * 95);
      });
    },
    [playTone],
  );

  const toggleMusic = useCallback(() => {
    unlockAudio();
    setMusicEnabled((enabled) => !enabled);
  }, [unlockAudio]);

  const toggleSounds = useCallback(() => {
    setSoundsEnabled((enabled) => !enabled);
  }, []);

  useEffect(() => {
    if (!musicEnabled) {
      if (musicTimerRef.current !== null) {
        window.clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
      return;
    }

    const melody = [523, 659, 784, 659, 587, 698, 880, 698];
    const playNextNote = () => {
      if (!musicEnabledRef.current) return;
      playTone(melody[musicStepRef.current % melody.length], 0.22, 0.012, "triangle");
      musicStepRef.current += 1;
    };

    playNextNote();
    musicTimerRef.current = window.setInterval(playNextNote, 440);
    return () => {
      if (musicTimerRef.current !== null) {
        window.clearInterval(musicTimerRef.current);
        musicTimerRef.current = null;
      }
    };
  }, [musicEnabled, playTone]);

  useEffect(() => {
    const warning = saveAudioSettings({ musicEnabled, soundsEnabled });
    setStorageWarning((current) => (current === warning ? current : warning));
  }, [musicEnabled, soundsEnabled]);

  useEffect(
    () => () => {
      if (musicTimerRef.current !== null) window.clearInterval(musicTimerRef.current);
      if (contextRef.current) void contextRef.current.close();
    },
    [],
  );

  return {
    musicEnabled,
    soundsEnabled,
    storageWarning,
    playSound,
    unlockAudio,
    toggleMusic,
    toggleSounds,
  };
}
