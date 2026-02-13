/**
 * VerticalSlider - Vertical slider for water level control
 * Positioned to the left of the beaker
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { ACIDS_BASES_COLORS } from '../../../theme/acidsBasesColors';

interface VerticalSliderProps {
   /** Current value (0-1) */
   value: number;
   /** Minimum value (default 0) */
   min?: number;
   /** Maximum value (default 1) */
   max?: number;
   /** Callback when value changes */
   onChange: (value: number) => void;
   /** Height of the slider track */
   height?: number;
   /** Optional className */
   className?: string;
   /** Whether the slider is interactive */
   enabled?: boolean;
   /** Size scale multiplier */
   scale?: number;
}

export function VerticalSlider({
   value,
   min = 0,
   max = 1,
   onChange,
   height = 200,
   className = '',
   enabled = true,
   scale = 1,
}: VerticalSliderProps) {
   const trackRef = useRef<HTMLDivElement>(null);
   const thumbRef = useRef<SVGSVGElement>(null);
   const [isDragging, setIsDragging] = useState(false);

   const handlePositionChange = useCallback(
      (clientY: number) => {
         if (!trackRef.current || !enabled) return;

         const rect = trackRef.current.getBoundingClientRect();
         // Invert because we want bottom = 0, top = 1
         const relativeY = rect.bottom - clientY;
         const rawInput = Math.max(0, Math.min(1, relativeY / rect.height));
         const newValue = Math.max(min, Math.min(max, rawInput));
         onChange(newValue);
      },
      [onChange, enabled, min, max]
   );

   const handleMouseDown = (e: React.MouseEvent) => {
      if (!enabled) return;
      e.preventDefault();
      setIsDragging(true);
      handlePositionChange(e.clientY);
   };

   useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
         if (isDragging && enabled) {
            handlePositionChange(e.clientY);
         }
      };

      const handleMouseUp = () => {
         setIsDragging(false);
      };

      const handleTouchMove = (e: TouchEvent) => {
         if (isDragging && enabled && e.touches[0]) {
            // Prevent scrolling
            if (e.cancelable) e.preventDefault();
            handlePositionChange(e.touches[0].clientY);
         }
      };

      const handleTouchEnd = () => {
         setIsDragging(false);
      };

      if (isDragging) {
         window.addEventListener('mousemove', handleMouseMove);
         window.addEventListener('mouseup', handleMouseUp);
         // Keep default scrolling blocked while the slider is dragged.
         window.addEventListener('touchmove', handleTouchMove, { passive: false });
         window.addEventListener('touchend', handleTouchEnd);
         window.addEventListener('touchcancel', handleTouchEnd);
      }

      return () => {
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('mouseup', handleMouseUp);
         window.removeEventListener('touchmove', handleTouchMove);
         window.removeEventListener('touchend', handleTouchEnd);
         window.removeEventListener('touchcancel', handleTouchEnd);
      };
   }, [isDragging, handlePositionChange, enabled]);

   useEffect(() => {
      const trackElement = trackRef.current;
      const thumbElement = thumbRef.current;
      if (!trackElement || !thumbElement) return;

      const handleTouchStart = (event: TouchEvent) => {
         if (!enabled || !event.touches[0]) return;
         if (event.cancelable) event.preventDefault();
         setIsDragging(true);
         handlePositionChange(event.touches[0].clientY);
      };

      // Explicit non-passive listeners are required for iOS Safari dragging.
      trackElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      thumbElement.addEventListener('touchstart', handleTouchStart, { passive: false });

      return () => {
         trackElement.removeEventListener('touchstart', handleTouchStart);
         thumbElement.removeEventListener('touchstart', handleTouchStart);
      };
   }, [enabled, handlePositionChange]);

   // Calculate thumb position (inverted: 0 = bottom, 1 = top)
   const clampedValue = Math.max(min, Math.min(max, value));

   // Thumb position depends on the absolute value (0-1) on the track, 
   // not normalized to the min-max range.
   const thumbPosition = (1 - clampedValue) * height;
   const scaleValue = Math.max(0.1, scale);
   const containerWidth = 60 * scaleValue;
   const trackWidth = 4 * scaleValue;
   const thumbWidth = 30 * scaleValue;
   const thumbHeight = 15 * scaleValue;
   const thumbOffset = thumbHeight / 2;

   return (
      <div
         className={`relative flex flex-col items-center ${className}`}
         style={{ height, width: containerWidth, opacity: enabled ? 1 : 0.6 }}
      >
         {/* Track using slider bar SVG */}
         <div
            ref={trackRef}
            className={`relative flex items-center justify-center ${enabled ? 'cursor-pointer' : 'cursor-default'}`}
         style={{ height }}
         onMouseDown={handleMouseDown}
      >
            <div
               className="absolute bottom-0"
               style={{
                  width: trackWidth,
                  height: `${clampedValue * 100}%`,
                  backgroundColor: enabled ? ACIDS_BASES_COLORS.ui.primary : ACIDS_BASES_COLORS.ui.disabled,
                  opacity: 1,
               }}
            />
            <div
               className="absolute top-0"
               style={{
                  width: trackWidth,
                  height: `100%`,
                  backgroundColor: '#6b7280',
                  opacity: 0.2,
               }}
            />
         </div>

         {/* Thumb (handle) */}
      <svg
         ref={thumbRef}
         viewBox="0 0 59 29"
         className={`absolute left-1/2 -translate-x-1/2 ${enabled ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
            style={{
               top: thumbPosition - thumbOffset,
               width: thumbWidth,
               height: thumbHeight,
               fill: enabled ? ACIDS_BASES_COLORS.ui.primary : ACIDS_BASES_COLORS.ui.disabled,
               overflow: 'visible', // Allow touch target to extend outside
            }}
            onMouseDown={handleMouseDown}
         >
            {/* Extended Touch Target (Invisible Hitbox) */}
            <rect
               x="-30"
               y="-35"
               width="120"
               height="100"
               fill="transparent"
               stroke="none"
            />
            {/* Visual Handle */}
            <rect width="59" height="29" rx="7.2" ry="7.2" />
         </svg>
      </div>
   );
}

export default VerticalSlider;
