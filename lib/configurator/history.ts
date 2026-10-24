import {
  deskReducer,
  initialDesk,
  type DeskAction,
  type DeskConfiguration,
} from "./desk";
export const HISTORY_LIMIT = 50;
export type DeskHistory = {
  operation: "initial" | "edit" | "undo" | "redo";
  past: DeskConfiguration[];
  present: DeskConfiguration;
  future: DeskConfiguration[];
};
export type HistoryAction =
  | { type: "edit"; action: DeskAction }
  | { type: "undo" }
  | { type: "redo" };
export function createDeskHistory(): DeskHistory {
  return {
    operation: "initial",
    past: [],
    present: structuredClone(initialDesk),
    future: [],
  };
}
export function deskHistoryReducer(
  history: DeskHistory,
  action: HistoryAction,
): DeskHistory {
  if (action.type === "undo") {
    if (!history.past.length) return history;
    return {
      operation: "undo",
      past: history.past.slice(0, -1),
      present: history.past.at(-1)!,
      future: [history.present, ...history.future].slice(0, HISTORY_LIMIT),
    };
  }
  if (action.type === "redo") {
    if (!history.future.length) return history;
    return {
      operation: "redo",
      past: [...history.past, history.present].slice(-HISTORY_LIMIT),
      present: history.future[0],
      future: history.future.slice(1),
    };
  }
  const next = deskReducer(history.present, action.action);
  if (JSON.stringify(next) === JSON.stringify(history.present)) return history;
  return {
    operation: "edit",
    past: [...history.past, history.present].slice(-HISTORY_LIMIT),
    present: next,
    future: [],
  };
}
