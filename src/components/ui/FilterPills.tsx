import { UnstyledButton } from '@mantine/core';
import { ATLAS_RADIUS_FULL } from '../../theme';
import classes from './FilterPills.module.css';

export interface FilterPillsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  'aria-label'?: string;
}

/** Quiet pill filters, e.g. All / Session / Project. The active pill gets an outlined hover fill. */
export function FilterPills<T extends string>({ value, onChange, options, ...props }: FilterPillsProps<T>) {
  return (
    <div className={classes.root} role="radiogroup" aria-label={props['aria-label']}>
      {options.map((option) => (
        <UnstyledButton
          key={option.value}
          className={classes.pill}
          style={{ borderRadius: ATLAS_RADIUS_FULL }}
          role="radio"
          aria-checked={option.value === value}
          data-active={option.value === value || undefined}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </UnstyledButton>
      ))}
    </div>
  );
}
