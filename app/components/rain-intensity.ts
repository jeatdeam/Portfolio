// Intensidad de la lluvia, compartida entre el botón del menú y RainBackground
export const RAIN_LEVELS = [
  { label: "Lluvia", density: 1 },
  { label: "Fuerte", density: 2.2 },
  { label: "Tormenta", density: 4 },
] as const;

export const RAIN_EVENT = "rain-intensity"; // detail: índice en RAIN_LEVELS
const STORAGE_KEY = "rain-level";

export function readRainLevel() {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isInteger(n) && n >= 0 && n < RAIN_LEVELS.length ? n : 0;
  } catch {
    return 0;
  }
}

export function setRainLevel(level: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(level));
  } catch {
    // sin almacenamiento (modo privado): solo dura en esta visita
  }
  window.dispatchEvent(new CustomEvent(RAIN_EVENT, { detail: level }));
}
