import type { KeyboardEvent } from "react";

/** Cmd+Enter (Mac) or Ctrl+Enter: toggle “done” (strikethrough). Plain Enter: optional move to next field. */
export function spreadsheetLineKeyDown(
  e: KeyboardEvent<HTMLInputElement>,
  actions: {
    onMoveNext?: () => void;
    onToggleDone?: () => void;
  }
): void {
  if (e.nativeEvent.isComposing) return;
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    actions.onToggleDone?.();
    return;
  }
  if (e.key === "Enter" && actions.onMoveNext) {
    e.preventDefault();
    actions.onMoveNext();
  }
}
