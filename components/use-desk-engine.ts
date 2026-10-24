"use client";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  availableConnections,
  canConnect,
  type DeskAction,
  type ModuleKind,
  type Slot,
} from "@/lib/configurator/desk";
import {
  createDeskHistory,
  deskHistoryReducer,
} from "@/lib/configurator/history";
/** Shared host state for every mode; selection is UI state, installed positions are undoable product state. */
export function useDeskEngine(active = true) {
  const [history, send] = useReducer(
    deskHistoryReducer,
    undefined,
    createDeskHistory,
  );
  const [kind, setKind] = useState<ModuleKind>("cup");
  const [slot, setSlot] = useState<Slot>("front-left");
  const dispatch = useCallback(
    (action: DeskAction) => send({ type: "edit", action }),
    [],
  );
  const undo = useCallback(() => send({ type: "undo" }), []);
  const redo = useCallback(() => send({ type: "redo" }), []);
  const chooseKind = (next: ModuleKind) => {
    setKind(next);
    if (!canConnect(history.present, next, slot)) {
      const first = availableConnections(history.present, next)[0];
      if (first) setSlot(first.id);
    }
  };
  useEffect(() => {
    if (!active) return;
    const keydown = (e: KeyboardEvent) => {
      if (
        (!e.ctrlKey && !e.metaKey) ||
        e.altKey ||
        e.isComposing ||
        e.key.toLowerCase() !== "z"
      )
        return;
      const target = e.target as HTMLElement | null;
      // Preserve native text editing undo; product shortcuts work from buttons, scene, radio lists and page.
      if (
        target?.closest(
          'textarea,select,[contenteditable="true"],input:not([type="range"]):not([type="checkbox"]):not([type="radio"])',
        )
      )
        return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [active, undo, redo]);
  return {
    config: history.present,
    historyMessage:
      history.operation === "undo"
        ? "Configuration undone."
        : history.operation === "redo"
          ? "Configuration redone."
          : "",
    dispatch,
    undo,
    redo,
    canUndo: !!history.past.length,
    canRedo: !!history.future.length,
    kind,
    slot,
    chooseKind,
    chooseSlot: setSlot,
  };
}
export type DeskEngine = ReturnType<typeof useDeskEngine>;
