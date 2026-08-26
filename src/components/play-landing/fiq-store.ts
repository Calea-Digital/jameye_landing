import { useSyncExternalStore } from "react";
import trader from "./assets/avatars/05-squad-row1-trader.svg?url";
import explorer from "./assets/avatars/06-squad-row1-explorer.svg?url";
import custom from "./assets/avatars/07-squad-row1-customizable.svg?url";
import fighter from "./assets/avatars/08-squad-row2-fighter.svg?url";
import rival from "./assets/avatars/09-squad-row2-rival.svg?url";

export type Player = { id: string; name: string; avatar: string; fiq: number; delta: number };

let players: Player[] = [
  { id: "you", name: "YOU", avatar: custom, fiq: 878, delta: 0 },
  { id: "a", name: "NOVA", avatar: trader, fiq: 912, delta: 0 },
  { id: "b", name: "KAI", avatar: explorer, fiq: 845, delta: 0 },
  { id: "c", name: "REX", avatar: fighter, fiq: 803, delta: 0 },
  { id: "d", name: "MIRA", avatar: rival, fiq: 764, delta: 0 },
];

const listeners = new Set<() => void>();
let timer: number | null = null;

function tick() {
  // Shuffle a target ordering each tick so ranks really change.
  const order = players.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  players = players.map((p, i) => {
    const rank = order.indexOf(i); // 0 = top
    const base = 960 - rank * 60; // big gaps between ranks
    const next = Math.max(640, Math.min(999, base + Math.round((Math.random() - 0.5) * 30)));
    return { ...p, fiq: next, delta: next - p.fiq };
  });
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null && typeof window !== "undefined") {
    timer = window.setInterval(tick, 1600);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => players;

/** Shared live FIQ state so the ring and the leaderboard never disagree. */
export function useFiqPlayers() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useFiqYou() {
  const all = useFiqPlayers();
  return all.find((p) => p.id === "you")!;
}
