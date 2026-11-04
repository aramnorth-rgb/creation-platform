"use client";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  availableConnections,
  canConnect,
  type DeskAction,
  type ModuleKind,
  type Slot,
  initialDesk,
} from "@/lib/configurator/desk";
import {
  createDeskHistory,
  deskHistoryReducer,
} from "@/lib/configurator/history";
import {
  approvedInitial,
  permittedAction,
  type ProductDraft,
} from "@/lib/studio/product";
/** Shared host state for every mode; selection is UI state, installed positions are undoable product state. */
export function useDeskEngine(active = true, policy?: ProductDraft) {
  const [history, send] = useReducer(deskHistoryReducer, policy, (p) =>
    createDeskHistory(p ? approvedInitial(p) : initialDesk),
  );
  const [kind, setKind] = useState<ModuleKind>(
    () => policy?.modules[0] ?? "cup",
  );
  const [slot, setSlot] = useState<Slot>(() =>
    policy
      ? (availableConnections(
          approvedInitial(policy),
          policy.modules[0] ?? "cup",
        )[0]?.id ?? "front-left")
      : "front-left",
  );
  const dispatch = useCallback(
    (action: DeskAction) => {
      if (policy && action.type === "reset") {
        // Reset approved fields as one history transaction, retaining the same reducer contract.
        const c = approvedInitial(policy);
        send({ type: "edit", action: { type: "restore", config: c } });
      } else if (!policy || permittedAction(history.present, action, policy))
        send({ type: "edit", action });
    },
    [policy, history.present],
  );
  const undo = useCallback(() => send({ type: "undo" }), []);
  const redo = useCallback(() => send({ type: "redo" }), []);
  const chooseKind = (next: ModuleKind) => {
    if (policy && !policy.modules.includes(next)) return;
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
    policy,
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
