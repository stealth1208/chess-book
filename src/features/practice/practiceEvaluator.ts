export type PracticeResult = "correct" | "wrong";

export function evaluatePracticeMove(userMove: string, expectedMove: string): PracticeResult {
  return userMove === expectedMove ? "correct" : "wrong";
}
