import { ActionIcon, TextInput, Tooltip } from '@mantine/core';
import type { ReactNode } from 'react';
import { ATLAS_RADIUS_FULL } from '../../theme';
import classes from './PromptInput.module.css';

export interface PromptInputAction {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  /** Extra round buttons shown before the send button. */
  actions?: PromptInputAction[];
  sendIcon: ReactNode;
}

/** Pill-shaped prompt box. Enter or the send button submits non-empty text. */
export function PromptInput({ value, onChange, onSubmit, placeholder, actions = [], sendIcon }: PromptInputProps) {
  const submit = () => {
    const text = value.trim();
    if (text) onSubmit(text);
  };

  const buttons = [...actions, { label: 'Send', icon: sendIcon, onClick: submit }];

  return (
    <TextInput
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') submit();
      }}
      placeholder={placeholder}
      aria-label={placeholder ?? 'Prompt'}
      radius={ATLAS_RADIUS_FULL}
      classNames={{ input: classes.input }}
      rightSectionWidth={actions.length * 36 + 44}
      rightSection={
        <div className={classes.actions}>
          {buttons.map((button) => (
            <Tooltip key={button.label} label={button.label}>
              <ActionIcon
                variant="subtle"
                color="gray"
                size={32}
                radius={ATLAS_RADIUS_FULL}
                className={classes.action}
                aria-label={button.label}
                onClick={button.onClick}
              >
                {button.icon}
              </ActionIcon>
            </Tooltip>
          ))}
        </div>
      }
    />
  );
}
