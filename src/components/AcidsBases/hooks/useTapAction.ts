import { useCallback, useRef, type TouchEvent } from 'react';

const GHOST_CLICK_THRESHOLD_MS = 450;

/**
 * iOS-safe tap handler:
 * - triggers action on touchend (for cases when click is not synthesized)
 * - suppresses ghost click fired right after touchend
 */
export function useTapAction(action: () => void) {
   const lastTouchTsRef = useRef(0);

   const onTouchEnd = useCallback((event: TouchEvent<HTMLElement>) => {
      lastTouchTsRef.current = Date.now();
      // Prevent Safari from generating duplicate synthetic click in some flows.
      if (event.cancelable) event.preventDefault();
      action();
   }, [action]);

   const onClick = useCallback(() => {
      if (Date.now() - lastTouchTsRef.current < GHOST_CLICK_THRESHOLD_MS) {
         return;
      }
      action();
   }, [action]);

   return { onClick, onTouchEnd };
}

export default useTapAction;
