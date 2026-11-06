import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import classes from './ResizeHandle.module.css';

const KEYBOARD_STEP = 16;

export interface ResizeHandleProps {
  /** Current width of the panel the handle sits on (its right edge). */
  width: number;
  onWidthChange: (width: number) => void;
  min: number;
  max: number;
  /** Width restored on double-click. */
  defaultWidth?: number;
  /** Accessible name, e.g. "Resize chat". */
  label: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Vertical drag handle for a panel's right edge. Place inside a `position: relative`
 * container. Drag or use the arrow keys to resize; double-click resets.
 */
export function ResizeHandle({ width, onWidthChange, min, max, defaultWidth, label }: ResizeHandleProps) {
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: width };
    document.documentElement.dataset.resizing = '';
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    onWidthChange(clamp(drag.current.startWidth + event.clientX - drag.current.startX, min, max));
  };

  const endDrag = () => {
    drag.current = null;
    delete document.documentElement.dataset.resizing;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const delta = { ArrowLeft: -KEYBOARD_STEP, ArrowRight: KEYBOARD_STEP }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    onWidthChange(clamp(width + delta, min, max));
  };

  return (
    <div
      className={classes.handle}
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(width)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={defaultWidth === undefined ? undefined : () => onWidthChange(clamp(defaultWidth, min, max))}
      onKeyDown={onKeyDown}
    />
  );
}
