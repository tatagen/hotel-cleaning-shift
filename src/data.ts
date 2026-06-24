import { Room } from "./types";

export const DEFAULT_ROOMS: Room[] = [
  { number: "201", defaultPrice: 1200 },
  { number: "202", defaultPrice: 1200 },
  { number: "203", defaultPrice: 1200 },
  { number: "205", defaultPrice: 1350 },
  { number: "301", defaultPrice: 1200 },
  { number: "302", defaultPrice: 1200 },
  { number: "303", defaultPrice: 1200 },
  { number: "305", defaultPrice: 1350 },
  { number: "401", defaultPrice: 1250 },
  { number: "402", defaultPrice: 1250 },
  { number: "403", defaultPrice: 1250 },
  { number: "405", defaultPrice: 1500 },
];

// 部屋構成のみ初期値として残し、スタッフ・シフト・割当は空の状態で開始する
export function getInitialData() {
  return {
    staff: [],
    rooms: DEFAULT_ROOMS,
    shifts: [],
    assignments: [],
  };
}
