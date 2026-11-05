import { UnstyledButton } from '@mantine/core';
import classes from './PromptChip.module.css';

export interface PromptChipProps {
  children: string;
  onClick?: () => void;
}

/** Clickable suggested prompt, e.g. a follow-up or starter question. */
export function PromptChip({ children, onClick }: PromptChipProps) {
  return (
    <UnstyledButton className={classes.chip} onClick={onClick}>
      {children}
    </UnstyledButton>
  );
}
