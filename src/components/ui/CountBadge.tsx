import { ATLAS_RADIUS_FULL } from '../../theme';
import classes from './CountBadge.module.css';

export interface CountBadgeProps {
  count: number;
  /** Accessible description, e.g. "8 ongoing sessions". Defaults to the number. */
  label?: string;
}

/** Quiet pill showing a group total. Circular for single digits, stretches for more. */
export function CountBadge({ count, label }: CountBadgeProps) {
  return (
    <span className={classes.badge} style={{ borderRadius: ATLAS_RADIUS_FULL }} aria-label={label}>
      {count}
    </span>
  );
}
