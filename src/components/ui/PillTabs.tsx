import { SegmentedControl } from '@mantine/core';
import { ATLAS_RADIUS_FULL } from '../../theme';
import classes from './PillTabs.module.css';

export interface PillTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}

/** Pill-shaped single-choice toggle, e.g. a filter. The active option fills with Primary. */
export function PillTabs<T extends string>({ value, onChange, options }: PillTabsProps<T>) {
  return (
    <SegmentedControl
      value={value}
      onChange={(next) => onChange(next as T)}
      data={options}
      radius={ATLAS_RADIUS_FULL}
      classNames={{ root: classes.root, control: classes.control, indicator: classes.indicator, label: classes.label }}
    />
  );
}
