import type { MouseEvent, TouchEvent } from 'react';

const GHOST_CLICK_THRESHOLD_MS = 450;
const lastTouchByElement = new WeakMap<EventTarget, number>();

export const runTapTouch = (
   event: TouchEvent<HTMLElement>,
   action: () => void
) => {
   lastTouchByElement.set(event.currentTarget, Date.now());
   if (event.cancelable) event.preventDefault();
   action();
};

export const runTapClick = (
   event: MouseEvent<HTMLElement>,
   action: () => void
) => {
   const lastTouchTs = lastTouchByElement.get(event.currentTarget) ?? 0;
   if (Date.now() - lastTouchTs < GHOST_CLICK_THRESHOLD_MS) return;
   action();
};

